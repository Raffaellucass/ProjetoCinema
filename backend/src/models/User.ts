import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: [true, 'O nome de usuário é obrigatório'],
    unique: true,
    trim: true,
    minlength: [3, 'O nome de usuário deve ter no mínimo 3 caracteres'],
    maxlength: [20, 'O nome de usuário deve ter no máximo 20 caracteres']
  },
  email: {
    type: String,
    required: [true, 'O e-mail é obrigatório'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor, insira um e-mail válido']
  },
  password: {
    type: String,
    required: [true, 'A senha é obrigatória'],
    minlength: [6, 'A senha deve ter no mínimo 6 caracteres'],
    select: false // Por padrão não retorna a senha nas queries
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Hash da senha antes de salvar
UserSchema.pre('save', async function (next) {
  const user = this as IUser;
  
  // Só faz hash se a senha foi modificada
  if (!user.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Método para comparar senha
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Índices
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

export default mongoose.model<IUser>('User', UserSchema);
