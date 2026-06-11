# Marketplace - Products Service

O **Products Service** é o microsserviço responsável pelo gerenciamento do catálogo de produtos, estoque e anúncios do Marketplace. Ele opera de forma isolada na porta **3001** e centraliza todas as regras de negócio relacionadas aos produtos disponibilizados pelos vendedores da plataforma.

---

# 🏛️ Recursos Core e Regras de Domínio

## Persistência Relacional Isolada

O serviço utiliza um banco PostgreSQL dedicado para armazenamento do catálogo.

### Características

* Banco exclusivo `products_db`
* PostgreSQL executando na porta `5434`
* Integração com TypeORM
* Sincronização automática das entidades

---

## Controle de Acesso Baseado em Papéis (RBAC)

A criação de produtos é restrita a usuários com perfil de vendedor.

### Regras

* Usuários com role `SELLER` podem cadastrar produtos.
* Usuários sem permissão recebem `403 Forbidden`.
* As permissões são validadas utilizando os dados propagados pelo API Gateway.

---

## Relação de Propriedade dos Produtos

Todo produto é associado ao vendedor responsável por sua criação através do campo:

```text id="b8gh5w"
sellerId
```

Benefícios:

* Isolamento de catálogo por vendedor.
* Controle de propriedade dos anúncios.
* Facilidade de auditoria e rastreamento.

---

## Estratégia de Exposição Pública

As rotas de consulta utilizam o decorator `@Public()`.

### Rotas Públicas

* Listagem de produtos
* Consulta por ID
* Consulta por vendedor

Isso permite ao API Gateway aplicar cache sem necessidade de autenticação.

---

## Telemetria e Monitoramento

Integração com Prometheus através do middleware global de métricas.

Monitoramento de:

* Volume de requisições
* Tempo de resposta
* Latência das consultas
* Taxa de erros

---

# 📦 Estrutura do Projeto

```text id="jlwmde"
src/
├── auth/
│   ├── decorators/    # Decorators customizados
│   ├── guards/        # Guards JWT
│   └── strategies/    # Estratégias de autenticação
│
├── config/            # Configuração do banco de dados
├── health/            # Health Checks
├── metrics/           # Métricas Prometheus
│
└── products/
    ├── dtos/          # DTOs de validação
    ├── entities/      # Entidades TypeORM
    ├── products.controller.ts
    ├── products.module.ts
    └── products.service.ts
```

---

# ⚙️ Variáveis de Ambiente

```env
PORT=3001

# PostgreSQL
DB_HOST=localhost
DB_PORT=5434
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=products_db

# JWT
JWT_SECRET=secret
```

---

# 🛠️ Instalação e Execução

## Pré-requisitos

* Node.js v18 ou superior
* Docker
* Docker Compose

---

## Instalação

Instale as dependências do projeto:

```bash id="yxhsm8"
npm install
```

---

## Inicialização do Banco

Suba o banco PostgreSQL do serviço:

```bash id="apg8h4"
docker compose up -d
```

O container executa automaticamente verificações de disponibilidade utilizando:

```bash id="6mrx7d"
pg_isready
```

---

## Executando o Serviço

Inicie a aplicação em modo de desenvolvimento:

```bash id="q8gn7e"
npm run start:dev
```

O microsserviço ficará disponível em:

```text id="kgr3pc"
http://localhost:3001
```

---

# 🛣️ API Endpoints (Uso Interno)

Estas rotas são consumidas pelo API Gateway.

---

## 📦 Módulo de Produtos

### POST `/products`

Cria um novo produto vinculado ao vendedor autenticado.

#### Regras

* Requer JWT válido.
* Requer role `SELLER`.
* Associa automaticamente o produto ao vendedor.

#### Respostas

| Status        | Descrição             |
| ------------- | --------------------- |
| 201 Created   | Produto criado        |
| 403 Forbidden | Usuário sem permissão |

---

### GET `/products`

Retorna todos os produtos cadastrados.

#### Características

* Rota pública.
* Compatível com cache do Gateway.

#### Respostas

| Status | Descrição         |
| ------ | ----------------- |
| 200 OK | Lista de produtos |

---

### GET `/products/seller/:sellerId`

Retorna os produtos pertencentes a um vendedor específico.

#### Características

* Rota pública.
* Filtragem por vendedor.

#### Respostas

| Status | Descrição            |
| ------ | -------------------- |
| 200 OK | Produtos encontrados |

---

### GET `/products/:id`

Busca um produto pelo UUID.

#### Características

* Rota pública.
* Consulta individual do catálogo.

#### Respostas

| Status        | Descrição           |
| ------------- | ------------------- |
| 200 OK        | Produto encontrado  |
| 404 Not Found | Produto inexistente |

---

# 🔬 Diagnóstico e Observabilidade

## Health Check

Endpoint responsável por verificar a saúde do serviço.

```http id="4w3pja"
GET /health
```

Verifica:

* Disponibilidade da aplicação
* Estado do banco de dados
* Integridade do processo

---

## Métricas Prometheus

Endpoint para coleta de métricas operacionais.

```http id="s8q9c9"
GET /metrics
```

Métricas disponíveis:

* Requests por segundo
* Latência das requisições
* Taxa de erro
* Tempo médio de resposta

---

# 🎯 Responsabilidades do Serviço

* Gerenciar o catálogo de produtos.
* Controlar a criação de anúncios.
* Garantir permissões de vendedores.
* Manter o vínculo entre produtos e vendedores.
* Disponibilizar consultas públicas para o Marketplace.
* Fornecer métricas e observabilidade para monitoramento da plataforma.
