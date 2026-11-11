import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Product } from '../data/products';

const STORAGE_KEY = 'dr-rahaf-cart-v1';

export interface CartVariation {
  id: string;
  name: string;
  label: string;
}

export interface CartItem {
  key: string;
  productId: number;
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  variation?: CartVariation;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  notice: string | null;
  addItem: (product: Product, quantity?: number, variation?: CartVariation) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  clearNotice: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const readCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as CartItem).key === 'string' &&
        typeof (item as CartItem).name === 'string' &&
        typeof (item as CartItem).unitPrice === 'number' &&
        typeof (item as CartItem).quantity === 'number' &&
        (item as CartItem).quantity > 0,
    );
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(readCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // The cart still works for the current session if storage is unavailable.
    }
  }, [items]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const clearNotice = useCallback(() => setNotice(null), []);

  const addItem = useCallback(
    (product: Product, quantity = 1, variation?: CartVariation) => {
      const variationOption = variation
        ? product.variations?.options.find((option) => option.id === variation.id)
        : undefined;
      const price = variationOption?.price ?? product.price;
      if (price === null) return;

      const key = `${product.id}:${variation?.id ?? 'default'}`;
      const safeQuantity = Math.min(99, Math.max(1, Math.round(quantity)));

      setItems((current) => {
        const existing = current.find((item) => item.key === key);
        if (existing) {
          return current.map((item) =>
            item.key === key
              ? { ...item, quantity: Math.min(99, item.quantity + safeQuantity) }
              : item,
          );
        }
        return [
          ...current,
          {
            key,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.imageSmall,
            unitPrice: price,
            quantity: safeQuantity,
            variation,
          },
        ];
      });

      setNotice(`أُضيف «${product.name}» إلى السلة`);
      setIsCartOpen(true);
    },
    [],
  );

  const updateQuantity = useCallback((key: string, quantity: number) => {
    const safeQuantity = Math.min(99, Math.max(1, Math.round(quantity)));
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, quantity: safeQuantity } : item)),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.quantity * item.unitPrice, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      totalItems,
      subtotal,
      isCartOpen,
      notice,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      openCart,
      closeCart,
      clearNotice,
    }),
    [
      items,
      totalItems,
      subtotal,
      isCartOpen,
      notice,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      openCart,
      closeCart,
      clearNotice,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
