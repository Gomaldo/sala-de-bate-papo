const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

// Importar o modelo de usuários e o módulo de mensagens
const usersModel = require('./models/users');
const chatModule = require('./models/chat'); // Corrigido para refletir um modelo de chat centralizado

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(
  session({
    secret: 'chatSecret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 60 * 1000 }, // Sessão válida por 30 minutos
  })
);

// Página inicial (Login)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Página de cadastro
app.get('/cadastroUsuario', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cadastroUsuario.html'));
});

// Página do menu
app.get('/menu', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }

  const ultimoAcesso = req.cookies.ultimoAcesso || 'Primeiro acesso!';
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Menu - Sistema de Bate-papo</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <h1>Menu</h1>
      <p>Bem-vindo, ${req.session.user.nome}!</p>
      <p>Último acesso: ${ultimoAcesso}</p>
      <ul>
        <li><a href="/cadastroUsuario">Cadastro de Usuários</a></li>
        <li><a href="/batepapo">Bate-papo</a></li>
      </ul>
      <form action="/users/logout" method="POST">
        <button type="submit">Sair</button>
      </form>
    </body>
    </html>
  `);
});

// Página do bate-papo
app.get('/batepapo', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }

  const users = usersModel.getAllUsers();
  const options = users
    .map(user => `<option value="${user.nome}">${user.nome}</option>`)
    .join('');

  const renderedMessages = chatModule.getMessages()
    .map(
      msg => `
      <div>
        <strong>${msg.remetente}:</strong> ${msg.mensagem} <span style="font-size: 0.8em; color: gray;">(${msg.timestamp})</span>
      </div>`
    )
    .join('');

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bate-papo</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <h1>Bate-papo</h1>
      <div id="messages">${renderedMessages}</div>
      <form action="/chat/postarMensagem" method="POST">
        <label for="usuario">Usuário:</label>
        <select name="usuario" id="usuario" required>${options}</select>
        <textarea name="mensagem" id="mensagem" rows="3" required></textarea>
        <button type="submit">Enviar</button>
      </form>
      <form action="/users/logout" method="POST">
        <button type="submit">Sair</button>
      </form>
    </body>
    </html>
  `);
});

// Processar cadastro de usuários
app.post('/users/cadastrarUsuario', (req, res) => {
  const { nome, dataNascimento, nickname, email, senha } = req.body;

  if (!nome || !dataNascimento || !nickname || !email || !senha) {
    return res.send('<p>Todos os campos são obrigatórios!</p><a href="/cadastroUsuario">Voltar</a>');
  }

  const result = usersModel.addUser({ nome, dataNascimento, nickname, email, senha });

  if (result.error) {
    return res.send(`<p>${result.error}</p><a href="/cadastroUsuario">Voltar</a>`);
  }

  res.redirect('/menu');
});

// Processar login
app.post('/users/login', (req, res) => {
  const { email, senha } = req.body;

  const user = usersModel.authenticateUser({ email, senha });

  if (!user) {
    return res.send('<p>E-mail ou senha inválidos!</p><a href="/">Voltar</a>');
  }

  req.session.user = user;
  res.cookie('ultimoAcesso', new Date().toLocaleString());
  res.redirect('/menu');
});

// Processar logout
app.post('/users/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.send('<p>Erro ao encerrar sessão!</p><a href="/batepapo">Voltar</a>');
    }
    res.redirect('/');
  });
});

// Processar envio de mensagens no bate-papo
app.post('/chat/postarMensagem', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }

  const { usuario, mensagem } = req.body;

  if (!usuario || !mensagem) {
    return res.send('<p>Usuário e mensagem são obrigatórios!</p><a href="/batepapo">Voltar</a>');
  }

  chatModule.addMessage({
    remetente: usuario,
    mensagem,
    timestamp: new Date().toLocaleString(),
  });

  res.redirect('/batepapo');
});

// Inicializar o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
