import http from "http";
import Koa from "koa";
import { createYoga } from "graphql-yoga";
import { useDeferStream } from '@graphql-yoga/plugin-defer-stream'

import logger from '@graphql/util-logger';
import { schema } from './schema';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

const app = new Koa();
const yoga = createYoga<Koa.ParameterizedContext>({
  schema,
  graphqlEndpoint: '/',
  cors: {
    origin: ['http://localhost:3000','http://localhost:3001','http://localhost:4000','https://studio.apollographql.com']
  },
  plugins: [
    useDeferStream(),
  ]
})
 
const httpServer = http.createServer(yoga);

app.use(async ctx => {
  const response = await yoga.handleNodeRequest(ctx.req, ctx);
  ctx.status = response.status;
 
  response.headers.forEach((value, key) => {
    ctx.append(key, value);
  })
 
  ctx.body = response.body;
})

await httpServer.listen({ host, port });
logger.info({ msg: `🚀 Server ready at http://${host}:${port}` });
