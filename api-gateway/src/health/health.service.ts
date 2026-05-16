import { Injectable } from '@nestjs/common';
import { HealthStatus } from 'src/common/health/health-check.interface';
import { HealthCheckService } from 'src/common/health/health-check.service';

@Injectable()
export class HealthService {
  constructor(private readonly HealthCheckService: HealthCheckService) {}

  // Passa por cada serviço e cria um resultado com detalhes de cada serviço, vai flitar e deixar de forma bonita para mostrar para o cliente.
  async getHealthStatus() {
    const healthChecks = await this.HealthCheckService.checkAllServices();

    const results = {
      status: HealthStatus.HEALTHY,
      timestamp: new Date().toISOString(),
      gateway: {
        status: HealthStatus.HEALTHY,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
      services: {},
    };

    let hasUnhealthyService = false;

    healthChecks.forEach((serviceHealth) => {
      results.services[serviceHealth.name] = {
        status: serviceHealth.status,
        responseTime: serviceHealth.responseTime,
        lastCheck: serviceHealth.lastCheck,
        url: serviceHealth.url,
        ...(serviceHealth.error && { error: serviceHealth.error }),
      };

      if (serviceHealth.status === HealthStatus.UNHEALTHY) {
        hasUnhealthyService = true;
      }
    });

    if (hasUnhealthyService) {
      results.status = HealthStatus.DEGRADED;
    }

    return results;
  }

  // se está todo mundo pronto para receber trafego ou não
  async getReadyStatus() {
    const healthStatus = await this.getHealthStatus();

    return {
      status:
        healthStatus.status == HealthStatus.HEALTHY ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
    };
  }

  // Verifica se o processo está funcionando, que é a API gateway
  async getLiveStatus() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
