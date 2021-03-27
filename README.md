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
🧑‍💻 Azure Functions [WIP]  
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

Below has a example of serverless configuration with typescript. The project output in `tsconfig.json` is set as `build`. The cloud provider in example is the `Amazon Web Services`. This example already includes the `Lambda Layer` with node_modules folder.

**`serverless.yml`**

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

**`package.json`**

```json
{
  "name": "your-service-name",
  "scripts": {
    "build": "rimraf build && tsc",
    "layer:node_modules": "rimraf temp/layers && yarn install --modules-folder ./tmp/layers/nodejs/node_modules --production=true",
    "deploy": "yarn build && yarn layer:node_modules && yarn sls deploy",
  },
  "dependencies": {
    "@satheler/s12r": "latest",
  },
  "devDependencies": {
    "@types/node": "^14.14.37",
    "rimraf": "^3.0.2",
    "serverless": "^2.30.3",
    "typescript": "~4.1",
  },
  "engines": {
    "node": "14.x"
  }
}
```
