import { GraphQLSchema } from "graphql";
import { MutationType, QueryType, SubscriptionType } from "./rootTypes";

const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
  subscription: SubscriptionType,
});

export {
  schema
};
