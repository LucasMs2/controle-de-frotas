# 🚌 Sistema de Gestão de Frotas - Amparo

Este projeto é uma aplicação desenvolvida para o processo seletivo de **Desenvolvedor Full Stack Júnior**. O sistema permite o gerenciamento completo de ônibus e motoristas, além da realização de alocações diárias respeitando regras de negócio solicitadas no problema.

## 🚀 Tecnologias Utilizadas

### Backend
- **Python 3.9 / Django 4.2**: Base do desenvolvimento.
- **Django Rest Framework**: Construção da API REST.
- **Psycopg2-binary**: Driver de conexão com o PostgreSQL.
- **Django-cors-headers**: Gerenciamento de políticas de CORS para integração com o frontend.

### Frontend
- **React (Vite)**: Biblioteca para interface de usuário.
- **Tailwind CSS**: Estilização moderna e responsiva.
- **Lucide React**: Biblioteca de ícones.
- **Axios**: Cliente para consumo de API.

### Infraestrutura e Banco de Dados
- **PostgreSQL 13**: Banco de dados relacional.
- **Docker & Docker Compose**: Orquestração de containers para ambiente isolado.

---

## 📋 Funcionalidades e Diferenciais Implementados

### 1. Cadastro de Ônibus (CRUD)
- Campos: ID, Placa, Modelo, Ano e Status (Ativo/Inativo).
- **Diferencial**: Implementação de **Soft Delete** (via alteração de status) e suporte a **Hard Delete** definitivo via parâmetro `?force=true` no endpoint de exclusão.

### 2. Cadastro de Motoristas (CRUD)
- Campos: ID, Nome, CPF, CNH, Categoria da CNH e Status.
- **Interface**: Formulário com validações básicas, edição e exclusão de registros.

### 3. Alocação Diária 
- Interface para associar motorista, ônibus e data da alocação.
- **Diferenciais Técnicos**:
    - **Filtragem**: Busca dinâmica por Data, Motorista e Veículo.
    - **Paginação**: Controle da quantidade de dados com opções de 5 a 75 itens por página.

---

## ⚖️ Regras de Negócio (Validadas no Backend)

As seguintes regras foram implementadas no método `clean` do modelo de Alocação no Django, garantindo integridade dos dados:
1. **Conflito de Motorista**: Um motorista não pode estar alocado em dois ônibus no mesmo dia.
2. **Conflito de Veículo**: Um ônibus não pode ter dois motoristas no mesmo dia.
3. **Status Ativo**: Apenas motoristas e veículos com status **Ativo** podem ser escalados.

---
## 🧠 Organização e Cronograma

-  Iniciei modelando os dados em modelo ER para iniciar o backend pelo banco de dados.
  - O próximo passo do backend foi implementar a lógica de validação utilizando o método clean() para garantir a funcionalidade das regras de negócio.
- Após a validação, desenvolvi os CRUDs utilizando ViewSet para ficar com um visual mais limpo e com menos código, após isso configurei o CORS para garantir a comunicação entre as portas do backend e frontend.
- Para o frontend resolvi utilizar React com Tailwind para uma estilização mais limpa e comecei fazendo uma Home simples que nao tem conteúdo em si, e contruí as paginas Motorista e Onibus primeiro para depois desenvolver a tela de alocações.
- Com as telas prontas fiz algumas validações simples de caracteres nos campos a serem preenchidos (não fiz a validação do dígito verificador do CPF para facilitar os testes)
- Por fim, adicionei o Docker para dar mais facilidade ao projeto e por se tratar de um diferencial para o teste que eu já utilizei anteriormente em projeto pessoal.

## 🛠️ Instruções para Execução

O projeto está configurado para rodar via Docker, garantindo portabilidade e facilidade de instalação.

### Passo 1: Preparar o Ambiente
Certifique-se de ter o Docker e o Node.js instalados em sua máquina.

### Passo 2: Subir Backend e Banco de Dados
Na raiz do projeto (`/testeTecnico`), execute o comando:
```bash
docker-compose up --build
```
### Passo 3: Iniciar o Frontend
Em uma **nova aba** do terminal execute:
```bash
cd frontend
npm install
npm run dev
```
### Passo 4: Acessar a aplicação
- Frontend (Interface): http://localhost:5173
 
- Backend (API): http://localhost:8000/api/

**Caso tenha alguma aplicação rodando na máquina que utilize Vite, será alterada a porta 5173, mas o terminal sinaliza o endereço.**
