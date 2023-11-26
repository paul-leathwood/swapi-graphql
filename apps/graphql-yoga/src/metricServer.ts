import Koa from "koa";

import { Registry, register as defaultRegister } from 'prom-client';

export function buildMetricsServer(register: Registry = defaultRegister) {
  const metricsMiddleware = async (ctx: any, next: any) => {
    if (ctx.request.path === '/metrics') {
      try {
        ctx.header['Content-Type'] = register.contentType;
        ctx.body = await register.metrics();
      } catch (err) {
        ctx.status = 500;
      }
    } else {
      return next();
    }
  };
  const metricsApp = new Koa();

  metricsApp.use(metricsMiddleware);

  return { metricsApp, register };
}
