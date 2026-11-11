import { useEffect } from 'react';

interface MetaOptions {
  image?: string;
  type?: string;
  noindex?: boolean;
}

const setMeta = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

export const useDocumentMeta = (
  title: string,
  description: string,
  options: MetaOptions = {},
) => {
  const { image, type = 'website', noindex = false } = options;

  useEffect(() => {
    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', type, 'property');
    setMeta('og:url', window.location.href, 'property');
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);

    if (image) {
      const absoluteImage = new URL(image, window.location.origin).href;
      setMeta('og:image', absoluteImage, 'property');
      setMeta('twitter:image', absoluteImage);
    }

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${window.location.pathname}`;
  }, [title, description, image, type, noindex]);
};
