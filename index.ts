import { AzureHandler } from './azure'
import { ApiGatewayProxy, AWSHandler } from './aws'
import { CloudRequest, CloudResponse, Serverlessizer } from './core'

const awsHandler = new AWSHandler()
const azureHandler = new AzureHandler()
const serverlessizer = new Serverlessizer(awsHandler, azureHandler)

const Serverlessize = (args: any[]): CloudResponse => serverlessizer.handle(args)
export default Serverlessize

export const ServerlessizeAWS = (args: CloudRequest<ApiGatewayProxy>): CloudResponse => awsHandler.handle(args)
export const ServerlessizeAzure = (args: CloudRequest<any>): CloudResponse => azureHandler.handle(args)
