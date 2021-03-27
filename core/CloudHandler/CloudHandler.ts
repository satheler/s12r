import { CloudRequest, CloudResponse  } from ".."

export interface CloudHandler {
  handle: (request: CloudRequest) => CloudResponse
}