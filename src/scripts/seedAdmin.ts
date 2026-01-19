import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import { UserRole } from '../types';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Conectado ao MongoDB');

    // Verificar se já existe um admin
    const adminExists = await User.findOne({ role: UserRole.ADMIN });

    if (adminExists) {
      console.log('ℹ️  Admin já existe no sistema');
      console.log(`📧 Email: ${adminExists.email}`);
      process.exit(0);
    }

    // Criar admin padrão
    const admin = await User.create({
      name: process.env.ADMIN_NAME || 'Administrador',
      email: process.env.ADMIN_EMAIL || 'admin@diaconia-alpha.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: UserRole.ADMIN,
      isActive: true,
      emailVerified: true,
    });

    console.log('✅ Admin criado com sucesso!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Senha:', process.env.ADMIN_PASSWORD || 'Admin@123');
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro ao criar admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
