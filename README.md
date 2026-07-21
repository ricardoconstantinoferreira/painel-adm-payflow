# painel-adm-payflow

Dashboard administrativo para gerenciamento de lojas que utilizam o gateway de pagamento Payflow.

## Tecnologias utilizadas

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Angular Router](https://img.shields.io/badge/Angular%20Router-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Reactive Forms](https://img.shields.io/badge/Angular%20Reactive%20Forms-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Angular Signals](https://img.shields.io/badge/Angular%20Signals-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Spartan UI](https://img.shields.io/badge/Spartan%20UI-111827?style=for-the-badge&logo=angular&logoColor=white)

- Angular (Standalone Components).
- TypeScript (strict mode).
- Angular Router.
- Angular Reactive Forms (FormBuilder + validacoes).
- Angular Signals para estado local e reatividade.
- RxJS para fluxos assincronos.
- Tailwind CSS (padrao definido do projeto).
- Spartan UI (padrao definido do projeto, baseado em Angular CDK + Tailwind).

## O que o sistema faz

- Realiza autenticacao de usuarios administrativos.
- Permite o cadastro de loja no fluxo de primeiro acesso.
- Exibe area administrativa com navegacao por funcionalidades.
- Gerencia regras de parcelamento:
  - cadastro de regra;
  - listagem de regra cadastrada;
  - remocao com confirmacao.
- Gerencia regras de bloqueio:
  - cadastro de regra com campos quantidade, parametro e tipo do parametro;
  - listagem de regra cadastrada;
  - remocao com confirmacao.

## Rotas principais

- `/` login.
- `/primeiro-acesso` cadastro de loja.
- `/home` painel inicial.
- `/home/regra-parcelamento` gestao de regras de parcelamento.
- `/home/regra-bloqueio` gestao de regras de bloqueio.

## Integracao com API

- Regras de parcelamento: `http://127.0.1:8080/api/payflow/store/config`.
- Regras de bloqueio: `http://127.0.1:8080/api/payflow/blockade`.

## Estrutura de arquitetura

O projeto segue organizacao por feature:

- `src/app/features/auth` para autenticacao e primeiro acesso.
- `src/app/features/home` para telas administrativas e regras.
- `src/app/services` para servicos globais (como sessao/autenticacao).

## Como executar localmente

1. Instale as dependencias:

```bash
npm install
```

2. Inicie o projeto:

```bash
npm start
```

3. Acesse no navegador:

- `http://localhost:4200`

## Testes

Para executar os testes unitarios:

```bash
npm test -- --watch=false
```
