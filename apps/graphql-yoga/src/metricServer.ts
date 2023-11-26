import Koa from "koa";

import { register as defaultRegister } from 'prom-client';

export function buildMetricsServer() {
  const metricsMiddleware = async (ctx: any, next: any) => {
    if (ctx.request.path === '/metrics') {
      try {
        ctx.header['Content-Type'] = defaultRegister.contentType;
        ctx.body = await defaultRegister.metrics();
      } catch (err) {
        ctx.status = 500;
      }
    } else {
      return next();
    }
  };
  const metricsApp = new Koa();

  metricsApp.use(metricsMiddleware);

  return { metricsApp, register: defaultRegister };
}
