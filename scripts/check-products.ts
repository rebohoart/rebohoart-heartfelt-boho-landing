/**
 * Script para verificar e popular produtos na base de dados
 * Execute com: npx tsx scripts/check-products.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Carregar variáveis de ambiente do .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não estão configuradas');
  console.error('   Verifique VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndSeedProducts() {
  console.log('🔍 Verificando produtos na base de dados...\n');

  try {
    // Verificar se conseguimos conectar ao Supabase
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar produtos:', error.message);
      console.error('   Detalhes:', error);
      return;
    }

    console.log(`✅ Conexão com Supabase estabelecida`);
    console.log(`📦 Total de produtos encontrados: ${products.length}\n`);

    if (products.length === 0) {
      console.log('⚠️  Nenhum produto encontrado. Vamos adicionar produtos de exemplo...\n');
      await seedProducts();
    } else {
      console.log('📋 Produtos existentes:\n');
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title}`);
        console.log(`   - Categoria: ${product.category}`);
        console.log(`   - Preço: €${product.price}`);
        console.log(`   - Ativo: ${product.active ? '✅ Sim' : '❌ Não'}`);
        console.log(`   - Imagem principal: ${product.image}`);
        console.log(`   - Imagens array: ${product.images?.length || 0} imagens`);
        console.log('');
      });

      // Verificar quantos produtos estão ativos
      const activeProducts = products.filter(p => p.active);
      if (activeProducts.length === 0) {
        console.log('⚠️  PROBLEMA: Nenhum produto está ativo (active = true)');
        console.log('   Os produtos não aparecerão no site porque o frontend filtra por active = true\n');
      } else {
        console.log(`✅ ${activeProducts.length} produto(s) ativo(s) que aparecerão no site\n`);
      }
    }
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

async function seedProducts() {
  const products = [
    {
      title: 'Macramé Wall Hanging',
      description: 'Handwoven cotton macramé with natural wood accent. Adds texture and warmth to any space.',
      image: 'product-macrame-wall.jpg',
      images: ['product-macrame-wall.jpg'],
      price: 45.00,
      category: 'Wall Art',
      active: true,
    },
    {
      title: 'Ceramic Planter Set',
      description: 'Hand-painted terracotta planters in earthy tones. Perfect for your favorite greenery.',
      image: 'product-ceramic-planter.jpg',
      images: ['product-ceramic-planter.jpg'],
      price: 38.00,
      category: 'Home Decor',
      active: true,
    },
    {
      title: 'Woven Storage Basket',
      description: 'Natural seagrass basket with organic patterns. Functional art for mindful living.',
      image: 'product-woven-basket.jpg',
      images: ['product-woven-basket.jpg'],
      price: 32.00,
      category: 'Storage',
      active: true,
    },
    {
      title: 'Abstract Canvas Art',
      description: 'Original painting on canvas featuring warm desert tones and organic shapes.',
      image: 'product-canvas-art.jpg',
      images: ['product-canvas-art.jpg'],
      price: 65.00,
      category: 'Wall Art',
      active: true,
    },
  ];

  console.log('📝 Inserindo produtos de exemplo...\n');

  const { data, error } = await supabase
    .from('products')
    .insert(products)
    .select();

  if (error) {
    console.error('❌ Erro ao inserir produtos:', error.message);
    console.error('   Detalhes:', error);

    if (error.message.includes('permission denied') || error.message.includes('policy')) {
      console.error('\n⚠️  PROBLEMA DE PERMISSÕES (RLS):');
      console.error('   Você não tem permissão para inserir produtos.');
      console.error('   Apenas admins podem criar produtos.');
      console.error('   Faça login como admin no backoffice primeiro.\n');
    }
    return;
  }

  console.log(`✅ ${data?.length || 0} produtos inseridos com sucesso!\n`);
}

// Executar
checkAndSeedProducts();
