export const formatPrice = (value: number): string =>
  `${Math.round(value).toLocaleString('de-DE')} ل.س`;

export const formatPriceOrRequest = (value: number | null): string =>
  value === null ? 'السعر عند الطلب' : formatPrice(value);

const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
const persianDigits = '۰۱۲۳۴۵۶۷۸۹';

export const normalizePhone = (value: string): string =>
  value
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[\s\-()]/g, '');

export const isValidPhone = (value: string): boolean => {
  const normalized = normalizePhone(value);
  return /^\+?\d{7,15}$/.test(normalized);
};
