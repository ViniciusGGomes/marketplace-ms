import { Injectable, Logger } from '@nestjs/common';
import {
  CircuitBreakerOptions,
  CircuitBreakerState,
  CircuitBreakerStateEnum,
} from './circuit-breaker.interface';

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger('CircuitBreaker');
  private readonly circuits = new Map<string, CircuitBreakerState>();
  private readonly defaultOptions: CircuitBreakerOptions = {
    failureThreshold: 5,
    timeout: 60000,
    resetTimeout: 30000,
  };

  // Recupera o estado atual de um serviço ou inicializa um novo como 'CLOSED'
  private getOrCreateCircuit(
    key: string,
    options: CircuitBreakerOptions,
  ): CircuitBreakerState {
    if (!this.circuits.has(key)) {
      this.circuits.set(key, {
        state: CircuitBreakerStateEnum.CLOSED,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: Date.now() + options.timeout,
      });
    }
    return this.circuits.get(key)!;
  }

  // Restaura o circuito para o estado CLOSED e zera o contador de falhas
  private onSuccess(circuit: CircuitBreakerState, key: string): void {
    circuit.failureCount = 0;
    circuit.state = CircuitBreakerStateEnum.CLOSED;
    this.logger.debug(`Circuit breaker SUCCESS for ${key}, state: CLOSED`);
  }

  // Incrementa o contador de falhas e abre o circuito OPEN caso o limite de tolerância seja atingido
  private onFailure(
    circuit: CircuitBreakerState,
    key: string,
    options: CircuitBreakerOptions,
  ): void {
    circuit.failureCount++;
    circuit.lastFailureTime = Date.now();
    if (circuit.failureCount >= options.failureThreshold) {
      circuit.state = CircuitBreakerStateEnum.OPEN;
      circuit.nextAttemptTime = Date.now() + options.resetTimeout;
      this.logger.warn(`Circuit breaker OPEN for ${key}, state: OPEN`);
    }
  }

  // Gerencia a execução da operação, controla a mudança de estados e executa o fallback se necessário
  async executeWithCircuitBreaker<T>(
    operation: () => Promise<T>,
    key: string,
    options: CircuitBreakerOptions = this.defaultOptions,
    fallback?: () => Promise<T>,
  ): Promise<T> {
    const config = { ...this.defaultOptions, ...options };
    const circuit = this.getOrCreateCircuit(key, config);

    if (circuit.state === CircuitBreakerStateEnum.OPEN) {
      if (Date.now() < circuit.nextAttemptTime) {
        this.logger.warn(`Circuit breaker OPEN for ${key}, using fallback`);
        if (fallback) {
          return await fallback();
        }
        throw new Error('Circuit breaker OPEN');
      } else {
        circuit.state = CircuitBreakerStateEnum.HALF_OPEN;
        this.logger.warn(
          `Circuit breaker HALF_OPEN for ${key}, using fallback`,
        );
      }
    }

    try {
      const result = await operation();
      this.onSuccess(circuit, key);
      return result;
    } catch (error) {
      this.onFailure(circuit, key, config);
      this.logger.error(`Circuit breaker failure for ${key}: `);
      if (fallback) {
        this.logger.log(`Using fallback for ${key}`);
        return await fallback();
      }
      throw error;
    }
  }

  // Detalhes de monitoramento(estado, falhas, timers) de um serviço específico
  getCircuitState(key: string): CircuitBreakerState | undefined {
    return this.circuits.get(key);
  }

  // Retorna um snapshot de todos os circuitos ativos para fins de telemetria ou logs
  getAllCircuits(): Map<string, CircuitBreakerState> {
    return new Map(this.circuits);
  }

  // Remove as métricas de um serviço
  resetCircuit(key: string): void {
    this.circuits.delete(key);
    this.logger.log(`Circuit breaker RESET for ${key}`);
  }
}
