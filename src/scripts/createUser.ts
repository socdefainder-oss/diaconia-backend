import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import { UserRole } from '../types';

dotenv.config();

const createUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Conectado ao MongoDB');

    // Criar ou atualizar usuário carloscosta@hotmail.com
    const email = 'carloscosta@hotmail.com';
    const password = 'Carlos@123'; // Senha padrão

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('ℹ️  Usuário já existe. Atualizando senha...');
      existingUser.password = password;
      existingUser.isActive = true;
      await existingUser.save();
      console.log('✅ Senha atualizada com sucesso!');
    } else {
      const user = await User.create({
        name: 'Carlos Costa',
        email,
        password,
        role: UserRole.ADMIN, // Criando como admin
        isActive: true,
        emailVerified: true,
      });
      console.log('✅ Usuário criado com sucesso!');
    }

    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);
    console.log('\n⚠️  Use estas credenciais para fazer login!\n');

    // Listar todos os usuários
    const allUsers = await User.find({});
    console.log('\n📋 Usuários no banco de dados:');
    allUsers.forEach(u => {
      console.log(`  - ${u.email} (${u.role}) - Ativo: ${u.isActive}`);
    });

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
};

createUser();
