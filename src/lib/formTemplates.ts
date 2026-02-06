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
}

export function getFormTemplate(templateId: string): FormTemplate | null {
  return FORM_TEMPLATES[templateId] || null
}

export function getAllFormTemplates(): FormTemplate[] {
  return Object.values(FORM_TEMPLATES)
}
