# Marketplace - Checkout Service

O **Checkout Service** é o microsserviço responsável pela orquestração do ciclo de compras do Marketplace. Ele gerencia carrinhos, cria pedidos e coordena o fluxo assíncrono de pagamentos utilizando RabbitMQ.

O serviço opera internamente na porta **3003** e combina persistência relacional com mensageria orientada a eventos para garantir consistência eventual e alta resiliência.

---

# 🏛️ Padrão Request-Reply Assíncrono

O Checkout Service implementa o padrão **Request-Reply** para desacoplar o processo de pagamento do fluxo principal da aplicação.

## Request (Solicitação)

Ao finalizar uma compra:

1. O pedido é criado com status `PENDING`.
2. Uma solicitação de pagamento é enviada para o RabbitMQ.
3. O cliente recebe uma resposta imediata sem aguardar o processamento financeiro.

## Reply (Resposta)

Após o processamento do pagamento:

1. O serviço de pagamentos publica o resultado.
2. O Checkout Service consome a mensagem.
3. O pedido é atualizado para seu estado final.

---

# 📐 Arquitetura e Fluxo Interno

## 📐 2. Arquitetura e Ciclo de Vida Interno

O fluxo de processamento do serviço divide-se em três grandes pipelines lógicos, detalhados de forma visual no diagrama de arquitetura orientada a eventos abaixo:

<p align="center">
  <img width="1586" height="801" alt="Image" src="https://github.com/user-attachments/assets/fff10c45-49bd-468d-b32b-d480d7d5cee5" />
</p>

## A. Gestão do Carrinho

### Adição de Itens

```http
POST /cart/items
```

Fluxo:

1. O usuário adiciona um item ao carrinho.

2. O `ProductsClientService` consulta o Products Service.

3. O sistema valida:
   - Existência do produto
   - Preço atual
   - Disponibilidade

4. Os dados são persistidos nas tabelas:
   - `cart`
   - `cart_item`

---

## B. Checkout do Pedido (Request)

### Finalização da Compra

```http
POST /cart/checkout
```

Fluxo:

1. Criação do pedido com status `PENDING`.
2. Limpeza transacional do carrinho.
3. Geração da ordem de pagamento.
4. Publicação da mensagem na exchange de pagamentos.

### Routing Key

```text
payment.order
```

### Exchange

```text
payments
```

---

## C. Processamento do Resultado (Reply)

Durante a inicialização da aplicação:

- O `PaymentResultConsumerService` registra um consumidor.
- A fila `payment_result_queue` permanece ativa aguardando respostas.

### Conversão de Status

| Pagamento | Pedido |
| --------- | ------ |
| approved  | PAID   |
| rejected  | FAILED |

Após o recebimento da resposta:

1. O pedido é localizado.
2. O status é atualizado.
3. O ciclo da compra é encerrado.

---

# 📦 Estrutura do Projeto

```text
src/
├── auth/                  # Estratégias de segurança e decorators de contexto do usuário
│   ├── decorators/        # Custom decorators (Ex: @CurrentUser, @Public)
│   ├── guards/            # Guards de proteção de rotas e escopo de autenticação
│   ├── strategies/        # Regras e decodificação do payload de claims do JWT
│   └── auth.module.ts     # Acoplador do módulo de autenticação
├── cart/                  # Domínio focado no gerenciamento do carrinho de compras
│   ├── dtos/              # Validação de payloads de entrada (Ex: AddCartItemDto)
│   ├── entities/          # Mapeamento TypeORM das tabelas locais (Cart, CartItem)
│   ├── enums/             # Enums de estado de negócio do carrinho
│   ├── cart.controller.ts # Endpoints de manipulação e gerenciamento de itens
│   ├── cart.module.ts     # Registrador do escopo de carrinho
│   └── cart.service.ts    # Regras de negócio de adição, leitura e limpeza do carrinho
├── config/                # Arquivos de parametrização de infraestrutura (database.config.ts)
├── events/                # Core de comunicação baseada em eventos via RabbitMQ broker
│   ├── payment-queue/     # Serviço produtor (Publisher) de ordens de pagamento
│   ├── rabbitmq/          # Engine de gerência de canais, prefetch, conexões e ack/nack
│   ├── events.module.ts   # Módulo centralizador de barramento
│   ├── payment-queue.interface.ts  # Contrato/Payload da mensagem enviada para cobrança
│   └── payment-result.interface.ts # Contrato/Payload da mensagem recebida do gateway
├── health/                # Probes de monitoramento de integridade via NestJS Terminus
├── metrics/               # Middleware e registro prom-client para o Prometheus scraper
├── orders/                # Domínio focado no ciclo de vida e fechamento de pedidos
│   ├── entities/          # Entidade relacional da tabela de ordens (Order Entity)
│   ├── enums/             # Enums de estado do pedido (PENDING, PAID, FAILED)
│   ├── payment-result-consumer/ # Consumidor que finaliza o ciclo e atualiza status
│   ├── orders.controller.ts     # Endpoints de checkout e histórico de ordens
│   ├── orders.module.ts         # Registrador do escopo de pedidos
│   └── orders.service.ts        # Orquestrador das transações e salvamento de pedidos
├── products-client/       # Cliente HTTP (Axios) para chamadas síncronas ao products-service
│   ├── products-client.module.ts  # Módulo integrador do cliente HTTP
│   └── products-client.service.ts # Consumidor síncrono da rota `/products/:id`
├── app.module.ts          # Módulo raiz que consolida toda a malha do checkout-service
└── main.ts                # Arquivo de inicialização e bootstrapping da aplicação NestJS
```

