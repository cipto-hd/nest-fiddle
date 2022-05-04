import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

export const Protocol = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    console.log('Protocol decorator data: ', data);
    const request: FastifyRequest = context
      .switchToHttp()
      .getRequest<FastifyRequest>();

    return request.protocol;
  },
);
