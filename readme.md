# Marketplace Microservices

Este repositório centraliza a arquitetura distribuída do Marketplace, construída com foco em microsserviços, comunicação orientada a eventos, resiliência operacional e observabilidade em tempo real.

A plataforma foi projetada seguindo os princípios de:

* Isolamento de domínios de negócio
* Escalabilidade horizontal
* Comunicação síncrona e assíncrona
* Tolerância a falhas
* Consistência eventual
* Observabilidade ponta a ponta

---

## 📦 Estrutura do Ecossistema

O projeto está dividido nos seguintes módulos e serviços:

* **[- API Gateway](./api-gateway):** Ponto de entrada e segurança do sistema (Rate Limiting, Autenticação e Circuit Breaker).
* **[- Checkout Service](./checkout-service):** Gerenciamento do ciclo de vida de carrinhos de compras e processamento inicial de pedidos.
* **[- Messaging Service](./messaging-service):** Orquestração e configuração de tópicos, exchanges e filas de mensageria com o RabbitMQ.
* **[- Observability Stack](./observability-stack):** Centralização e provisionamento de métricas e dashboards em tempo real usando Prometheus e Grafana.
* **[- Payments Service](./payments-service):** Motor assíncrono para processamento de pagamentos e validação de transações financeiras.
* **[- Products Service](./products-service):** Domínio responsável pelo catálogo, estoque e gerenciamento de permissões de vendedores.
* **[- Users Service](./users-service):** Serviço central de identidade, autenticação e gerenciamento de perfis de usuários.

### 🐳 Ambiente Conteinerizado (Orquestração Local)

Toda a malha de microsserviços e seus respectivos bancos de dados/brokers de infraestrutura são orquestrados localmente via Docker Compose, garantindo isolamento e paridade de ambiente:

<p align="center">
  <img width="1578" height="661" alt="Image" src="https://github.com/user-attachments/assets/c87161dd-87e0-4844-b3e4-2ed3ab36909c" />
</p>

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

---

## 📨 Comunicação Assíncrona (Event-Driven)

Utilizada em processos de negócio que podem ser executados de forma desacoplada.

### Principais Benefícios

* Menor acoplamento entre serviços.
* Maior resiliência.
* Processamento assíncrono.
* Tolerância a falhas.
* Consistência eventual.

---

# 🗺️ Visão Geral da Arquitetura

<p align="center">
  <img width="5156" height="5513" alt="Image" src="https://github.com/user-attachments/assets/b46d0f3c-a25c-4f31-892b-f0f48944281e" />
</p>

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
<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/81af006c-2808-42f5-9174-76d7d087d755" />

---

# 🛠️ Metodologia de Desenvolvimento (AI-Driven Engineering)

Mais do que a implementação física da arquitetura, o ciclo de vida deste projeto foi guiado por **Engenharia de Prompts avançada**, utilizando inteligência artificial de forma estruturada para garantir previsibilidade, documentação rigorosa e blindagem de software.

O fluxo de trabalho seguiu rigorosamente o pipeline mapeado abaixo:

<p align="center">
  <img width="1010" height="229" alt="Image" src="https://github.com/user-attachments/assets/2039b612-0617-43ba-be0d-7033533ecacc" />
</p>

### 🔄 Etapas do Pipeline

1. **Criação da Spec:** Utilização de prompts especializados para gerar especificações técnicas detalhadas de cada componente (ex: contratos de mensageria e regras de negócio).
2. **Análise (PR da Spec):** Revisão estática humana/IA do escopo proposto para validação de contratos antes da escrita de qualquer linha de código.
3. **Plano de Desenvolvimento:** Desdobramento automático da especificação em tarefas atômicas, mapeando arquivos afetados, dependências e assinaturas de métodos.
4. **Testes e Implementação:** Escrita paralela do código de negócio e dos testes automatizados (E2E e unitários) orientados estritamente pelas diretrizes do plano.
5. **Análise Final (PR de Código):** Code review automatizado focado em segurança, boas práticas do ecossistema NestJS e cobertura de testes.

---

# 🎯 Objetivos Concluídos da Arquitetura

* **Isolamento de Domínio:** Separação estrita de responsabilidades por microsserviço.
* **Evolução Independente:** Liberdade para escalar e alterar serviços sem gerar efeitos colaterais na malha privada.
* **Resiliência Nativa:** Minimização de falhas em cascata com comunicação assíncrona baseada em eventos.
* **Observabilidade Total:** Telemetria centralizada em tempo real para tomada de decisões operacionais.
* **Garantia de Qualidade:** Código limpo e validado de forma previsível através do pipeline de IA.
