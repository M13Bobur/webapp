import { connectDatabase } from '../config/database.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { createSlug } from '../utils/slug.js';
import { ensureDefaultAdmin } from '../services/auth.service.js';

const seed = async () => {
  await connectDatabase();
  await ensureDefaultAdmin();

  const categoriesData = [
    { title: 'Sho\'rvalar', sortOrder: 1 },
    { title: 'Salatlar', sortOrder: 2 },
    { title: 'Asosiy taomlar', sortOrder: 3 },
    { title: 'Ichimliklar', sortOrder: 4 },
    { title: 'Shirinliklar', sortOrder: 5 },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const slug = createSlug(cat.title);
    const category = await Category.findOneAndUpdate(
      { slug },
      { ...cat, slug, isActive: true },
      { upsert: true, new: true }
    );
    categories[cat.title] = category;
  }

  const productsData = [
    { title: 'Mastava', category: 'Sho\'rvalar', price: 25000, shortDescription: 'An\'anaviy o\'zbek sho\'rvasi', badges: ['popular'] },
    { title: 'Achichuk salat', category: 'Salatlar', price: 15000, shortDescription: 'Yangi sabzavotlar', badges: ['new'] },
    { title: 'Osh', category: 'Asosiy taomlar', price: 35000, shortDescription: 'To\'y oshi', badges: ['hot', 'popular'], discountPrice: 32000 },
    { title: 'Lag\'mon', category: 'Asosiy taomlar', price: 28000, shortDescription: 'Uy lag\'moni' },
    { title: 'Manti', category: 'Asosiy taomlar', price: 30000, shortDescription: '5 dona', badges: ['popular'] },
    { title: 'Choy', category: 'Ichimliklar', price: 5000, shortDescription: 'Ko\'k choy' },
    { title: 'Kompot', category: 'Ichimliklar', price: 8000, shortDescription: 'Uy kompoti' },
    { title: 'Halva', category: 'Shirinliklar', price: 12000, shortDescription: 'An\'anaviy halva', badges: ['new'] },
  ];

  for (const p of productsData) {
    const slug = createSlug(p.title);
    const categoryId = categories[p.category]._id;
    await Product.findOneAndUpdate(
      { slug },
      {
        title: p.title,
        slug,
        price: p.price,
        discountPrice: p.discountPrice || null,
        shortDescription: p.shortDescription,
        description: p.shortDescription,
        categoryId,
        isAvailable: true,
        stock: 100,
        badges: p.badges || [],
        preparationTime: 20,
        rating: 4.5,
      },
      { upsert: true, new: true }
    );
  }

  console.log('Seed completed successfully!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
