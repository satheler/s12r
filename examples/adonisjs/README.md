# AdonisJs v5 Example

1. Add the code below in `serverless.ts` on project root

```typescript
import 'reflect-metadata'
import { ServerContract } from '@ioc:Adonis/Core/Server'
import { Ignitor } from '@adonisjs/core/build/standalone'
import ServerlessHandle from '@satheler/s12r'

let server: ServerContract

async function bootstrapServer () {
  const ignitor = new Ignitor(__dirname)
  const httpServer = ignitor.httpServer()

  httpServer.application.setup()
  httpServer.application.registerProviders()
  httpServer.application.requirePreloads()
  await httpServer.application.bootProviders()

  const server = httpServer.application.container.use('Adonis/Core/Server')
  server.optimize()

  return server
}

export const handle = async (...args: any[]) => {
  const { request, response } = ServerlessHandle(args)

  if(!server) {
    server = await bootstrapServer()
  }

  return server.handle(request, response)
}

```
