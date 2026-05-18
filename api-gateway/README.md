# Marketplace Microservices - API Gateway 🚀

Este repositório contém a implementação da **API Gateway**, o ponto central de entrada para o ecossistema de microsserviços do marketplace. O projeto foi desenhado seguindo princípios de escalabilidade independente, isolamento de falhas, resiliência avançada e segurança.

## 🏗️ Arquitetura do Sistema

O sistema é composto por domínios principais, cada um com a sua responsabilidade e base de dados própria (padrão _Database per Service_):

- **API Gateway**: Única porta de entrada para os clientes. Gerencia o roteamento, autenticação unificada, telemetria de saúde e proteção resiliente da infraestrutura.
- **Users Service**: Gestão de usuários, perfis e persistência segura de credenciais.
- **Product Service**: Catálogo de produtos e gestão de inventário.
- **Checkout Service**: Orquestração do carrinho de compras e criação de ordens de pedido.
- **Payment Service**: Processamento financeiro integrado a gateways de pagamento.

---

## 🛡️ Mecanismos de Resiliência (Pipeline em Camadas)

Para garantir que a arquitetura não colapse em cenários de instabilidade de rede ou quedas parciais de microsserviços, o `ProxyService` implementa uma **esteira de resiliência concêntrica (padrão Matrioska)**. Cada requisição síncrona passa por três barreiras de defesa antes de acionar uma estratégia de mitigação:

1. **Camada 1: Circuit Breaker (Estabilidade Global)**
   - **Papel**: Funciona como um disjuntor de proteção. Se um microsserviço registrar 3 falhas consecutivas, o circuito se abre por 30 segundos (`failureThreshold: 3`).
   - **Benefício**: Evita o esgotamento de recursos do Gateway e impede o efeito cascata, bloqueando requisições a serviços instáveis e dando tempo para que eles se recuperem.

2. **Camada 2: Retry Adaptativo (Recuperação de Falhas Transientes)**
   - **Papel**: Caso a requisição falhe por um erro lógico imediato (como HTTP 500) ou estoure o tempo limite, o sistema realiza até **4 retentativas** automáticas.
   - **Exponential Backoff & Jitter**: O tempo de espera cresce exponencialmente a cada falha, e o algoritmo de **Jitter** introduz um ruído aleatório nesses milissegundos. Isso distribui o tráfego e evita o _Thundering Herd Problem_ (efeito manada) quando o microsserviço volta a ficar online.

3. **Camada 3: Timeout Estrito (Proteção de Thread)**
   - **Papel**: Estabelece um teto rígido de tempo configurado por serviço (ex: 5 segundos).
   - **Benefício**: Se um microsserviço travar ou demorar demais em um processamento pesado, o Gateway corta a conexão de forma limpa via `Promise.race`, liberando a memória e acionando as tentativas do Retry.

4. **Camada de Escape: Fallback dinâmico e Cache Automatizado**
   - Se todas as barreiras falharem ou o circuito estiver aberto, a requisição é interceptada por uma estratégia de degradação graciosa:
     - **Cache Fallback (Consultas GET)**: Devolve dados previamente cacheados na memória (como a lista de produtos), mantendo o app funcional para o cliente.
     - **Default Fallback (Comandos POST/PUT/DELETE)**: Retorna respostas padronizadas e amigáveis de indisponibilidade temporária.

---

## 🔬 Observabilidade e Diagnóstico (Health Checks)

O Gateway expõe o módulo `HealthModule`, fornecendo endpoints estratégicos para monitoramento humano e integração com orquestradores de infraestrutura em nuvem (como Kubernetes ou AWS ECS):

- **`GET /health`**: Verifica de forma rápida a integridade e saúde do próprio processo do API Gateway (Uptime, memória e versão).
- **`GET /health/services`**: Varre e agrega concorrentemente (`Promise.allSettled`) o estado de todos os microsserviços do ecossistema, determinando se o status global está `HEALTHY` ou `DEGRADED`.
- **`GET /health/ready`** e **`GET /health/live`**: Probes padronizadas de _Readiness_ e _Liveness_ para sinalizar aos gerenciadores de container se o gateway está pronto para receber tráfego.

---

## 🔒 Implementações de Segurança

- **Helmet**: Configuração de cabeçalhos HTTP seguros para mitigar vulnerabilidades web comuns.
- **CORS Avançado**: Controle rígido de origens, métodos HTTP e cabeçalhos permitidos.
- **Advanced Rate Limiting**: Implementado via `@nestjs/throttler` em três níveis de granularidade (curto, médio e longo prazo) para prevenir ataques de negação de serviço (DoS) e abusos de API.
- **Validação Global**: Uso de `ValidationPipe` corporativo com `whitelist` e `forbidNonWhitelisted` ativos para sanetização estrita de payloads.

---

## 🛠️ Tecnologias e Ferramentas

- **Framework Principal**: NestJS (TypeScript)
- **Infraestrutura & Containers**: Docker & Docker Compose
- **Comunicação Síncrona**: Axios (`@nestjs/axios` + RxJS Observers)
- **Comunicação Assíncrona**: RabbitMQ (Arquitetura orientada a eventos/Event-driven)
- **Documentação Viva**: Swagger UI (OpenAPI)
