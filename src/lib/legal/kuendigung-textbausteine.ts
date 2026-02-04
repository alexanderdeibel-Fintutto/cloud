/**
 * Rechtssichere Textbausteine für Kündigungsschreiben
 * Basierend auf BGB §§ 542-545, 568-575, 573-573d und aktueller BGH-Rechtsprechung
 * Stand: 2024
 */

// ============================================
// ORDENTLICHE KÜNDIGUNG - MIETER
// ============================================
export const KUENDIGUNG_MIETER_TEXTE = {
  betreff: 'Kündigung des Mietverhältnisses',

  einleitung: `hiermit kündige ich das bestehende Mietverhältnis über die oben genannte Wohnung fristgerecht zum nächstmöglichen Zeitpunkt.`,

  einleitung_mit_datum: `hiermit kündige ich das bestehende Mietverhältnis über die oben genannte Wohnung zum {datum}, hilfsweise zum nächstmöglichen Zeitpunkt.`,

  kuendigungsfrist_hinweis: `Die Kündigung erfolgt unter Einhaltung der gesetzlichen Kündigungsfrist von drei Monaten gemäß § 573c Abs. 1 BGB zum Ende des {monat}.`,

  wohnungsuebergabe: `Ich bitte Sie, mir rechtzeitig einen Termin zur Wohnungsübergabe und Schlüsselrückgabe mitzuteilen. Ich schlage hierfür den Zeitraum {zeitraum} vor.`,

  kautionsrueckgabe: `Bitte überweisen Sie die geleistete Mietkaution in Höhe von {betrag} EUR nach Vertragsende und erfolgter Wohnungsabnahme auf folgendes Konto:
IBAN: {iban}
Kontoinhaber: {inhaber}`,

  betriebskostenabrechnung: `Ich bitte um Zusendung der Betriebskostenabrechnung für das laufende Abrechnungsjahr an meine neue Adresse, sobald diese vorliegt.`,

  neue_adresse: `Meine neue Anschrift ab dem {datum} lautet:
{adresse}`,

  besichtigungen: `Für notwendige Besichtigungen durch Nachmieter oder Kaufinteressenten stehe ich nach vorheriger Terminabsprache zur Verfügung.`,

  bestaetigung: `Bitte bestätigen Sie mir den Erhalt dieser Kündigung sowie den Beendigungstermin schriftlich.`,

  schluss: `Mit freundlichen Grüßen`,
}

