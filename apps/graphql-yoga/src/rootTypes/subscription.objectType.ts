import { GraphQLObjectType, GraphQLInt, GraphQLFloat } from "graphql";

import { pubSub } from "../graphql-pubsub";

export const SubscriptionType = new GraphQLObjectType({
  name: 'Subscription',
  fields: () => ({
    countdown: {
      type: GraphQLInt,
      args: {
        from: { type: GraphQLInt, defaultValue: 5}
      },
      subscribe: async function* (_, { from }) {
        for (let i = from; i >= 0; i--) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          yield i;
        }
      },
      resolve: payload => payload,
    },
    randomNumber: {
      type: GraphQLFloat,
      resolve: payload => payload,
      subscribe: () => pubSub.subscribe('randomNumber')
    }
  })
})