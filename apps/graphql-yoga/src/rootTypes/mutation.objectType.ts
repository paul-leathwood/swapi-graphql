import { GraphQLObjectType, GraphQLBoolean } from "graphql";

import { pubSub } from "../graphql-pubsub";

export const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    broadcastRandomNumber: {
      type: GraphQLBoolean,
      resolve: () => {
        pubSub.publish('randomNumber', Math.random())
      }
    }
  })
});