import { products } from '../data/products';
import { categories } from '../data/categories';

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();

export const searchProducts = (query: string) => {
  const term = normalize(query);
  if (!term) return [];

  return products
    .map((product) => {
      const category = categories.find((item) => item.slug === product.category);
      const haystack = normalize(
        [
          product.name,
          product.description ?? '',
          product.concerns.join(' '),
          category?.name ?? '',
          category?.shortName ?? '',
        ].join(' '),
      );
      let score = 0;
      if (normalize(product.name).includes(term)) score += 10;
      if (normalize(product.name).startsWith(term)) score += 6;
      if (haystack.includes(term)) score += 2;
      return { product, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);
};
