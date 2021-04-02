import { CloudHandler, CloudRequest, CloudResponse } from '..'

export class Serverlessizer implements CloudHandler {
  constructor (
    private readonly aws: CloudHandler,
    private readonly azure: CloudHandler
  ) {}

  public handle (request: CloudRequest): CloudResponse {
    if (request.length === 2) {
      return this.azure.handle(request)
    }

    return this.aws.handle(request)
  }
}
