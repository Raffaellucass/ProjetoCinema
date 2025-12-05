import express from 'express';
import {
  listarFilmes,
  criarFilme,
  obterFilme,
  atualizarFilme,
  deletarFilme,
  listarPorGenero,
  buscarFilmes,
  getFilme
} from '../controllers/filmeController';

import {
  criarFilmeValidator,
  atualizarFilmeValidator,
  buscarFilmesValidator,
  listarPorGeneroValidator
} from '../validators/filmeValidator';

import { authenticate, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Middleware para buscar filme por ID
router.param('id', getFilme);

// Rota para listar todos os filmes com filtros e paginação
// Exemplo: GET /api/filmes?genero=Ação&ano=2020&page=1&limit=10
router.get('/', authenticate, listarFilmes);

// Rota para buscar filmes por termo
// Exemplo: GET /api/filmes/buscar?q=vingadores
router.get('/buscar', authenticate, buscarFilmesValidator, buscarFilmes);

// Rota para listar filmes por gênero
// Exemplo: GET /api/filmes/genero/Ação
router.get('/genero/:genero', authenticate, listarPorGeneroValidator, listarPorGenero);

// Rota para obter um filme específico
// Exemplo: GET /api/filmes/5f8d5b9b9d4f4b3e3c6f9b1a
router.get('/:id', authenticate, obterFilme);

// Rota para criar um novo filme (apenas admin)
// Exemplo: POST /api/filmes
router.post('/', authenticate, authorize('admin'), criarFilmeValidator, criarFilme);

// Rota para atualizar um filme existente (apenas admin)
// Exemplo: PUT /api/filmes/5f8d5b9b9d4f4b3e3c6f9b1a
router.put('/:id', authenticate, authorize('admin'), atualizarFilmeValidator, atualizarFilme);

// Rota para deletar um filme (apenas admin)
// Exemplo: DELETE /api/filmes/5f8d5b9b9d4f4b3e3c6f9b1a
router.delete('/:id', authenticate, authorize('admin'), deletarFilme);

// Rota para atualizar um filme (apenas admin)


export default router;
