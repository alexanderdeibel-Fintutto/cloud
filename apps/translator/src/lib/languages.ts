export interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  speechCode?: string
}

export const LANGUAGES: Language[] = [
  { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '\uD83C\uDDE9\uD83C\uDDEA', speechCode: 'de-DE' },
  { code: 'en', name: 'Englisch', nativeName: 'English', flag: '\uD83C\uDDEC\uD83C\uDDE7', speechCode: 'en-US' },
  { code: 'fr', name: 'Franz\u00f6sisch', nativeName: 'Fran\u00e7ais', flag: '\uD83C\uDDEB\uD83C\uDDF7', speechCode: 'fr-FR' },
  { code: 'es', name: 'Spanisch', nativeName: 'Espa\u00f1ol', flag: '\uD83C\uDDEA\uD83C\uDDF8', speechCode: 'es-ES' },
  { code: 'it', name: 'Italienisch', nativeName: 'Italiano', flag: '\uD83C\uDDEE\uD83C\uDDF9', speechCode: 'it-IT' },
  { code: 'pt', name: 'Portugiesisch', nativeName: 'Portugu\u00eas', flag: '\uD83C\uDDF5\uD83C\uDDF9', speechCode: 'pt-PT' },
  { code: 'nl', name: 'Niederl\u00e4ndisch', nativeName: 'Nederlands', flag: '\uD83C\uDDF3\uD83C\uDDF1', speechCode: 'nl-NL' },
  { code: 'pl', name: 'Polnisch', nativeName: 'Polski', flag: '\uD83C\uDDF5\uD83C\uDDF1', speechCode: 'pl-PL' },
  { code: 'tr', name: 'T\u00fcrkisch', nativeName: 'T\u00fcrk\u00e7e', flag: '\uD83C\uDDF9\uD83C\uDDF7', speechCode: 'tr-TR' },
  { code: 'ru', name: 'Russisch', nativeName: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439', flag: '\uD83C\uDDF7\uD83C\uDDFA', speechCode: 'ru-RU' },
  { code: 'uk', name: 'Ukrainisch', nativeName: '\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430', flag: '\uD83C\uDDFA\uD83C\uDDE6', speechCode: 'uk-UA' },
  { code: 'ar', name: 'Arabisch', nativeName: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629', flag: '\uD83C\uDDF8\uD83C\uDDE6', speechCode: 'ar-SA' },
  { code: 'zh', name: 'Chinesisch', nativeName: '\u4e2d\u6587', flag: '\uD83C\uDDE8\uD83C\uDDF3', speechCode: 'zh-CN' },
  { code: 'ja', name: 'Japanisch', nativeName: '\u65e5\u672c\u8a9e', flag: '\uD83C\uDDEF\uD83C\uDDF5', speechCode: 'ja-JP' },
  { code: 'ko', name: 'Koreanisch', nativeName: '\ud55c\uad6d\uc5b4', flag: '\uD83C\uDDF0\uD83C\uDDF7', speechCode: 'ko-KR' },
  { code: 'hi', name: 'Hindi', nativeName: '\u0939\u093f\u0928\u094d\u0926\u0940', flag: '\uD83C\uDDEE\uD83C\uDDF3', speechCode: 'hi-IN' },
  { code: 'sv', name: 'Schwedisch', nativeName: 'Svenska', flag: '\uD83C\uDDF8\uD83C\uDDEA', speechCode: 'sv-SE' },
  { code: 'da', name: 'D\u00e4nisch', nativeName: 'Dansk', flag: '\uD83C\uDDE9\uD83C\uDDF0', speechCode: 'da-DK' },
  { code: 'cs', name: 'Tschechisch', nativeName: '\u010ce\u0161tina', flag: '\uD83C\uDDE8\uD83C\uDDFF', speechCode: 'cs-CZ' },
  { code: 'ro', name: 'Rum\u00e4nisch', nativeName: 'Rom\u00e2n\u0103', flag: '\uD83C\uDDF7\uD83C\uDDF4', speechCode: 'ro-RO' },
  { code: 'el', name: 'Griechisch', nativeName: '\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac', flag: '\uD83C\uDDEC\uD83C\uDDF7', speechCode: 'el-GR' },
  { code: 'hu', name: 'Ungarisch', nativeName: 'Magyar', flag: '\uD83C\uDDED\uD83C\uDDFA', speechCode: 'hu-HU' },
]

export function getLanguageByCode(code: string): Language | undefined {
  return LANGUAGES.find(l => l.code === code)
}
