# Marketplace - Users Service

O **Users Service** é o microsserviço responsável pelo gerenciamento de identidade, cadastro de usuários e autenticação/autorização dentro do ecossistema do Marketplace. Ele centraliza o armazenamento dos perfis de usuários e a emissão de tokens JWT utilizados na comunicação segura entre os serviços.

O serviço opera internamente na porta **3000** e disponibiliza suas funcionalidades ao ambiente externo exclusivamente através do **API Gateway**.

---

# 🏛️ Recursos Core e Regras de Domínio

## Persistência Relacional

Utiliza **TypeORM** com **PostgreSQL** para persistência dos dados dos usuários.

Principais características:

* UUID como chave primária.
* Exclusão automática de campos sensíveis utilizando `@Exclude()`.
* Repositórios relacionais para acesso aos dados.
* Banco dedicado `users_db`.

## Criptografia de Senhas

As senhas são protegidas utilizando **bcryptjs** com fator de hash 10.

Benefícios:

* Senhas nunca são armazenadas em texto puro.
* Proteção contra vazamento de credenciais.
* Verificação segura durante autenticação.

## JWT (JSON Web Token)

Responsável pela emissão de tokens de acesso contendo informações de autenticação e autorização.

### Claims do Token

* `sub`
* `email`
* `role`

## Controle de Acesso Baseado em Papéis (RBAC)

O sistema diferencia usuários através do enum `UserRole`.

### Perfis Suportados

| Role   | Descrição |
| ------ | --------- |
| BUYER  | Comprador |
| SELLER | Vendedor  |

## Telemetria e Monitoramento

Integração com Prometheus através do middleware global de métricas.

Monitoramento de:

* Volume de requisições
* Latência
* Taxa de autenticação
* Erros operacionais

---

# 📦 Estrutura do Projeto

```text
src/
├── auth/
│   ├── decorators/   # Decorators customizados
│   ├── dto/          # DTOs de autenticação
│   ├── guards/       # Guards JWT
│   └── strategies/   # Estratégias Passport/JWT
│
├── config/           # Configurações do PostgreSQL
├── health/           # Health Checks
├── metrics/          # Métricas Prometheus
│
└── users/
    ├── entities/     # Entidades TypeORM
    └── enums/        # Enums de negócio
```

---

# ⚙️ Variáveis de Ambiente

```env
PORT=3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=users_db

# JWT
JWT_SECRET=secret
JWT_EXPIRES_IN=24h
```

---

# 🛠️ Instalação e Execução

## Pré-requisitos

* Node.js v18 ou superior
* PostgreSQL em execução
* Banco `users_db` criado

---

## Instalação

Instale as dependências:

```bash
npm install
```

---

## Execução

Inicie a aplicação em modo de desenvolvimento:

```bash
npm run start:dev
```

O serviço ficará disponível em:

```text
http://localhost:3000
```

---

# 🛣️ API Endpoints (Uso Interno)

Estas rotas são consumidas pelo API Gateway. Todas as entradas passam por validações de DTOs e regras de negócio.

---

## 🔐 Módulo de Autenticação

### POST `/auth/register`

Realiza o cadastro de um novo usuário.

#### Regras

* Verifica se o e-mail já existe.
* Gera hash da senha.
* Cria o usuário no banco.

#### Respostas

| Status       | Descrição            |
| ------------ | -------------------- |
| 201 Created  | Usuário criado       |
| 409 Conflict | E-mail já cadastrado |

---

### POST `/auth/login`

Realiza autenticação do usuário.

#### Regras

* Valida e-mail e senha.
* Verifica se a conta está ativa.
* Retorna token JWT.

#### Respostas

| Status           | Descrição             |
| ---------------- | --------------------- |
| 200 OK           | Login realizado       |
| 401 Unauthorized | Credenciais inválidas |

---

### GET `/auth/validate-token`

Valida a sessão atual utilizando o token JWT recebido.

#### Retorno

```json
{
  "id": "uuid",
  "email": "user@email.com",
  "role": "BUYER"
}
```

#### Respostas

| Status           | Descrição      |
| ---------------- | -------------- |
| 200 OK           | Token válido   |
| 401 Unauthorized | Token inválido |

---

## 👤 Módulo de Usuários

### GET `/users/profile`

Retorna os dados completos do usuário autenticado.

#### Respostas

| Status | Descrição         |
| ------ | ----------------- |
| 200 OK | Perfil encontrado |

---

### GET `/users/sellers`

Retorna todos os vendedores ativos cadastrados na plataforma.

#### Filtros Aplicados

* Role = SELLER
* Status = ACTIVE

#### Respostas

| Status | Descrição           |
| ------ | ------------------- |
| 200 OK | Lista de vendedores |

---

### GET `/users/:id`

Busca um usuário pelo UUID.

#### Validações

* Verificação automática de UUID via `ParseUUIDPipe`.

#### Respostas

| Status          | Descrição              |
| --------------- | ---------------------- |
| 200 OK          | Usuário encontrado     |
| 404 Not Found   | Usuário não encontrado |
| 400 Bad Request | UUID inválido          |

---

# 📈 Observabilidade

## Métricas Prometheus e Grafana

# 🎯 Responsabilidades do Serviço

* Cadastro de usuários.
* Autenticação de contas.
* Emissão de tokens JWT.
* Gerenciamento de perfis.
* Controle de acesso baseado em papéis (RBAC).
* Validação de identidade entre microsserviços.
* Monitoramento e observabilidade das operações de autenticação.
