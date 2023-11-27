import { createPubSub } from "graphql-yoga";
import Redis from 'ioredis';
import { createRedisEventTarget } from '@graphql-yoga/redis-event-target'
 
const publishClient = new Redis()
const subscribeClient = new Redis()

const eventTarget = createRedisEventTarget({
  publishClient,
  subscribeClient
})
 
export const pubSub = createPubSub({ eventTarget })
