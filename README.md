# 🧾 PixelConta - Contabilidade Digital & Emissão Automatizada

`PixelConta` é uma plataforma moderna e completa de **contabilidade digital e emissão automatizada de notas fiscais** (NFS-e, NF-e e NFC-e) desenvolvida especialmente para o ecossistema de negócios digitais, infoprodutores, prestadores de serviços e e-commerces.

A plataforma automatiza todo o fluxo fiscal, desde a captura de vendas em plataformas parceiras (como Hotmart, Kiwify, Asaas, Shopify, Stripe e outras) até a emissão da nota fiscal eletrônica junto à prefeitura ou SEFAZ, armazenamento do XML/PDF e comunicação integrada com contadores dedicados.

---

## ✨ Funcionalidades Principais

*   **📊 Dashboard Financeiro Integrado**: Visualização clara de faturamento, impostos acumulados, volume de notas emitidas e pendências, com gráficos dinâmicos de receitas e impostos por período.
*   **⚡ Emissão de Notas Fiscais**: Emissão manual simplificada em múltiplos passos (NFS-e, NF-e, NFC-e) ou automatizada. Assistente com preenchimento de dados de clientes, cálculo de tributos e preview de nota em tempo real.
*   **🤖 Automações Inteligentes**: Criador de regras e fluxos de trabalho visuais (*"Se pagamento for aprovado na Hotmart -> Emitir NFS-e -> Enviar e-mail de notificação"*).
*   **🔌 Ampla Integração**: Conexão simples e rápida com canais de vendas e gateways de pagamento populares (Kiwify, Hotmart, Eduzz, Shopify, Stripe, Asaas, Nuvemshop, etc.).
*   **📁 Portal de Contabilidade & Documentos**: Canal de troca de documentos fiscais e contábeis, gestão de pendências e chat em tempo real com contador dedicado.
*   **👥 Gestão de Clientes e Catálogos**: Cadastros centralizados de clientes (PF/PJ com consulta de CNPJ/CPF), além de catálogo completo de produtos (SKU, NCM, CFOP) e serviços (CNAE, alíquota de ISS).
*   **🚀 Fluxo de Onboarding Integrado**: Configuração guiada passo a passo para novos usuários (dados da empresa, upload de certificado digital A1, regime tributário).

---

## 🛠️ Tecnologias Utilizadas

A aplicação foi desenvolvida utilizando as tecnologias web mais modernas e eficientes:

*   **React 19** - Biblioteca para construção de interfaces SPA eficientes.
*   **TypeScript** - Tipagem estática para robustez e produtividade no desenvolvimento.
*   **Vite** - Ferramenta de build ultrarrápida.
*   **Tailwind CSS v4** - Estilização moderna e de alta performance baseada em utilitários e CSS nativo.
*   **React Router DOM v7** - Roteamento avançado para uma experiência SPA fluida.
*   **Recharts** - Gráficos interativos e responsivos para dados financeiros.
*   **React Hook Form & Zod** - Validações avançadas de formulários de emissão e cadastros.
*   **Lucide React** - Conjunto consistente de ícones modernos.
*   **Oxlint** - Linter de altíssima performance para garantir a qualidade do código.

---

## 🏛️ Integrações Governamentais (APIs)

O software será integrado diretamente com as principais APIs e Web Services governamentais para garantir a emissão, validação e autorização legal de documentos fiscais em tempo real:

*   **SEFAZ (Secretaria da Fazenda)**: Comunicação com os Web Services Estaduais e Ambiente Nacional para autorização de NF-e (Nota Fiscal Eletrônica) e NFC-e.
*   **Prefeituras Municipais**: Integração com os sistemas municipais (padrão ABRASF e outros layouts) para geração e validação de NFS-e (Nota Fiscal de Serviços Eletrônica).
*   **Receita Federal / SINTEGRA**: Consultas de situação cadastral de CNPJ e Inscrição Estadual para validação de clientes e fornecedores.

---

## 📂 Estrutura do Projeto

Abaixo está o mapeamento dos principais diretórios do código-fonte:

