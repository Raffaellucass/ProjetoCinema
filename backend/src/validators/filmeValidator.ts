import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Middleware para validar os resultados da validação
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const criarFilmeValidator = [
  // Validação do campo nome
  body('nome')
    .trim()
    .notEmpty().withMessage('O nome é obrigatório')
    .isLength({ max: 100 }).withMessage('O nome não pode ter mais que 100 caracteres'),

  // Validação do campo descricao
  body('descricao')
    .trim()
    .notEmpty().withMessage('A descrição é obrigatória')
    .isLength({ max: 2000 }).withMessage('A descrição não pode ter mais que 2000 caracteres'),

  // Validação do campo ano
  body('ano')
    .isInt({ min: 1888, max: new Date().getFullYear() + 1 })
    .withMessage(`O ano deve estar entre 1888 e ${new Date().getFullYear() + 1}`),

  // Validação do campo foto (opcional)
  body('foto')
    .optional({ checkFalsy: true }) // Aceita valores vazios, null, undefined
    .custom((value) => {
      if (!value) return true;
      // Aceita URLs http/https OU data URIs (base64)
      return /^(https?:\/\/|data:image\/)/i.test(value);
    }).withMessage('A foto deve ser uma URL válida (http, https ou data:image)'),

  // Validação do campo diretor (opcional)
  body('diretor')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('O nome do diretor não pode ter mais que 100 caracteres'),

  // Validação do campo genero (opcional)
  body('genero')
    .optional()
    .isArray().withMessage('Gênero deve ser um array')
    .custom((value: any[]) => {
      const generosValidos = [
        'Ação', 'Aventura', 'Comédia', 'Drama', 'Terror',
        'Ficção Científica', 'Romance', 'Suspense', 'Documentário',
        'Animação', 'Fantasia', 'Crime', 'Guerra', 'Mistério',
        'Musical', 'Faroeste', 'Biografia', 'Histórico'
      ];

      if (!Array.isArray(value)) return false;
      return value.every(genero => generosValidos.includes(genero));
    })
    .withMessage('Gênero inválido'),

  // Validação do campo duracao (opcional)
  body('duracao')
    .optional()
    .isInt({ min: 1 }).withMessage('A duração deve ser maior que 0'),

  // Validação do campo classificacao (opcional)
  body('classificacao')
    .optional()
    .isIn(['L', '10', '12', '14', '16', '18'])
    .withMessage('Classificação indicativa inválida'),

  // Validação do campo elenco (opcional)
  body('elenco')
    .optional()
    .isArray().withMessage('Elenco deve ser um array de strings'),

  // Validação do campo avaliacao (opcional)
  body('avaliacao')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('A avaliação deve ser entre 0 e 10'),

  // Middleware para tratar os erros de validação
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const atualizarFilmeValidator = [
  // Validação do ID
  param('id')
    .isMongoId().withMessage('ID do filme inválido'),

  // Validação dos campos (todos opcionais na atualização)
  body('nome')
    .optional()
    .trim()
    .notEmpty().withMessage('O nome não pode estar vazio')
    .isLength({ max: 100 }).withMessage('O nome não pode ter mais que 100 caracteres'),

  body('descricao')
    .optional()
    .trim()
    .notEmpty().withMessage('A descrição não pode estar vazia')
    .isLength({ max: 2000 }).withMessage('A descrição não pode ter mais que 2000 caracteres'),

  body('ano')
    .optional()
    .isInt({ min: 1888, max: new Date().getFullYear() + 1 })
    .withMessage(`O ano deve estar entre 1888 e ${new Date().getFullYear() + 1}`),

  body('foto')
    .optional()
    .custom((value) => {
      if (!value) return true;
      return /^(https?:\/\/|data:image\/)/i.test(value);
    }).withMessage('A foto deve ser uma URL válida (http, https ou data:image)'),

  // Middleware para tratar os erros de validação
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const buscarFilmesValidator = [
  // Validação do parâmetro de busca
  query('q')
    .trim()
    .notEmpty().withMessage('O termo de busca é obrigatório')
    .isLength({ min: 2 }).withMessage('O termo de busca deve ter pelo menos 2 caracteres'),

  // Middleware para tratar os erros de validação
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const listarPorGeneroValidator = [
  // Validação do parâmetro de gênero
  param('genero')
    .isIn([
      'Ação', 'Aventura', 'Comédia', 'Drama', 'Terror',
      'Ficção Científica', 'Romance', 'Suspense', 'Documentário',
      'Animação', 'Fantasia', 'Crime', 'Guerra', 'Mistério',
      'Musical', 'Faroeste', 'Biografia', 'Histórico'
    ])
    .withMessage('Gênero inválido'),

  // Middleware para tratar os erros de validação
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
