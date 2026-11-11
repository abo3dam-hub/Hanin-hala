import { Link } from 'react-router-dom';
import { buildConsultationMessage, whatsappUrl } from '../lib/whatsapp';
import { BagIcon, WhatsAppIcon } from './Icons';

interface EmptyCartProps {
  title?: string;
  description?: string;
}

export const EmptyCart = ({
  title = 'سلتك فارغة حاليًا',
  description = 'اكتشفي مجموعات العناية المصنوعة يدويًا بإشراف د. رهف سلوم، وأضيفي ما يناسب روتينك.',
}: EmptyCartProps) => (
  <div className="empty-state empty-state--cart">
    <span className="empty-state__icon">
      <BagIcon width={34} height={34} />
    </span>
    <h2>{title}</h2>
    <p>{description}</p>
    <div className="empty-state__actions">
      <Link className="button button--primary" to="/shop">
        تسوّقي المجموعة
      </Link>
      <a
        className="button button--ghost"
        href={whatsappUrl(buildConsultationMessage())}
        target="_blank"
        rel="noreferrer"
      >
        <WhatsAppIcon width={18} height={18} />
        استشارة مجانية
      </a>
    </div>
  </div>
);
