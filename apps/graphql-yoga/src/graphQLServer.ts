import { hostname } from 'node:os';

// Request Server
import { App } from 'uWebSockets.js'
import type { HttpRequest, HttpResponse } from 'uWebSockets.js'

// GraphQL Server
import { createYoga, useReadinessCheck } from "graphql-yoga";
import type { ReadinessCheckPluginOptions } from 'graphql-yoga/typings/plugins/use-readiness-check';
import type { Plugin, PromiseOrValue, YogaInitialContext } from "graphql-yoga";

// WebSocket Server
import { execute, ExecutionArgs, GraphQLSchema, subscribe } from 'graphql'
import { makeBehavior } from 'graphql-ws/lib/use/uWebSockets'

// Plugins
import { costLimitPlugin } from '@escape.tech/graphql-armor-cost-limit'
import { maxAliasesPlugin } from '@escape.tech/graphql-armor-max-aliases'
import { maxDepthPlugin } from '@escape.tech/graphql-armor-max-depth'
import { maxDirectivesPlugin } from '@escape.tech/graphql-armor-max-directives'
import { maxTokensPlugin } from '@escape.tech/graphql-armor-max-tokens'
import { useDeferStream } from '@graphql-yoga/plugin-defer-stream'
import { useDisableIntrospection } from '@graphql-yoga/plugin-disable-introspection'
import { usePrometheus } from '@envelop/prometheus'
import type { Registry } from 'prom-client';
import { useResponseCache } from '@graphql-yoga/plugin-response-cache'
import { createRedisCache } from '@envelop/response-cache-redis'
import type { Redis } from 'ioredis';

interface ServerContext {
  // req: HttpRequest (you can't make changes with this part so best to hide the implementation)
  // res: HttpResponse (you can't make changes with this part so best to hide the implementation)
  request: Record<string, unknown>
  params: {
    query: string;
    extensions: {
      headers: { [key: string]: string }
    }
  }
}

type BaseContext = {};
type ServerOptions<AppContext> = {
  schema: GraphQLSchema;
  options: {
    context: (serverContext: ServerContext) => PromiseOrValue<AppContext>;
    cors: { origin: string[] };
    disableIntrospection: boolean;
    enableGraphQLArmor: boolean;
    logging: {
      debug: (...args) => void;
      info: (...args) => void;
      warn: (...args) => void;
      error: (...args) => void;
    };
    metrics?: {
      execute?: boolean;
      parse?: boolean;
      validate?: boolean;
      contextBuilding?: boolean;
      deprecatedFields?: boolean;
      errors?: boolean;
      requestCount?: boolean; // requires `execute` to be true as well
      requestSummary?: boolean; // requires `execute` to be true as well
      requestTotalDuration?: boolean;
      resolvers?: boolean; // requires "execute" to be `true` as well
      resolversWhitelist?: string[];
      skipIntrospection?: boolean;
      registry: Registry;
    };
    readiness?: ReadinessCheckPluginOptions;
    responseCache?: {
      session: () => string;
      ttl: number;
      cache?: Redis;
    };
    tracing?: {}
  };
};
type YogaPlugin = {} | Plugin | Plugin<ServerContext & YogaInitialContext>;

export function buildGraphQLServer<AppContext extends BaseContext>(serverOptions: ServerOptions<AppContext>) {
  const { schema, options } = serverOptions;

  const plugins: (YogaPlugin)[] = [useDeferStream()];
  if (options.disableIntrospection) {
    plugins.push(useDisableIntrospection());
  }
  if (options.enableGraphQLArmor) {
    plugins.push(
      costLimitPlugin(),
      maxTokensPlugin(),
      maxDepthPlugin(),
      maxDirectivesPlugin(),
      maxAliasesPlugin(),
    );
  }
  if (options.metrics) {
    plugins.push(
      usePrometheus(options.metrics)
    );
  }
  if (options.readiness) {
    plugins.push(
      useReadinessCheck(options.readiness)
    )
  }
  if (options.responseCache) {
    const { session, ttl } = options.responseCache;
    let cache;
    if (options.responseCache.cache) {
      cache = createRedisCache({ redis: options.responseCache.cache })
    }
    plugins.push(useResponseCache({
      session,
      ttl,
      cache,
    }));
  }

  const yoga = createYoga<ServerContext>({
    schema,
    batching: true,
    context: options.context,
    cors: options.cors,
    graphiql: {
      subscriptionsProtocol: 'WS' // use WebSockets instead of SSE
    },
    graphqlEndpoint: '/',
    logging: options.logging,
    plugins,
  })

  type EnvelopedExecutionArgs = ExecutionArgs & {
    rootValue: {
      execute: typeof execute
      subscribe: typeof subscribe
    }
  }

  const wsHandler = makeBehavior({
    execute: args => (args as EnvelopedExecutionArgs).rootValue.execute(args),
    subscribe: args => (args as EnvelopedExecutionArgs).rootValue.subscribe(args),
    onSubscribe: async (ctx, msg) => {
      const { schema, execute, subscribe, contextFactory, parse, validate } = yoga.getEnveloped(ctx)

      const args: EnvelopedExecutionArgs = {
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
  })

  const graphqlApp = App()
    .addServerName(hostname(), {})
    .any('/*', yoga)
    .ws(yoga.graphqlEndpoint, wsHandler);
  return { graphqlApp };
}