*   [src](file:///c:/Users/CMEND/.gemini/antigravity/scratch/pixelconta/src) - Pasta principal com código-fonte do app.
    *   [assets](file:///c:/Users/CMEND/.gemini/antigravity/scratch/pixelconta/src/assets) - Recursos estáticos (imagens, logos, etc.).
    *   [components](file:///c:/Users/CMEND/.gemini/antigravity/scratch/pixelconta/src/components) - Componentes React reutilizáveis.
        *   [shared](file:///c:/Users/CMEND/.gemini/antigravity/scratch/pixelconta/src/components/shared) - Componentes de layout e navegação (Sidebar, Topbar, DataTable, etc.).
        *   [ui](file:///c:/Users/CMEND/.gemini/antigravity/scratch/pixelconta/src/components/ui) - Componentes atômicos de interface (Button, Input, Select, Switch, etc.).
    *   [context](file:///c:/Users/CMEND/.gemini/antigravity/scratch/pixelconta/src/context) - Contextos globais da aplicação (ex: `ToastContext` para notificações).
    *   [layouts](file:///c:/Users/CMEND/.gemini/antigravity/scratch/pixelconta/src/layouts) - Templates de estrutura de página (`AuthenticatedLayout`, `OnboardingLayout`, `PublicLayout`).
    *   [mocks](file:///c:/Users/CMEND/.gemini/antigravity/scratch/pixelconta/src/mocks) - Banco de dados simulado no cliente para testes (`db.ts` com persistência em `localStorage`).
    *   [pages](file:///c:/Users/CMEND/.gemini/antigravity/scratch/pixelconta/src/pages) - Páginas e fluxos completos da aplicação (Dashboard, EmitirNota, Clientes, etc.).
    *   [services](file:///c:/Users/CMEND/.gemini/antigravity/scratch/pixelconta/src/services) - Integrações e wrappers de chamadas de API (`api.ts`).
    *   [types](file:///c:/Users/CMEND/.gemini/antigravity/scratch/pixelconta/src/types) - Definições de tipos e interfaces TypeScript (`index.ts`).
    *   [App.tsx](file:///c:/Users/CMEND/.gemini/antigravity/scratch/pixelconta/src/App.tsx) - Rotas e gerenciador principal da aplicação.
    *   [index.css](file:///c:/Users/CMEND/.gemini/antigravity/scratch/pixelconta/src/index.css) - Configuração global de estilos e Tailwind CSS v4.
    *   [main.tsx](file:///c:/Users/CMEND/.gemini/antigravity/scratch/pixelconta/src/main.tsx) - Ponto de entrada do React.
*   [tailwind.config.js](file:///c:/Users/CMEND/.gemini/antigravity/scratch/pixelconta/tailwind.config.js) - Customizações do tema Tailwind.
*   [tsconfig.json](file:///c:/Users/CMEND/.gemini/antigravity/scratch/pixelconta/tsconfig.json) - Configurações do TypeScript.
*   [package.json](file:///c:/Users/CMEND/.gemini/antigravity/scratch/pixelconta/package.json) - Dependências e scripts de execução.

---

## ⚡ Como Executar o Projeto

Siga as instruções abaixo para rodar o projeto localmente.

### Pré-requisitos
Certifique-se de ter instalado em sua máquina:
*   [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
*   [npm](https://www.npmjs.com/) ou outro gerenciador de pacotes (como yarn ou pnpm)

### Passo a Passo

1.  **Instale as dependências:**
    ```bash
    npm install
    ```

2.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    O servidor iniciará e o projeto estará disponível no seu navegador em `http://localhost:5173` (ou na porta indicada no terminal).

3.  **Execute o Linter (Oxlint):**
    ```bash
    npm run lint
    ```

4.  **Gere a build de produção:**
    ```bash
    npm run build
    ```
    Isso compilará os arquivos TypeScript e gerará os arquivos estáticos prontos para produção na pasta `/dist`.

5.  **Visualize a build localmente:**
    ```bash
    npm run preview
    ```

---

## 💾 Banco de Dados Simulado (Mock DB)

Para viabilizar demonstrações interativas completas sem a necessidade imediata de configurar APIs ou servidores externos, a plataforma inclui um **banco de dados simulado no cliente** ([db.ts](file:///c:/Users/CMEND/.gemini/antigravity/scratch/pixelconta/src/mocks/db.ts)).

Ele gerencia no `localStorage` do navegador a criação, edição, deleção e busca de:
*   Notas Fiscais emitidas, com log de eventos fiscais detalhados.
*   Clientes e respectivos endereços.
*   Produtos e Serviços com códigos NCM/CNAE.
*   Integrações conectadas e regras de Automação ativas.
*   Histórico de faturamento mensal.

Assim, qualquer alteração, cadastro ou exclusão feita no painel **persiste** mesmo se a página for recarregada ou fechada.

---

feito por Matheus Gabriel
