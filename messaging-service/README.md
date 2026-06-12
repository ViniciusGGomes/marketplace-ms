# 📨 Marketplace - Messaging Infrastructure

A infraestrutura de mensageria é o núcleo assíncrono do Marketplace, responsável por inicializar e gerenciar o cluster local do **RabbitMQ**.

Ela fornece o barramento de comunicação distribuída utilizado pelos microsserviços para troca de eventos, permitindo desacoplamento entre componentes, tolerância a falhas e consistência eventual.

Atualmente, a infraestrutura é utilizada principalmente na comunicação entre:

* Checkout Service
* Payments Service

---

# 🏛️ Arquitetura e Topologia de Mensageria

A solução foi construída utilizando o padrão **Topic Exchange**, permitindo roteamento flexível através de **Routing Keys**.

---

## Exchange Principal

| Propriedade | Valor    |
| ----------- | -------- |
| Nome        | payments |
| Tipo        | topic    |
| Durável     | Sim      |

Responsável por centralizar todos os eventos relacionados ao fluxo de compras.

---

## Routing Keys

### payment.order

Mensagens publicadas pelo Checkout Service contendo solicitações de cobrança.

#### Exemplo

```json id="tgt1s4"
{
  "orderId": "uuid",
  "userId": "uuid",
  "total": 199.90
}
```

Destino:

```text 
Payments Service
```

---

### payment.result

Mensagens publicadas pelo Payments Service contendo o resultado da transação financeira.

#### Exemplo

```json
{
  "orderId": "uuid",
  "status": "approved"
}
```

Status possíveis:

* approved
* rejected

Destino:

```text
payment_result_queue
```

Consumidor:

```text
Checkout Service
```

---

# ⚙️ Ambiente Docker (RabbitMQ 4.x)

A infraestrutura foi otimizada para ambientes locais de desenvolvimento utilizando a versão mais recente do RabbitMQ.

---

## Imagem Utilizada

```yaml id="afwftd"
rabbitmq:4.3-management-alpine
```

### Benefícios

* Imagem leve baseada em Alpine Linux
* Menor consumo de memória
* Inicialização rápida
* Painel administrativo integrado

---

## Persistência de Dados

O broker utiliza um volume dedicado para preservar:

* Filas
* Exchanges
* Bindings
* Mensagens persistentes

Volume utilizado:

```text
rabbitmq_data
```

---

## Health Check

O container executa verificações automáticas utilizando:

```bash
rabbitmq-diagnostics
```

Isso garante que os microsserviços somente iniciem conexões após a completa disponibilidade do broker.

---

# 🔌 Portas de Comunicação

| Porta | Serviço            | Finalidade                   |
| ----- | ------------------ | ---------------------------- |
| 5672  | AMQP 0-9-1         | Comunicação entre aplicações |
| 15672 | HTTP Management UI | Interface administrativa     |

---

## AMQP

Utilizada pelos microsserviços NestJS através do cliente:

```text
amqplib
```

Protocolo:

```text
AMQP 0-9-1
```

---

## Painel Administrativo

Acesse:

```text
http://localhost:15672
```

Permite monitorar:

* Filas
* Exchanges
* Consumers
* Producers
* Taxa de mensagens
* Conexões ativas

---

# 🛠️ Inicialização

## Pré-requisitos

* Docker
* Docker Compose

---

## Subir o RabbitMQ

Execute:

```bash
docker compose up -d
```

---

## Verificar Status

```bash
docker compose ps
```

---

## Acessar Interface Web

Abra no navegador:

```text
http://localhost:15672
```

---

## Credenciais de Desenvolvimento

> ⚠️ Utilizar apenas em ambiente local.

| Campo   | Valor |
| ------- | ----- |
| Usuário | admin |
| Senha   | admin |

---

# 🎯 Responsabilidades da Infraestrutura

* Fornecer comunicação assíncrona entre microsserviços.
* Garantir desacoplamento entre produtores e consumidores.
* Permitir consistência eventual.
* Armazenar mensagens de forma segura.
* Garantir entrega confiável através de ACK/NACK.
* Suportar escalabilidade horizontal da plataforma.
* Disponibilizar monitoramento operacional via painel administrativo.
