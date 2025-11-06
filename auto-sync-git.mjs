#!/usr/bin/env node

/**
 * Script de sincronização automática com Git
 * Monitora o repositório remoto e faz pull automaticamente quando há mudanças
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Configurações
const CHECK_INTERVAL = 30000; // Verificar a cada 30 segundos
const BRANCH = 'claude/fix-localhost-auto-reload-011CUrm66gTkXWxQkQRd8Cbx'; // Branch atual

console.log('🔄 Script de sincronização Git iniciado');
console.log(`📡 Verificando atualizações a cada ${CHECK_INTERVAL / 1000} segundos`);
console.log(`🌿 Branch: ${BRANCH}\n`);

async function getCurrentCommit() {
  try {
    const { stdout } = await execAsync('git rev-parse HEAD');
    return stdout.trim();
  } catch (error) {
    console.error('❌ Erro ao obter commit atual:', error.message);
    return null;
  }
}

async function fetchRemote() {
  try {
    await execAsync(`git fetch origin ${BRANCH}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao fazer fetch:', error.message);
    return false;
  }
}

async function getRemoteCommit() {
  try {
    const { stdout } = await execAsync(`git rev-parse origin/${BRANCH}`);
    return stdout.trim();
  } catch (error) {
    console.error('❌ Erro ao obter commit remoto:', error.message);
    return null;
  }
}

async function pullChanges() {
  try {
    console.log('⬇️  Baixando mudanças...');
    const { stdout, stderr } = await execAsync(`git pull origin ${BRANCH}`);
    console.log('✅ Atualização completa!');
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);
    return true;
  } catch (error) {
    console.error('❌ Erro ao fazer pull:', error.message);
    return false;
  }
}

async function checkForUpdates() {
  const localCommit = await getCurrentCommit();
  if (!localCommit) return;

  await fetchRemote();

  const remoteCommit = await getRemoteCommit();
  if (!remoteCommit) return;

  if (localCommit !== remoteCommit) {
    console.log('\n🆕 Nova versão disponível!');
    console.log(`   Local:  ${localCommit.substring(0, 8)}`);
    console.log(`   Remoto: ${remoteCommit.substring(0, 8)}`);
    await pullChanges();
    console.log('');
  } else {
    process.stdout.write('✓ ');
  }
}

// Verificar imediatamente na inicialização
console.log('🔍 Verificando versão inicial...\n');
await checkForUpdates();

// Depois verificar periodicamente
setInterval(checkForUpdates, CHECK_INTERVAL);

// Manter o processo rodando
process.on('SIGINT', () => {
  console.log('\n\n👋 Encerrando sincronização Git...');
  process.exit(0);
});
