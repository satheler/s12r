import { CloudRequest, CloudResponse  } from "core/CloudHandler"

export interface CloudHandler {
  handle: (request: CloudRequest) => CloudResponse
}