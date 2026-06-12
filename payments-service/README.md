# Marketplace - Payments Service

O **Payments Service** é o microsserviço responsável pelo processamento financeiro do Marketplace. Ele gerencia o ciclo de vida das transações, integra-se ao barramento de eventos do RabbitMQ e atua como o componente central do processamento assíncrono de pagamentos.

O serviço opera internamente na porta **3004** e utiliza um banco PostgreSQL dedicado para armazenamento e auditoria das transações financeiras.

---

# 🏛️ Arquitetura Event-Driven

O Payments Service participa do padrão **Request-Reply Assíncrono**, assumindo dois papéis fundamentais dentro da arquitetura.

## 📥 Consumer (Request)

Consome eventos de cobrança enviados pelo Checkout Service através do RabbitMQ.

Responsabilidades:

* Receber ordens de pagamento.
* Validar mensagens recebidas.
* Processar transações financeiras.
* Persistir registros de auditoria.

---

## 📤 Publisher (Reply)

Após o processamento, publica um evento contendo o resultado da transação.

Responsabilidades:

* Informar aprovação ou rejeição.
* Atualizar o ecossistema de forma desacoplada.
* Encerrar o fluxo assíncrono iniciado pelo Checkout Service.

---

# 📐 Ciclo de Vida do Processamento
## Estrutura do payments-service
## 📐 2. Arquitetura e Ciclo de Vida Interno

O fluxo de processamento do serviço divide-se em três grandes pipelines lógicos, detalhados de forma visual no diagrama de arquitetura orientada a eventos abaixo:

<p align="center">
  <img width="1474" height="847" alt="Image" src="https://github.com/user-attachments/assets/528cecde-739e-45bb-9f3b-d1171588e584" />
</p>

Durante o startup da aplicação:

1. O NestJS executa `onModuleInit()`.
2. O `PaymentConsumerService` inicia o consumo das filas.
3. O RabbitMQ valida a conectividade.
4. O consumidor registra a escuta contínua de mensagens.

---

## Fase 2 - Captura e Validação

Quando uma mensagem é recebida:

1. O payload é consumido da fila.
2. O sistema executa validações estruturais.
3. Dados inválidos são rejeitados imediatamente.
4. Dados válidos são encaminhados ao `PaymentsService`.

### Estratégia Utilizada

```text id="r5t9wq"
Fail Fast
```

O processamento é interrompido imediatamente caso a mensagem apresente inconsistências.

---

## Fase 3 - Processamento do Pagamento

O serviço cria inicialmente um registro financeiro com status:

```text id="3y3zt5"
PENDING
```

Em seguida, delega a operação para o:

```text id="0eovzj"
FakePaymentGatewayService
```

---

### Simulação de Gateway Financeiro

O ambiente simula comportamentos reais de um processador de pagamentos.

#### Latência de Rede

Tempo aleatório entre:

```text id="rkj51u"
500ms - 2000ms
```

---

#### Regra de Limite Financeiro

Valores acima de:

```text id="6t5ttg"
R$ 10.000,00
```

São automaticamente rejeitados.

Motivo:

```text id="k98l1x"
Limite excedido
```

---

#### Regra do Centavo Rejeitado

Valores terminados em:

```text id="8f6c2f"
.99
```

Simulam falha da operadora.

Motivo:

```text id="wzjlm4"
Cartão recusado pela operadora
```

---

### Aprovação

Caso nenhuma regra seja violada:

* Status atualizado para `APPROVED`
* Geração de `transactionId`
* Registro de `processedAt`

---

## Fase 4 - Publicação do Resultado

Após a conclusão:

1. O pagamento é persistido.
2. O resultado é encapsulado.
3. Um evento é publicado na exchange global.

### Exchange

```text id="g8tvjw"
payments
```

### Routing Key

```text id="3m8a7x"
payment.result
```

Consumidor final:

```text id="bkhsgv"
Checkout Service
```

---

# 📦 Estrutura do Projeto

```text id="w7xhlr"
src/
├── config/
│
├── events/
│   ├── dlq/
│   ├── payment-consumer/
│   ├── payment-queue/
│   ├── payment-result-publish/
│   ├── rabbitmq/
│   ├── events.module.ts
│   └── payment-queue.interface.ts
│
├── health/
├── metrics/
│
└── payments/
    ├── entities/
    ├── fake-payment-gateway.service.ts
    ├── payments.controller.ts
    ├── payments.module.ts
    └── payments.service.ts
```

---

## Principais Componentes

| Componente             | Responsabilidade                  |
| ---------------------- | --------------------------------- |
| payment-consumer       | Consumo das ordens de pagamento   |
| payment-result-publish | Publicação dos resultados         |
| rabbitmq               | Gerenciamento de conexões         |
| dlq                    | Tratamento de mensagens inválidas |
| fake-payment-gateway   | Simulação do gateway financeiro   |
| payments.service       | Processamento das transações      |

---

# ⚙️ Variáveis de Ambiente

```env id="4x83zv"
PORT=3004
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5435
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=payments_db

# JWT
JWT_SECRET=your-super-secret
JWT_EXPIRES_IN=24h

# Serviços Externos
USERS_SERVICE_URL=http://localhost:3000
PRODUCTS_SERVICE_URL=http://localhost:3001
CHECKOUT_SERVICE_URL=http://localhost:3003

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin@localhost:5672
RABBITMQ_QUEUE_PAYMENTS=payment_queue
RABBITMQ_EXCHANGE=payments
```

---

# 🛣️ Endpoints Síncronos

Embora o processamento principal seja assíncrono, o serviço disponibiliza endpoints REST para auditoria e consulta.

---

## GET `/payments/:orderId`

Retorna os dados financeiros associados a uma ordem específica.

### Informações Retornadas

* Order ID
* Transaction ID
* Status do pagamento
* Motivos de falha
* Data de processamento

### Respostas

| Status        | Descrição            |
| ------------- | -------------------- |
| 200 OK        | Pagamento encontrado |
| 404 Not Found | Registro inexistente |

---

# 🔬 Observabilidade

## Health Check

```http id="7um1qu"
GET /health
```

Valida:

* Aplicação
* Banco PostgreSQL
* RabbitMQ

---

## Métricas Prometheus

```http id="y0xw0e"
GET /metrics
```

Métricas monitoradas:

* Total de pagamentos processados
* Aprovações
* Rejeições
* Tempo médio de processamento
* Latência do RabbitMQ
* Consumo de filas

---

# 🛠️ Como Rodar o Serviço

## 1. Instalar Dependências

```bash id="7yns25"
npm install
```

---

## 2. Inicializar Infraestrutura

```bash id="ptd3zg"
docker compose up -d
```

Isso iniciará:

* PostgreSQL
* RabbitMQ (caso configurado localmente)

---

## 3. Executar Aplicação

```bash id="jcf0mt"
npm run start:dev
```

Após a inicialização:

```text id="jv2nre"
http://localhost:3004
```

---

# 🎯 Responsabilidades do Serviço

* Processar pagamentos do Marketplace.
* Consumir eventos de cobrança.
* Publicar resultados financeiros.
* Persistir histórico transacional.
* Simular integrações com gateways de pagamento.
* Garantir rastreabilidade e auditoria.
* Fornecer observabilidade operacional.
* Integrar-se ao ecossistema através de arquitetura orientada a eventos.
