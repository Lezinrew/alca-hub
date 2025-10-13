import 'dotenv/config';
import mongoose, { Types } from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import Category from '../models/Category';
import Provider from '../models/Provider';

async function main() {
  console.log('🚀 Iniciando importação de prestadores...');
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI não encontrada no .env');
  }

  await mongoose.connect(uri);
  console.log('✅ Conectado ao MongoDB');

  // Carregar dados dos seeds
  const categoriesPath = path.join(__dirname, '../seeds/seed_categories.json');
  const providersPath = path.join(__dirname, '../seeds/seed_providers.json');
  
  const catsRaw = JSON.parse(await fs.readFile(categoriesPath, 'utf-8'));
  const provRaw = JSON.parse(await fs.readFile(providersPath, 'utf-8'));

  console.log(`📊 Carregados ${catsRaw.length} categorias e ${provRaw.length} prestadores`);

  // Upsert categorias
  const catMap = new Map<string, Types.ObjectId>();
  let categoriesCreated = 0;
  let categoriesUpdated = 0;

  for (const c of catsRaw) {
    const res = await Category.findOneAndUpdate(
      { name: c.name.trim() },
      { 
        $set: { 
          name: c.name.trim(), 
          parentId: c.parentId || undefined 
        } 
      },
      { upsert: true, new: true }
    );
    
    catMap.set(res.name, res._id);
    
    if (res.createdAt.getTime() === res.updatedAt.getTime()) {
      categoriesCreated++;
    } else {
      categoriesUpdated++;
    }
  }

  console.log(`📁 Categorias: +${categoriesCreated} ~${categoriesUpdated}`);

  // Upsert prestadores
  let providersCreated = 0;
  let providersUpdated = 0;

  for (const p of provRaw) {
    // Converter categorias para ObjectIds
    const categoryIds: Types.ObjectId[] = [];
    for (const name of (p.categories || [])) {
      const id = catMap.get(String(name).trim());
      if (id) categoryIds.push(id);
    }

    // Normalizar document (apenas dígitos)
    const normDoc = String(p.document || '').replace(/\D+/g, '');

    const res = await Provider.findOneAndUpdate(
      { document: normDoc },
      {
        $set: {
          name: p.name,
          legalName: p.legalName,
          documentType: p.documentType,
          document: normDoc,
          description: p.description,
          phone: p.phone,
          whatsapp: p.whatsapp,
          email: p.email,
          website: p.website,
          instagram: p.instagram,
          rating: p.rating ?? 0,
          isVerified: !!p.isVerified,
          coverageArea: p.coverageArea,
          addressCity: p.addressCity,
          addressState: p.addressState,
          addressZip: p.addressZip,
          categoryIds
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (res.createdAt.getTime() === res.updatedAt.getTime()) {
      providersCreated++;
    } else {
      providersUpdated++;
    }
  }

  console.log(`👥 Prestadores: +${providersCreated} ~${providersUpdated}`);

  // Verificar índices
  console.log('🔍 Verificando índices...');
  
  const providerIndexes = await Provider.collection.getIndexes();
  const categoryIndexes = await Category.collection.getIndexes();
  
  console.log('📊 Índices do Provider:', Object.keys(providerIndexes));
  console.log('📊 Índices do Category:', Object.keys(categoryIndexes));

  // Estatísticas finais
  const totalProviders = await Provider.countDocuments();
  const totalCategories = await Category.countDocuments();
  const verifiedProviders = await Provider.countDocuments({ isVerified: true });
  const unverifiedProviders = await Provider.countDocuments({ isVerified: false });

  console.log('\n📈 Estatísticas finais:');
  console.log(`   📁 Total de categorias: ${totalCategories}`);
  console.log(`   👥 Total de prestadores: ${totalProviders}`);
  console.log(`   ✅ Prestadores verificados: ${verifiedProviders}`);
  console.log(`   ⏳ Prestadores não verificados: ${unverifiedProviders}`);

  console.log('\n🎉 Importação concluída com sucesso!');
  
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('❌ Erro na importação:', err);
  try { 
    await mongoose.disconnect(); 
  } catch {}
  process.exit(1);
});
