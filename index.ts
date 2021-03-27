import { AWSHandler } from './aws'
import { ServerlessHandler } from './core'

const awsHandler = new AWSHandler()
const serverlessizer = new ServerlessHandler(awsHandler)

export default serverlessizer.handle.bind(serverlessizer)