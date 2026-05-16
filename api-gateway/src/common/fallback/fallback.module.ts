import { Module } from '@nestjs/common';
import { DefaultFallbackService } from './default-fallback.service';
import { CacheFallbackService } from './cache.fallback';

@Module({
  providers: [CacheFallbackService, DefaultFallbackService],
  exports: [CacheFallbackService, DefaultFallbackService],
})
export class FallbackModule {}