### Principais Módulos

| Módulo                  | Responsabilidade                  |
| ----------------------- | --------------------------------- |
| auth                    | Contexto de autenticação          |
| cart                    | Gerenciamento de carrinho         |
| orders                  | Gerenciamento de pedidos          |
| products-client         | Integração com Products Service   |
| payment-queue           | Publicação de eventos             |
| payment-result-consumer | Consumo de respostas              |
| rabbitmq                | Conexão e gerenciamento do broker |

---

# 🔒 Robustez e Resiliência

## Consistência Transacional

O esvaziamento do carrinho e a criação do pedido ocorrem na mesma transação.

Benefícios:

- Evita pedidos duplicados.
- Evita múltiplos checkouts do mesmo carrinho.
- Mantém integridade dos dados.

---

## Garantia de Entrega

O consumidor RabbitMQ utiliza:

```text
prefetch(1)
ack()
nack()
```

Características:

- Processamento controlado.
- Reentrega automática em caso de falha.
- Consistência eventual garantida.

Se o serviço ficar indisponível, as mensagens permanecem armazenadas no RabbitMQ até o retorno da aplicação.

---

# ⚙️ Variáveis de Ambiente

```env
PORT=3003

# PostgreSQL
DB_HOST=localhost
DB_PORT=5436
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=checkout_db

# Serviços Externos
USERS_SERVICE_URL=http://localhost:3000
PRODUCTS_SERVICE_URL=http://localhost:3001
PAYMENTS_SERVICE_URL=http://localhost:3004

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin@localhost:5672
RABBITMQ_QUEUE_PAYMENTS=payment_queue
RABBITMQ_EXCHANGE=payments

# JWT
JWT_SECRET=secret
```

---

# 🛣️ API Endpoints

## 🛒 Carrinho

| Método | Endpoint              | Descrição                      |
| ------ | --------------------- | ------------------------------ |
| POST   | `/cart/items`         | Adiciona ou incrementa um item |
| GET    | `/cart`               | Retorna o carrinho ativo       |
| DELETE | `/cart/items/:itemId` | Remove um item do carrinho     |

---

## 📦 Pedidos

| Método | Endpoint         | Descrição                     |
| ------ | ---------------- | ----------------------------- |
| POST   | `/cart/checkout` | Inicia o fluxo de checkout    |
| GET    | `/orders`        | Lista pedidos do usuário      |
| GET    | `/orders/:id`    | Retorna detalhes de um pedido |

---

# 🔬 Observabilidade

## Health Check

```http
GET /health
```

Verifica:

- Aplicação
- PostgreSQL
- RabbitMQ

---

## Métricas Prometheus

```http
GET /metrics
```

Métricas monitoradas:

- Requests por segundo
- Tempo de resposta
- Erros
- Consumo de filas
- Processamento de pedidos

---

# 🛠️ Como Rodar o Serviço

## 1. Instalar Dependências

```bash
npm install
```

---

## 2. Subir Infraestrutura

```bash
docker compose up -d
```

Isso iniciará:

- PostgreSQL
- RabbitMQ

---

## 3. Iniciar Aplicação

```bash
npm run start:dev
```

Após a inicialização, o serviço estará disponível em:

```text
http://localhost:3003
```

---

# 🎯 Responsabilidades do Serviço

- Gerenciar carrinhos de compras.
- Criar pedidos.
- Orquestrar o fluxo de checkout.
- Integrar-se ao Products Service.
- Publicar solicitações de pagamento.
- Consumir respostas financeiras.
- Garantir consistência eventual dos pedidos.
- Fornecer observabilidade e monitoramento operacional.

---
