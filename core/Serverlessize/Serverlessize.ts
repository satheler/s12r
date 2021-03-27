import { CloudHandler, CloudRequest, CloudResponse } from '..'

export class Serverlessize implements CloudHandler {
  constructor(
    private readonly aws: CloudHandler
  ) {}

  public handle(request: CloudRequest): CloudResponse {
    return this.aws.handle(request)
  }
}
