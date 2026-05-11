import { CustomThrottlerGuard } from './custom-throtter.guard';

describe('CustomThrotterGuard', () => {
  it('should be defined', () => {
    expect(new CustomThrottlerGuard()).toBeDefined();
  });
});
