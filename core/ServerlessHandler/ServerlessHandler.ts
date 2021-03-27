import { CloudHandler, CloudRequest, CloudResponse } from '..'

export class ServerlessHandler implements CloudHandler {
  constructor(
    private readonly aws: CloudHandler
  ) {}

  public handle(params: CloudRequest): CloudResponse {
    return this.aws.handle(params)
  }
}
