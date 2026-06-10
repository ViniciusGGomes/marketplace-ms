# Marketplace - API Gateway

O **API Gateway** atua como a camada de borda corporativa e o ponto único de entrada para o ecossistema de microsserviços do Marketplace. É responsável por centralizar requisições provenientes de aplicações Frontend, Mobile e clientes HTTP, realizando o roteamento inteligente para os serviços especializados do ecossistema.

Sua arquitetura foi projetada com foco em **alta disponibilidade**, **segurança**, **resiliência** e **observabilidade ponta a ponta**.

---

# 🏛️ Recursos e Padrões Arquiteturais

## Reverse Proxy

Realiza o redirecionamento transparente de requisições para os microsserviços internos através do `ProxyModule`, ocultando a topologia da infraestrutura e centralizando o acesso externo.

## Autenticação Centralizada

O `AuthModule` intercepta e valida tokens JWT recebidos via Bearer Token, propagando informações do usuário para os serviços internos através dos seguintes cabeçalhos:

- `x-user-id`
- `x-user-email`
- `x-user-role`

## Fault Tolerance

### Timeout Controlado

Implementado pelo `TimeoutModule`, limita o tempo máximo de resposta dos microsserviços para evitar bloqueios no Gateway.

### Retry com Backoff Exponencial

Executa novas tentativas automáticas em falhas transitórias de rede utilizando estratégias de retentativa progressiva.

### Circuit Breaker

Interrompe chamadas para serviços degradados quando o limite de falhas configurado é atingido, prevenindo falhas em cascata.

### Fallback Inteligente

Quando um serviço está indisponível, o Gateway pode retornar dados em cache ou respostas alternativas por meio do `CacheFallbackService`.

## Métricas e Observabilidade

Coleta métricas seguindo o padrão **RED (Requests, Errors, Duration)** utilizando `prom-client` e o middleware global `HttpMetricsMiddleware`.

Compatível com integração ao Prometheus e Grafana.

---

# 🔒 Segurança

## Helmet

Configuração automática de cabeçalhos HTTP para mitigação de vulnerabilidades comuns:

- XSS
- Clickjacking
- MIME Sniffing

## CORS

Controle explícito de:

- Origens permitidas
- Métodos HTTP
- Cabeçalhos autorizados

## Rate Limiting

Implementado com `@nestjs/throttler` através do `CustomThrottlerGuard`.

| Nível  | Limite         |
| ------ | -------------- |
| Short  | 10 req/s       |
| Medium | 100 req/min    |
| Long   | 1000 req/15min |

Proteção contra:

- Ataques DoS
- Scripts automatizados
- Abuso de APIs

---

## 🔬 Diagnóstico de Infraestrutura (Health Check)

O Gateway expõe um endpoint único e estratégico para monitorar a integridade da malha privada de microsserviços através do `HealthModule` utilizando o NestJS Terminus:

- **`GET /health`**: Executa testes de conectividade ativos concorrentemente contra os endpoints locais de cada microsserviço cadastrado (`users`, `products`, `checkout` e `payments`).
  - **Status 200 OK:** Sinaliza que todos os microsserviços do ecossistema estão online, comunicando-se perfeitamente e prontos para receber tráfego.
  - **Status 503 Service Unavailable:** Disparado de forma automática caso algum dos microsserviços upstream fique offline ou sofra degradação crítica, permitindo auditoria humana imediata e integração com ferramentas de alerta.

# 🛠️ Tecnologias

## Backend

- NestJS
- TypeScript

## Comunicação

- Axios
- RabbitMQ

## Infraestrutura

- Docker
- Docker Compose

## Documentação

- Swagger UI

## Monitoramento

- Prometheus
- prom-client

---

# 📦 Estrutura do Projeto

```text
src/
├── auth/          # JWT, Guards e autenticação
├── checkout/      # Proxy para carrinho e pedidos
├── common/        # Circuit Breaker, Retry, Timeout e Fallback
├── config/        # Configurações globais e URLs dos serviços
├── guards/        # CustomThrottlerGuard
├── health/        # Endpoints de monitoramento
├── middleware/    # Logging e auditoria
├── metrics/       # Métricas Prometheus
├── payments/      # Proxy do serviço de pagamentos
├── products/      # Proxy do catálogo e estoque
└── users/         # Proxy de usuários e autenticação
```

---

# ⚙️ Variáveis de Ambiente

```env
PORT=3005

# JWT
JWT_SECRET=secret

# Microsserviços
USERS_SERVICE_URL=http://localhost:3000
PRODUCTS_SERVICE_URL=http://localhost:3001
CHECKOUT_SERVICE_URL=http://localhost:3003
PAYMENTS_SERVICE_URL=http://localhost:3004

# CORS
CORS_ORIGIN=*
```

