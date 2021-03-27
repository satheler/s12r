import { ApiGatewayProxy } from 'aws/ApiGatewayProxy'
import { AWSHandler } from './aws'
import { CloudRequest, CloudResponse, Serverlessize } from './core'

const awsHandler = new AWSHandler()
const serverlessizer = new Serverlessize(awsHandler)

export default (args: any[]): CloudResponse => serverlessizer.handle(args)
export const ServerlessizeAWS = (args: CloudRequest<ApiGatewayProxy>): CloudResponse => awsHandler.handle(args)
