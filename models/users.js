const users = [];

// Adicionar um novo usuário
function addUser(user) {
  if (!user.nome || !user.dataNascimento || !user.nickname || !user.email || !user.senha) {
    return { error: 'Todos os campos são obrigatórios!' };
  }

  if (users.some(u => u.email === user.email)) {
    return { error: 'E-mail já cadastrado!' };
  }

  users.push(user);
  return { success: true };
}

// Autenticar um usuário
function authenticateUser({ email, senha }) {
  return users.find(user => user.email === email && user.senha === senha);
}

// Obter todos os usuários
function getAllUsers() {
  return users;
}

module.exports = {
  addUser,
  authenticateUser,
  getAllUsers,
};
