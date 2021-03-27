import { IncomingMessage, ServerResponse } from 'http'

export type CloudResponse = {
  request: IncomingMessage
  response: ServerResponse
}