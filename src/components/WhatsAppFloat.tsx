import { site } from '../data/site';
import { buildGeneralMessage, whatsappUrl } from '../lib/whatsapp';
import { WhatsAppIcon } from './Icons';

export const WhatsAppFloat = () => (
  <a
    className="whatsapp-float"
    href={whatsappUrl(buildGeneralMessage())}
    target="_blank"
    rel="noreferrer"
    aria-label={`تواصلي مع ${site.name} عبر واتساب`}
  >
    <WhatsAppIcon width={26} height={26} />
    <span>استشارة عبر واتساب</span>
  </a>
);
