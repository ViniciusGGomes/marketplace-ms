# 📊 Marketplace - Observability Stack

O **Observability Stack** é o módulo responsável pela telemetria, monitoramento e observabilidade do Marketplace. Ele centraliza a coleta, armazenamento e visualização de métricas utilizando **Prometheus** e **Grafana**, permitindo acompanhamento em tempo real da saúde dos microsserviços e da infraestrutura.

<p align="center">
  <img src="./assets/checkout-flow.png" alt="Fluxo de Checkout e Request-Reply com RabbitMQ" width="100%">
</p>

---

# 🏛️ Recursos Core e Provisionamento Automatizado

A stack utiliza o conceito de **Provisioning as Code**, eliminando configurações manuais após a inicialização.

## Auto Discovery de Métricas

O Prometheus executa ciclos de coleta a cada **15 segundos**, capturando:

- Métricas nativas do Node.js
- Métricas RED (Requests, Errors, Duration)
- Informações de infraestrutura dos microsserviços
- Indicadores de negócio

---

## Data Sources Provisionadas

O Grafana é inicializado automaticamente com a conexão ao Prometheus através do arquivo:

```text
grafana/provisioning/datasources/datasource.yml
```

---

## Dashboards Automáticos

Os dashboards são carregados automaticamente durante a inicialização do Grafana.

### Dashboards Disponíveis

| Dashboard | Finalidade |
|------------|------------|
| marketplace-overview | Visão geral da plataforma |
| service-details | Detalhamento individual dos serviços |

---

# 📦 Estrutura de Pastas

```text
observability-stack/
├── docs/
│
├── grafana/
│   └── provisioning/
│       ├── dashboards/
│       │   ├── dashboards.yml
│       │   ├── marketplace-overview.json
│       │   └── service-details.json
│       │
│       └── datasources/
│           └── datasource.yml
│
├── prometheus/
│   ├── alert.rules.yml
│   └── prometheus.yml
│
└── tests/
    ├── alert-test.sh
    └── prometheus.yml
```

---

# 🚪 Portas e Serviços

| Serviço | Porta | URL | Credenciais |
|----------|----------|----------|----------|
| Prometheus | 9090 | http://localhost:9090 | Não possui |
| Grafana | 3010 | http://localhost:3010 | admin / admin |

---

# 📊 Dashboards

O Grafana fornece uma visão centralizada de toda a arquitetura de microsserviços.

Monitoramentos disponíveis:

- API Gateway
- Users Service
- Products Service
- Checkout Service
- Payments Service
- RabbitMQ
- PostgreSQL
- Infraestrutura Docker

---

# 🚨 Políticas de Alertas

As regras são definidas no arquivo:

```text
prometheus/alert.rules.yml
```

O Prometheus avalia continuamente as métricas a cada **15 segundos**.

---

## ⚙️ Alertas de Infraestrutura

### ServiceDown

**Severidade:** CRITICAL

Disparado quando:

```promql
up == 0
```

Indica que um microsserviço está indisponível por mais de 30 segundos.

---

### HighErrorRate

**Severidade:** WARNING

Disparado quando:

- Erros HTTP 5xx ultrapassam 10%
- Janela de análise de 5 minutos

---

### HighLatencyP95

**Severidade:** WARNING

Disparado quando:

- P95 de latência ultrapassa 2 segundos
- Janela de análise de 5 minutos

---

### HighMemoryUsage

**Severidade:** WARNING

Disparado quando:

- Uso de memória RSS ultrapassa 512 MB
- Persistência superior a 2 minutos

---

## 💼 Alertas de Negócio

### NoPaymentsProcessed

**Severidade:** INFO

Disparado quando:

- Nenhum pagamento aprovado é registrado nos últimos 5 minutos.

Objetivo:

- Detectar travamentos silenciosos.
- Identificar falhas de consumo no RabbitMQ.

---

### HighPaymentRejectionRate

**Severidade:** WARNING

Disparado quando:

- Taxa de rejeição de pagamentos supera 50%.
- Janela de análise de 2 minutos.

Objetivo:

- Detectar instabilidades no gateway financeiro.

---

# 🛠️ Como Rodar a Stack

## Pré-requisitos

- Docker
- Docker Compose
- Microsserviços em execução

> Os serviços devem estar ativos para que o Prometheus consiga coletar métricas através do `host.docker.internal`.

---

## Inicialização

Suba toda a infraestrutura:

```bash
docker compose up -d
```

---

## Verificar Status

```bash
docker compose ps
```

---

## Verificar Alvos Monitorados

Acesse:

```text
http://localhost:9090/targets
```

Nesta tela é possível validar:

- Targets ativos
- Status de coleta
- Tempo de resposta
- Erros de scraping

---

## Encerrar Infraestrutura

Mantendo volumes e históricos:

```bash
docker compose down
```

---

## Hard Reset

Remove containers, volumes e históricos persistidos:

```bash
docker compose down -v
```

---

# 🔍 Health Checks

## Prometheus

```http
GET http://localhost:9090/-/healthy
```

---

## Grafana

```http
GET http://localhost:3010/api/health
```

---

# 🎯 Responsabilidades da Stack

- Coletar métricas dos microsserviços.
- Armazenar séries temporais.
- Exibir dashboards operacionais.
- Monitorar infraestrutura.
- Detectar falhas automaticamente.
- Gerar alertas proativos.
- Fornecer observabilidade ponta a ponta do Marketplace.
- Apoiar troubleshooting e análise de performance.