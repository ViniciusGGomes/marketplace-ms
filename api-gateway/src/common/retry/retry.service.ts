import { Injectable, Logger } from '@nestjs/common';
import { RetryOptions, RetryResult } from './retry.interface';

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);
  private readonly defaultOptions: RetryOptions = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true,
  };

  /**
   * CALCULADORA PRIVADA: Calcula o tempo de recuo exponencial para a próxima tentativa.
   * Se a opção 'jitter' estiver ativa, adiciona um ruído aleatório no tempo para
   * evitar picos de carga simultâneos (efeito manada) no microsserviço.
   */
  private calculateDelay(attempt: number, options: RetryOptions): number {
    let delay =
      options.baseDelay * Math.pow(options.backoffMultiplier, attempt);

    if (options.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.min(delay, options.maxDelay);

    // segue a AWS Architecture Blog
  }

  /**
   * UTILITÁRIO PRIVADO: Cria uma pausa assíncrona que segura a execução do loop.
   * Utilizado para forçar o Gateway a aguardar o tempo calculado pelo Backoff antes de tentar novamente.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * MÉTODO PRINCIPAL: Executa um fluxo lógico coletando telemetria e métricas profundas.
   * Não lança exceções diretamente; em vez disso, envelopa o desfecho da operação em um
   * objeto de relatório contendo o tempo total gasto e o número de tentativas reais.
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {},
  ): Promise<RetryResult<T>> {
    const config = { ...this.defaultOptions, ...options };
    const startTime = Date.now();
    let lastError: Error;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        this.logger.debug(
          `Retry attempt ${attempt + 1}/${config.maxRetries + 1}`,
        );

        const data = await operation();
        const totalTime = Date.now() - startTime;

        this.logger.log(
          `Operation succeeded on attempt ${attempt + 1} in ${totalTime}ms`,
        );

        return {
          success: true,
          data,
          attempts: attempt + 1,
          totalTime,
        };
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Attempt ${attempt + 1} failed: ${lastError.message}`);

        if (attempt < config.maxRetries) {
          const delay = this.calculateDelay(attempt, config);
          this.logger.debug(`Waiting ${delay}ms before retry`);
          await this.delay(delay);
        }
      }
    }
    const totalTime = Date.now() - startTime;
    this.logger.error(
      `All ${config.maxRetries + 1} attempts failed in ${totalTime}ms`,
    );

    return {
      success: false,
      error: lastError!,
      attempts: config.maxRetries + 1,
      totalTime,
    };
  }

  /**
   * MÉTODO AUXILIAR SIMPLIFICADO: Executa a operação utilizando o recuo exponencial tradicional.
   * Diferente do método principal, este funciona como um interceptador clássico: se todas as
   * tentativas falharem, ele desembrulha o relatório de métricas e estoura o erro original na Stack.
   */
  async executeWithExponentialBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
  ): Promise<T> {
    const result = await this.executeWithRetry(operation, { maxRetries });

    if (!result.success) {
      throw result.error!;
    }

    return result.data!;
  }
}