// ============================================
// ORDENTLICHE KÜNDIGUNG - VERMIETER
// ============================================
export const KUENDIGUNG_VERMIETER_TEXTE = {
  betreff: 'Kündigung des Mietverhältnisses',

  einleitung: `hiermit kündige ich das bestehende Mietverhältnis über die oben genannte Wohnung ordentlich unter Einhaltung der gesetzlichen Kündigungsfrist.`,

  einleitung_mit_datum: `hiermit kündige ich das bestehende Mietverhältnis über die oben genannte Wohnung zum {datum}. Das Mietverhältnis begann am {mietbeginn}.`,

  // Kündigungsfristen nach § 573c BGB
  kuendigungsfrist: {
    unter_5_jahre: `Die Kündigungsfrist beträgt gemäß § 573c Abs. 1 BGB drei Monate zum Monatsende, da das Mietverhältnis weniger als fünf Jahre besteht.`,

    ueber_5_jahre: `Die Kündigungsfrist beträgt gemäß § 573c Abs. 1 BGB sechs Monate zum Monatsende, da das Mietverhältnis länger als fünf Jahre besteht.`,

    ueber_8_jahre: `Die Kündigungsfrist beträgt gemäß § 573c Abs. 1 BGB neun Monate zum Monatsende, da das Mietverhältnis länger als acht Jahre besteht.`,
  },

  // Berechtigtes Interesse nach § 573 BGB
  berechtigtes_interesse: `Die Kündigung erfolgt wegen eines berechtigten Interesses gemäß § 573 BGB.`,

  // Kündigungsgründe nach § 573 BGB
  gruende: {
    eigenbedarf: {
      standard: `Ich mache Eigenbedarf gemäß § 573 Abs. 2 Nr. 2 BGB geltend.`,

      begruendung: `Die Wohnung wird für {person} benötigt. {person} ist {beziehung}.

Grund für den Eigenbedarf: {grund}

{person} benötigt die Wohnung, weil {details}.`,

      hinweis: `Sollte der Eigenbedarf vor Ablauf der Kündigungsfrist wegfallen, werde ich Sie unverzüglich informieren.`,
    },

    pflichtverletzung: {
      standard: `Der Mieter hat seine vertraglichen Pflichten schuldhaft nicht unerheblich verletzt (§ 573 Abs. 2 Nr. 1 BGB).`,

      zahlungsverzug: `Der Mieter befindet sich mit der Zahlung der Miete für die Monate {monate} in Verzug. Der Mietrückstand beträgt insgesamt {betrag} EUR. Trotz Mahnung vom {datum} wurde der Rückstand nicht ausgeglichen.`,

      stoerung_hausfrieden: `Der Mieter hat wiederholt und nachhaltig den Hausfrieden gestört. Trotz Abmahnung vom {datum} wurden die Störungen fortgesetzt.`,

      vertragswidriger_gebrauch: `Der Mieter nutzt die Mietsache vertragswidrig. Trotz Abmahnung vom {datum} wurde das vertragswidrige Verhalten nicht eingestellt.`,
    },

    verwertung: {
      standard: `Der Vermieter wäre durch die Fortsetzung des Mietverhältnisses an einer angemessenen wirtschaftlichen Verwertung des Grundstücks gehindert und würde dadurch erhebliche Nachteile erleiden (§ 573 Abs. 2 Nr. 3 BGB).`,

      begruendung: `Die wirtschaftliche Verwertung ist erforderlich, weil {grund}.

Der wirtschaftliche Nachteil bei Fortsetzung des Mietverhältnisses besteht in {nachteil}.`,
    },
  },

  widerspruchsrecht: `Sie haben das Recht, der Kündigung bis zwei Monate vor Beendigung des Mietverhältnisses zu widersprechen und die Fortsetzung des Mietverhältnisses zu verlangen, wenn die Beendigung für Sie, Ihre Familie oder einen anderen Angehörigen Ihres Haushalts eine Härte bedeuten würde, die auch unter Würdigung der berechtigten Interessen des Vermieters nicht zu rechtfertigen ist (§ 574 BGB).`,

  widerspruchsbelehrung: `WIDERSPRUCHSRECHT NACH § 574 BGB

Sie können der Kündigung widersprechen und die Fortsetzung des Mietverhältnisses verlangen, wenn die Beendigung des Mietverhältnisses für Sie oder Ihre Familie eine Härte bedeuten würde, die auch unter Würdigung meiner berechtigten Interessen nicht zu rechtfertigen ist. Eine Härte liegt insbesondere vor, wenn angemessener Ersatzwohnraum zu zumutbaren Bedingungen nicht beschafft werden kann.

Der Widerspruch muss schriftlich erfolgen und mir spätestens zwei Monate vor Beendigung des Mietverhältnisses zugehen.`,

  raeumung: `Ich fordere Sie auf, die Wohnung bis zum {datum} geräumt und in vertragsgemäßem Zustand an mich zurückzugeben. Bitte vereinbaren Sie rechtzeitig einen Übergabetermin.`,

  kaution: `Die geleistete Mietkaution wird nach Beendigung des Mietverhältnisses, Rückgabe der Wohnung und Prüfung etwaiger Ansprüche abgerechnet.`,

  schluss: `Mit freundlichen Grüßen`,
}

