export interface PendingOrder {
  message: string;
  subtotal: number;
  itemCount: number;
  customerName: string;
  branch: string;
  phone: string;
  createdAt: number;
}

const STORAGE_KEY = 'dr-rahaf-pending-order-v1';

export const savePendingOrder = (order: PendingOrder): void => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  } catch {
    // The confirmation screen still works from navigation state.
  }
};

export const readPendingOrder = (): PendingOrder | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const order = parsed as PendingOrder;
    if (typeof order.message !== 'string' || typeof order.subtotal !== 'number') return null;
    if (typeof order.itemCount !== 'number' || typeof order.customerName !== 'string') return null;
    if (typeof order.branch !== 'string') return null;
    return order;
  } catch {
    return null;
  }
};

export const clearPendingOrder = (): void => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
};
