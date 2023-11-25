import http from "http";
import Koa from "koa";
import { createYoga } from "graphql-yoga";
import { useDisableIntrospection } from '@graphql-yoga/plugin-disable-introspection'
import { useDeferStream } from '@graphql-yoga/plugin-defer-stream'
import { useServer } from 'graphql-ws/lib/use/ws'
import { WebSocketServer } from 'ws';

import logger from '@graphql/util-logger';
import { schema } from './schema';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

const yoga = createYoga<Koa.ParameterizedContext>({
  schema,
  graphqlEndpoint: '/',
  batching: true,
  cors: {
    origin: ['http://localhost:3000','http://localhost:3001','http://localhost:4000','https://studio.apollographql.com']
  },
  plugins: [
    // useDisableIntrospection({
    //   isDisabled: () => process.env.NODE_ENV === 'production'
    // }),
    useDeferStream(),
  ],
  context: async ({ req }) => {
    if (req.headers.authorization) {
      return {
      };
    }
  },
})
 
const app = new Koa();
app.use(async ctx => {
  const response = await yoga.handleNodeRequest(ctx.req, ctx);
  ctx.status = response.status;
 
  response.headers.forEach((value, key) => {
    ctx.append(key, value);
  })
 
  ctx.body = response.body;
})

// const httpServer = http.createServer(yoga);
const httpServer = http.createServer(app.callback());

const wsServer = new WebSocketServer({
  server: httpServer,
  path: yoga.graphqlEndpoint
})

useServer(
  {
    execute: (args: any) => args.rootValue.execute(args),
    subscribe: (args: any) => args.rootValue.subscribe(args),
    onSubscribe: async (ctx, msg) => {
      const { schema, execute, subscribe, contextFactory, parse, validate } = yoga.getEnveloped({
        ...ctx,
        req: ctx.extra.request,
        socket: ctx.extra.socket,
        params: msg.payload
      })
 
      const args = {
        schema,
        operationName: msg.payload.operationName,
        document: parse(msg.payload.query),
        variableValues: msg.payload.variables,
        contextValue: await contextFactory(),
        rootValue: {
          execute,
          subscribe
        }
      }
 
      const errors = validate(args.schema, args.document)
      if (errors.length) return errors
      return args
    }
  },
  wsServer
)

await httpServer.listen({ host, port });
logger.info({ msg: `🚀 Server ready at http://${host}:${port}` });