// ============================================
// AUSSERORDENTLICHE KÜNDIGUNG
// ============================================
export const KUENDIGUNG_FRISTLOS_TEXTE = {
  betreff: 'Außerordentliche fristlose Kündigung des Mietverhältnisses',

  einleitung: `hiermit kündige ich das bestehende Mietverhältnis über die oben genannte Wohnung außerordentlich fristlos gemäß § 543 BGB mit sofortiger Wirkung.`,

  // Kündigungsgründe Mieter
  gruende_mieter: {
    gesundheitsgefaehrdung: {
      standard: `Ein wichtiger Grund für die fristlose Kündigung liegt vor, da die Wohnung so beschaffen ist, dass ihre Benutzung mit einer erheblichen Gefährdung der Gesundheit verbunden ist (§ 569 Abs. 1 BGB).`,

      begruendung: `Die Gesundheitsgefährdung besteht in: {details}

Der Mangel wurde dem Vermieter am {datum} angezeigt. Trotz angemessener Fristsetzung wurde der Mangel nicht behoben.`,
    },

    nichtgewaehrung: {
      standard: `Ein wichtiger Grund liegt vor, da mir der vertragsgemäße Gebrauch der Mietsache nicht gewährt wird (§ 543 Abs. 2 Nr. 1 BGB).`,

      begruendung: `Der Gebrauch wird verweigert/eingeschränkt durch: {details}`,
    },

    erheblicher_mangel: {
      standard: `Ein wichtiger Grund liegt vor, da die Mietsache einen erheblichen Mangel aufweist, der trotz Fristsetzung nicht behoben wurde.`,

      begruendung: `Der Mangel besteht in: {mangel}

Der Mangel wurde am {datum} angezeigt. Eine Frist zur Beseitigung bis zum {frist} ist fruchtlos verstrichen.`,
    },
  },

  // Kündigungsgründe Vermieter
  gruende_vermieter: {
    zahlungsverzug: {
      standard: `Ein wichtiger Grund für die fristlose Kündigung liegt vor, da der Mieter mit der Zahlung der Miete in Höhe von mindestens zwei Monatsmieten in Verzug ist (§ 543 Abs. 2 Nr. 3 BGB).`,

      begruendung: `Der Mieter ist mit der Miete für folgende Monate in Verzug:
{monate}

Der aufgelaufene Mietrückstand beträgt {betrag} EUR (entspricht {anzahl} Monatsmieten).

Eine Zahlung erfolgte trotz Mahnung vom {mahndatum} nicht.`,

      schonfrist: `Diese fristlose Kündigung wird hilfsweise als ordentliche Kündigung aufrechterhalten, falls die fristlose Kündigung durch nachträgliche Zahlung unwirksam werden sollte (§ 569 Abs. 3 Nr. 2 BGB).`,
    },

    stoerung_hausfrieden: {
      standard: `Ein wichtiger Grund liegt vor, da der Mieter den Hausfrieden so nachhaltig stört, dass dem Vermieter die Fortsetzung des Mietverhältnisses nicht mehr zugemutet werden kann (§ 569 Abs. 2 BGB).`,

      begruendung: `Die nachhaltige Störung des Hausfriedens besteht in:
{details}

Der Mieter wurde am {datum} abgemahnt. Die Störungen wurden trotzdem fortgesetzt am {fortgesetzt}.`,
    },

    vertragswidriger_gebrauch: {
      standard: `Ein wichtiger Grund liegt vor, da der Mieter die Mietsache trotz Abmahnung unbefugt Dritten überlassen oder erheblich gefährdet hat (§ 543 Abs. 2 Nr. 2 BGB).`,

      begruendung: `Der vertragswidrige Gebrauch besteht in: {details}

Abmahnung erfolgte am {datum}. Das vertragswidrige Verhalten wurde fortgesetzt.`,
    },
  },

  hilfsweise_ordentlich: `Hilfsweise wird das Mietverhältnis ordentlich zum nächstmöglichen Zeitpunkt gekündigt, falls die außerordentliche Kündigung unwirksam sein sollte.`,

  raeumung_sofort: `Ich fordere Sie auf, die Wohnung unverzüglich, spätestens jedoch innerhalb von zwei Wochen nach Zugang dieses Schreibens, geräumt zu übergeben.`,

  rechtliche_schritte: `Sollten Sie dieser Aufforderung nicht nachkommen, werde ich Räumungsklage erheben und die Zwangsräumung durchsetzen lassen.`,

  widerspruchsrecht_vermieter: `WIDERSPRUCHSRECHT NACH § 574 BGB

Auch bei einer außerordentlichen Kündigung können Sie Widerspruch einlegen, wenn die Räumung für Sie eine besondere Härte darstellt. Der Widerspruch muss schriftlich und rechtzeitig erfolgen.`,
}

