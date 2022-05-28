import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Current User Info
 */
export interface ICurrentUser {
  id: string;
  email: string;
}

/**
 * GraphQL Context
 */
export const CurrentUser = createParamDecorator(
  (_, context: ExecutionContext): ICurrentUser => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
