import mongoose, { Schema, Document } from 'mongoose';

export interface IFilme extends Document {
  nome: string;
  descricao: string;
  ano: number;
  foto: string;
  diretor?: string;
  genero?: string[];
  duracao?: number; // em minutos
  classificacao?: string;
  elenco?: string[];
  avaliacao?: number;
  sessoes?: {
    data: string;
    horarios: string[];
  }[];
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const FilmeSchema: Schema = new Schema({
  nome: {
    type: String,
    required: [true, 'O nome é obrigatório'],
    trim: true,
    maxlength: [100, 'O nome não pode ter mais que 100 caracteres']
  },
  descricao: {
    type: String,
    required: [true, 'A descrição é obrigatória'],
    maxlength: [2000, 'A descrição não pode ter mais que 2000 caracteres']
  },
  ano: {
    type: Number,
    required: [true, 'O ano é obrigatório'],
    min: [1888, 'O primeiro filme foi feito em 1888'],
    max: [new Date().getFullYear() + 1, 'Ano inválido']
  },
  foto: {
    type: String,
    required: false,
    validate: {
      validator: function (v: string) {
        if (!v || v.trim() === '') return true; // Aceita vazio
        // Validação simples de URL (começa com http/https ou data:image)
        return /^(https?:\/\/|data:image\/)/i.test(v);
      },
      message: 'Por favor, insira uma URL de imagem válida (http, https ou data:image) ou deixe em branco'
    }
  },
  diretor: {
    type: String,
    trim: true
  },
  genero: {
    type: [String],
    enum: [
      'Ação', 'Aventura', 'Comédia', 'Drama', 'Terror',
      'Ficção Científica', 'Romance', 'Suspense', 'Documentário',
      'Animação', 'Fantasia', 'Crime', 'Guerra', 'Mistério',
      'Musical', 'Faroeste', 'Biografia', 'Histórico'
    ]
  },
  duracao: {
    type: Number,
    min: [1, 'A duração deve ser maior que 0']
  },
  classificacao: {
    type: String,
    enum: ['L', '10', '12', '14', '16', '18']
  },
  elenco: [{
    type: String,
    trim: true
  }],
  avaliacao: {
    type: Number,
    min: [0, 'A avaliação mínima é 0'],
    max: [10, 'A avaliação máxima é 10']
  },
  sessoes: [{
    data: {
      type: String,
      required: true
    },
    horarios: [{
      type: String,
      required: true
    }]
  }]
}, {
  timestamps: {
    createdAt: 'dataCriacao',
    updatedAt: 'dataAtualizacao'
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

FilmeSchema.index({ nome: 'text', descricao: 'text' });
FilmeSchema.index({ genero: 1 });
FilmeSchema.index({ ano: -1 });
FilmeSchema.index({ avaliacao: -1 });

export default mongoose.model<IFilme>('Filme', FilmeSchema);
