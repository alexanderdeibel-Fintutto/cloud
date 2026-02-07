import { FormTemplate } from '@/contexts/FormContext'

export const FORM_TEMPLATES: Record<string, FormTemplate> = {
  // ===== MIETE & KOSTEN =====
  'mietpreisbremse-ruege': {
    id: 'mietpreisbremse-ruege',
    name: 'Mietpreisbremse-Ruege',
    description: 'Ruegen Sie die ueberhöhte Miete und fordern Sie Geld zurueck',
    category: 'miete',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'mietbeginn', name: 'mietbeginn', label: 'Mietbeginn', type: 'date', required: true, section: 'mietverhaeltnis' },
      { id: 'kaltmiete', name: 'kaltmiete', label: 'Aktuelle Kaltmiete (EUR)', type: 'currency', required: true, section: 'mietverhaeltnis' },
      { id: 'wohnflaeche', name: 'wohnflaeche', label: 'Wohnflaeche (m2)', type: 'number', required: true, section: 'mietverhaeltnis' },
      { id: 'ortsuebliche_miete', name: 'ortsuebliche_miete', label: 'Ortsuebliche Vergleichsmiete (EUR/m2)', type: 'currency', required: true, section: 'mietverhaeltnis' },
      { id: 'rueckforderung', name: 'rueckforderung', label: 'Rueckforderungsbetrag (EUR)', type: 'currency', section: 'forderung' },
      { id: 'frist', name: 'frist', label: 'Frist zur Stellungnahme', type: 'date', required: true, section: 'forderung' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

hiermit ruege ich gemaess § 556g BGB die Hoehe der vereinbarten Miete.

Die von mir gezahlte Miete uebersteigt die nach der Mietpreisbremse zulaessige Miete. Nach § 556d BGB darf die Miete bei Wiedervermietung hoechstens 10% ueber der ortsueblichen Vergleichsmiete liegen.

Ich fordere Sie auf, die Miete auf das zulaessige Mass zu reduzieren und mir die zu viel gezahlte Miete zurueckzuerstatten.

Mit freundlichen Gruessen`,
  },

  'mieterhoehung-widerspruch': {
    id: 'mieterhoehung-widerspruch',
    name: 'Mieterhoehung-Widerspruch',
    description: 'Widersprechen Sie einer unzulaessigen Mieterhoehung',
    category: 'miete',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'aktuelle_miete', name: 'aktuelle_miete', label: 'Aktuelle Kaltmiete (EUR)', type: 'currency', required: true, section: 'mieterhoehung' },
      { id: 'neue_miete', name: 'neue_miete', label: 'Geforderte neue Miete (EUR)', type: 'currency', required: true, section: 'mieterhoehung' },
      { id: 'erhoehung_datum', name: 'erhoehung_datum', label: 'Datum der Mieterhoehung', type: 'date', required: true, section: 'mieterhoehung' },
      { id: 'letzte_erhoehung', name: 'letzte_erhoehung', label: 'Datum der letzten Erhoehung', type: 'date', section: 'mieterhoehung' },
      { id: 'widerspruch_grund', name: 'widerspruch_grund', label: 'Begruendung des Widerspruchs', type: 'textarea', required: true, section: 'widerspruch' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

hiermit widerspreche ich der von Ihnen geforderten Mieterhoehung.

Die Mieterhoehung ist aus folgenden Gruenden unwirksam:
- Die Kappungsgrenze von 20% (bzw. 15% in angespannten Wohnungsmaerkten) innerhalb von 3 Jahren wird ueberschritten
- Die geforderte Miete liegt ueber der ortsueblichen Vergleichsmiete
- Die formellen Voraussetzungen nach § 558 BGB sind nicht erfuellt

Ich fordere Sie auf, die Mieterhoehung zurueckzunehmen.

Mit freundlichen Gruessen`,
  },

  'nebenkostenabrechnung-widerspruch': {
    id: 'nebenkostenabrechnung-widerspruch',
    name: 'Nebenkosten-Widerspruch',
    description: 'Widersprechen Sie fehlerhaften Nebenkostenabrechnungen',
    category: 'miete',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'abrechnungszeitraum', name: 'abrechnungszeitraum', label: 'Abrechnungszeitraum', type: 'text', required: true, section: 'abrechnung', placeholder: 'z.B. 01.01.2024 - 31.12.2024' },
      { id: 'nachzahlung', name: 'nachzahlung', label: 'Geforderte Nachzahlung (EUR)', type: 'currency', required: true, section: 'abrechnung' },
      { id: 'widerspruch_punkte', name: 'widerspruch_punkte', label: 'Beanstandete Positionen', type: 'textarea', required: true, section: 'widerspruch', placeholder: 'Listen Sie die beanstandeten Kostenpositionen auf...' },
      { id: 'belegeinsicht', name: 'belegeinsicht', label: 'Belegeinsicht anfordern', type: 'checkbox', section: 'widerspruch' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

hiermit widerspreche ich der Nebenkostenabrechnung fuer den oben genannten Zeitraum.

Die Abrechnung weist folgende Maengel auf, die zu einer fehlerhaften Berechnung fuehren. Ich behalte mir vor, weitere Einwaende nach Einsicht in die Belege geltend zu machen.

Bitte senden Sie mir eine korrigierte Abrechnung zu.

Mit freundlichen Gruessen`,
  },

  // ===== KUENDIGUNG =====
  'kuendigung-widerspruch': {
    id: 'kuendigung-widerspruch',
    name: 'Kuendigungs-Widerspruch',
    description: 'Widersprechen Sie der Kuendigung durch den Vermieter',
    category: 'kuendigung',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'kuendigung_datum', name: 'kuendigung_datum', label: 'Datum der Kuendigung', type: 'date', required: true, section: 'kuendigung' },
      { id: 'kuendigung_grund', name: 'kuendigung_grund', label: 'Angegebener Kuendigungsgrund', type: 'select', required: true, section: 'kuendigung', options: [
        { value: 'eigenbedarf', label: 'Eigenbedarf' },
        { value: 'verwertung', label: 'Wirtschaftliche Verwertung' },
        { value: 'vertragswidrig', label: 'Vertragswidriges Verhalten' },
        { value: 'sonstige', label: 'Sonstiger Grund' },
      ]},
      { id: 'widerspruch_grund', name: 'widerspruch_grund', label: 'Begruendung des Widerspruchs', type: 'textarea', required: true, section: 'widerspruch' },
      { id: 'haertefall', name: 'haertefall', label: 'Haertefall geltend machen', type: 'checkbox', section: 'widerspruch' },
      { id: 'haertefall_grund', name: 'haertefall_grund', label: 'Haertefall-Begruendung', type: 'textarea', section: 'widerspruch' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

hiermit widerspreche ich der Kuendigung vom oben genannten Datum gemaess § 574 BGB.

Die Beendigung des Mietverhaeltnisses wuerde fuer mich eine besondere Haerte bedeuten, die auch unter Wuerdigung der berechtigten Interessen des Vermieters nicht zu rechtfertigen ist.

Ich fordere die Fortsetzung des Mietverhaeltnisses zu den bisherigen Bedingungen.

Mit freundlichen Gruessen`,
  },

  'mieter-kuendigung': {
    id: 'mieter-kuendigung',
    name: 'Mieterkuendigung',
    description: 'Kuendigen Sie Ihren Mietvertrag ordentlich',
    category: 'kuendigung',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'kuendigung_zum', name: 'kuendigung_zum', label: 'Kuendigung zum', type: 'date', required: true, section: 'kuendigung' },
      { id: 'uebergabe_termin', name: 'uebergabe_termin', label: 'Gewuenschter Uebergabetermin', type: 'date', section: 'kuendigung' },
      { id: 'kaution_konto', name: 'kaution_konto', label: 'IBAN fuer Kautionsrueckzahlung', type: 'text', section: 'kaution' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

hiermit kuendige ich das Mietverhaeltnis ueber die oben genannte Wohnung ordentlich und fristgerecht zum angegebenen Datum, hilfsweise zum naechstmoeglichen Termin.

Ich bitte um schriftliche Bestaetigung der Kuendigung sowie um Vereinbarung eines Termins zur Wohnungsuebergabe.

Die geleistete Kaution bitte ich auf das angegebene Konto zu ueberweisen.

Mit freundlichen Gruessen`,
  },

  // ===== MAENGEL =====
  'mietminderung-anzeige': {
    id: 'mietminderung-anzeige',
    name: 'Mietminderung-Anzeige',
    description: 'Zeigen Sie Maengel an und mindern Sie die Miete',
    category: 'maengel',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'mangel_beschreibung', name: 'mangel_beschreibung', label: 'Beschreibung des Mangels', type: 'textarea', required: true, section: 'mangel' },
      { id: 'mangel_seit', name: 'mangel_seit', label: 'Mangel besteht seit', type: 'date', required: true, section: 'mangel' },
      { id: 'mangel_ort', name: 'mangel_ort', label: 'Ort des Mangels (Raum)', type: 'text', section: 'mangel' },
      { id: 'minderung_prozent', name: 'minderung_prozent', label: 'Minderung in Prozent', type: 'number', required: true, section: 'minderung' },
      { id: 'frist_beseitigung', name: 'frist_beseitigung', label: 'Frist zur Beseitigung', type: 'date', required: true, section: 'minderung' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

hiermit zeige ich Ihnen folgenden Mangel an der Mietsache an und mache mein Recht auf Mietminderung gemaess § 536 BGB geltend.

Der Mangel schraenkt die Gebrauchstauglichkeit der Wohnung erheblich ein. Bis zur Beseitigung des Mangels mindere ich die Miete um den angegebenen Prozentsatz.

Ich fordere Sie auf, den Mangel innerhalb der gesetzten Frist zu beseitigen.

Mit freundlichen Gruessen`,
  },

  'schimmel-anzeige': {
    id: 'schimmel-anzeige',
    name: 'Schimmel-Anzeige',
    description: 'Melden Sie Schimmelbefall in der Wohnung',
    category: 'maengel',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'schimmel_ort', name: 'schimmel_ort', label: 'Betroffene Raeume', type: 'text', required: true, section: 'schimmel' },
      { id: 'schimmel_flaeche', name: 'schimmel_flaeche', label: 'Ungefaehre Flaeche (qcm)', type: 'number', section: 'schimmel' },
      { id: 'schimmel_seit', name: 'schimmel_seit', label: 'Bemerkt seit', type: 'date', required: true, section: 'schimmel' },
      { id: 'schimmel_beschreibung', name: 'schimmel_beschreibung', label: 'Detaillierte Beschreibung', type: 'textarea', required: true, section: 'schimmel' },
      { id: 'gesundheit', name: 'gesundheit', label: 'Gesundheitliche Beschwerden', type: 'checkbox', section: 'schimmel' },
      { id: 'frist', name: 'frist', label: 'Frist zur Beseitigung', type: 'date', required: true, section: 'forderung' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

hiermit zeige ich Ihnen Schimmelbefall in meiner Wohnung an.

Schimmelbefall stellt einen erheblichen Mangel der Mietsache dar, der die Gesundheit gefaehrden kann. Ich fordere Sie auf, umgehend die Ursache zu ermitteln und den Schimmel fachgerecht zu beseitigen.

Bis zur vollstaendigen Beseitigung behalte ich mir vor, die Miete zu mindern.

Mit freundlichen Gruessen`,
  },

  // ===== AUSZUG =====
  'kaution-rueckforderung': {
    id: 'kaution-rueckforderung',
    name: 'Kaution-Rueckforderung',
    description: 'Fordern Sie Ihre Kaution zurueck',
    category: 'auszug',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Neue Adresse - Strasse', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'alte_wohnung', name: 'alte_wohnung', label: 'Adresse der frueheren Wohnung', type: 'text', required: true, section: 'mietverhaeltnis' },
      { id: 'auszug_datum', name: 'auszug_datum', label: 'Auszugsdatum', type: 'date', required: true, section: 'mietverhaeltnis' },
      { id: 'kaution_hoehe', name: 'kaution_hoehe', label: 'Kautionshoehe (EUR)', type: 'currency', required: true, section: 'kaution' },
      { id: 'iban', name: 'iban', label: 'IBAN fuer Rueckzahlung', type: 'text', required: true, section: 'kaution' },
      { id: 'kontoinhaber', name: 'kontoinhaber', label: 'Kontoinhaber', type: 'text', required: true, section: 'kaution' },
      { id: 'frist', name: 'frist', label: 'Zahlungsfrist', type: 'date', required: true, section: 'forderung' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

das Mietverhaeltnis ueber die oben genannte Wohnung ist beendet. Die Wohnung wurde ordnungsgemaess uebergeben.

Hiermit fordere ich Sie auf, die von mir geleistete Kaution nebst aufgelaufener Zinsen auf das angegebene Konto zurueckzuzahlen.

Eine angemessene Pruefungsfrist ist bereits verstrichen. Sollte die Zahlung nicht fristgerecht erfolgen, behalte ich mir rechtliche Schritte vor.

Mit freundlichen Gruessen`,
  },

  'schoenheitsreparaturen-widerspruch': {
    id: 'schoenheitsreparaturen-widerspruch',
    name: 'Schoenheitsreparaturen-Widerspruch',
    description: 'Widersprechen Sie unzulaessigen Renovierungsforderungen',
    category: 'auszug',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'wohnung_zustand', name: 'wohnung_zustand', label: 'Zustand bei Einzug', type: 'select', required: true, section: 'wohnung', options: [
        { value: 'unrenoviert', label: 'Unrenoviert uebernommen' },
        { value: 'renoviert', label: 'Renoviert uebernommen' },
        { value: 'teilrenoviert', label: 'Teilweise renoviert' },
      ]},
      { id: 'forderung_beschreibung', name: 'forderung_beschreibung', label: 'Geforderte Arbeiten', type: 'textarea', required: true, section: 'forderung' },
      { id: 'widerspruch_grund', name: 'widerspruch_grund', label: 'Begruendung', type: 'textarea', required: true, section: 'widerspruch' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

hiermit widerspreche ich Ihrer Forderung zur Durchfuehrung von Schoenheitsreparaturen.

Die Klausel zu Schoenheitsreparaturen in meinem Mietvertrag ist nach aktueller Rechtsprechung des BGH unwirksam, da die Wohnung unrenoviert uebernommen wurde und/oder starre Fristen enthaelt.

Eine Pflicht zur Renovierung besteht daher nicht. Ich werde die geforderten Arbeiten nicht durchfuehren.

Mit freundlichen Gruessen`,
  },

  // ===== EINZUG =====
  'wohnungsuebergabe-einzug': {
    id: 'wohnungsuebergabe-einzug',
    name: 'Uebergabeprotokoll Einzug',
    description: 'Dokumentieren Sie den Zustand beim Einzug',
    category: 'einzug',
    outputFormat: 'protocol',
    fields: [
      { id: 'mieter_name', name: 'mieter_name', label: 'Name des Mieters', type: 'text', required: true, section: 'parteien' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'parteien' },
      { id: 'wohnung_adresse', name: 'wohnung_adresse', label: 'Adresse der Wohnung', type: 'text', required: true, section: 'wohnung' },
      { id: 'uebergabe_datum', name: 'uebergabe_datum', label: 'Uebergabedatum', type: 'date', required: true, section: 'wohnung' },
      { id: 'zaehler_strom', name: 'zaehler_strom', label: 'Zaehlerstand Strom', type: 'text', section: 'zaehler' },
      { id: 'zaehler_gas', name: 'zaehler_gas', label: 'Zaehlerstand Gas', type: 'text', section: 'zaehler' },
      { id: 'zaehler_wasser', name: 'zaehler_wasser', label: 'Zaehlerstand Wasser', type: 'text', section: 'zaehler' },
      { id: 'zaehler_heizung', name: 'zaehler_heizung', label: 'Zaehlerstand Heizung', type: 'text', section: 'zaehler' },
      { id: 'schluessel_anzahl', name: 'schluessel_anzahl', label: 'Anzahl uebergebener Schluessel', type: 'number', required: true, section: 'schluessel' },
      { id: 'schluessel_details', name: 'schluessel_details', label: 'Schluessel-Details', type: 'textarea', section: 'schluessel', placeholder: 'z.B. 2x Haustuer, 1x Briefkasten, 1x Keller' },
      { id: 'maengel', name: 'maengel', label: 'Festgestellte Maengel', type: 'textarea', section: 'zustand', placeholder: 'Listen Sie alle Maengel auf...' },
      { id: 'zustand_allgemein', name: 'zustand_allgemein', label: 'Allgemeiner Zustand', type: 'textarea', section: 'zustand' },
      { id: 'signature_mieter', name: 'signature_mieter', label: 'Unterschrift Mieter', type: 'signature', section: 'unterschriften' },
      { id: 'signature_vermieter', name: 'signature_vermieter', label: 'Unterschrift Vermieter', type: 'signature', section: 'unterschriften' },
    ],
    legalText: `WOHNUNGSUEBERGABEPROTOKOLL - EINZUG

Die Wohnung wurde in dem oben beschriebenen Zustand an den Mieter uebergeben. Beide Parteien bestaetigen die Richtigkeit der Angaben.

Dieses Protokoll wurde in zweifacher Ausfertigung erstellt. Jede Partei erhaelt ein Exemplar.`,
  },

  // ===== KOMMUNIKATION =====
  'vollmacht-vertreter': {
    id: 'vollmacht-vertreter',
    name: 'Vollmacht fuer Vertreter',
    description: 'Bevollmaechtigen Sie jemanden fuer Ihre Anliegen',
    category: 'kommunikation',
    outputFormat: 'form',
    fields: [
      { id: 'vollmachtgeber_name', name: 'vollmachtgeber_name', label: 'Vollmachtgeber (Ihr Name)', type: 'text', required: true, section: 'vollmachtgeber' },
      { id: 'vollmachtgeber_strasse', name: 'vollmachtgeber_strasse', label: 'Strasse', type: 'text', required: true, section: 'vollmachtgeber' },
      { id: 'vollmachtgeber_plz_ort', name: 'vollmachtgeber_plz_ort', label: 'PLZ und Ort', type: 'text', required: true, section: 'vollmachtgeber' },
      { id: 'vollmachtgeber_geburt', name: 'vollmachtgeber_geburt', label: 'Geburtsdatum', type: 'date', section: 'vollmachtgeber' },
      { id: 'bevollmaechtigter_name', name: 'bevollmaechtigter_name', label: 'Bevollmaechtigter (Name)', type: 'text', required: true, section: 'bevollmaechtigter' },
      { id: 'bevollmaechtigter_strasse', name: 'bevollmaechtigter_strasse', label: 'Strasse', type: 'text', required: true, section: 'bevollmaechtigter' },
      { id: 'bevollmaechtigter_plz_ort', name: 'bevollmaechtigter_plz_ort', label: 'PLZ und Ort', type: 'text', required: true, section: 'bevollmaechtigter' },
      { id: 'vollmacht_umfang', name: 'vollmacht_umfang', label: 'Umfang der Vollmacht', type: 'textarea', required: true, section: 'vollmacht', placeholder: 'z.B. Vertretung in allen Mietangelegenheiten...' },
      { id: 'vollmacht_gueltig_bis', name: 'vollmacht_gueltig_bis', label: 'Gueltig bis (leer = unbefristet)', type: 'date', section: 'vollmacht' },
      { id: 'signature', name: 'signature', label: 'Unterschrift Vollmachtgeber', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `VOLLMACHT

Hiermit bevollmaechtige ich die oben genannte Person, mich in dem bezeichneten Umfang zu vertreten.

Der/die Bevollmaechtigte ist berechtigt, in meinem Namen Erklaerungen abzugeben und entgegenzunehmen.

Diese Vollmacht kann jederzeit widerrufen werden.`,
  },

  // ===== MIETERRECHTE =====
  'tierhaltung-antrag': {
    id: 'tierhaltung-antrag',
    name: 'Tierhaltung-Antrag',
    description: 'Beantragen Sie die Erlaubnis zur Tierhaltung',
    category: 'rechte',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'tierart', name: 'tierart', label: 'Tierart', type: 'select', required: true, section: 'tier', options: [
        { value: 'hund', label: 'Hund' },
        { value: 'katze', label: 'Katze' },
        { value: 'kleintier', label: 'Kleintier (Hamster, Meerschweinchen, etc.)' },
        { value: 'vogel', label: 'Vogel' },
        { value: 'fische', label: 'Fische/Aquarium' },
        { value: 'sonstige', label: 'Sonstiges' },
      ]},
      { id: 'tier_rasse', name: 'tier_rasse', label: 'Rasse/Art', type: 'text', section: 'tier' },
      { id: 'tier_groesse', name: 'tier_groesse', label: 'Groesse/Gewicht', type: 'text', section: 'tier' },
      { id: 'begruendung', name: 'begruendung', label: 'Begruendung', type: 'textarea', section: 'antrag' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

hiermit bitte ich um Ihre Erlaubnis zur Haltung des oben beschriebenen Tieres in meiner Mietwohnung.

Ich versichere, dass die Tierhaltung keine Belaestigung fuer andere Mieter darstellen wird und ich fuer etwaige durch das Tier verursachte Schaeden hafte.

Ich bitte um eine zeitnahe Rueckmeldung.

Mit freundlichen Gruessen`,
  },

  // ===== WEITERE MIETE & KOSTEN TEMPLATES =====
  'betriebskosten-pruefung': {
    id: 'betriebskosten-pruefung',
    name: 'Betriebskosten-Belegeinsicht',
    description: 'Anfrage zur Belegeinsicht bei Betriebskosten',
    category: 'miete',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'abrechnungsjahr', name: 'abrechnungsjahr', label: 'Abrechnungsjahr', type: 'text', required: true, section: 'abrechnung' },
      { id: 'wunschtermin', name: 'wunschtermin', label: 'Wunschtermin fuer Einsicht', type: 'date', section: 'termin' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

hiermit mache ich von meinem Recht auf Belegeinsicht gemaess § 259 BGB Gebrauch.

Ich bitte um Einsicht in saemtliche Belege zur Betriebskostenabrechnung fuer das oben genannte Jahr. Bitte teilen Sie mir mit, wann und wo ich die Belege einsehen kann.

Mit freundlichen Gruessen`,
  },

  'mietrueckstand-ratenzahlung': {
    id: 'mietrueckstand-ratenzahlung',
    name: 'Ratenzahlungsvereinbarung',
    description: 'Vereinbaren Sie Ratenzahlung bei Mietrueckstand',
    category: 'miete',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'rueckstand_hoehe', name: 'rueckstand_hoehe', label: 'Hoehe des Rueckstands (EUR)', type: 'currency', required: true, section: 'rueckstand' },
      { id: 'rueckstand_zeitraum', name: 'rueckstand_zeitraum', label: 'Betroffener Zeitraum', type: 'text', required: true, section: 'rueckstand' },
      { id: 'raten_hoehe', name: 'raten_hoehe', label: 'Vorgeschlagene Ratenhoehe (EUR)', type: 'currency', required: true, section: 'ratenzahlung' },
      { id: 'raten_beginn', name: 'raten_beginn', label: 'Beginn der Ratenzahlung', type: 'date', required: true, section: 'ratenzahlung' },
      { id: 'begruendung', name: 'begruendung', label: 'Begruendung der Zahlungsschwierigkeiten', type: 'textarea', section: 'begruendung' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

ich befinde mich derzeit in einer voruebergehenden finanziellen Notlage und bitte um eine Ratenzahlungsvereinbarung fuer den aufgelaufenen Mietrueckstand.

Ich schlage vor, den Rueckstand in monatlichen Raten zu begleichen, zusaetzlich zur laufenden Miete. Ich werde die Raten zuverlaessig zahlen.

Ich bitte um Ihre Zustimmung zu dieser Vereinbarung.

Mit freundlichen Gruessen`,
  },

  'heizkosten-widerspruch': {
    id: 'heizkosten-widerspruch',
    name: 'Heizkosten-Widerspruch',
    description: 'Widersprechen Sie fehlerhafter Heizkostenabrechnung',
    category: 'miete',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'abrechnungszeitraum', name: 'abrechnungszeitraum', label: 'Abrechnungszeitraum', type: 'text', required: true, section: 'abrechnung' },
      { id: 'nachzahlung', name: 'nachzahlung', label: 'Geforderte Nachzahlung (EUR)', type: 'currency', section: 'abrechnung' },
      { id: 'widerspruch_punkte', name: 'widerspruch_punkte', label: 'Beanstandete Punkte', type: 'textarea', required: true, section: 'widerspruch' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

hiermit widerspreche ich der Heizkostenabrechnung fuer den genannten Zeitraum.

Die Abrechnung versteosst gegen die Heizkostenverordnung und/oder enthaelt fehlerhafte Berechnungen. Ich bitte um Korrektur.

Mit freundlichen Gruessen`,
  },

  'guthaben-auszahlung': {
    id: 'guthaben-auszahlung',
    name: 'Guthaben-Auszahlung',
    description: 'Fordern Sie Ihr Nebenkostenguthaben ein',
    category: 'miete',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'guthaben_hoehe', name: 'guthaben_hoehe', label: 'Guthabenbetrag (EUR)', type: 'currency', required: true, section: 'guthaben' },
      { id: 'abrechnungsjahr', name: 'abrechnungsjahr', label: 'Abrechnungsjahr', type: 'text', required: true, section: 'guthaben' },
      { id: 'iban', name: 'iban', label: 'IBAN', type: 'text', required: true, section: 'zahlung' },
      { id: 'kontoinhaber', name: 'kontoinhaber', label: 'Kontoinhaber', type: 'text', required: true, section: 'zahlung' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

laut Nebenkostenabrechnung besteht ein Guthaben zu meinen Gunsten. Ich bitte um Auszahlung auf das angegebene Konto.

Sollte die Zahlung nicht innerhalb von 14 Tagen erfolgen, behalte ich mir vor, den Betrag mit der naechsten Mietzahlung zu verrechnen.

Mit freundlichen Gruessen`,
  },

  // ===== WEITERE KUENDIGUNG TEMPLATES =====
  'eigenbedarf-widerspruch': {
    id: 'eigenbedarf-widerspruch',
    name: 'Eigenbedarf-Widerspruch',
    description: 'Widersprechen Sie einer Eigenbedarfskuendigung',
    category: 'kuendigung',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'kuendigung_datum', name: 'kuendigung_datum', label: 'Datum der Kuendigung', type: 'date', required: true, section: 'kuendigung' },
      { id: 'bedarfsperson', name: 'bedarfsperson', label: 'Genannte Bedarfsperson', type: 'text', section: 'eigenbedarf' },
      { id: 'zweifel_grund', name: 'zweifel_grund', label: 'Gruende fuer Zweifel am Eigenbedarf', type: 'textarea', required: true, section: 'widerspruch' },
      { id: 'haertefall', name: 'haertefall', label: 'Haertefall geltend machen', type: 'checkbox', section: 'haertefall' },
      { id: 'haertefall_grund', name: 'haertefall_grund', label: 'Haertefall-Begruendung', type: 'textarea', section: 'haertefall' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

hiermit widerspreche ich der Eigenbedarfskuendigung gemaess § 574 BGB.

Ich bezweifle das Vorliegen eines berechtigten Eigenbedarfs und mache zudem eine besondere Haerte geltend, die die Beendigung des Mietverhaeltnisses nicht rechtfertigt.

Mit freundlichen Gruessen`,
  },

  'haertefall-einwand': {
    id: 'haertefall-einwand',
    name: 'Haertefall-Einwand',
    description: 'Machen Sie soziale Haerte gegen Kuendigung geltend',
    category: 'kuendigung',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'haertegrund', name: 'haertegrund', label: 'Art des Haertefalls', type: 'select', required: true, section: 'haertefall', options: [
        { value: 'alter', label: 'Hohes Alter' },
        { value: 'krankheit', label: 'Schwere Krankheit' },
        { value: 'behinderung', label: 'Behinderung' },
        { value: 'schwangerschaft', label: 'Schwangerschaft' },
        { value: 'kinder', label: 'Schulpflichtige Kinder' },
        { value: 'wohnungsmarkt', label: 'Angespannter Wohnungsmarkt' },
        { value: 'sonstige', label: 'Sonstige Gruende' },
      ]},
      { id: 'haertefall_beschreibung', name: 'haertefall_beschreibung', label: 'Detaillierte Beschreibung', type: 'textarea', required: true, section: 'haertefall' },
      { id: 'nachweise', name: 'nachweise', label: 'Beigefuegte Nachweise', type: 'textarea', section: 'nachweise' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

hiermit mache ich gemaess § 574 BGB einen Haertefall-Einwand gegen die Kuendigung geltend.

Die Beendigung des Mietverhaeltnisses wuerde fuer mich und meine Familie eine unzumutbare Haerte bedeuten, die auch unter Beruecksichtigung Ihrer Interessen nicht gerechtfertigt ist.

Ich beantrage die Fortsetzung des Mietverhaeltnisses.

Mit freundlichen Gruessen`,
  },

  'sonderkuendigung-mieter': {
    id: 'sonderkuendigung-mieter',
    name: 'Sonderkuendigung (Mieter)',
    description: 'Ausserordentliche Kuendigung bei schweren Maengeln',
    category: 'kuendigung',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'kuendigung_grund', name: 'kuendigung_grund', label: 'Grund der Sonderkuendigung', type: 'select', required: true, section: 'kuendigung', options: [
        { value: 'gesundheit', label: 'Gesundheitsgefaehrdung' },
        { value: 'unbewohnbar', label: 'Wohnung unbewohnbar' },
        { value: 'vertragsbruch', label: 'Schwerer Vertragsbruch' },
        { value: 'stoerung', label: 'Erhebliche Stoerung des Hausfriedens' },
      ]},
      { id: 'beschreibung', name: 'beschreibung', label: 'Detaillierte Begruendung', type: 'textarea', required: true, section: 'kuendigung' },
      { id: 'kuendigung_zum', name: 'kuendigung_zum', label: 'Kuendigung zum (fristlos/Datum)', type: 'text', required: true, section: 'kuendigung' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

hiermit kuendige ich das Mietverhaeltnis ausserordentlich gemaess § 543 BGB.

Ein wichtiger Grund liegt vor, der mir die Fortsetzung des Mietverhaeltnisses unzumutbar macht. Die Wohnung ist in ihrem aktuellen Zustand nicht zum vertragsmaessigen Gebrauch geeignet.

Mit freundlichen Gruessen`,
  },

  'aufhebungsvertrag': {
    id: 'aufhebungsvertrag',
    name: 'Aufhebungsvertrag',
    description: 'Einvernehmliche Aufhebung des Mietverhaeltnisses',
    category: 'kuendigung',
    outputFormat: 'form',
    fields: [
      { id: 'mieter_name', name: 'mieter_name', label: 'Name des Mieters', type: 'text', required: true, section: 'parteien' },
      { id: 'mieter_adresse', name: 'mieter_adresse', label: 'Adresse des Mieters', type: 'text', required: true, section: 'parteien' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'parteien' },
      { id: 'vermieter_adresse', name: 'vermieter_adresse', label: 'Adresse des Vermieters', type: 'text', required: true, section: 'parteien' },
      { id: 'wohnung_adresse', name: 'wohnung_adresse', label: 'Adresse der Mietwohnung', type: 'text', required: true, section: 'wohnung' },
      { id: 'beendigungsdatum', name: 'beendigungsdatum', label: 'Beendigungsdatum', type: 'date', required: true, section: 'aufhebung' },
      { id: 'uebergabedatum', name: 'uebergabedatum', label: 'Uebergabedatum', type: 'date', required: true, section: 'aufhebung' },
      { id: 'kaution_regelung', name: 'kaution_regelung', label: 'Regelung zur Kaution', type: 'textarea', section: 'regelungen' },
      { id: 'renovierung_regelung', name: 'renovierung_regelung', label: 'Regelung zu Renovierung', type: 'textarea', section: 'regelungen' },
      { id: 'sonstige_regelungen', name: 'sonstige_regelungen', label: 'Sonstige Vereinbarungen', type: 'textarea', section: 'regelungen' },
      { id: 'signature_mieter', name: 'signature_mieter', label: 'Unterschrift Mieter', type: 'signature', section: 'unterschriften' },
      { id: 'signature_vermieter', name: 'signature_vermieter', label: 'Unterschrift Vermieter', type: 'signature', section: 'unterschriften' },
    ],
    legalText: `AUFHEBUNGSVERTRAG

Die Parteien vereinbaren einvernehmlich die Aufhebung des Mietverhaeltnisses zum oben genannten Datum.

Mit der Uebergabe der Wohnung sind saemtliche gegenseitigen Ansprueche aus dem Mietverhaeltnis abgegolten, soweit in diesem Vertrag nichts anderes vereinbart wurde.

Dieser Vertrag wurde in zweifacher Ausfertigung erstellt.`,
  },

  // ===== WEITERE MAENGEL TEMPLATES =====
  'maengelanzeige': {
    id: 'maengelanzeige',
    name: 'Maengelanzeige (Allgemein)',
    description: 'Melden Sie allgemeine Maengel an Ihren Vermieter',
    category: 'maengel',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'mangel_beschreibung', name: 'mangel_beschreibung', label: 'Beschreibung des Mangels', type: 'textarea', required: true, section: 'mangel' },
      { id: 'mangel_ort', name: 'mangel_ort', label: 'Ort des Mangels', type: 'text', required: true, section: 'mangel' },
      { id: 'mangel_seit', name: 'mangel_seit', label: 'Mangel besteht seit', type: 'date', section: 'mangel' },
      { id: 'frist', name: 'frist', label: 'Frist zur Beseitigung', type: 'date', required: true, section: 'forderung' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

hiermit zeige ich Ihnen folgenden Mangel an der Mietsache an.

Ich bitte Sie, den Mangel innerhalb der gesetzten Frist zu beseitigen. Sollte dies nicht erfolgen, behalte ich mir vor, von meinen gesetzlichen Rechten Gebrauch zu machen.

Mit freundlichen Gruessen`,
  },

  'instandsetzung-aufforderung': {
    id: 'instandsetzung-aufforderung',
    name: 'Instandsetzungs-Aufforderung',
    description: 'Fordern Sie den Vermieter zur Reparatur auf',
    category: 'maengel',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'erste_anzeige', name: 'erste_anzeige', label: 'Datum der ersten Maengelanzeige', type: 'date', required: true, section: 'vorgeschichte' },
      { id: 'mangel_beschreibung', name: 'mangel_beschreibung', label: 'Beschreibung des Mangels', type: 'textarea', required: true, section: 'mangel' },
      { id: 'frist', name: 'frist', label: 'Letzte Frist', type: 'date', required: true, section: 'forderung' },
      { id: 'selbstvornahme', name: 'selbstvornahme', label: 'Selbstvornahme ankuendigen', type: 'checkbox', section: 'forderung' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

trotz meiner Maengelanzeige wurde der angezeigte Mangel bis heute nicht beseitigt.

Hiermit fordere ich Sie letztmalig auf, den Mangel innerhalb der gesetzten Frist zu beseitigen. Nach fruchtlosem Fristablauf werde ich von meinem Recht zur Selbstvornahme gemaess § 536a BGB Gebrauch machen und die Kosten von Ihnen zurueckfordern.

Mit freundlichen Gruessen`,
  },

  'heizung-ausfall': {
    id: 'heizung-ausfall',
    name: 'Heizungsausfall-Anzeige',
    description: 'Melden Sie defekte oder unzureichende Heizung',
    category: 'maengel',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'ausfall_art', name: 'ausfall_art', label: 'Art des Problems', type: 'select', required: true, section: 'heizung', options: [
        { value: 'totalausfall', label: 'Totalausfall' },
        { value: 'teilausfall', label: 'Teilausfall (einzelne Raeume)' },
        { value: 'unzureichend', label: 'Unzureichende Heizleistung' },
        { value: 'geraeusche', label: 'Stoerende Geraeusche' },
      ]},
      { id: 'ausfall_seit', name: 'ausfall_seit', label: 'Problem seit', type: 'date', required: true, section: 'heizung' },
      { id: 'temperatur', name: 'temperatur', label: 'Aktuelle Raumtemperatur (C)', type: 'number', section: 'heizung' },
      { id: 'beschreibung', name: 'beschreibung', label: 'Detaillierte Beschreibung', type: 'textarea', required: true, section: 'heizung' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

hiermit zeige ich einen erheblichen Mangel an der Heizungsanlage an.

Die Wohnung kann nicht ausreichend beheizt werden. Ich bitte um sofortige Behebung des Problems. Bis zur Behebung mache ich mein Recht auf Mietminderung geltend.

Mit freundlichen Gruessen`,
  },

  'wasserschaden-anzeige': {
    id: 'wasserschaden-anzeige',
    name: 'Wasserschaden-Anzeige',
    description: 'Melden Sie einen Wasserschaden sofort',
    category: 'maengel',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'schaden_datum', name: 'schaden_datum', label: 'Datum/Uhrzeit des Schadens', type: 'text', required: true, section: 'schaden' },
      { id: 'schaden_ort', name: 'schaden_ort', label: 'Betroffene Raeume', type: 'text', required: true, section: 'schaden' },
      { id: 'schaden_ursache', name: 'schaden_ursache', label: 'Vermutete Ursache', type: 'text', section: 'schaden' },
      { id: 'schaden_beschreibung', name: 'schaden_beschreibung', label: 'Beschreibung des Schadens', type: 'textarea', required: true, section: 'schaden' },
      { id: 'sofortmassnahmen', name: 'sofortmassnahmen', label: 'Ergriffene Sofortmassnahmen', type: 'textarea', section: 'massnahmen' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

hiermit melde ich einen Wasserschaden in meiner Wohnung.

Es besteht dringender Handlungsbedarf. Bitte veranlassen Sie umgehend die Begutachtung und Behebung des Schadens.

Ich bitte um sofortige Rueckmeldung.

Mit freundlichen Gruessen`,
  },

  'modernisierung-widerspruch': {
    id: 'modernisierung-widerspruch',
    name: 'Modernisierung-Widerspruch',
    description: 'Widersprechen Sie unzulaessigen Modernisierungskosten',
    category: 'maengel',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'ankuendigung_datum', name: 'ankuendigung_datum', label: 'Datum der Modernisierungsankuendigung', type: 'date', required: true, section: 'modernisierung' },
      { id: 'mieterhoehung', name: 'mieterhoehung', label: 'Angekuendigte Mieterhoehung (EUR)', type: 'currency', section: 'modernisierung' },
      { id: 'widerspruch_grund', name: 'widerspruch_grund', label: 'Begruendung des Widerspruchs', type: 'textarea', required: true, section: 'widerspruch' },
      { id: 'haertefall', name: 'haertefall', label: 'Haertefall geltend machen', type: 'checkbox', section: 'haertefall' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

hiermit widerspreche ich der angekuendigten Modernisierung bzw. der daraus resultierenden Mieterhoehung.

Die Massnahmen erfuellen nicht die Voraussetzungen einer Modernisierung nach § 559 BGB und/oder die angekuendigte Mieterhoehung ist unzulaessig berechnet.

Mit freundlichen Gruessen`,
  },

  // ===== WEITERE EINZUG TEMPLATES =====
  'kaution-bestaetigung': {
    id: 'kaution-bestaetigung',
    name: 'Kautions-Bestaetigung',
    description: 'Bestaetigung ueber geleistete Kautionszahlung',
    category: 'einzug',
    outputFormat: 'form',
    fields: [
      { id: 'mieter_name', name: 'mieter_name', label: 'Name des Mieters', type: 'text', required: true, section: 'parteien' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'parteien' },
      { id: 'wohnung_adresse', name: 'wohnung_adresse', label: 'Adresse der Wohnung', type: 'text', required: true, section: 'wohnung' },
      { id: 'kaution_hoehe', name: 'kaution_hoehe', label: 'Kautionshoehe (EUR)', type: 'currency', required: true, section: 'kaution' },
      { id: 'zahlungsart', name: 'zahlungsart', label: 'Zahlungsart', type: 'select', required: true, section: 'kaution', options: [
        { value: 'ueberweisung', label: 'Ueberweisung' },
        { value: 'bar', label: 'Barzahlung' },
        { value: 'buergschaft', label: 'Kautionsbuergschaft' },
      ]},
      { id: 'zahlung_datum', name: 'zahlung_datum', label: 'Zahlungsdatum', type: 'date', required: true, section: 'kaution' },
      { id: 'anlage_konto', name: 'anlage_konto', label: 'Kautionskonto (Bank)', type: 'text', section: 'anlage' },
      { id: 'signature_mieter', name: 'signature_mieter', label: 'Unterschrift Mieter', type: 'signature', section: 'unterschriften' },
      { id: 'signature_vermieter', name: 'signature_vermieter', label: 'Unterschrift Vermieter', type: 'signature', section: 'unterschriften' },
    ],
    legalText: `KAUTIONSBESTAETIGUNG

Der Vermieter bestaetigt den Erhalt der Kaution in der angegebenen Hoehe. Die Kaution wird gemaess § 551 BGB vom uebrigen Vermoegen des Vermieters getrennt angelegt.

Der Mieter erhaelt eine Kopie dieser Bestaetigung.`,
  },

  'untervermietung-antrag': {
    id: 'untervermietung-antrag',
    name: 'Untervermietung-Antrag',
    description: 'Beantragen Sie die Erlaubnis zur Untervermietung',
    category: 'einzug',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'untermieter_name', name: 'untermieter_name', label: 'Name des Untermieters', type: 'text', required: true, section: 'untermieter' },
      { id: 'untermieter_geburt', name: 'untermieter_geburt', label: 'Geburtsdatum', type: 'date', section: 'untermieter' },
      { id: 'untermieter_beruf', name: 'untermieter_beruf', label: 'Beruf', type: 'text', section: 'untermieter' },
      { id: 'untermietflaeche', name: 'untermietflaeche', label: 'Zu vermietende Raeume', type: 'text', required: true, section: 'untervermietung' },
      { id: 'zeitraum', name: 'zeitraum', label: 'Geplanter Zeitraum', type: 'text', required: true, section: 'untervermietung' },
      { id: 'begruendung', name: 'begruendung', label: 'Begruendung', type: 'textarea', required: true, section: 'antrag' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

hiermit bitte ich um Ihre Erlaubnis zur Untervermietung eines Teils meiner Wohnung.

Gemaess § 553 BGB habe ich einen Anspruch auf Erteilung der Erlaubnis, wenn ein berechtigtes Interesse besteht und keine wichtigen Gruende dagegen sprechen.

Ich bitte um zeitnahe Rueckmeldung.

Mit freundlichen Gruessen`,
  },

  // ===== WEITERE AUSZUG TEMPLATES =====
  'uebergabeprotokoll': {
    id: 'uebergabeprotokoll',
    name: 'Uebergabeprotokoll Auszug',
    description: 'Dokumentieren Sie den Zustand beim Auszug',
    category: 'auszug',
    outputFormat: 'protocol',
    fields: [
      { id: 'mieter_name', name: 'mieter_name', label: 'Name des Mieters', type: 'text', required: true, section: 'parteien' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'parteien' },
      { id: 'wohnung_adresse', name: 'wohnung_adresse', label: 'Adresse der Wohnung', type: 'text', required: true, section: 'wohnung' },
      { id: 'uebergabe_datum', name: 'uebergabe_datum', label: 'Uebergabedatum', type: 'date', required: true, section: 'wohnung' },
      { id: 'zaehler_strom', name: 'zaehler_strom', label: 'Zaehlerstand Strom', type: 'text', section: 'zaehler' },
      { id: 'zaehler_gas', name: 'zaehler_gas', label: 'Zaehlerstand Gas', type: 'text', section: 'zaehler' },
      { id: 'zaehler_wasser', name: 'zaehler_wasser', label: 'Zaehlerstand Wasser', type: 'text', section: 'zaehler' },
      { id: 'zaehler_heizung', name: 'zaehler_heizung', label: 'Zaehlerstand Heizung', type: 'text', section: 'zaehler' },
      { id: 'schluessel_anzahl', name: 'schluessel_anzahl', label: 'Zurueckgegebene Schluessel', type: 'number', required: true, section: 'schluessel' },
      { id: 'zustand_boden', name: 'zustand_boden', label: 'Zustand Boeden', type: 'textarea', section: 'zustand' },
      { id: 'zustand_waende', name: 'zustand_waende', label: 'Zustand Waende/Decken', type: 'textarea', section: 'zustand' },
      { id: 'zustand_fenster', name: 'zustand_fenster', label: 'Zustand Fenster/Tueren', type: 'textarea', section: 'zustand' },
      { id: 'zustand_sanitaer', name: 'zustand_sanitaer', label: 'Zustand Sanitaeranlagen', type: 'textarea', section: 'zustand' },
      { id: 'zustand_kueche', name: 'zustand_kueche', label: 'Zustand Kueche', type: 'textarea', section: 'zustand' },
      { id: 'maengel', name: 'maengel', label: 'Festgestellte Maengel/Schaeden', type: 'textarea', section: 'maengel' },
      { id: 'vereinbarungen', name: 'vereinbarungen', label: 'Besondere Vereinbarungen', type: 'textarea', section: 'vereinbarungen' },
      { id: 'signature_mieter', name: 'signature_mieter', label: 'Unterschrift Mieter', type: 'signature', section: 'unterschriften' },
      { id: 'signature_vermieter', name: 'signature_vermieter', label: 'Unterschrift Vermieter', type: 'signature', section: 'unterschriften' },
    ],
    legalText: `WOHNUNGSUEBERGABEPROTOKOLL - AUSZUG

Die Wohnung wurde in dem oben beschriebenen Zustand vom Mieter an den Vermieter zurueckgegeben.

Beide Parteien bestaetigen die Richtigkeit der Angaben. Mit der Schluesseluebergabe endet das Mietverhaeltnis.

Dieses Protokoll wurde in zweifacher Ausfertigung erstellt.`,
  },

  'kaution-mahnung': {
    id: 'kaution-mahnung',
    name: 'Kaution-Mahnung',
    description: 'Mahnen Sie die ausstehende Kautionsrueckzahlung an',
    category: 'auszug',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Neue Adresse - Strasse', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'alte_wohnung', name: 'alte_wohnung', label: 'Adresse der frueheren Wohnung', type: 'text', required: true, section: 'mietverhaeltnis' },
      { id: 'auszug_datum', name: 'auszug_datum', label: 'Auszugsdatum', type: 'date', required: true, section: 'mietverhaeltnis' },
      { id: 'erste_aufforderung', name: 'erste_aufforderung', label: 'Datum der ersten Aufforderung', type: 'date', required: true, section: 'mahnung' },
      { id: 'kaution_hoehe', name: 'kaution_hoehe', label: 'Kautionshoehe (EUR)', type: 'currency', required: true, section: 'kaution' },
      { id: 'iban', name: 'iban', label: 'IBAN', type: 'text', required: true, section: 'kaution' },
      { id: 'letzte_frist', name: 'letzte_frist', label: 'Letzte Frist', type: 'date', required: true, section: 'forderung' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

trotz meiner Aufforderung haben Sie die Kaution bisher nicht zurueckgezahlt.

Ich setze Ihnen hiermit eine letzte Frist. Nach fruchtlosem Fristablauf werde ich ohne weitere Ankuendigung rechtliche Schritte einleiten und Verzugszinsen geltend machen.

Mit freundlichen Gruessen`,
  },

  // ===== WEITERE KOMMUNIKATION TEMPLATES =====
  'terminvereinbarung': {
    id: 'terminvereinbarung',
    name: 'Terminvereinbarung',
    description: 'Vereinbaren Sie einen Besichtigungstermin',
    category: 'kommunikation',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'empfaenger_name', name: 'empfaenger_name', label: 'Name', type: 'text', required: true, section: 'empfaenger' },
      { id: 'empfaenger_strasse', name: 'empfaenger_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'empfaenger_plz', name: 'empfaenger_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'empfaenger_ort', name: 'empfaenger_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'termin_grund', name: 'termin_grund', label: 'Grund des Termins', type: 'text', required: true, section: 'termin' },
      { id: 'termin_vorschlag_1', name: 'termin_vorschlag_1', label: 'Terminvorschlag 1', type: 'text', required: true, section: 'termin' },
      { id: 'termin_vorschlag_2', name: 'termin_vorschlag_2', label: 'Terminvorschlag 2', type: 'text', section: 'termin' },
      { id: 'termin_vorschlag_3', name: 'termin_vorschlag_3', label: 'Terminvorschlag 3', type: 'text', section: 'termin' },
      { id: 'kontakt_telefon', name: 'kontakt_telefon', label: 'Telefon fuer Rueckruf', type: 'text', section: 'kontakt' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

ich moechte einen Termin mit Ihnen vereinbaren.

Bitte teilen Sie mir mit, welcher der vorgeschlagenen Termine Ihnen passt, oder schlagen Sie mir alternative Zeiten vor.

Mit freundlichen Gruessen`,
  },

  'beschwerde-hausverwaltung': {
    id: 'beschwerde-hausverwaltung',
    name: 'Beschwerde Hausverwaltung',
    description: 'Beschwerde an die Hausverwaltung',
    category: 'kommunikation',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'hausverwaltung_name', name: 'hausverwaltung_name', label: 'Name der Hausverwaltung', type: 'text', required: true, section: 'empfaenger' },
      { id: 'hausverwaltung_strasse', name: 'hausverwaltung_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'hausverwaltung_plz', name: 'hausverwaltung_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'hausverwaltung_ort', name: 'hausverwaltung_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'beschwerde_betreff', name: 'beschwerde_betreff', label: 'Betreff', type: 'text', required: true, section: 'beschwerde' },
      { id: 'beschwerde_inhalt', name: 'beschwerde_inhalt', label: 'Beschreibung des Problems', type: 'textarea', required: true, section: 'beschwerde' },
      { id: 'bisherige_kontakte', name: 'bisherige_kontakte', label: 'Bisherige Kontaktversuche', type: 'textarea', section: 'beschwerde' },
      { id: 'forderung', name: 'forderung', label: 'Ihre Forderung', type: 'textarea', required: true, section: 'forderung' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

ich wende mich mit folgender Beschwerde an Sie.

Ich bitte um umgehende Bearbeitung und Rueckmeldung.

Mit freundlichen Gruessen`,
  },

  // ===== WEITERE MIETERRECHTE TEMPLATES =====
  'zutritt-verweigerung': {
    id: 'zutritt-verweigerung',
    name: 'Zutritts-Verweigerung',
    description: 'Widersprechen Sie unberechtigten Wohnungsbegehungen',
    category: 'rechte',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'termin_datum', name: 'termin_datum', label: 'Angefragter Termin', type: 'date', section: 'zutritt' },
      { id: 'zutritt_grund', name: 'zutritt_grund', label: 'Angegebener Grund', type: 'text', section: 'zutritt' },
      { id: 'verweigerung_grund', name: 'verweigerung_grund', label: 'Grund der Verweigerung', type: 'textarea', required: true, section: 'verweigerung' },
      { id: 'alternativ_termin', name: 'alternativ_termin', label: 'Alternativtermin (optional)', type: 'date', section: 'alternativ' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

ich verweigere den Zutritt zu meiner Wohnung zum angekuendigten Termin.

Gemaess Mietrecht haben Sie kein unbeschraenktes Zutrittsrecht. Eine Wohnungsbegehung bedarf eines berechtigten Anlasses und muss rechtzeitig angekuendigt werden.

Mit freundlichen Gruessen`,
  },

  'hausordnung-widerspruch': {
    id: 'hausordnung-widerspruch',
    name: 'Hausordnung-Widerspruch',
    description: 'Widersprechen Sie unzulaessigen Hausordnungsregeln',
    category: 'rechte',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'regel_beschreibung', name: 'regel_beschreibung', label: 'Beanstandete Regel', type: 'textarea', required: true, section: 'hausordnung' },
      { id: 'widerspruch_grund', name: 'widerspruch_grund', label: 'Begruendung des Widerspruchs', type: 'textarea', required: true, section: 'widerspruch' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

hiermit widerspreche ich der in der Hausordnung enthaltenen Regelung.

Diese Regelung ist unzulaessig, da sie meine Mieterrechte unangemessen einschraenkt und/oder gegen geltendes Recht verstoesst.

Mit freundlichen Gruessen`,
  },

  // ===== SONSTIGE TEMPLATES =====
  'mietbescheinigung-anfrage': {
    id: 'mietbescheinigung-anfrage',
    name: 'Mietbescheinigung',
    description: 'Anfrage fuer eine Mietbescheinigung',
    category: 'sonstige',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'verwendungszweck', name: 'verwendungszweck', label: 'Verwendungszweck', type: 'text', required: true, section: 'anfrage' },
      { id: 'benoetigte_angaben', name: 'benoetigte_angaben', label: 'Benoetigte Angaben', type: 'textarea', section: 'anfrage', placeholder: 'z.B. Miethoehe, Mietbeginn, Wohnflaeche...' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

ich benoetige fuer den genannten Zweck eine Mietbescheinigung von Ihnen.

Ich bitte Sie, mir diese innerhalb von zwei Wochen zuzusenden.

Mit freundlichen Gruessen`,
  },

  'datenschutz-auskunft': {
    id: 'datenschutz-auskunft',
    name: 'Datenschutz-Auskunft',
    description: 'DSGVO-Auskunftsanfrage an den Vermieter',
    category: 'sonstige',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'absender_geburt', name: 'absender_geburt', label: 'Geburtsdatum', type: 'date', section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters/Verwaltung', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

gemaess Artikel 15 DSGVO bitte ich um Auskunft ueber die zu meiner Person gespeicherten Daten.

Bitte teilen Sie mir mit:
- Welche personenbezogenen Daten Sie zu meiner Person speichern
- Die Verarbeitungszwecke
- Die Kategorien personenbezogener Daten
- Die Empfaenger der Daten
- Die geplante Speicherdauer

Bitte uebersenden Sie mir die Auskunft innerhalb eines Monats.

Mit freundlichen Gruessen`,
  },

  'wohngeld-bescheinigung': {
    id: 'wohngeld-bescheinigung',
    name: 'Vermieterbescheinigung Wohngeld',
    description: 'Anfrage fuer Wohngeld-Bescheinigung',
    category: 'sonstige',
    outputFormat: 'letter',
    fields: [
      { id: 'absender_name', name: 'absender_name', label: 'Ihr Name', type: 'text', required: true, section: 'absender' },
      { id: 'absender_strasse', name: 'absender_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'absender' },
      { id: 'absender_plz', name: 'absender_plz', label: 'PLZ', type: 'text', required: true, section: 'absender' },
      { id: 'absender_ort', name: 'absender_ort', label: 'Ort', type: 'text', required: true, section: 'absender' },
      { id: 'vermieter_name', name: 'vermieter_name', label: 'Name des Vermieters', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_strasse', name: 'vermieter_strasse', label: 'Strasse und Hausnummer', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_plz', name: 'vermieter_plz', label: 'PLZ', type: 'text', required: true, section: 'empfaenger' },
      { id: 'vermieter_ort', name: 'vermieter_ort', label: 'Ort', type: 'text', required: true, section: 'empfaenger' },
      { id: 'signature', name: 'signature', label: 'Unterschrift', type: 'signature', section: 'unterschrift' },
    ],
    legalText: `Sehr geehrte Damen und Herren,

ich beantrage Wohngeld und benoetige dafuer eine Vermieterbescheinigung.

Bitte fuellen Sie das beiliegende Formular aus oder bestaetigen Sie mir schriftlich:
- Die Wohnflaeche der Wohnung
- Die Hoehe der Kaltmiete
- Die Hoehe der Nebenkosten/Vorauszahlung
- Die Anzahl der Raeume
- Das Datum des Mietbeginns

Vielen Dank fuer Ihre Unterstuetzung.

Mit freundlichen Gruessen`,
  },
}

export function getFormTemplate(templateId: string): FormTemplate | null {
  return FORM_TEMPLATES[templateId] || null
}

export function getAllFormTemplates(): FormTemplate[] {
  return Object.values(FORM_TEMPLATES)
}
