import { Injectable, Logger } from '@nestjs/common';
import { HealthStatus, ServiceHealth } from './health-check.interface';
import { HttpService } from '@nestjs/axios';
import { CircuitBreakerService } from '../circuit-breaker/circuit-breaker.service';
import { serviceConfig } from 'src/config/gateway.config';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);
  private readonly heathyCache = new Map<string, ServiceHealth>();

  constructor(
    private readonly httpService: HttpService,
    private readonly circuitBreakerService: CircuitBreakerService,
  ) {}

  // Checa um serviço apenas
  async checkServiceHealth(
    serviceName: keyof typeof serviceConfig,
  ): Promise<ServiceHealth> {
    const service = serviceConfig[serviceName];
    const startTime = Date.now();

    try {
      await this.circuitBreakerService.executeWithCircuitBreaker(
        async () => {
          const response = await firstValueFrom(
            this.httpService
              .get(`${service.url}/health`, {
                timeout: service.timeout,
              })
              .pipe(timeout(service.timeout)),
          );
          return response.status;
        },
        `health-${serviceName}`,
        { failureThreshold: 3, timeout: 30000, resetTimeout: 30000 },
        async () => {
          throw new Error('Circuit breaker fallback');
        },
      );
      const responseTime = Date.now() - startTime;
      const serviceHealth: ServiceHealth = {
        name: serviceName,
        url: service.url,
        status: HealthStatus.HEALTHY,
        responseTime,
        lastCheck: new Date(),
      };
      this.heathyCache.set(serviceName, serviceHealth);
      return serviceHealth;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const serviceHealth: ServiceHealth = {
        name: serviceName,
        url: service.url,
        status: HealthStatus.UNHEALTHY,
        responseTime,
        lastCheck: new Date(),
      };
      this.heathyCache.set(serviceName, serviceHealth);
      this.logger.error(`Health check failed for ${serviceName}:`);
      return serviceHealth;
    }
  }

  //checa vários serviços de uma vez
  async checkAllServices(): Promise<ServiceHealth[]> {
    //Lista de serviços que vamos monitorar
    const services: (keyof typeof serviceConfig)[] = [
      'users',
      'products',
      'checkout',
      'payments',
    ];

    //allSettled espera o retorno de todos os serviços, mesmo que um retorne falha
    const healthChecks = await Promise.allSettled(
      services.map((serviceName) => this.checkServiceHealth(serviceName)),
    );

    // fulfilled - se ele terminou, a requisição terminou
    return healthChecks.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          name: services[index],
          url: serviceConfig[services[index]].url,
          status: HealthStatus.UNHEALTHY as const,
          responseTime: 0,
          lastCheck: new Date(),
          error: result.reason?.message || 'Unknown error',
        };
      }
    });
  }

  // métodos auxiliares para recuperar o cache
  getCachedHealth(serviceName: string): ServiceHealth | undefined {
    return this.heathyCache.get(serviceName);
  }

  getAllCachedHealth(): ServiceHealth[] {
    return Array.from(this.heathyCache.values());
  }
}
