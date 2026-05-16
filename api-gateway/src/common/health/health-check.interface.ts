export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  UNHEALTHY = 'UNHEALTHY',
  DEGRADED = 'DEGRADED',
}

export interface ServiceHealth {
  name: string;
  url: string;
  status: HealthStatus;
  responseTime: number;
  lastCheck: Date;
  error?: Error;
}
