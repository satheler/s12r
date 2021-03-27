type ApiGatewayProxyEvent = { 
  version?: string
} & Record<string, any>

export type ApiGatewayProxy = [event: ApiGatewayProxyEvent, context: any, callback: Function]