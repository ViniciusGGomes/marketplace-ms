import { Injectable, Logger } from '@nestjs/common';
import { TimeoutOptions } from './timeout.interface';

@Injectable()
export class TimeoutService {
  private readonly logger = new Logger(TimeoutService.name);
  private readonly defaultOptions: TimeoutOptions = {
    timeout: 5000,
    retries: 3,
    backoffMultiplier: 2,
    maxBackoff: 30000,
  };

  /**
   * UTILITÁRIO PRIVADO: Cria uma promessa que rejeita (estoura erro) após o tempo limite.
   * Funciona como o timer do cronômetro para monitorar o estouro de timeout.
   */
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeout} ms`));
      }, timeout);
    });
  }

  /**
   * UTILITÁRIO PRIVADO: Segura a execução do código (bloqueio assíncrono) por X milissegundos.
   * Usado para dar tempo de descanso entre as tentativas de repetição.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * NÚCLEO DA LÓGICA (PRIVADO): Gerencia o loop de retentativas e a corrida de timeout.
   * Executa a operação, calcula o recuo exponencial (Exponential Backoff) e respeita o teto máximo.
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: TimeoutOptions,
  ): Promise<T> {
    let lastError: Error;
    let delay = 1000; // Tempo inicial de espera entre falhas

    for (let attempt = 0; attempt <= options.retries; attempt++) {
      try {
        this.logger.debug(`Attempt ${attempt + 1}/${options.retries + 1}`);

        // Corrida de promessas: o microsserviço contra o relógio de timeout
        const result = await Promise.race([
          operation(),
          this.createTimeoutPromise(options.timeout),
        ]);

        if (attempt > 0) {
          this.logger.log(`Operation succeeded on attempt ${attempt + 1}`);
        }

        return result;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Attempt ${attempt + 1} failed: ${lastError.message}`);

        // Se ainda restarem tentativas, aplica o recuo e aumenta o próximo descanso
        if (attempt < options.retries) {
          await this.delay(delay);
          delay = Math.min(
            delay * options.backoffMultiplier,
            options.maxBackoff,
          );
        }
      }
    }

    this.logger.error(`All ${options.retries + 1} attempts failed`);

    throw lastError!;
  }

  /**
   * MÉTODO PÚBLICO PRINCIPAL: Executa uma operação aplicando timeouts e retentativas configuráveis.
   * Se nenhuma opção for enviada, ele mescla e assume os valores padrões da aplicação (defaultOptions).
   */
  async executeWithTimeout<T>(
    operation: () => Promise<T>,
    options: Partial<TimeoutOptions> = {},
  ): Promise<T> {
    const config = { ...this.defaultOptions, ...options };

    return this.executeWithRetry(operation, config);
  }

  /**
   * MÉTODO PÚBLICO AUXILIAR: Corrida direta de timeout sem nenhuma retentativa (Retry zero).
   * Ideal para fluxos rígidos onde se o microsserviço falhar de primeira, o fluxo deve cair direto no fallback.
   */
  async executeWithCustomTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    return Promise.race([operation(), this.createTimeoutPromise(timeoutMs)]);
  }
}
