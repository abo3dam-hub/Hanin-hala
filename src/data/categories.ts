import { products, type CategorySlug } from './products';

export interface Category {
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  image: string;
  count: number;
}

const definitions: Omit<Category, 'count'>[] = [
  {
    slug: 'skincare',
    name: 'منتجات العناية بالبشرة',
    shortName: 'العناية بالبشرة',
    description: 'روتينات وكريمات وسيرومات للعناية اليومية بالبشرة، مصنوعة يدويًا بإشراف د. رهف سلوم.',
    image: '/images/products/17014.webp',
  },
  {
    slug: 'hair',
    name: 'منتجات العناية بالشعر',
    shortName: 'العناية بالشعر',
    description: 'زيوت وخلطات ومجموعات للعناية بالشعر، من الجذور حتى الأطراف.',
    image: '/images/products/8569.webp',
  },
  {
    slug: 'makeup',
    name: 'منتجات الميكاب الطبي',
    shortName: 'الميكاب الطبي',
    description: 'مكياج طبي بملمس خفيف، يراعي احتياجات البشرة ويمنحها مظهرًا طبيعيًا.',
    image: '/images/products/8415.webp',
  },
  {
    slug: 'slimming',
    name: 'منتجات التنحيف',
    shortName: 'التنحيف',
    description: 'منتج ضمن مجموعة التنحيف، مع إرشادات الاستخدام المرفقة.',
    image: '/images/products/8582.webp',
  },
];

export const categories: Category[] = definitions.map((category) => ({
  ...category,
  count: products.filter((product) => product.category === category.slug).length,
}));

export const getCategory = (slug: string) => categories.find((category) => category.slug === slug);
