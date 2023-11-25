import http from "http";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { koaMiddleware } from "@as-integrations/koa";

import logger from '@graphql/util-logger';
import { schema } from './schema';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = new Koa();
const httpServer = http.createServer(app.callback());

const server = new ApolloServer({
  schema,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();

app.use(cors());
app.use(bodyParser());
app.use(
  koaMiddleware(server, {
    context: async ({ ctx }) => ({ token: ctx.headers.token }),
  })
);

await httpServer.listen({ host, port });
logger.info({ msg: `🚀 Server ready at http://${host}:${port}` });
