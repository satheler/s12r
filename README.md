# Serverlessizer (S12R)

Serverlessize your Node.js backend application to main clouds providers. With this package you can run your application on the **Function as a Service** on many cloud providers with same configuration.

## 📑 Overview

1. **[📥 Installation](#-installation)**
2. **[☁️ Supported Cloud Providers](#%EF%B8%8F-supported-cloud-providers)**
3. **[🧩 Supported frameworks](#supported-frameworks)**
   - **[Adonis](#adonis)**
   - **[Express (Coming soon)](#express-coming-soon)**
   - **[Hapi (Coming soon)](#hapi-coming-soon)**
   - **[LoopBack (Coming soon)](#loopback-coming-soon)**
4. **[⚡️ Serverless Framework](#%EF%B8%8F-serverless-framework)**
5. **[📜 Licensing](#-licensing)**

## 📥 Installation

Serverlessizer library for Node can be installed via package manager.

```console
# npm
npm install @satheler/s12r

# yarn
yarn add @satheler/s12r
```

## ☁️ Supported Cloud Providers

The following is a list of the currently support cloud providers:

✅ AWS Lambda  
✅ Azure Functions  
⏱ Google Cloud Functions  
⏱ IBM Cloud

## 🧩 Supported frameworks

The following sections is the currently support frameworks.

### Adonis

1. Add the code below in `serverlessizer.ts` on your project root.

```typescript
import 'reflect-metadata'
import { ServerContract } from '@ioc:Adonis/Core/Server'
import { Ignitor } from '@adonisjs/core/build/standalone'
import Serverlessizer from '@satheler/s12r'

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
  if(!server) {
    server = await bootstrapServer()
  }

  const { request, response } = Serverlessizer(args)
  return server.handle(request, response)
}
```

### Express (Coming soon)

### Hapi (Coming soon)

### LoopBack (Coming soon)

## ⚡️ Serverless Framework

The [Serverless Framework](https://www.serverless.com) uses new event-driven compute services, like AWS Lambda, Google Cloud Functions, and more. It's a command-line tool, providing scaffolding, workflow automation and best practices for developing and deploying your serverless architecture.

Below has a example of serverless configuration with typescript. The project output in `tsconfig.json` is set as `build`.

### Amazon Web Services (AWS)

This example already includes the `Lambda Layer` with node_modules folder.

**`serverless.aws.yml`**

```yaml
service: your-service-name

provider:
  name: aws
  region: ${opt:region, 'sa-east-1'}
  stage: ${opt:stage, 'development'}
  runtime: nodejs14.x
  timeout: 10
  memorySize: 256
  versionFunctions: false
  environment:
    NODE_ENV: production
    MY_ENV_VARS: true

functions:
  app:
    handler: build/serverlessizer.handle
    layers:
      - { Ref: NodeModulesLambdaLayer }
    events:
      - http:
          cors: true
          path: '/'
          method: any
      - http:
          cors: true
          path: '{proxy+}'
          method: any

package:
  include:
    - build/**

  exclude:
    - '**/*.ts'
    - node_modules/**

layers:
  NodeModules:
    name: ${self:provider.apiName}-layer
    path: tmp/layers
    description: "node_modules dependencies"
```

### Microsoft Azure

**`serverless.azure.yml`**

```yaml
service: your-service-name

provider:
  name: azure
  region: ${opt:region, 'sa-east-1'}
  runtime: nodejs12
  stage: ${opt:stage, 'develop'}
  stackName: ${self:provider.stage}-${self:service}
  apiName: ${self:provider.stage}-${self:service}
  timeout: 10
  memorySize: 256
  versionFunctions: false
  apim: true
  environment:
    NODE_ENV: production
    MY_ENV_VARS: true

functions:
  app:
    handler: build/serverlessizer.handle
    events:
      - http: true
        route: '{*proxy}'
        authLevel: anonymous

package:
  include:
    - build/**

  exclude:
    - '**/*.ts'
    - node_modules/**
    - tmp/**
    - app/**

plugins:
  - serverless-azure-functions
```

## 📜 Licensing

Serverlessizer is licensed under the [MIT License](./LICENSE).

All files located in the node_modules and external directories are externally maintained libraries used by this software which have their own licenses; we recommend you read them, as their terms may differ from the terms in the MIT License.
