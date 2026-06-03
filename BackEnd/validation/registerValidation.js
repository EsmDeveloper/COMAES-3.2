export function validateRegistrationPayload(data) {
  const errors = {};
  
  const {
    nome,
    telefone,
    email,
    nascimento,
    sexo,
    password,
    role = 'estudante',
    disciplina_colaborador
  } = data;

  // Nome
  if (!nome || nome.trim().length === 0) {
    errors.nome = 'O nome é obrigatório.';
  } else if (nome.trim().length < 2 || nome.trim().length > 100) {
    errors.nome = 'O nome deve ter entre 2 e 100 caracteres.';
  }

  // Telefone (Angola: 9 dígitos começando com 9)
  if (!telefone || telefone.trim().length === 0) {
    errors.telefone = 'O telefone é obrigatório.';
  } else {
    const phoneRegex = /^9[0-9]{8}$/;
    if (!phoneRegex.test(telefone.trim())) {
      errors.telefone = 'O telefone deve ter 9 dígitos válidos começando com 9.';
    }
  }

  // Email
  if (!email || email.trim().length === 0) {
    errors.email = 'O e-mail é obrigatório.';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValue = email.trim().toLowerCase();
    
    if (!emailRegex.test(emailValue)) {
      errors.email = 'O e-mail informado é inválido.';
    } else if (/@(gmai|gmal|gmial|gmaill|hotmal|hotmial|outlok|yaho|yhoo)\.com$/i.test(emailValue)) {
      errors.email = 'Verifique o domínio do e-mail.';
    }
  }

  // Nascimento
  if (!nascimento) {
    errors.nascimento = 'A data de nascimento é obrigatória.';
  } else {
    const birthDate = new Date(nascimento);
    const today = new Date();
    if (isNaN(birthDate.getTime())) {
      errors.nascimento = 'Data de nascimento inválida.';
    } else if (birthDate > today) {
      errors.nascimento = 'A data de nascimento não pode estar no futuro.';
    }
  }

  // Sexo
  if (!sexo) {
    errors.sexo = 'O sexo é obrigatório.';
  } else if (!['Masculino', 'Feminino'].includes(sexo)) {
    errors.sexo = 'Sexo inválido.';
  }

  // Senha
  if (!password) {
    errors.password = 'A senha é obrigatória.';
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password)) {
    errors.password = 'A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.';
  }

  // Role (se fornecido)
  const validRoles = ['estudante', 'colaborador', 'admin'];
  if (role && !validRoles.includes(role)) {
    errors.role = 'Perfil inválido.';
  }

  // Validações específicas para colaborador
  if (role === 'colaborador') {
    const validDisciplinas = ['matematica', 'ingles', 'programacao'];
    
    if (!disciplina_colaborador) {
      errors.disciplina_colaborador = 'A disciplina é obrigatória para colaborador.';
    } else if (!validDisciplinas.includes(disciplina_colaborador)) {
      errors.disciplina_colaborador = 'Disciplina inválida. As opções são: matematica, ingles, programacao.';
    }
  }

  return errors;
}