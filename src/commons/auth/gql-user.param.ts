import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export interface ICurrentUser {
  id: string;
  email: string;
}

export const CurrentUser = createParamDecorator(
  (data: any, context: ExecutionContext): ICurrentUser => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
