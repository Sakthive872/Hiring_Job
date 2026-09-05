# Professional networking and job portal backend

## Overview
This project is a Spring Boot monolith for a LinkedIn-style professional networking and recruitment platform.

## Prerequisites
- Java 23+
- Maven 3.9+
- MySQL 8+

## Local setup
1. Create MySQL database:
   CREATE DATABASE linkedin_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
2. Update datasource settings in `src/main/resources/application.yml`.
3. Run:
   mvn clean install
4. Start the app:
   mvn spring-boot:run

## API conventions
- Auth endpoints under `/api/v1/auth`
- All response bodies use `ApiResponse<T>`
- JWT auth is required on protected endpoints

## WebSocket
- STOMP endpoint: `/ws`
- Application destination prefix: `/app`
- Message queue subscription: `/user/queue/messages`
- Notification queue subscription: `/user/queue/notifications`
