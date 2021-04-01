export type ApiGatewayProxyEvent = {
  version?: string
  requestContext: {
    stage: string
    path?: string
    http: {
      path?: string
      method?: string
    }
  }
} & Record<string, any>

export type ApiGatewayProxy = [event: ApiGatewayProxyEvent, context: any, callback: Function]

export type ApiGatewayResponse = {
  headers?: Record<string, string | string[]>
  multiValueHeaders?: Record<string, string | string[]>
  body: Buffer | string
  isBase64Encoded: boolean
  statusCode: number
  cookies?: any[]
}
