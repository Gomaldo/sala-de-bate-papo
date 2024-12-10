const express = require('express');
const router = express.Router();

const messages = [];

// Rota para postar mensagem
router.post('/postarMensagem', (req, res) => {
  const { usuario, mensagem } = req.body;

  if (!usuario || !mensagem) {
    return res.send('<p>Usuário e mensagem são obrigatórios!</p><a href="/batepapo">Voltar</a>');
  }

  addMessage({
    remetente: usuario,
    mensagem,
    timestamp: new Date().toLocaleString(),
  });

  res.redirect('/batepapo');
});

// Função para adicionar mensagens
function addMessage(message) {
  messages.push(message);
}

// Função para obter mensagens
function getMessages() {
  return messages;
}

module.exports = { router, addMessage, getMessages };