// ============================================
// SONDERKÜNDIGUNGEN
// ============================================
export const SONDERKUENDIGUNG_TEXTE = {
  mieterhoehung: {
    betreff: 'Sonderkündigungsrecht wegen Mieterhöhung',

    text: `Aufgrund der mir zugegangenen Mieterhöhung vom {datum} mache ich von meinem Sonderkündigungsrecht gemäß § 561 Abs. 1 BGB Gebrauch.

Ich kündige das Mietverhältnis zum Ablauf des übernächsten Monats, in dem die Mieterhöhung eintreten sollte, also zum {kuendigungsdatum}.

Die erhöhte Miete schulde ich nicht.`,
  },

  modernisierung: {
    betreff: 'Sonderkündigungsrecht wegen Modernisierung',

    text: `Aufgrund der mir angekündigten Modernisierungsmaßnahme vom {datum} mache ich von meinem Sonderkündigungsrecht gemäß § 555e BGB Gebrauch.

Ich kündige das Mietverhältnis zum Ablauf des Monats, der auf den Zugang der Modernisierungsankündigung folgt, also zum {kuendigungsdatum}.`,
  },

  tod_des_mieters: {
    betreff: 'Kündigung nach Tod des Mieters',

    text: `Der Mieter {name} ist am {sterbedatum} verstorben.

Gemäß § 564 BGB kündigen wir als {beziehung} das Mietverhältnis mit der gesetzlichen Frist von einem Monat zum Monatsende, also zum {kuendigungsdatum}.`,
  },

  vermieter_tod: {
    betreff: 'Kündigung nach Tod des Vermieters',

    text: `Hiermit kündigen wir als Erben des am {sterbedatum} verstorbenen Vermieters {name} das Mietverhältnis.`,
  },
}

// ============================================
// RECHTLICHE HINWEISE
// ============================================
export const RECHTLICHE_HINWEISE = {
  schriftform: `WICHTIG: Die Kündigung eines Mietverhältnisses bedarf der Schriftform (§ 568 BGB). Eine Kündigung per E-Mail, Fax oder mündlich ist unwirksam.`,

  zugang: `Die Kündigung muss dem Empfänger zugehen. Der Zugang sollte nachweisbar sein (Einschreiben mit Rückschein, persönliche Übergabe mit Empfangsbestätigung).`,

  fristberechnung: `Die Kündigung muss spätestens am dritten Werktag eines Kalendermonats zugehen, um zum Ablauf des übernächsten Monats wirksam zu werden. Der Samstag gilt nicht als Werktag (BGH VIII ZR 206/04).`,

  mehrere_mieter: `Bei mehreren Mietern muss die Kündigung von allen Mietern ausgesprochen werden. Bei mehreren Vermietern muss die Kündigung an alle Mieter gerichtet sein.`,

  vollmacht: `Wird die Kündigung durch einen Bevollmächtigten erklärt, ist die Originalvollmacht beizufügen. Andernfalls kann die Kündigung unverzüglich zurückgewiesen werden (§ 174 BGB).`,

  widerspruch_frist: `Der Widerspruch gegen eine Kündigung muss dem Vermieter spätestens zwei Monate vor Beendigung des Mietverhältnisses schriftlich zugehen.`,

  haertegruende: `Härtegründe für einen Widerspruch können sein:
- Angemessener Ersatzwohnraum nicht zu zumutbaren Bedingungen beschaffbar
- Hohes Alter
- Schwere Krankheit
- Behinderung
- Schwangerschaft
- Prüfungsvorbereitungen bei Studierenden`,
}

// ============================================
// HILFSFUNKTION: Text mit Platzhaltern füllen
// ============================================
export function fillKuendigungTemplate(template: string, values: Record<string, string | number>): string {
  let result = template
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
  }
  return result
}

// ============================================
// BGB-PARAGRAPHEN REFERENZEN FÜR KÜNDIGUNG
// ============================================
export const BGB_KUENDIGUNG_REFERENZEN = {
  '§ 542': 'Ende des Mietverhältnisses',
  '§ 543': 'Außerordentliche fristlose Kündigung aus wichtigem Grund',
  '§ 545': 'Stillschweigende Verlängerung des Mietverhältnisses',
  '§ 555e': 'Sonderkündigungsrecht des Mieters bei Modernisierung',
  '§ 561': 'Sonderkündigungsrecht des Mieters nach Mieterhöhung',
  '§ 564': 'Mietverhältnis bei Tod des Mieters',
  '§ 568': 'Form und Inhalt der Kündigung',
  '§ 569': 'Außerordentliche fristlose Kündigung aus wichtigem Grund (Wohnraum)',
  '§ 573': 'Ordentliche Kündigung des Vermieters',
  '§ 573a': 'Erleichterte Kündigung des Vermieters',
  '§ 573c': 'Fristen der ordentlichen Kündigung',
  '§ 574': 'Widerspruch des Mieters gegen die Kündigung',
  '§ 574a': 'Härtegründe',
  '§ 574b': 'Form und Frist des Widerspruchs',
  '§ 575': 'Zeitmietvertrag',
}
