import 'dotenv/config';
import mongoose from 'mongoose';
import Provider from '../models/Provider';
import Category from '../models/Category';

async function testImport() {
  console.log('🧪 Testando importação MongoDB...');
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI não encontrada no .env');
  }

  await mongoose.connect(uri);
  console.log('✅ Conectado ao MongoDB');

  // Testar contagens
  const totalProviders = await Provider.countDocuments();
  const totalCategories = await Category.countDocuments();
  const verifiedProviders = await Provider.countDocuments({ isVerified: true });
  const unverifiedProviders = await Provider.countDocuments({ isVerified: false });

  console.log('\n📊 Estatísticas:');
  console.log(`   📁 Total de categorias: ${totalCategories}`);
  console.log(`   👥 Total de prestadores: ${totalProviders}`);
  console.log(`   ✅ Prestadores verificados: ${verifiedProviders}`);
  console.log(`   ⏳ Prestadores não verificados: ${unverifiedProviders}`);

  // Testar busca por categoria
  const eletricaCategory = await Category.findOne({ name: 'Elétrica' });
  if (eletricaCategory) {
    const eletricistas = await Provider.find({ categoryIds: eletricaCategory._id });
    console.log(`   ⚡ Eletricistas: ${eletricistas.length}`);
  }

  // Testar busca por cidade
  const novaLimaProviders = await Provider.find({ addressCity: 'Nova Lima' });
  console.log(`   🏙️ Prestadores em Nova Lima: ${novaLimaProviders.length}`);

  // Testar prestadores premium
  const premiumProviders = await Provider.find({ isVerified: true });
  console.log(`   💎 Prestadores premium: ${premiumProviders.length}`);

  // Testar índices
  console.log('\n🔍 Verificando índices...');
  const providerIndexes = await Provider.collection.getIndexes();
  const categoryIndexes = await Category.collection.getIndexes();
  
  console.log('   📊 Índices do Provider:', Object.keys(providerIndexes));
  console.log('   📊 Índices do Category:', Object.keys(categoryIndexes));

  // Testar busca textual
  const searchResults = await Provider.find({
    $or: [
      { name: { $regex: 'premium', $options: 'i' } },
      { description: { $regex: 'premium', $options: 'i' } }
    ]
  });
  console.log(`   🔍 Resultados da busca por "premium": ${searchResults.length}`);

  // Testar agregação por categoria
  const byCategory = await Provider.aggregate([
    { $unwind: '$categoryIds' },
    { $lookup: { from: 'categories', localField: 'categoryIds', foreignField: '_id', as: 'category' } },
    { $unwind: '$category' },
    { $group: { _id: '$category.name', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  console.log('\n📈 Top 5 categorias:');
  byCategory.forEach(cat => {
    console.log(`   ${cat._id}: ${cat.count} prestadores`);
  });

  console.log('\n✅ Teste concluído com sucesso!');
  
  await mongoose.disconnect();
  process.exit(0);
}

testImport().catch(async (err) => {
  console.error('❌ Erro no teste:', err);
  try { 
    await mongoose.disconnect(); 
  } catch {}
  process.exit(1);
});
