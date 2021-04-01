import { IncomingMessage, ServerResponse } from 'http'
import { Socket } from 'net'
import { stringify } from 'querystring'
import Stream from 'stream'
import { CloudHandler, CloudRequest, CloudResponse } from '../core'
import { ApiManagementProxy } from './ApiManagementProxy'

export class AzureHandler implements CloudHandler {
  private isBase64Encoded!: boolean

  public handle([context, apiRequest]: CloudRequest<ApiManagementProxy>): CloudResponse {
    this.isBase64Encoded = process.env.BINARY_SUPPORT === 'yes'

    const request: IncomingMessage = this.request(apiRequest)
    const response: ServerResponse = this.response(context)

    return { request, response }
  }

  private request(event: any): IncomingMessage {
    const request = new Stream.Readable() as IncomingMessage & { finished: true, getHeader: Function, getHeaders: Function }

    request.finished = true
    request.url = event.params.proxy ? `/${event.params.proxy}` : '/'

    if (event.query) {
      request.url = request.url.concat('?', stringify(event.query))
    }

    request.method = event.method
    request.rawHeaders = []
    request.headers = {}

    const headers = event.headers || {}

    for (const key of Object.keys(headers)) {
      request.headers[key.toLowerCase()] = headers[key].toString()
    }

    request.getHeader = (name: string) => request.headers[name.toLowerCase()]
    request.getHeaders = () => request.headers
    request.connection = {} as unknown as Socket

    if (event.body) {
      request.push(event.body, event.isBase64Encoded ? 'base64' : undefined)
      request.push(null)
    }

    return request
  }

  private response(context: any): ServerResponse {
    const responseInitialValues: any = {
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
      get() {
        return responseInitialValues.statusCode
      },
      set(statusCode) {
        responseInitialValues.statusCode = statusCode
      }
    })

    Object.defineProperty(response, 'headersSent', {
      get() {
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

      response.writeHead()
      context.res = {
        status: responseInitialValues.statusCode,
        body: responseInitialValues.body,
      }
    }

    return response
  }
}
