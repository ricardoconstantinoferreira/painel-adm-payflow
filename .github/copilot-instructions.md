# Diretrizes Gerais de Desenvolvimento - Front-End

Este documento serve como a fonte da verdade para o padrão de código, arquitetura e decisões de design deste projeto. O GitHub Copilot deve seguir estritamente estas diretrizes ao gerar ou refatorar código.

## 1. Visão Geral do Projeto
* **Objetivo:** Dashboard administrativo para gerenciamento de Lojas que iram usar o Gateway de Pagamento.
* **Público-alvo:** Administradores internos e gerentes de operações.

## 2. Pilha de Tecnologias (Tech Stack)
* **Framework:** Angular (versão estável mais recente, utilizando Standalone Components)
* **Linguagem:** TypeScript (com modo estrito ativado)
* **Estilização:** Tailwind CSS (integrado nativamente ao Angular)
* **Componentes de UI:** Spartan UI (o equivalente oficial do Shadcn/ui para Angular, baseado em Tailwind e Angular CDK)
* **Gerenciamento de Estado:** Angular Signals (nativo para estados locais/reativos) ou NgRx SignalStore (para estados globais robustos)
* **Roteamento:** Angular Router (módulo nativo de rotas com suporte a Guards e Resolvers)
* **Formulários:** Angular Reactive Forms (FormBuilder) + Validações nativas ou customizadas

## 3. Padrões de Arquitetura e Estrutura de Pastas
Siga rigorosamente a estrutura baseada em recursos (feature-based) adaptada para Angular Standalone:
* `src/app/components/ui/` -> Componentes de apresentação globais, genéricos e reutilizáveis (botões, inputs).
* `src/app/features/[nome-da-feature]/` -> Funcionalidades isoladas do negócio (ex: `features/auth/`).
  * Cada feature deve conter sua estrutura própria: `/components`, `/services`, `/interfaces`.
  * As rotas de cada feature devem ser expostas em um arquivo `[nome-da-feature].routes.ts`.
* `src/app/services/` -> Serviços globais (ex: interceptors, serviços de API globais).
* `src/app/shared/` -> Diretivas, pipes e guards compartilhados globalmente.

## 4. Regras de Estilo de Código (TypeScript & Angular)
* **Componentes:** Sempre crie componentes utilizando a arquitetura Standalone (`standalone: true`).
* **Sintaxe de Template:** Utilize estritamente a nova sintaxe de blocos de controle de fluxo (`@if`, `@for`, `@switch`) em vez das diretivas antigas (`*ngIf`, `*ngFor`).
* **Gestão de Estado e Reatividade:** Priorize o uso de `Signals` (`signal()`, `computed()`) para reatividade e manipulação de estado local. Evite o uso excessivo de `RxJS` para estados simples.
* **Ciclo de Vida:** Prefira o uso de funções modernas baseadas em injeção, como `effect()` em vez do hook `ngOnChanges` sempre que aplicável.
* **Tipagem:** Ative o modo estrito do TypeScript. Proibido o uso de `any`. Use `interface` para contratos de dados e modelos de API.
* **Injeção de Dependência:** Use a função `inject(MyService)` em vez de declarar serviços no construtor da classe.
* **Tamanho do Arquivo:** Mantenha a lógica do componente (`.ts`) focada. Máximo de 200 linhas por arquivo de componente. Se o template HTML crescer demais, isole-o em um arquivo `.html` separado.
* **Imports:** Agrupe os imports no arquivo TypeScript por: 1. Angular Core e pacotes nativos, 2. Bibliotecas externas, 3. Componentes/Serviços locais.
* **Acessibilidade:** Elementos interativos devem implementar atributos ARIA corretos e herdar os padrões de acessibilidade do Angular CDK/Spartan UI.

## 5. Padrões de Gerenciamento de Estado e Serviços
* **Separação de Conceitos (Smart vs. Dumb Components):** O template HTML deve focar apenas na renderização e disparo de eventos. Toda a lógica de busca de dados (HTTP), manipulação de estado complexo e regras de negócio deve residir em um `Service`.
* **Stores Atômicas com NgRx SignalStore:** Ao gerenciar estados com `NgRx SignalStore`, crie stores pequenas, focadas e atômicas por feature (ex: `AuthStore`, `CartStore`). Evite centralizar todo o estado da aplicação em uma única store gigante.
* **Consumo de Estados:** Exponha o estado para os componentes utilizando `Signals` de leitura (`asReadonly()`). Os componentes não devem mutar o estado diretamente; eles devem disparar métodos definidos na store ou no serviço.

## 6. Tratamento de Erros e Logs
* **Formulários:** Os erros de validação devem ser gerenciados pelo `Reactive Forms` através da propriedade `controls`. Use o bloco `@if (form.get('campo')?.errors && form.get('campo')?.touched)` para exibir mensagens de erro amigáveis diretamente abaixo do campo correspondente.
* **Requisições API (RxJS e Interceptors):**
  * Toda chamada HTTP deve ser tratada usando operadores RxJS adequados (como `catchError`).
  * Utilize um `HttpInterceptor` global para capturar erros comuns de rede (como 401 ou 500) e centralizar os logs.
* **Feedback Visual:** Em caso de falha na requisição, exiba um feedback visual reativo para o usuário (ex: um componente Toast ou Snackbar de notificação) e garanta que estados de carregamento (`isLoading`) sejam resetados corretamente.

