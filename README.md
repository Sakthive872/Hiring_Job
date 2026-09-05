# React + Vite

## Run With MySQL

The frontend uses `http://localhost:8080` by default. Start the backend with
the MySQL profile after creating the `hiring` database:

```powershell
$env:SPRING_PROFILES_ACTIVE = 'mysql'
$env:DB_USERNAME = 'root'
$env:DB_PASSWORD = '<your-mysql-password>'
Set-Location backend
mvn spring-boot:run
```

The supplied SQL schema must match the backend JPA schema before using
`DDL_AUTO=validate`. The current backend expects `users.password`,
`users.username`, and a `user_roles` table; the pasted schema uses
`password_hash`, no username column, and a single `role` column. Do not run
the application against that schema unchanged. Use the backend migration in
`src/main/resources/db/migration/V1__init_schema.sql`, or migrate those
columns and tables first.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
