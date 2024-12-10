const messages = [];

// Adicionar uma nova mensagem
function addMessage({ remetente, mensagem, timestamp }) {
  if (!remetente || !mensagem || !timestamp) {
    throw new Error('Todos os campos são obrigatórios!');
  }

  messages.push({ remetente, mensagem, timestamp });
}

// Obter todas as mensagens
function getMessages() {
  return messages;
}

module.exports = {
  addMessage,
  getMessages,
};
