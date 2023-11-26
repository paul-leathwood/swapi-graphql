import logger from '@graphql/util-logger';

import { buildMetricsServer } from './metricServer';
import { buildGraphQLServer } from "./graphQLServer";
import { schema } from './schema';
import Redis from 'ioredis';

type AppContext = {
  user: string;
}

const { metricsApp, register } = buildMetricsServer();

const { graphqlApp } = buildGraphQLServer<AppContext>({
  schema,
  options: {
    context: async (serverContext) => {
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
    metrics: {
      // all optional, and by default, all set to false, please opt-in to the metrics you wish to get
      execute: true,
      parse: true,
      validate: true,
      contextBuilding: true,
      // deprecatedFields: true,
      errors: true,
      requestCount: true, // requires `execute` to be true as well
      requestSummary: true, // requires `execute` to be true as well
      requestTotalDuration: true,
      resolvers: true, // requires "execute" to be `true` as well
      // resolversWhitelist: ['Mutation.*', 'Query.user'], // reports metrics als for these resolvers, leave `undefined` to report all fields
      skipIntrospection: true,
      registry: register,
    },
    readiness: {
      check: () => { },
    },
    responseCache: {
      session: () => null, // global cache
      ttl: 500_000,
      cache: new Redis(),
    }
  },
});

// const host = process.env.HOST ?? 'localhost';
const graphQLPort = process.env.PORT ? Number(process.env.PORT) : 4000;
const metricsPort = process.env.METRICS_PORT ? Number(process.env.METRICS_PORT) : 9464;

metricsApp.listen(metricsPort, () => {
  logger.info({ msg: `🚀 Metric server ready at http://localhost:${metricsPort}` })
});
graphqlApp.listen(graphQLPort, () => {
  logger.info({ msg: `🚀 GraphQL server ready at http://localhost:${graphQLPort}` })
});
