# Marketplace Microservices - Payments Service 💳

Este repositório contém a implementação do **Payments Service**, o microsserviço responsável por consumir as ordens de pedidos e processar as transações financeiras do ecossistema de forma assíncrona.

## 🏗️ Arquitetura e Papel no Ecossistema

O `payments-service` atua estritamente como um **Consumer (Consumidor)** no modelo de mensageria assíncrona ($Pub/Sub$). Ele escuta a fila de pagamentos para processar as transações sem bloquear o fluxo principal de compra do cliente.