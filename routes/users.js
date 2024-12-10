const express = require('express');
const router = express.Router();
const usersModel = require('../models/users');

// Rota para cadastrar usuário
router.post('/cadastrarUsuario', (req, res) => {
  console.log('Dados recebidos no servidor:', req.body); // Para verificar os dados recebidos
  const { nome, dataNascimento, nickname, email, senha } = req.body;

  // Validação no servidor
  if (!nome || !dataNascimento || !nickname || !email || !senha) {
    return res.send('<p>Todos os campos são obrigatórios!</p><a href="/cadastroUsuario">Voltar</a>');
  }

  const result = usersModel.addUser({ nome, dataNascimento, nickname, email, senha });

  if (result.error) {
    return res.send(`<p>${result.error}</p><a href="/cadastroUsuario">Voltar</a>`);
  }

  const users = usersModel.getAllUsers();
  const userList = users
    .map(user => `<li>${user.nome} - ${user.nickname} - ${user.dataNascimento}</li>`)
    .join('');

  res.send(`
    <h1>Usuários Cadastrados</h1>
    <ul>${userList}</ul>
    <a href="/cadastroUsuario">Cadastrar Novamente</a>
    <br>
    <a href="/">Voltar</a>
  `);
});

// Rota para login
router.post('/login', (req, res) => {
  const { email, senha } = req.body;

  const user = usersModel.authenticateUser({ email, senha });

  if (!user) {
    return res.send('<p>E-mail ou senha inválidos!</p><a href="/">Voltar</a>');
  }

  req.session.user = user;
  res.cookie('ultimoAcesso', new Date().toLocaleString());
  res.redirect('/batepapo');
});

// Rota para logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.send('<p>Erro ao encerrar sessão!</p><a href="/batepapo">Voltar</a>');
    }
    res.redirect('/');
  });
});

module.exports = router;
