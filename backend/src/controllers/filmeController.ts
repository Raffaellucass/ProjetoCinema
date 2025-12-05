import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Filme, { IFilme } from '../models/Filme';
import mongoose from 'mongoose';

// Tipos para as requisições
type FilmeRequest = Request & {
  filme?: IFilme;
};

// Middleware para buscar filme por ID
export const getFilme = async (req: FilmeRequest, res: Response, next: any, id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID de filme inválido' });
  }

  try {
    const filme = await Filme.findById(id);
    if (!filme) {
      return res.status(404).json({ message: 'Filme não encontrado' });
    }
    req.filme = filme;
    next();
  } catch (err: any) {
    res.status(500).json({ message: 'Erro ao buscar filme', error: err.message });
  }
};

// Listar todos os filmes com filtros e paginação
export const listarFilmes = async (req: Request, res: Response) => {
  try {
    // Filtros
    const { genero, ano, diretor, search, limit = 10, page = 1 } = req.query;
    const query: any = {};

    if (genero) query.genero = genero;
    if (ano) query.ano = ano;
    if (diretor) {
      const escapeRegExp = (string: string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      };
      query.diretor = new RegExp(escapeRegExp(String(diretor)), 'i');
    }

    // Busca por texto (Regex parcial no nome - Starts With)
    if (search) {
      query.nome = { $regex: '^' + String(search), $options: 'i' };
    }

    const options = {
      limit: Math.min(Number(limit), 100), // Limite máximo de 100 itens por página
      skip: (Number(page) - 1) * Number(limit),
      sort: { dataCriacao: -1 } // Ordena por data de criação (mais recentes primeiro)
    };

    const [filmes, total] = await Promise.all([
      Filme.find(query, null, options),
      Filme.countDocuments(query)
    ]);

    res.json({
      data: filmes,
      paginacao: {
        total,
        pagina: Number(page),
        totalPaginas: Math.ceil(total / Number(limit)),
        itensPorPagina: Number(limit)
      }
    });
  } catch (err: any) {
    res.status(500).json({
      message: 'Erro ao listar filmes',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Obter um filme específico
export const obterFilme = (req: FilmeRequest, res: Response) => {
  res.json(req.filme);
};

// Criar um novo filme
export const criarFilme = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const novoFilme = new Filme({
      ...req.body,
      // Garante que o usuário não pode sobrescrever datas
      dataCriacao: undefined,
      dataAtualizacao: undefined
    });

    const filmeSalvo = await novoFilme.save();
    res.status(201).json(filmeSalvo);
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Erro de validação',
        errors: Object.values(err.errors).map((e: any) => e.message)
      });
    }
    res.status(500).json({
      message: 'Erro ao criar filme',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Atualizar um filme existente
export const atualizarFilme = async (req: FilmeRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const filme = req.filme!;

    // Atualiza os campos fornecidos no corpo da requisição
    Object.assign(filme, {
      ...req.body,
      // Garante que as datas não sejam alteradas
      dataCriacao: filme.dataCriacao,
      dataAtualizacao: undefined // Será definido automaticamente pelo pre-save hook
    });

    const filmeAtualizado = await filme.save();
    res.json(filmeAtualizado);
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Erro de validação',
        errors: Object.values(err.errors).map((e: any) => e.message)
      });
    }
    res.status(500).json({
      message: 'Erro ao atualizar filme',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Deletar um filme
export const deletarFilme = async (req: FilmeRequest, res: Response) => {
  try {
    await req.filme!.deleteOne();
    res.json({ message: 'Filme removido com sucesso' });
  } catch (err: any) {
    res.status(500).json({
      message: 'Erro ao remover filme',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


// Listar filmes por gênero
export const listarPorGenero = async (req: Request, res: Response) => {
  try {
    const { genero } = req.params;
    const filmes = await Filme.find({ genero });
    res.json(filmes);
  } catch (err: any) {
    res.status(500).json({
      message: 'Erro ao buscar filmes por gênero',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Buscar filmes por termo
export const buscarFilmes = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Termo de busca não fornecido' });
    }

    const filmes = await Filme.find(
      { $text: { $search: String(q) } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });

    res.json(filmes);
  } catch (err: any) {
    res.status(500).json({
      message: 'Erro na busca de filmes',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
