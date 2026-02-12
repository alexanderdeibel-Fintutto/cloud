export { de } from './de';
export { en } from './en';
export type { Translations } from './de';

export type Language = 'de' | 'en';

export const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];
