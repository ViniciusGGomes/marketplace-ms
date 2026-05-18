export interface TimeoutOptions {
  timeout: number; // Tempo máximo de espera pela resposta da API
  retries: number; // Quantidade de tentativas após uma falha
  backoffMultiplier: number; // Multiplicador do tempo de espera entre tentativas
  maxBackoff: number; // Limite máximo (teto) do tempo de espera
}
