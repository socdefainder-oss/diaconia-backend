import mongoose from 'mongoose';
import User from '../models/User';
import Team from '../models/Team';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const syncTeamMembers = async () => {
  try {
    // Conectar ao banco
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Conectado ao MongoDB');

    // Buscar todos os usuários que têm um team definido
    const usersWithTeam = await User.find({ team: { $exists: true, $ne: null } });
    console.log(`📊 Encontrados ${usersWithTeam.length} usuários com time definido`);

    let syncedCount = 0;

    for (const user of usersWithTeam) {
      try {
        // Verificar se o time existe
        const team = await Team.findById(user.team);
        
        if (!team) {
          console.log(`⚠️  Time ${user.team} do usuário ${user.name} não existe`);
          continue;
        }

        // Verificar se o usuário já está no array de membros
        const isMember = team.members.some(
          (memberId) => memberId.toString() === user._id.toString()
        );

        if (!isMember) {
          // Adicionar usuário ao time
          await Team.findByIdAndUpdate(
            user.team,
            { $addToSet: { members: user._id } }
          );
          console.log(`✅ Usuário ${user.name} adicionado ao time ${team.name}`);
          syncedCount++;
        } else {
          console.log(`✓  Usuário ${user.name} já está no time ${team.name}`);
        }
      } catch (error) {
        console.error(`❌ Erro ao processar usuário ${user.name}:`, error);
      }
    }

    console.log(`\n🎉 Sincronização concluída! ${syncedCount} usuários sincronizados.`);
    
    // Mostrar contagem de membros por time
    const teams = await Team.find().populate('members', 'name');
    console.log('\n📋 Resumo dos times:');
    for (const team of teams) {
      console.log(`   ${team.name}: ${team.members.length} membros`);
    }

  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado do MongoDB');
  }
};

// Executar
syncTeamMembers();
