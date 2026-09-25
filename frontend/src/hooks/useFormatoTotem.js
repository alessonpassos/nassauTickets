import { useSyncExternalStore } from 'react';

const consulta = '(min-width: 768px)';
const assinar = (callback) => {
  const media = window.matchMedia(consulta);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
};

export default function useFormatoTotem() {
  return useSyncExternalStore(assinar, () => window.matchMedia(consulta).matches, () => true);
}
