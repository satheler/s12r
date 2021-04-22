import Stream from 'stream'
import { stringify } from 'querystring'
import { IncomingMessage, ServerResponse } from 'http'
import { CloudHandler, CloudRequest, CloudResponse } from '../core'
import { ApiGatewayProxy, ApiGatewayResponse, ApiGatewayProxyEvent } from './ApiGatewayProxy'
import { Socket } from 'net'

export class AWSHandler implements CloudHandler {
  private isBase64Encoded!: boolean

  public handle ([event, context, callback]: CloudRequest<ApiGatewayProxy>): CloudResponse {
    context.callbackWaitsForEmptyEventLoop = false
    this.isBase64Encoded = process.env.BINARY_SUPPORT === 'yes'

    const request: IncomingMessage = this.request(event)
    const response: ServerResponse = this.response(callback)

    return { request, response }
  }

  private request (event: ApiGatewayProxyEvent): IncomingMessage {
    const request = new Stream.Readable() as IncomingMessage & { finished: boolean, getHeader: Function, getHeaders: Function }

    const requestQuery = stringify(event.queryStringParameters)
    const path = event.path !== '' ? event.path : '/'
    request.url = requestQuery ? path.concat('?', requestQuery) : path

    request.finished = true

    request.method = event.httpMethod
    request.rawHeaders = []
    request.headers = {}

    const headers = event.multiValueHeaders || {}

    for (const key of Object.keys(headers)) {
      const headerValues = headers[key]
      for (const value of headerValues) {
        request.rawHeaders.push(key)
        request.rawHeaders.push(value)
      }
      request.headers[key.toLowerCase()] = headers[key].toString()
    }

    request.getHeader = (name: string) => request.headers[name.toLowerCase()]
    request.getHeaders = () => request.headers
    request.connection = {} as unknown as Socket

    if (event.body) {
      const bufferEncoding = event.isBase64Encoded ? 'base64' : undefined

      const contentLength = Buffer.byteLength(event.body, 'utf-8')
      request.headers['content-length'] = contentLength.toString()

      request.push(event.body, bufferEncoding)
      request.push(null)
    }

    console.log(request)
    return request
  }

  private response (callback: Function): ServerResponse {
    const responseInitialValues: ApiGatewayResponse = {
      headers: {},
      multiValueHeaders: {},
      body: Buffer.from(''),
      isBase64Encoded: this.isBase64Encoded,
      statusCode: 200
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
      }
    })

    Object.defineProperty(response, 'headersSent', {
      get () {
        return headersSent
      }
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
        Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      ])
    }

    response.setHeader = (name: string, value: string) => {
      response.headers[name.toLowerCase()] = value
    }

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

      responseInitialValues.multiValueHeaders = response.headers

      response.writeHead(responseInitialValues.statusCode)
      this.fixApiGatewayHeaders(responseInitialValues)
      callback(null, responseInitialValues)
    }

    return response
  }

  private fixApiGatewayHeaders (responseInitialValues: ApiGatewayResponse): void {
    const { multiValueHeaders } = responseInitialValues

    if (!multiValueHeaders || Object.keys(multiValueHeaders).length === 0 || multiValueHeaders.constructor !== Object) {
      return
    }

    for (const key of Object.keys(multiValueHeaders)) {
      if (!Array.isArray(multiValueHeaders[key])) {
        multiValueHeaders[key] = [multiValueHeaders[key] as string]
      }
    }
  }
}
