# Marketplace Microservices - API Gateway 🚀

Este repositório contém a implementação da **API Gateway**, o ponto central de entrada para o ecossistema de microsserviços do marketplace. O projeto foi desenhado seguindo princípios de escalabilidade independente, isolamento de falhas e segurança.

## 🏗️ Arquitetura do Sistema

O sistema é composto por 5 domínios principais, cada um com a sua responsabilidade e base de dados própria:

* **API Gateway**: Única porta de entrada para os clientes. Gere o roteamento, autenticação unificada e proteção da infraestrutura.
* **Users Service**: Gestão de utilizadores, perfis e persistência segura de credenciais.
* **Product Service**: Catálogo de produtos e gestão de inventário/stock.
* **Checkout Service**: Orquestração do carrinho de compras e criação de ordens de pedido.
* **Payment Service**: Processamento financeiro. Este serviço é isolado e protegido, sendo acessível apenas internamente.

## 🛠️ Tecnologias e Ferramentas

* **Framework**: [NestJS](com TypeScript)
* **Infraestrutura**: & Docker Compose
* **Banco de Dados**:Padrão: Database per Service
* **Mensageria**:(Comunicação assíncrona/Event-driven)
* **Segurança**: Helmet, Throttler (Rate Limit) e NestJS Config
* **Documentação**: Swagger (OpenAPI)

## 🛡️ Implementações de Segurança (Fase Atual: Gateway)

Nesta etapa de desenvolvimento da **API Gateway**, foram configuradas as seguintes camadas de proteção:

* **Helmet**: Middleware para segurança de cabeçalhos HTTP.
* **CORS**: Configurado para permitir origens específicas e métodos controlados.
* **Rate Limiting**: Implementado via `@nestjs/throttler` (limite de 100 pedidos por minuto para prevenir abusos e ataques DoS).
* **Validação Global**: Uso de `ValidationPipe` com `class-validator` para garantir que apenas dados válidos entrem no sistema (com `whitelist` e `forbidNonWhitelisted` ativos).

## 📡 Comunicação entre Microsserviços

O projeto explora os dois principais modelos de comunicação externa:

1.  **Síncrona (HTTP/Axios)**: Utilizada pelo Gateway para obter dados imediatos de *Users* e *Products*.
2.  **Assíncrona (RabbitMQ)**: Utilizada entre *Checkout* e *Payments* para garantir que os pagamentos sejam processados de forma resiliente e rastreável, mesmo sob alta carga.
