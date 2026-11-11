import { site } from '../data/site';
import { formatPrice } from './format';

export interface OrderLine {
  name: string;
  variation?: { name: string; label: string };
  quantity: number;
  unitPrice: number;
}

export interface ShippingDetails {
  firstName: string;
  lastName: string;
  country: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  phone: string;
}

export interface CheckoutCustomer {
  firstName: string;
  fatherName: string;
  lastName: string;
  country: string;
  phone: string;
  branch: string;
  notes: string;
  couponCode: string;
  shipToDifferent: boolean;
  shipping?: ShippingDetails;
}

export const whatsappUrl = (message: string): string =>
  `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;

export const buildOrderMessage = (customer: CheckoutCustomer, items: OrderLine[]): string => {
  const lines = items
    .map((item, index) => {
      const variation = item.variation
        ? ` — ${item.variation.name}: ${item.variation.label}`
        : '';
      return `${index + 1}. ${item.name}${variation}\n   الكمية: ${item.quantity} × ${formatPrice(
        item.unitPrice,
      )} = ${formatPrice(item.quantity * item.unitPrice)}`;
    })
    .join('\n');

  const subtotal = items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);

  const shippingBlock = customer.shipToDifferent && customer.shipping
    ? `\n\n🚚 عنوان الشحن المختلف\nالاسم: ${customer.shipping.firstName} ${customer.shipping.lastName}\nالدولة / المنطقة: ${customer.shipping.country}\nعنوان الشارع / الحي: ${customer.shipping.address}\nالمدينة: ${customer.shipping.city}\nالمنطقة: ${customer.shipping.state}\nالرمز البريدي: ${customer.shipping.postcode}\nالهاتف: ${customer.shipping.phone}`
    : '';

  const notesBlock = customer.notes.trim()
    ? `\n\n📝 ملاحظات الطلب\n${customer.notes.trim()}`
    : '';

  const couponBlock = customer.couponCode.trim()
    ? `\n\n🎟️ رمز الخصم\n${customer.couponCode.trim()}`
    : '';

  return `🛍️ طلب جديد من متجر ${site.name}

👤 معلومات العميل
الاسم الأول: ${customer.firstName}
اسم الأب: ${customer.fatherName}
الاسم الأخير: ${customer.lastName}
الدولة / المنطقة: ${customer.country}
رقم الواتس: ${customer.phone}

📍 فرع الاستلام
${customer.branch}${shippingBlock}${notesBlock}${couponBlock}

📦 المنتجات
${lines}

🧾 ملخص الطلب
المجموع الفرعي: ${formatPrice(subtotal)}
أجرة التوصيل: لا تُضاف إلى الإجمالي على الموقع — تُؤكَّد تفاصيل التوصيل عبر واتساب
الإجمالي: ${formatPrice(subtotal)}

💳 طريقة الدفع: ${site.payment.name}
اسم المحفظة: ${site.payment.walletName}
معرّف المحفظة: ${site.payment.walletId}

أُرسل هذا الطلب من الموقع الإلكتروني لمتجر ${site.name}.`;
};

export const buildProductInquiryMessage = (productName: string): string =>
  `مرحبًا د. رهف،\nأرغب بالاستفسار عن منتج «${productName}»: المكونات، طريقة الاستخدام، والسعر إن كان متاحًا.\nشكرًا لكِ.`;

export const buildConsultationMessage = (): string =>
  `مرحبًا د. رهف،\nأرغب بحجز استشارة مجانية للعناية بالبشرة.\nأرجو إخباري بالخطوات والمعلومات المطلوبة.\nشكرًا لكِ.`;

export const buildGeneralMessage = (): string =>
  `مرحبًا د. رهف،\nأرغب بالاستفسار عن منتجات متجركم.\nشكرًا لكِ.`;

export const buildContactMessage = (
  name: string,
  phone: string,
  topic: string,
  message: string,
): string => {
  const phoneBlock = phone.trim() ? `\nرقم التواصل: ${phone.trim()}` : '';
  const messageBlock = message.trim() ? `\n\n${message.trim()}` : '';

  return `مرحبًا د. رهف،\nأنا ${name.trim() || 'من زوّار المتجر'}.${phoneBlock}\nالموضوع: ${topic}${messageBlock}\n\nأُرسلت هذه الرسالة من صفحة التواصل في الموقع.`;
};
