import { ApiGatewayProxy } from 'aws/ApiGatewayProxy'
import { AWSHandler } from './aws'
import { CloudRequest, Serverlessize } from './core'

const awsHandler = new AWSHandler()
const serverlessizer = new Serverlessize(awsHandler)

export default (args: any[]) => serverlessizer.handle(args)
export const ServerlessizeAWS = (args: CloudRequest<ApiGatewayProxy>) => awsHandler.handle(args)