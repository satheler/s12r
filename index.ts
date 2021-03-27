import { AWSHandler } from './aws'
import { ServerlessHandler } from './core'

const awsHandler = new AWSHandler()
const serverlessHandler = new ServerlessHandler(awsHandler)

export default serverlessHandler.handle
export const aws = awsHandler.handle