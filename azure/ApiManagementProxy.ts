type ApiManagementEvent = {
  query?: string
  body: any
} & Record<string, any>

export type ApiManagementProxy = [context: any, request: ApiManagementEvent]
