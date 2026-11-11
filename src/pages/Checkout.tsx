import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { site } from '../data/site';
import { branches } from '../data/branches';
import { useCart } from '../context/CartContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { formatPrice, isValidPhone } from '../lib/format';
import { copyText } from '../lib/clipboard';
import { buildOrderMessage, whatsappUrl, type CheckoutCustomer } from '../lib/whatsapp';
import { savePendingOrder, type PendingOrder } from '../lib/order';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EmptyCart } from '../components/EmptyCart';
import { FormField } from '../components/FormField';
import {
  ArrowLeftIcon,
  CheckIcon,
  CopyIcon,
  ShieldIcon,
  TruckIcon,
  WhatsAppIcon,
} from '../components/Icons';

interface FormState {
  firstName: string;
  fatherName: string;
  lastName: string;
  country: string;
  phone: string;
  branch: string;
  notes: string;
  couponCode: string;
  shipToDifferent: boolean;
  shippingFirstName: string;
  shippingLastName: string;
  shippingCountry: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPostcode: string;
  shippingPhone: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = {
  firstName: '',
  fatherName: '',
  lastName: '',
  country: 'سوريا',
  phone: '',
  branch: '',
  notes: '',
  couponCode: '',
  shipToDifferent: false,
  shippingFirstName: '',
  shippingLastName: '',
  shippingCountry: 'سوريا',
  shippingAddress: '',
  shippingCity: '',
  shippingState: '',
  shippingPostcode: '',
  shippingPhone: '',
};

const fieldSelectors: Partial<Record<keyof FormState, string>> = {
  firstName: '[name="billing_first_name"]',
  fatherName: '[name="middle_name"]',
  lastName: '[name="billing_last_name"]',
  phone: '[name="billing_phone"]',
  branch: '[name="_kadmous"]',
  shippingFirstName: '[name="shipping_first_name"]',
  shippingLastName: '[name="shipping_last_name"]',
  shippingAddress: '[name="shipping_address_1"]',
  shippingCity: '[name="shipping_city"]',
  shippingState: '[name="shipping_state"]',
  shippingPostcode: '[name="shipping_postcode"]',
  shippingPhone: '[name="shipping_phone"]',
};

export const Checkout = () => {
  const { items, totalItems, subtotal } = useCart();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [copied, setCopied] = useState(false);

  useDocumentMeta(
    'إتمام الطلب | د. رهف سلوم',
    'أكملي معلومات طلبك، ثم أرسليه عبر واتساب لتأكيده مع متجر د. رهف سلوم. الدفع عبر شام كاش.',
    { noindex: true },
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const toggleShipping = (checked: boolean) => {
    update('shipToDifferent', checked);
    if (!checked) {
      setErrors((current) => {
        const next = { ...current };
        const keys: (keyof FormState)[] = [
          'shippingFirstName',
          'shippingLastName',
          'shippingAddress',
          'shippingCity',
          'shippingState',
          'shippingPostcode',
          'shippingPhone',
        ];
        keys.forEach((key) => delete next[key]);
        return next;
      });
    }
  };

  const validate = (): Errors => {
    const next: Errors = {};

    if (!form.firstName.trim()) next.firstName = 'الاسم الأول مطلوب.';
    if (!form.fatherName.trim()) next.fatherName = 'اسم الأب مطلوب.';
    if (!form.lastName.trim()) next.lastName = 'الاسم الأخير مطلوب.';

    if (!form.phone.trim()) next.phone = 'رقم الواتس مطلوب.';
    else if (!isValidPhone(form.phone)) next.phone = 'أدخلي رقمًا صالحًا من 7 إلى 15 رقمًا.';

    if (!form.branch) next.branch = 'اختاري أقرب فرع للاستلام.';

    if (form.shipToDifferent) {
      if (!form.shippingFirstName.trim()) next.shippingFirstName = 'الاسم الأول لعنوان الشحن مطلوب.';
      if (!form.shippingLastName.trim()) next.shippingLastName = 'الاسم الأخير لعنوان الشحن مطلوب.';
      if (!form.shippingAddress.trim()) next.shippingAddress = 'عنوان الشارع / الحي مطلوب.';
      if (!form.shippingCity.trim()) next.shippingCity = 'المدينة مطلوبة.';
      if (!form.shippingState.trim()) next.shippingState = 'المنطقة مطلوبة.';
      if (!form.shippingPostcode.trim()) next.shippingPostcode = 'الرمز البريدي مطلوب.';
      if (!form.shippingPhone.trim()) next.shippingPhone = 'هاتف عنوان الشحن مطلوب.';
      else if (!isValidPhone(form.shippingPhone)) {
        next.shippingPhone = 'أدخلي رقمًا صالحًا من 7 إلى 15 رقمًا.';
      }
    }

    return next;
  };

  const focusFirstError = (nextErrors: Errors) => {
    const firstKey = Object.keys(nextErrors)[0] as keyof FormState | undefined;
    if (!firstKey) return;
    const selector = fieldSelectors[firstKey];
    const element = selector ? formRef.current?.querySelector<HTMLElement>(selector) : null;
    element?.focus();
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (items.length === 0) return;

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      focusFirstError(nextErrors);
      return;
    }

    const customer: CheckoutCustomer = {
      firstName: form.firstName.trim(),
      fatherName: form.fatherName.trim(),
      lastName: form.lastName.trim(),
      country: form.country,
      phone: form.phone.trim(),
      branch: form.branch,
      notes: form.notes,
      couponCode: form.couponCode,
      shipToDifferent: form.shipToDifferent,
      shipping: form.shipToDifferent
        ? {
            firstName: form.shippingFirstName.trim(),
            lastName: form.shippingLastName.trim(),
            country: form.shippingCountry,
            address: form.shippingAddress.trim(),
            city: form.shippingCity.trim(),
            state: form.shippingState.trim(),
            postcode: form.shippingPostcode.trim(),
            phone: form.shippingPhone.trim(),
          }
        : undefined,
    };

    const message = buildOrderMessage(
      customer,
      items.map((item) => ({
        name: item.name,
        variation: item.variation
          ? { name: item.variation.name, label: item.variation.label }
          : undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    );

    const pending: PendingOrder = {
      message,
      subtotal,
      itemCount: totalItems,
      customerName: `${customer.firstName} ${customer.fatherName} ${customer.lastName}`,
      branch: customer.branch,
      phone: customer.phone,
      createdAt: Date.now(),
    };

    savePendingOrder(pending);
    window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer');
    navigate('/order-ready', { state: pending });
  };

  const copyWalletId = async () => {
    const ok = await copyText(site.payment.walletId);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);
  };

  return (
    <section className="checkout-page">
      <div className="container">
        <Breadcrumbs
          items={[
            { label: 'الرئيسية', to: '/' },
            { label: 'السلة', to: '/cart' },
            { label: 'إتمام الطلب' },
          ]}
        />

        <div className="page-title checkout-title">
          <div>
            <span className="eyebrow">إتمام الطلب</span>
            <h1>معلومات الطلب</h1>
            <p>أكملي البيانات، ثم أرسلي الطلب عبر واتساب لتأكيده مع فريق د. رهف.</p>
          </div>
          <ol className="checkout-steps" aria-label="خطوات إتمام الطلب">
            <li className="is-done">
              <span>1</span>
              السلة
            </li>
            <li className="is-active" aria-current="step">
              <span>2</span>
              المعلومات
            </li>
            <li>
              <span>3</span>
              واتساب
            </li>
          </ol>
        </div>

        {items.length === 0 ? (
          <EmptyCart
            title="لا يوجد ما يمكن إتمامه"
            description="سلتك فارغة، أضيفي منتجًا واحدًا على الأقل قبل إتمام الطلب."
          />
        ) : (
          <form
            id="checkout-form"
            ref={formRef}
            className="checkout-layout"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="checkout-form">
              <div className="checkout-intro-note">
                <WhatsAppIcon width={22} height={22} />
                <p>
                  لا يوجد دفع إلكتروني مباشر على الموقع. بعد تعبئة النموذج ستُفتح محادثة واتساب
                  برسالة الطلب، ويُعتبر الطلب مؤكدًا فقط بعد إرسال الرسالة وتأكيد الفريق عبر
                  واتساب.
                </p>
              </div>

              <section className="form-section" aria-labelledby="contact-heading">
                <div className="form-section__head">
                  <span className="form-section__number">01</span>
                  <div>
                    <h2 id="contact-heading">معلومات التواصل</h2>
                    <p>نحتاج هذه البيانات لتأكيد الطلب والتواصل معكِ.</p>
                  </div>
                </div>

                <div className="form-grid">
                  <FormField id="billing_first_name" label="الاسم الأول" required error={errors.firstName}>
                    <input
                      id="billing_first_name"
                      name="billing_first_name"
                      type="text"
                      value={form.firstName}
                      onChange={(event) => update('firstName', event.target.value)}
                      autoComplete="given-name"
                      placeholder="الاسم الأول"
                      aria-required="true"
                      aria-invalid={Boolean(errors.firstName)}
                      aria-describedby={errors.firstName ? 'billing_first_name-error' : undefined}
                    />
                  </FormField>

                  <FormField id="middle_name" label="اسم الأب" required error={errors.fatherName}>
                    <input
                      id="middle_name"
                      name="middle_name"
                      type="text"
                      value={form.fatherName}
                      onChange={(event) => update('fatherName', event.target.value)}
                      autoComplete="additional-name"
                      placeholder="اسم الأب"
                      aria-required="true"
                      aria-invalid={Boolean(errors.fatherName)}
                      aria-describedby={errors.fatherName ? 'middle_name-error' : undefined}
                    />
                  </FormField>

                  <FormField id="billing_last_name" label="الاسم الأخير" required error={errors.lastName}>
                    <input
                      id="billing_last_name"
                      name="billing_last_name"
                      type="text"
                      value={form.lastName}
                      onChange={(event) => update('lastName', event.target.value)}
                      autoComplete="family-name"
                      placeholder="الاسم الأخير"
                      aria-required="true"
                      aria-invalid={Boolean(errors.lastName)}
                      aria-describedby={errors.lastName ? 'billing_last_name-error' : undefined}
                    />
                  </FormField>

                  <FormField id="billing_country" label="الدولة / المنطقة" required>
                    <select
                      id="billing_country"
                      name="billing_country"
                      value={form.country}
                      onChange={(event) => update('country', event.target.value)}
                      autoComplete="country-name"
                    >
                      <option value="سوريا">سوريا</option>
                    </select>
                  </FormField>

                  <FormField
                    id="billing_phone"
                    label="رقم الواتس"
                    required
                    error={errors.phone}
                    hint="أدخلي الرقم مع رمز الدولة إن أمكن، مثال: +963 9XX XXX XXX"
                  >
                    <input
                      id="billing_phone"
                      name="billing_phone"
                      type="tel"
                      dir="ltr"
                      inputMode="tel"
                      value={form.phone}
                      onChange={(event) => update('phone', event.target.value)}
                      autoComplete="tel"
                      placeholder="+963 9XX XXX XXX"
                      aria-required="true"
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'billing_phone-error' : undefined}
                    />
                  </FormField>

                  <FormField id="_kadmous" label="أقرب فرع للاستلام" required error={errors.branch}>
                    <select
                      id="_kadmous"
                      name="_kadmous"
                      value={form.branch}
                      onChange={(event) => update('branch', event.target.value)}
                      aria-required="true"
                      aria-invalid={Boolean(errors.branch)}
                      aria-describedby={errors.branch ? '_kadmous-error' : undefined}
                    >
                      <option value="">اختاري أقرب فرع</option>
                      {branches.map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
              </section>

              <section className="form-section" aria-labelledby="extra-heading">
                <div className="form-section__head">
                  <span className="form-section__number">02</span>
                  <div>
                    <h2 id="extra-heading">ملاحظات إضافية</h2>
                    <p>كل الحقول هنا اختيارية.</p>
                  </div>
                </div>

                <div className="form-grid">
                  <FormField id="order_comments" label="ملاحظات الطلب (اختياري)" full>
                    <textarea
                      id="order_comments"
                      name="order_comments"
                      rows={3}
                      value={form.notes}
                      onChange={(event) => update('notes', event.target.value)}
                      placeholder="ملاحظات حول الطلب، مثال: ملحوظة خاصة بتسليم الطلب."
                    />
                  </FormField>

                  <FormField
                    id="coupon_code"
                    label="رمز الخصم (اختياري)"
                    full
                    hint="لا يُطبَّق الخصم تلقائيًا على الموقع؛ سيتم التحقق من الرمز عبر واتساب."
                  >
                    <input
                      id="coupon_code"
                      name="coupon_code"
                      type="text"
                      value={form.couponCode}
                      onChange={(event) => update('couponCode', event.target.value)}
                      placeholder="رمز القسيمة"
                      autoComplete="off"
                    />
                  </FormField>
                </div>
              </section>

              <section className="form-section" aria-labelledby="shipping-heading">
                <div className="form-section__head">
                  <span className="form-section__number">03</span>
                  <div>
                    <h2 id="shipping-heading">عنوان الشحن</h2>
                    <p>الاستلام من الفرع هو الخيار الأساسي. أكملي العنوان فقط إن رغبتِ بالشحن.</p>
                  </div>
                </div>

                <label className="checkbox-field" htmlFor="ship-to-different-address-checkbox">
                  <input
                    id="ship-to-different-address-checkbox"
                    name="ship_to_different_address"
                    type="checkbox"
                    checked={form.shipToDifferent}
                    onChange={(event) => toggleShipping(event.target.checked)}
                  />
                  <span className="checkbox-field__box" aria-hidden="true">
                    <CheckIcon width={14} height={14} />
                  </span>
                  <span className="checkbox-field__text">
                    <strong>هل تودّ الشحن لعنوان مختلف؟</strong>
                    <small>عند التفعيل ستظهر حقول عنوان الشحن كاملة.</small>
                  </span>
                </label>

                {form.shipToDifferent && (
                  <div className="form-grid shipping-fields">
                    <FormField
                      id="shipping_first_name"
                      label="الاسم الأول"
                      required
                      error={errors.shippingFirstName}
                    >
                      <input
                        id="shipping_first_name"
                        name="shipping_first_name"
                        type="text"
                        value={form.shippingFirstName}
                        onChange={(event) => update('shippingFirstName', event.target.value)}
                        autoComplete="shipping given-name"
                        aria-required="true"
                        aria-invalid={Boolean(errors.shippingFirstName)}
                        aria-describedby={
                          errors.shippingFirstName ? 'shipping_first_name-error' : undefined
                        }
                      />
                    </FormField>

                    <FormField
                      id="shipping_last_name"
                      label="الاسم الأخير"
                      required
                      error={errors.shippingLastName}
                    >
                      <input
                        id="shipping_last_name"
                        name="shipping_last_name"
                        type="text"
                        value={form.shippingLastName}
                        onChange={(event) => update('shippingLastName', event.target.value)}
                        autoComplete="shipping family-name"
                        aria-required="true"
                        aria-invalid={Boolean(errors.shippingLastName)}
                        aria-describedby={
                          errors.shippingLastName ? 'shipping_last_name-error' : undefined
                        }
                      />
                    </FormField>

                    <FormField id="shipping_country" label="الدولة / المنطقة" required>
                      <select
                        id="shipping_country"
                        name="shipping_country"
                        value={form.shippingCountry}
                        onChange={(event) => update('shippingCountry', event.target.value)}
                        autoComplete="shipping country-name"
                      >
                        <option value="سوريا">سوريا</option>
                      </select>
                    </FormField>

                    <FormField
                      id="shipping_address_1"
                      label="عنوان الشارع / الحي"
                      required
                      error={errors.shippingAddress}
                      full
                    >
                      <input
                        id="shipping_address_1"
                        name="shipping_address_1"
                        type="text"
                        value={form.shippingAddress}
                        onChange={(event) => update('shippingAddress', event.target.value)}
                        autoComplete="shipping address-line1"
                        placeholder="رقم المنزل واسم الشارع / الحي"
                        aria-required="true"
                        aria-invalid={Boolean(errors.shippingAddress)}
                        aria-describedby={
                          errors.shippingAddress ? 'shipping_address_1-error' : undefined
                        }
                      />
                    </FormField>

                    <FormField
                      id="shipping_city"
                      label="المدينة"
                      required
                      error={errors.shippingCity}
                    >
                      <input
                        id="shipping_city"
                        name="shipping_city"
                        type="text"
                        value={form.shippingCity}
                        onChange={(event) => update('shippingCity', event.target.value)}
                        autoComplete="shipping address-level2"
                        aria-required="true"
                        aria-invalid={Boolean(errors.shippingCity)}
                        aria-describedby={errors.shippingCity ? 'shipping_city-error' : undefined}
                      />
                    </FormField>

                    <FormField
                      id="shipping_state"
                      label="المنطقة"
                      required
                      error={errors.shippingState}
                    >
                      <input
                        id="shipping_state"
                        name="shipping_state"
                        type="text"
                        value={form.shippingState}
                        onChange={(event) => update('shippingState', event.target.value)}
                        autoComplete="shipping address-level1"
                        aria-required="true"
                        aria-invalid={Boolean(errors.shippingState)}
                        aria-describedby={errors.shippingState ? 'shipping_state-error' : undefined}
                      />
                    </FormField>

                    <FormField
                      id="shipping_postcode"
                      label="الرمز البريدي / ZIP"
                      required
                      error={errors.shippingPostcode}
                    >
                      <input
                        id="shipping_postcode"
                        name="shipping_postcode"
                        type="text"
                        value={form.shippingPostcode}
                        onChange={(event) => update('shippingPostcode', event.target.value)}
                        autoComplete="shipping postal-code"
                        aria-required="true"
                        aria-invalid={Boolean(errors.shippingPostcode)}
                        aria-describedby={
                          errors.shippingPostcode ? 'shipping_postcode-error' : undefined
                        }
                      />
                    </FormField>

                    <FormField
                      id="shipping_phone"
                      label="الهاتف"
                      required
                      error={errors.shippingPhone}
                    >
                      <input
                        id="shipping_phone"
                        name="shipping_phone"
                        type="tel"
                        dir="ltr"
                        inputMode="tel"
                        value={form.shippingPhone}
                        onChange={(event) => update('shippingPhone', event.target.value)}
                        autoComplete="shipping tel"
                        placeholder="+963 9XX XXX XXX"
                        aria-required="true"
                        aria-invalid={Boolean(errors.shippingPhone)}
                        aria-describedby={
                          errors.shippingPhone ? 'shipping_phone-error' : undefined
                        }
                      />
                    </FormField>
                  </div>
                )}
              </section>

              <section className="form-section" aria-labelledby="payment-heading">
                <div className="form-section__head">
                  <span className="form-section__number">04</span>
                  <div>
                    <h2 id="payment-heading">طريقة الدفع</h2>
                    <p>الدفع عبر شام كاش، ثم تأكيد الطلب وإرسال الإيصال عبر واتساب.</p>
                  </div>
                </div>

                <div className="payment-card">
                  <div className="payment-card__head">
                    <span className="payment-brand">شام كاش</span>
                    <span className="payment-badge">
                      <CheckIcon width={14} height={14} />
                      الطريقة المتاحة
                    </span>
                  </div>
                  <p className="payment-card__desc">{site.payment.description}</p>

                  <div className="wallet-card">
                    <img
                      src={site.payment.qr}
                      alt="رمز QR لمحفظة شام كاش الخاصة بد. رهف سلوم"
                      width={150}
                      height={198}
                      loading="lazy"
                    />
                    <div className="wallet-info">
                      <span className="wallet-info__label">اسم المحفظة</span>
                      <strong>{site.payment.walletName}</strong>
                      <span className="wallet-info__label">معرّف المحفظة</span>
                      <code dir="ltr">{site.payment.walletId}</code>
                      <button type="button" className="copy-button" onClick={copyWalletId}>
                        {copied ? <CheckIcon width={16} height={16} /> : <CopyIcon width={16} height={16} />}
                        <span aria-live="polite">{copied ? 'تم النسخ' : 'نسخ المعرّف'}</span>
                      </button>
                    </div>
                  </div>

                  <ol className="payment-steps">
                    <li>افتحي تطبيق شام كاش وابحثي عن المحفظة بالمعرّف أعلاه أو امسحي رمز QR.</li>
                    <li>أرسلي مبلغ الطلب الظاهر في ملخص الطلب.</li>
                    <li>احتفظي بصورة من إيصال التحويل.</li>
                    <li>بعد الضغط على تأكيد الطلب، أرسلي الرسالة في واتساب وأرفقي صورة الإيصال.</li>
                  </ol>
                </div>
              </section>
            </div>

            <aside className="checkout-aside">
              <div className="order-summary">
                <div className="order-summary__head">
                  <h2>ملخص الطلب</h2>
                  <Link to="/cart">تعديل السلة</Link>
                </div>

                <ul className="order-lines">
                  {items.map((item) => (
                    <li key={item.key}>
                      <img src={item.image} alt="" width={56} height={56} loading="lazy" />
                      <div>
                        <strong>{item.name}</strong>
                        <small>
                          {item.variation ? `${item.variation.name}: ${item.variation.label} • ` : ''}
                          {item.quantity} × {formatPrice(item.unitPrice)}
                        </small>
                      </div>
                      <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                    </li>
                  ))}
                </ul>

                <div className="summary-row">
                  <span>المجموع الفرعي ({totalItems} منتجًا)</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
                <div className="summary-row">
                  <span>أجرة التوصيل</span>
                  <span className="summary-row__soft">لا تُضاف على الموقع — تُؤكَّد عبر واتساب</span>
                </div>
                {form.couponCode.trim() && (
                  <p className="summary-coupon">
                    رمز الخصم: <strong>{form.couponCode.trim()}</strong> — يُتحقق منه عبر واتساب.
                  </p>
                )}
                <div className="summary-row is-total">
                  <span>الإجمالي</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
                <p className="summary-note">{site.shippingNote}</p>

                <button type="submit" className="button button--primary button--wide">
                  <WhatsAppIcon width={20} height={20} />
                  تأكيد الطلب عبر واتساب
                </button>
                <p className="checkout-disclaimer">
                  بالضغط على الزر ستُفتح محادثة واتساب برسالة الطلب. لا يُعتبر الطلب مؤكدًا حتى
                  إرسال الرسالة وتأكيد الفريق.
                </p>

                <ul className="summary-trust">
                  <li>
                    <TruckIcon width={18} height={18} />
                    شحن بعد 24 ساعة من تثبيت الحجز
                  </li>
                  <li>
                    <ShieldIcon width={18} height={18} />
                    لا نطلب أي بيانات دفع على الموقع
                  </li>
                </ul>
              </div>

              <div className="checkout-help">
                <span className="checkout-help__icon">
                  <WhatsAppIcon width={22} height={22} />
                </span>
                <div>
                  <strong>تحتاجين مساعدة قبل الطلب؟</strong>
                  <p>تواصلي مع د. رهف مباشرة للاستفسار عن المنتجات أو طريقة الشحن.</p>
                  <Link className="text-link" to="/contact">
                    صفحة التواصل
                    <ArrowLeftIcon width={16} height={16} />
                  </Link>
                </div>
              </div>
            </aside>
          </form>
        )}
      </div>
    </section>
  );
};
