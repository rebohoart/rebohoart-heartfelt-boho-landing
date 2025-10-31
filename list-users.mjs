import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY são necessárias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listUsers() {
  console.log('📊 Buscando usuários do Rebohoart...\n');

  // Get user roles from public.user_roles
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*')
    .order('created_at', { ascending: true });

  if (rolesError) {
    console.error('❌ Erro ao buscar roles:', rolesError.message);
    return;
  }

  console.log(`✅ Total de usuários com roles: ${roles?.length || 0}\n`);

  if (roles && roles.length > 0) {
    console.log('👥 Usuários registrados:\n');
    console.log('ID'.padEnd(38) + ' | Role'.padEnd(8) + ' | Criado em');
    console.log('-'.repeat(70));

    for (const role of roles) {
      const createdAt = new Date(role.created_at).toLocaleString('pt-BR');
      console.log(
        role.user_id.padEnd(38) +
        ' | ' + role.role.padEnd(6) +
        ' | ' + createdAt
      );
    }
  } else {
    console.log('ℹ️  Nenhum usuário com role encontrado.');
  }

  console.log('\n' + '='.repeat(70));
  console.log(`\n📈 Resumo:`);
  console.log(`   - Total de usuários: ${roles?.length || 0}`);
  console.log(`   - Admins: ${roles?.filter(r => r.role === 'admin').length || 0}`);
  console.log(`   - Users: ${roles?.filter(r => r.role === 'user').length || 0}`);
}

listUsers().catch(console.error);
