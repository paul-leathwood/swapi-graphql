import logger from '@graphql/util-logger';

import { buildServer } from "./server";
import { schema } from './schema';
import Redis from 'ioredis';

type AppContext = {
  user: string;
}

const app = buildServer<AppContext>({
  schema,
  options: {
    contextFn: async (serverContext) => {
      return {
        user: serverContext.params.extensions.headers['authorization']
      }
    },
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:4000', 'https://studio.apollographql.com']
    },
    disableIntrospection: process.env.NODE_ENV === 'production',
    enableGraphQLArmor: process.env.NODE_ENV === 'production',
    logging: logger,
    responseCache: {
      session: () => null, // global cache
      ttl: 500_000,
      cache: new Redis()
    }
  },
});

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.listen(host, port, () => {
  logger.info({ msg: `🚀 Server ready at http://${host}:${port}` })
});
