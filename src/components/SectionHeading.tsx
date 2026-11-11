import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from './Icons';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  link?: { to: string; label: string };
  align?: 'start' | 'center';
}

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  link,
  align = 'start',
}: SectionHeadingProps) => (
  <div className={`section-heading${align === 'center' ? ' is-center' : ''}`}>
    <div className="section-heading__text">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
    {link && (
      <Link className="text-link" to={link.to}>
        {link.label}
        <ArrowLeftIcon width={18} height={18} />
      </Link>
    )}
  </div>
);
