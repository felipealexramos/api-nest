import { UserIdCheckMiddlewareTsMiddleware } from './user-id-check.middleware.ts.middleware';

describe('UserIdCheckMiddlewareTsMiddleware', () => {
  it('should be defined', () => {
    expect(new UserIdCheckMiddlewareTsMiddleware()).toBeDefined();
  });
});
