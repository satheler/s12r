import Stream from 'stream'
import { stringify } from 'querystring'
import { IncomingMessage, ServerResponse } from 'http'
import { CloudHandler, CloudRequest, CloudResponse } from 'core'
import { ApiGatewayProxy } from './ApiGatewayProxy'

type ResponseType = {
  headers?: Record<string, string | string[]>
  multiValueHeaders?: Record<string, string | string[]>
  body: Buffer | string
  isBase64Encoded: boolean
  statusCode: number
  cookies?: any[]
}

const EVENT = 0
const CALLBACK = 2

export class AWSHandler implements CloudHandler {
  private version!: string
  private isBase64Encoded!: boolean

  public handle (params: CloudRequest<ApiGatewayProxy>): CloudResponse {
    const event = params[EVENT]
    const callback = params[CALLBACK]

    const { version = '1.0' } = event

    this.version = version
    this.isBase64Encoded = process.env.BINARY_SUPPORT === 'yes'

    const request: IncomingMessage = this.request(event)
    const response: ServerResponse = this.response(callback)

    return { request, response }
  }

  private request (event: ApiGatewayProxy[0]): IncomingMessage {
    const request = new Stream.Readable() as any

    const REMOVE_STAGE_PATTERN = new RegExp(`^/${event.requestContext.stage}(/)?`)

    const urlByVersion = this.version === '2.0'
      ? event.requestContext.http.path || event.rawPath || '/'
      : event.requestContext.path || event.path || event.rawPath || '/'

    request.url = urlByVersion.replace(REMOVE_STAGE_PATTERN, '/')
    request.finished = true

    if (this.version === '1.0') {
      if (event.multiValueQueryStringParameters) {
        request.url += '?' + stringify(event.multiValueQueryStringParameters)
      }
    } else {
      if (event.rawQueryString) {
        request.url += '?' + event.rawQueryString
      }
    }

    request.method = this.version === '2.0' ? event.requestContext.http.method : event.httpMethod
    request.rawHeaders = []
    request.headers = {}

    const headers = event.multiValueHeaders || event.headers || {}

    for (const key of Object.keys(headers)) {
      const headerValues =
        this.version === '1.0' ? headers[key] : headers[key].split(',')
      for (const value of headerValues) {
        request.rawHeaders.push(key)
        request.rawHeaders.push(value)
      }
      request.headers[key.toLowerCase()] = headers[key].toString()
    }

    if (this.version === '2.0') {
      if (event.cookies && event.cookies.length) {
        for (const value of event.cookies) {
          request.rawHeaders.push('cookie')
          request.rawHeaders.push(value)
        }
        request.headers.cookie = event.cookies.join(' ')
      }
    }

    request.getHeader = (name: string) => request.headers[name.toLowerCase()]
    request.getHeaders = () => request.headers
    request.socket = {}

    if (event.body) {
      request.push(event.body, event.isBase64Encoded ? 'base64' : undefined)
      request.push(null)
    }

    return request
  }

  private response (callback: Function): ServerResponse {
    const responseInitialValues: ResponseType = {
      headers: {},
      multiValueHeaders: {},
      body: Buffer.from(''),
      isBase64Encoded: this.isBase64Encoded,
      statusCode: 200,
      ...(this.version === '1.0' && { multiValueHeaders: {} }),
      ...(this.version === '2.0' && { headers: {} }),
    }

    const response = new Stream() as any
    let headersSent = false

    response.statusCode = responseInitialValues.statusCode

    Object.defineProperty(response, 'statusCode', {
      get () {
        return responseInitialValues.statusCode
      },
      set (statusCode) {
        responseInitialValues.statusCode = statusCode
      },
    })
    
    Object.defineProperty(response, 'headersSent', {
      get () {
        return headersSent
      },
    })

    response.headers = {}
    response.writeHead = (status: number, headers: Record<string, string> = {}) => {
      headersSent = true
      responseInitialValues.statusCode = status
      const lowerCaseHeaders: Record<string, string> = {}
      for (const key of Object.keys(headers)) {
        lowerCaseHeaders[key.toLowerCase()] = headers[key]
      }
      response.headers = Object.assign(response.headers, lowerCaseHeaders)
    }

    response.write = (chunk: Buffer) => {
      headersSent = true
      responseInitialValues.body = Buffer.concat([
        responseInitialValues.body as Uint8Array,
        Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk),
      ])
    }

    response.setHeader = (name: string, value: string) => response.headers[name.toLowerCase()] = value
    response.removeHeader = (name: string) => response.headers[name.toLowerCase()]
    response.getHeader = (name: string) => response.headers[name.toLowerCase()]
    response.getHeaders = () => response.headers
    response.hasHeader = (name: string) => undefined !== response.getHeader(name)

    response.end = (text: string) => {
      if (text) {
        response.write(text)
      }

      responseInitialValues.body = Buffer.from(responseInitialValues.body).toString(
        this.isBase64Encoded ? 'base64' : undefined
      )

      if (this.version === '1.0') {
        responseInitialValues.multiValueHeaders = response.headers
      } else {
        responseInitialValues.headers = response.headers
      }

      response.writeHead(responseInitialValues.statusCode)
      this.fixApiGatewayHeaders(responseInitialValues)
      callback(null, responseInitialValues)
    }

    return response
  }

  private fixApiGatewayHeaders (responseInitialValues: ResponseType) {
    if (this.version === '1.0') {
      const { multiValueHeaders } = responseInitialValues

      if(!multiValueHeaders || Object.keys(multiValueHeaders).length === 0 || multiValueHeaders.constructor !== Object){
        return
      }

      for (const key of Object.keys(multiValueHeaders)) {
        if (!Array.isArray(multiValueHeaders[key])) {
          multiValueHeaders[key] = [multiValueHeaders[key] as string]
        }
      }

      return
    }

    const cookies = responseInitialValues.headers?.['set-cookie']
    if (cookies) {
      responseInitialValues.cookies = Array.isArray(cookies) ? cookies : [cookies]
      delete responseInitialValues.headers?.['set-cookie']
    }

    const { headers } = responseInitialValues
    if(!headers || Object.keys(headers).length === 0 || headers.constructor !== Object) {
      return
    }

    for (const key of Object.keys(headers)) {
      if (Array.isArray(headers[key])) {
        headers[key] = (headers[key] as string[]).join(',')
      }
    }
  }
}
