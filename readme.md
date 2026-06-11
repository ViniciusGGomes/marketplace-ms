# 🚀 Marketplace Microservices

Este repositório centraliza a arquitetura distribuída do Marketplace, construída com foco em microsserviços, comunicação orientada a eventos, resiliência operacional e observabilidade em tempo real.

A plataforma foi projetada seguindo os princípios de:

* Isolamento de domínios de negócio
* Escalabilidade horizontal
* Comunicação síncrona e assíncrona
* Tolerância a falhas
* Consistência eventual
* Observabilidade ponta a ponta

---

# 🏛️ Visão Geral da Arquitetura

O ecossistema é composto por diversos microsserviços especializados, cada um responsável por um domínio específico da aplicação.

Cada serviço possui sua própria documentação detalhada em seu respectivo arquivo `README.md`.

| Componente               | Função                                                               | Porta        | Tecnologias                         |
| ------------------------ | -------------------------------------------------------------------- | ------------ | ----------------------------------- |
| API Gateway              | Camada de entrada, roteamento, autenticação e proteção da plataforma | 3005         | NestJS, Helmet, Throttler           |
| Users Service            | Gerenciamento de usuários, autenticação e autorização                | 3000         | NestJS, TypeORM, PostgreSQL, Bcrypt |
| Products Service         | Gerenciamento do catálogo e produtos                                 | 3001         | NestJS, TypeORM, PostgreSQL         |
| Checkout Service         | Carrinho, pedidos e orquestração de compras                          | 3003         | NestJS, TypeORM, PostgreSQL, Axios  |
| Payments Service         | Processamento financeiro e pagamentos                                | 3004         | NestJS, TypeORM, PostgreSQL         |
| Messaging Infrastructure | Comunicação assíncrona baseada em eventos                            | 5672 / 15672 | RabbitMQ, Docker                    |
| Observability Stack      | Monitoramento, métricas e dashboards                                 | 9090 / 3010  | Prometheus, Grafana, PromQL         |

---

# 📐 Topologia de Comunicação

A arquitetura utiliza dois modelos de comunicação operando simultaneamente.

## 🔄 Comunicação Síncrona (HTTP/REST)

Utilizada para operações que exigem resposta imediata.

### Exemplos

* Login e autenticação de usuários.
* Consulta de produtos.
* Consulta de pedidos.
* Validação de estoque.
* Comunicação entre API Gateway e microsserviços.

### Fluxo

```text
Cliente
   │
   ▼
API Gateway
   │
   ├── Users Service
   ├── Products Service
   ├── Checkout Service
   └── Payments Service
```

---

## 📨 Comunicação Assíncrona (Event-Driven)

Utilizada em processos de negócio que podem ser executados de forma desacoplada.

### Principais Benefícios

* Menor acoplamento entre serviços.
* Maior resiliência.
* Processamento assíncrono.
* Tolerância a falhas.
* Consistência eventual.

### Fluxo de Pagamentos

```text
Checkout Service
       │
       ▼
 RabbitMQ Exchange
       │
       ▼
 Payments Service
       │
       ▼
 payment.result
       │
       ▼
 Checkout Service
```

---

# 🗺️ Visão Geral da Arquitetura
 IMAGEM DA ULTIMA AULA - DE TODA A ARQUITETURA
---

# 📊 Observabilidade

Toda a plataforma é monitorada através da stack de observabilidade.

## Componentes

### Prometheus

Responsável por:

* Coleta de métricas
* Armazenamento temporal
* Avaliação de alertas
* Execução de consultas PromQL

Porta:

```text
9090
```

---

### Grafana

Responsável por:

* Dashboards
* Visualização de métricas
* Monitoramento operacional
* Investigação de incidentes

Porta:

```text
3010
```
IMAGEM DO SSERVICÇOS FUNCIOANDNOS NO GRAFANA

---

# 🎯 Objetivos da Arquitetura

* Separar responsabilidades por domínio.
* Permitir evolução independente dos serviços.
* Garantir disponibilidade da plataforma.
* Facilitar manutenção e escalabilidade.
* Reduzir acoplamento entre componentes.
* Implementar comunicação orientada a eventos.
* Fornecer monitoramento centralizado.
* Garantir observabilidade completa do ecossistema.