---

# 🎯 Responsabilidades do Gateway

- Centralizar o acesso ao ecossistema de microsserviços.
- Aplicar autenticação e autorização na borda.
- Implementar mecanismos de resiliência distribuída.
- Monitorar tráfego e desempenho da plataforma.
- Proteger os serviços internos contra abusos e ataques.
- Fornecer observabilidade operacional para infraestrutura e negócio.

---

# 🛣️ Matriz de Roteamento Unificada (Porta 3005)

| Método | Endpoint Externo             | Destino Interno (Upstream)                           | Autenticação | Proteções Ativas                |
| ------ | ---------------------------- | ---------------------------------------------------- | ------------ | ------------------------------- |
| POST   | `/auth/register`             | users-service (`:3000/auth/register`)                | Pública      | Throttler, ValidationPipe       |
| POST   | `/auth/login`                | users-service (`:3000/auth/login`)                   | Pública      | Throttler, ValidationPipe       |
| GET    | `/auth/validate-token`       | users-service (`:3000/auth/validate-token`)          | Requer JWT   | Throttler                       |
| GET    | `/users/profile`             | users-service (`:3000/users/profile`)                | Requer JWT   | Throttler                       |
| GET    | `/users/sellers`             | users-service (`:3000/users/sellers`)                | Requer JWT   | Throttler                       |
| GET    | `/users/:id`                 | users-service (`:3000/users/:id`)                    | Requer JWT   | Throttler                       |
| POST   | `/products`                  | products-service (`:3001/products`)                  | Requer JWT   | Throttler, ValidationPipe       |
| GET    | `/products`                  | products-service (`:3001/products`)                  | Pública      | Cache, Timeout, Circuit Breaker |
| GET    | `/products/:id`              | products-service (`:3001/products/:id`)              | Pública      | Cache, Timeout, Circuit Breaker |
| GET    | `/products/seller/:sellerId` | products-service (`:3001/products/seller/:sellerId`) | Pública      | Cache, Timeout, Circuit Breaker |
| POST   | `/cart/items`                | checkout-service (`:3003/cart/items`)                | Requer JWT   | Timeout, Retry, ValidationPipe  |
| GET    | `/cart`                      | checkout-service (`:3003/cart`)                      | Requer JWT   | Timeout, Retry                  |
| DELETE | `/cart/items/:itemId`        | checkout-service (`:3003/cart/items/:itemId`)        | Requer JWT   | Timeout, Retry                  |
| POST   | `/cart/checkout`             | checkout-service (`:3003/cart/checkout`)             | Requer JWT   | Timeout, Retry, ValidationPipe  |
| GET    | `/orders`                    | checkout-service (`:3003/orders`)                    | Requer JWT   | Timeout, Retry                  |
| GET    | `/orders/:id`                | checkout-service (`:3003/orders/:id`)                | Requer JWT   | Timeout, Retry                  |
| GET    | `/payments/:orderId`         | payments-service (`:3004/payments/:orderId`)         | Requer JWT   | Timeout, Retry, Fallback        |
| GET    | `/health`                    | Interno (Terminus Probes)                            | Pública      | Nenhuma (Ignora Throttler)      |
| GET    | `/metrics`                   | Interno (Prometheus Exporter)                        | Pública      | Nenhuma (Ignora Throttler)      |

---

## 🚀 Como Rodar o Serviço

Siga os passos abaixo para instalar as dependências e iniciar o API Gateway localmente.

### 📋 Pré-requisitos

- **Node.js** (v18 ou superior)
- **Docker**
- **Docker Compose**

---

### 🛠️ Instalação das Dependências

Instale as dependências do projeto:

```bash
npm install
```

---

### 🐳 Subindo a Infraestrutura

Caso os microsserviços e dependências estejam conteinerizados, inicie os containers necessários:

```bash
docker compose up -d
```

Verifique se todos os serviços necessários estão em execução antes de iniciar o Gateway.

---

### ▶️ Executando o API Gateway

Inicie a aplicação em modo de desenvolvimento com Hot Reload:

```bash
npm run start:dev
```

---

### 🌐 Acesso

Após a inicialização, o API Gateway estará disponível em:

```text
http://localhost:3005
```

---

### 📚 Documentação Swagger

A documentação interativa da API pode ser acessada em:

```text
http://localhost:3005/api
```

---

### 📈 Métricas Prometheus & Grafana

Endpoint utilizado para coleta ativa de telemetria:

```text
GET http://localhost:3005/metrics
```

---
