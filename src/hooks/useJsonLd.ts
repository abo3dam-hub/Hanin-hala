import { useEffect } from 'react';

export const useJsonLd = (id: string, data: unknown) => {
  const serialized = JSON.stringify(data);

  useEffect(() => {
    const existing = document.getElementById(id);
    existing?.remove();

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.textContent = serialized;
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [id, serialized]);
};
