# Como Executar o Projeto - Grade Horaria Universitaria

Este guia explica o passo a passo completo para configurar, instalar e executar a aplicacao de gerenciamento de grade horaria tanto em ambientes Linux quanto Windows, partindo do absoluto zero.

---

## Pre-requisitos Gerais

Para rodar esta aplicacao, voce precisa ter instalado na sua maquina:
1. Git (para clonagem do repositorio).
2. Node.js (versao 18.x ou superior recomendada) e o gerenciador de pacotes npm (que ja vem instalado junto com o Node.js).

---

## Como Executar no Linux (Ubuntu/Debian e derivados)

### Passo 1: Instalar o Git e o Node.js
Se voce ainda nao os possui instalados, abra o seu terminal e execute:

```bash
sudo apt update
sudo apt install git -y
sudo apt install nodejs npm -y
```

Para verificar se foram instalados corretamente, voce pode checar as versoes:
```bash
node -v
npm -v
git --version
```

### Passo 2: Clonar o Repositorio do GitHub
No seu terminal, navegue ate a pasta onde deseja salvar o projeto e execute:
```bash
git clone https://github.com/SEU_USUARIO/TO-2026.-ScheduleApp.git
```
*(Substitua a URL acima pela URL real do seu repositorio Git).*

### Passo 3: Entrar na Pasta do Projeto
```bash
cd TO-2026.-ScheduleApp
```

### Passo 4: Instalar as Dependencias
Execute o comando abaixo para instalar as bibliotecas do projeto:
```bash
npm install
```

### Passo 5: Executar o Projeto
Para iniciar o servidor de desenvolvimento local, execute:
```bash
npm run dev
```
O console mostrara que o site esta rodando. Abra o seu navegador e acesse:
http://localhost:3000

---

## Como Executar no Windows

### Passo 1: Instalar o Git e o Node.js
1. Instalar Node.js: Acesse o site oficial nodejs.org, baixe o instalador da versao LTS e siga os passos do instalador classico.
2. Instalar Git: Acesse git-scm.com, baixe o instalador para Windows e execute a instalacao com as opcoes recomendadas padrao.

Para garantir que o Windows reconheceu as instalacoes, abra o Prompt de Comando (cmd) ou PowerShell e execute:
```cmd
node -v
npm -v
git --version
```

### Passo 2: Clonar o Repositorio do GitHub
Abra o Prompt de Comando na pasta desejada e rode:
```cmd
git clone https://github.com/SEU_USUARIO/TO-2026.-ScheduleApp.git
```

### Passo 3: Entrar na Pasta do Projeto
```cmd
cd TO-2026.-ScheduleApp
```

### Passo 4: Instalar as Dependencias
Instale as bibliotecas necessarias para a execucao:
```cmd
npm install
```

### Passo 5: Executar o Projeto
Para rodar a aplicacao em modo de desenvolvimento local:
```cmd
npm run dev
```
Agora, abra o seu navegador de preferencia e digite o endereco:
http://localhost:3000

---

## Comandos de Producao (Opcional)

Se voce deseja gerar a build otimizada de producao:

1. Construir a Aplicacao:
   ```bash
   npm run build
   ```
2. Iniciar o Servidor em Modo Producao:
   ```bash
   npm start
   ```

---

## Estrutura do Banco de Dados
Ao iniciar o aplicativo pela primeira vez, uma pasta chamada data/ sera gerada automaticamente na raiz do projeto com um arquivo db.json que atuara como nosso banco de dados local. 
* Nota: Essa pasta e arquivos internos estao configurados no .gitignore para que suas alocacoes de teste locais nao sejam subidas e misturadas no repositorio compartilhado do GitHub.
