// Shared types for Hanin-Hala POS (multi-tenant capable)

export type ID = string;

export interface Restaurant {
  id: ID;
  name: string;
  nameAr?: string;
  currencyCode: string; // e.g., 'SYP' - configurable
  currencySymbol: string; // e.g., 'ل.س'
  timezone: string;
  address?: string;
  phone?: string;
  taxEnabled: boolean;
  taxRatePercent: number; // decimal percent
  serviceChargeEnabled: boolean;
  serviceChargeRatePercent: number;
  discountEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'ADMIN' | 'CASHIER' | 'WAITER' | 'KITCHEN' | 'MANAGER';

export interface Role {
  id: ID;
  restaurantId: ID;
  name: UserRole;
  permissions: string[];
}

export interface User {
  id: ID;
  restaurantId: ID;
  username: string;
  displayName: string;
  roleId: ID;
  role: UserRole;
  isActive: boolean;
  pinHash?: string; // for quick login on POS devices if enabled
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: ID;
  restaurantId: ID;
  nameAr: string;
  nameEn?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Product {
  id: ID;
  restaurantId: ID;
  categoryId: ID;
  nameAr: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  priceCents: number; // store in smallest unit/cents equivalent; use integer
  imageUrl?: string;
  isAvailable: boolean;
  hasVariants: boolean;
  hasModifiers: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  id: ID;
  restaurantId: ID;
  code: string; // table number/name
  seats?: number;
  area?: string;
  isActive: boolean;
}

export type OrderStatus = 'OPEN' | 'SENT_TO_KITCHEN' | 'IN_PREP' | 'READY' | 'SERVED' | 'CLOSED' | 'CANCELLED';
export type OrderSource = 'WAITER' | 'KIOSK' | 'TAKEAWAY' | 'DELIVERY';

export interface Order {
  id: ID;
  restaurantId: ID;
  tableId?: ID;
  tableSessionId?: ID;
  orderNumber: number;
  source: OrderSource;
  status: OrderStatus;
  openedByUserId: ID;
  waiterUserId?: ID;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface OrderItem {
  id: ID;
  restaurantId: ID;
  orderId: ID;
  productId: ID;
  productNameSnapshot: string;
  productPriceSnapshotCents: number;
  quantity: number;
  unitPriceCents: number;
  notes?: string;
  status: 'PENDING' | 'SENT' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export type BillStatus = 'OPEN' | 'PARTIALLY_PAID' | 'PAID' | 'VOID' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'CARD' | 'MIXED' | 'OTHER';

export interface Bill {
  id: ID;
  restaurantId: ID;
  orderId: ID;
  billNumber: number;
  subtotalCents: number;
  taxCents: number;
  serviceChargeCents: number;
  discountCents: number;
  totalCents: number;
  status: BillStatus;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

export interface Payment {
  id: ID;
  restaurantId: ID;
  billId: ID;
  amountCents: number;
  method: PaymentMethod;
  receivedByUserId: ID;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export type PrintJobStatus = 'PENDING' | 'PRINTING' | 'PRINTED' | 'FAILED' | 'CANCELLED';

export interface PrintJob {
  id: ID;
  restaurantId: ID;
  orderId?: ID;
  billId?: ID;
  destination: 'KITCHEN' | 'BAR' | 'CASHIER' | 'CUSTOM';
  printerId: string;
  content: string; // pre-formatted text for thermal printer
  status: PrintJobStatus;
  attempts: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
  printedAt?: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string };
}
