/**
 * Rechtssichere Textbausteine für Mietverträge
 * Basierend auf BGB §§ 535-580a und aktueller BGH-Rechtsprechung
 * Stand: 2024
 */

// ============================================
// § VERTRAGSPARTEIEN
// ============================================
export const VERTRAGSPARTEIEN_TEXTE = {
  praeambel: `Zwischen den nachfolgend genannten Parteien wird folgender Wohnraummietvertrag geschlossen.`,

  mehrere_mieter: `Bei mehreren Mietern haften diese als Gesamtschuldner für alle Verpflichtungen aus diesem Vertrag (§ 421 BGB). Erklärungen, die das Mietverhältnis betreffen, müssen von oder gegenüber allen Mietern abgegeben werden.`,

  vertreter: `Der Vermieter wird vertreten durch die nachfolgend genannte Hausverwaltung. Diese ist zur Entgegennahme von Erklärungen und Zahlungen bevollmächtigt.`,
}

// ============================================
// § MIETGEGENSTAND
// ============================================
export const MIETGEGENSTAND_TEXTE = {
  wohnflaeche_abweichung: `Die angegebene Wohnfläche ist circa-Angabe. Abweichungen bis zu 10% sind unerheblich und berechtigen nicht zur Mietminderung (BGH VIII ZR 133/03). Bei Abweichungen von mehr als 10% kann eine Anpassung verlangt werden.`,

  ausstattung_standard: `Die Wohnung wird übergeben mit:
- Fußbodenbelag in allen Räumen
- Funktionsfähiger Heizungsanlage
- Warmwasserversorgung
- Elektrischen Anschlüssen in allen Räumen
- Kalt- und Warmwasseranschluss in Küche und Bad`,

  keller_mitnutzung: `Der Mieter erhält das Recht zur Mitbenutzung folgender Gemeinschaftsräume: Waschküche, Trockenraum, Fahrradkeller (soweit vorhanden). Die Nutzung erfolgt nach der Hausordnung.`,

  energieausweis: `Ein Energieausweis wurde dem Mieter vorgelegt. Die Angaben zum Energieverbrauch dienen nur der Information und stellen keine Beschaffenheitsvereinbarung dar.`,
}

// ============================================
// § MIETZEIT UND KÜNDIGUNG
// ============================================
export const MIETZEIT_TEXTE = {
  unbefristet: {
    standard: `Das Mietverhältnis beginnt am {startDatum} und läuft auf unbestimmte Zeit.`,

    kuendigung_mieter: `Der Mieter kann das Mietverhältnis mit einer Frist von drei Monaten zum Monatsende kündigen (§ 573c Abs. 1 BGB). Die Kündigung muss schriftlich erfolgen und spätestens am dritten Werktag eines Kalendermonats zugehen, um zum Ablauf des übernächsten Monats wirksam zu werden.`,

    kuendigung_vermieter: `Der Vermieter kann nur bei Vorliegen eines berechtigten Interesses kündigen (§ 573 BGB). Die Kündigungsfrist beträgt:
- 3 Monate bei einer Mietdauer bis zu 5 Jahren
- 6 Monate bei einer Mietdauer von mehr als 5 Jahren
- 9 Monate bei einer Mietdauer von mehr als 8 Jahren`,

    kuendigungsausschluss: `Beide Parteien verzichten auf das Recht zur ordentlichen Kündigung für die Dauer von {monate} Monaten ab Mietbeginn. Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.`,
  },

  befristet: {
    standard: `Das Mietverhältnis ist befristet vom {startDatum} bis zum {endDatum}. Es endet mit Ablauf der vereinbarten Zeit, ohne dass es einer Kündigung bedarf.`,

    befristungsgruende: {
      eigenbedarf: `Befristungsgrund gem. § 575 Abs. 1 Nr. 1 BGB: Der Vermieter beabsichtigt, die Räume nach Ablauf der Mietzeit als Wohnung für sich, seine Familienangehörigen oder Angehörige seines Haushalts zu nutzen.`,

      abriss: `Befristungsgrund gem. § 575 Abs. 1 Nr. 2 BGB: Der Vermieter beabsichtigt, die Räume in zulässiger Weise zu beseitigen oder so wesentlich zu verändern oder instand zu setzen, dass die Maßnahmen durch eine Fortsetzung des Mietverhältnisses erheblich erschwert würden.`,

      werkswohnung: `Befristungsgrund gem. § 575 Abs. 1 Nr. 3 BGB: Der Vermieter beabsichtigt, die Räume an einen zur Dienstleistung Verpflichteten zu vermieten.`,
    },

    verlaengerung: `Wird das Mietverhältnis nach Ablauf der Befristung fortgesetzt, gilt es als auf unbestimmte Zeit verlängert (§ 545 BGB), sofern nicht eine Partei binnen zwei Wochen widerspricht.`,
  },

  ausserordentliche_kuendigung: `Das Recht zur außerordentlichen fristlosen Kündigung aus wichtigem Grund bleibt beiden Parteien vorbehalten (§ 543 BGB). Ein wichtiger Grund liegt insbesondere vor bei:
- erheblicher Gefährdung der Gesundheit
- nachhaltiger Störung des Hausfriedens
- Zahlungsverzug mit zwei Monatsmieten
- vertragswidrigem Gebrauch trotz Abmahnung`,
}

// ============================================
// § MIETE UND NEBENKOSTEN
// ============================================
export const MIETE_TEXTE = {
  zusammensetzung: `Die monatliche Miete setzt sich zusammen aus:
a) Grundmiete (Nettokaltmiete): {kaltmiete} EUR
b) Vorauszahlung für Betriebskosten: {betriebskosten} EUR
c) Vorauszahlung für Heizkosten: {heizkosten} EUR
Gesamtmiete monatlich: {gesamtmiete} EUR`,

  faelligkeit: `Die Miete ist monatlich im Voraus, spätestens bis zum {tag}. Werktag eines jeden Monats, kostenfrei auf das Konto des Vermieters zu entrichten. Für die Rechtzeitigkeit der Zahlung kommt es auf den Eingang auf dem Konto des Vermieters an.`,

  zahlungsweise: {
    ueberweisung: `Die Zahlung erfolgt durch Überweisung auf folgendes Konto:
Kontoinhaber: {inhaber}
IBAN: {iban}
BIC: {bic}
Bank: {bank}`,

    lastschrift: `Der Mieter erteilt dem Vermieter ein SEPA-Lastschriftmandat. Die Miete wird jeweils zum {tag}. eines Monats eingezogen.`,
  },

  betriebskosten: {
    vorauszahlung: `Über die Betriebskosten wird jährlich abgerechnet. Die Abrechnung muss dem Mieter spätestens bis zum Ablauf des zwölften Monats nach Ende des Abrechnungszeitraums zugehen. Nach Ablauf dieser Frist ist eine Nachforderung ausgeschlossen, es sei denn, der Vermieter hat die verspätete Geltendmachung nicht zu vertreten (§ 556 Abs. 3 BGB).`,

    pauschale: `Für die Betriebskosten wird eine monatliche Pauschale von {betrag} EUR vereinbart. Eine Abrechnung erfolgt nicht. Die Pauschale umfasst die in § 2 BetrKV genannten Betriebskosten mit Ausnahme der Heizkosten, die gesondert nach Verbrauch abgerechnet werden.`,

    umlagefaehig: `Umlagefähig sind die Betriebskosten gemäß § 2 der Betriebskostenverordnung (BetrKV), insbesondere:
1. Grundsteuer
2. Wasserversorgung
3. Entwässerung
4. Heizung (wird verbrauchsabhängig nach HeizKV abgerechnet)
5. Warmwasser (wird verbrauchsabhängig nach HeizKV abgerechnet)
6. Aufzug
7. Straßenreinigung und Müllabfuhr
8. Gebäudereinigung und Ungezieferbekämpfung
9. Gartenpflege
10. Beleuchtung (Allgemeinflächen)
11. Schornsteinreinigung
12. Sach- und Haftpflichtversicherung
13. Hauswart
14. Gemeinschaftsantenne/Kabelanschluss
15. Einrichtungen für die Wäschepflege
16. Sonstige Betriebskosten (soweit vereinbart)`,

    verteilerschluessel: {
      wohnflaeche: `Die Betriebskosten werden nach dem Verhältnis der Wohnflächen umgelegt.`,
      personen: `Die Betriebskosten werden nach der Personenzahl umgelegt.`,
      einheiten: `Die Betriebskosten werden nach Mieteinheiten umgelegt.`,
      verbrauch: `Die Betriebskosten werden nach erfasstem Verbrauch umgelegt.`,
    },
  },

  mieterhoehung: {
    vergleichsmiete: `Der Vermieter kann die Zustimmung zu einer Erhöhung der Miete bis zur ortsüblichen Vergleichsmiete verlangen (§ 558 BGB). Die Miete darf sich innerhalb von drei Jahren nicht um mehr als 20% erhöhen (Kappungsgrenze). In Gebieten mit angespanntem Wohnungsmarkt beträgt die Kappungsgrenze 15%.`,

    staffelmiete: `Die Parteien vereinbaren eine Staffelmiete gemäß § 557a BGB. Die Miete erhöht sich wie folgt:
{staffeln}
Die Miete muss jeweils mindestens ein Jahr unverändert bleiben. Während der Laufzeit der Staffelmiete ist eine Erhöhung nach §§ 558-559 BGB ausgeschlossen.`,

    indexmiete: `Die Parteien vereinbaren eine Indexmiete gemäß § 557b BGB. Die Miete ändert sich entsprechend der prozentualen Änderung des vom Statistischen Bundesamt ermittelten Verbraucherpreisindex für Deutschland.
Basisindex: {basismonat} ({basiswert} Punkte)
Eine Anpassung kann frühestens nach Ablauf eines Jahres seit der letzten Anpassung verlangt werden. Die Anpassung wird mit Beginn des übernächsten Monats nach Zugang der Erklärung wirksam.`,
  },

  verzug: `Gerät der Mieter mit der Zahlung von Miete in Verzug, ist der Vermieter berechtigt, Verzugszinsen in Höhe von 5 Prozentpunkten über dem Basiszinssatz zu verlangen (§ 288 Abs. 1 BGB). Das Recht zur außerordentlichen Kündigung bei Zahlungsverzug mit zwei Monatsmieten bleibt unberührt (§ 543 Abs. 2 Nr. 3 BGB).`,
}

// ============================================
// § KAUTION
// ============================================
export const KAUTION_TEXTE = {
  hoehe: `Der Mieter leistet als Mietsicherheit einen Betrag von {betrag} EUR. Dies entspricht {monate} Monatskaltmieten. Die Kaution darf das Dreifache der Monatskaltmiete nicht übersteigen (§ 551 Abs. 1 BGB).`,

  ratenzahlung: `Der Mieter ist berechtigt, die Kaution in drei gleichen monatlichen Raten zu zahlen (§ 551 Abs. 2 BGB). Die erste Rate ist zu Beginn des Mietverhältnisses fällig, die weiteren Raten zusammen mit den folgenden Mietzahlungen.`,

  anlage: `Der Vermieter ist verpflichtet, die Kaution getrennt von seinem Vermögen bei einem Kreditinstitut zu dem für Spareinlagen mit dreimonatiger Kündigungsfrist üblichen Zinssatz anzulegen (§ 551 Abs. 3 BGB). Die Zinsen stehen dem Mieter zu und erhöhen die Sicherheit.`,

  arten: {
    barkaution: `Die Kaution wird als Barkaution auf ein Mietkautionskonto eingezahlt. Der Vermieter wird dem Mieter die Einzahlung nachweisen.`,

    buergschaft: `Die Kaution wird in Form einer unbefristeten, selbstschuldnerischen Bankbürgschaft unter Verzicht auf die Einreden der Vorausklage und der Anfechtbarkeit geleistet. Die Bürgschaftsurkunde ist dem Vermieter bei Mietbeginn auszuhändigen.`,

    sparbuch: `Die Kaution wird in Form eines verpfändeten Sparbuchs geleistet. Das Sparbuch wird an den Vermieter verpfändet. Die Verpfändungserklärung ist beigefügt.`,

    kautionsversicherung: `Die Kaution wird in Form einer Kautionsversicherung geleistet. Der Nachweis über den Abschluss ist dem Vermieter bei Mietbeginn vorzulegen.`,
  },

  rueckgabe: `Die Kaution ist nach Beendigung des Mietverhältnisses und Rückgabe der Mietsache abzurechnen und zurückzuerstatten. Der Vermieter darf einen angemessenen Teil der Kaution für noch zu erwartende Betriebskostennachforderungen einbehalten. Die Abrechnungsfrist beträgt regelmäßig 3-6 Monate nach Beendigung des Mietverhältnisses.`,
}

// ============================================
// § NUTZUNG DER MIETRÄUME
// ============================================
export const NUTZUNG_TEXTE = {
  wohnzwecke: `Die Mietsache ist ausschließlich zu Wohnzwecken bestimmt. Eine gewerbliche oder berufliche Nutzung ist nur mit vorheriger schriftlicher Zustimmung des Vermieters zulässig, soweit sie nicht mit der Wohnnutzung verbunden ist und keine Außenwirkung entfaltet (z.B. Homeoffice).`,

  personenzahl: `Die Wohnung darf nur von den im Vertrag genannten Personen bewohnt werden. Die Aufnahme weiterer Personen, auch von Familienangehörigen, in die Wohnung bedarf der vorherigen Zustimmung des Vermieters. Besuch ist hiervon nicht betroffen.`,

  tierhaltung: {
    erlaubt: `Die Haltung von Haustieren ist gestattet. Bei Hunden und Katzen ist dem Vermieter die Tierhaltung anzuzeigen. Der Mieter haftet für alle durch das Tier verursachten Schäden.`,

    verboten: `Die Haltung von Hunden und Katzen ist nicht gestattet. Kleintiere (z.B. Ziervögel, Zierfische, Hamster) dürfen in artgerechter Haltung und üblicher Anzahl gehalten werden. Ein generelles Tierhaltungsverbot ist unwirksam (BGH VIII ZR 340/06).`,

    genehmigungspflichtig: `Die Haltung von Hunden und Katzen bedarf der vorherigen schriftlichen Zustimmung des Vermieters. Die Zustimmung kann nur aus wichtigem Grund verweigert werden und ist jederzeit bei Vorliegen eines wichtigen Grundes widerruflich.`,
  },

  untervermietung: {
    erlaubt: `Der Mieter ist zur Untervermietung berechtigt. Er hat dem Vermieter den Namen des Untermieters mitzuteilen.`,

    verboten: `Eine Untervermietung der Wohnung oder einzelner Räume ist nicht gestattet.`,

    genehmigungspflichtig: `Eine Untervermietung oder sonstige Gebrauchsüberlassung an Dritte bedarf der vorherigen Zustimmung des Vermieters (§ 540 BGB). Besteht für den Mieter nach Abschluss des Mietvertrags ein berechtigtes Interesse an der Überlassung eines Teils des Wohnraums an einen Dritten, kann er vom Vermieter die Erlaubnis hierzu verlangen (§ 553 BGB).`,
  },

  bauliche_veraenderungen: `Bauliche Veränderungen, insbesondere Um- und Einbauten, bedürfen der vorherigen schriftlichen Zustimmung des Vermieters. Der Vermieter kann die Zustimmung von der Verpflichtung zur Wiederherstellung des ursprünglichen Zustands bei Beendigung des Mietverhältnisses abhängig machen.`,
}

// ============================================
// § INSTANDHALTUNG UND INSTANDSETZUNG
// ============================================
export const INSTANDHALTUNG_TEXTE = {
  vermieter: `Der Vermieter trägt die Kosten der Instandhaltung und Instandsetzung der Mietsache, soweit diese nicht durch vertragswidrigen Gebrauch des Mieters verursacht wurden.`,

  schoenheitsreparaturen: {
    mieter_flexibel: `Der Mieter übernimmt die Schönheitsreparaturen während der Mietzeit, wenn ein Renovierungsbedarf besteht. Schönheitsreparaturen umfassen das Tapezieren, Anstreichen oder Kalken der Wände und Decken, das Streichen der Fußböden, Heizkörper einschließlich Heizrohre, der Innentüren sowie der Fenster und Außentüren von innen.

Starre Fristenpläne gelten nicht. Die Renovierung ist nur dann durchzuführen, wenn der Zustand der Wohnung dies erfordert.`,

    mieter_bei_auszug: `Bei unrenoviert oder renovierungsbedürftig übernommener Wohnung: Der Mieter ist nur verpflichtet, die während der Mietzeit eingetretenen Abnutzungen zu beseitigen. Für die Abgeltung des Anfangszustands ist der Vermieter nicht berechtigt, Ausgleichszahlungen zu verlangen.`,

    vermieter: `Die Schönheitsreparaturen verbleiben beim Vermieter.`,

    unwirksame_klauseln: `Hinweis: Klauseln mit starren Fristenplänen, Endrenovierungsklauseln ohne Rücksicht auf den Wohnungszustand und Quotenabgeltungsklauseln sind nach der Rechtsprechung des BGH unwirksam.`,
  },

  kleinreparaturen: {
    wirksam: `Der Mieter trägt die Kosten für Kleinreparaturen an den seiner Obhut unterliegenden Teilen der Mietsache (Installationsgegenstände für Elektrizität, Wasser und Gas, Heiz- und Kocheinrichtungen, Fenster- und Türverschlüsse, Verschlussvorrichtungen von Fensterläden).

Die Kosten je Einzelreparatur dürfen {einzelbetrag} EUR nicht übersteigen. Die jährliche Gesamtbelastung ist auf {jahresbetrag} EUR begrenzt. Darüber hinausgehende Kosten trägt der Vermieter.`,

    unwirksam_hinweis: `Hinweis: Kleinreparaturklauseln, die keine betragsmäßige Begrenzung enthalten oder den Mieter zur Durchführung der Reparatur (statt nur zur Kostentragung) verpflichten, sind unwirksam.`,
  },

  maengelanzeige: `Der Mieter ist verpflichtet, Mängel der Mietsache dem Vermieter unverzüglich anzuzeigen (§ 536c BGB). Unterlässt er die Anzeige, ist er zum Ersatz des daraus entstehenden Schadens verpflichtet. Das Mietminderungsrecht kann bei unterlassener Anzeige ausgeschlossen sein.`,
}

// ============================================
// § BETRETEN DER WOHNUNG
// ============================================
export const BETRETUNGSRECHT_TEXTE = {
  standard: `Der Vermieter oder sein Beauftragter darf die Mietsache nach vorheriger Ankündigung zu folgenden Zwecken betreten:
- Besichtigung zur Prüfung des Zustands
- Ablesung von Messgeräten
- Durchführung notwendiger Instandsetzungsarbeiten
- Bei beabsichtigtem Verkauf: Besichtigung mit Kaufinteressenten
- Bei beabsichtigter Neuvermietung: Besichtigung mit Mietinteressenten (in den letzten 3 Monaten des Mietverhältnisses)

Die Ankündigung muss in angemessener Frist erfolgen (in der Regel mindestens 24 Stunden), außer bei Gefahr im Verzug. Die Besichtigung soll zu einer für den Mieter zumutbaren Zeit stattfinden.`,

  kein_generalzutritt: `Ein generelles Zutrittsrecht ohne konkreten Anlass besteht nicht. Der Mieter ist berechtigt, bei der Besichtigung anwesend zu sein.`,
}

// ============================================
// § RÜCKGABE DER MIETSACHE
// ============================================
export const RUECKGABE_TEXTE = {
  standard: `Bei Beendigung des Mietverhältnisses ist die Mietsache vollständig geräumt, sauber und in dem Zustand zurückzugeben, der sich aus vertragsgemäßem Gebrauch ergibt. Alle Schlüssel sind zurückzugeben, auch selbst beschaffte.`,

  protokoll: `Über den Zustand der Wohnung bei Rückgabe wird ein gemeinsames Übergabeprotokoll erstellt. Beide Parteien erhalten eine Ausfertigung.`,

  einbauten: `Vom Mieter eingebaute Einrichtungen sind auf Verlangen des Vermieters zu entfernen und der ursprüngliche Zustand wiederherzustellen, sofern bei der Genehmigung nichts anderes vereinbart wurde.`,

  vorzeitige_rueckgabe: `Gibt der Mieter die Mietsache vor Ablauf der Mietzeit zurück, wird er dadurch nicht von seiner Pflicht zur Mietzahlung bis zum vertragsgemäßen Ende des Mietverhältnisses befreit. Der Vermieter ist jedoch verpflichtet, sich um eine anderweitige Vermietung zu bemühen.`,
}

// ============================================
// § HAUSORDNUNG
// ============================================
export const HAUSORDNUNG_TEXTE = {
  bestandteil: `Die als Anlage beigefügte Hausordnung ist Bestandteil dieses Mietvertrags. Der Mieter verpflichtet sich, die Hausordnung einzuhalten und auch bei seinen Haushaltsangehörigen und Besuchern für deren Einhaltung zu sorgen.`,

  aenderungen: `Der Vermieter ist berechtigt, die Hausordnung aus wichtigem Grund mit angemessener Frist zu ändern. Änderungen dürfen nicht in den Kernbereich des Mietgebrauchs eingreifen.`,

  ruhezeiten: `Im Haus sind die üblichen Ruhezeiten einzuhalten:
- Mittagsruhe: 13:00 - 15:00 Uhr
- Nachtruhe: 22:00 - 7:00 Uhr
- An Sonn- und Feiertagen: ganztags`,
}

// ============================================
// § HAFTUNG UND VERSICHERUNG
// ============================================
export const HAFTUNG_TEXTE = {
  mieter: `Der Mieter haftet für Schäden, die durch ihn, seine Haushaltsangehörigen, Untermieter, Besucher oder von ihm beauftragte Personen schuldhaft verursacht werden. Der Mieter haftet auch für Schäden durch unsachgemäße Benutzung der Mietsache.`,

  versicherung_empfehlung: `Dem Mieter wird der Abschluss einer Hausratversicherung und einer Privathaftpflichtversicherung empfohlen.`,

  wohngebaeudeversicherung: `Der Vermieter unterhält eine Wohngebäudeversicherung. Die Kosten sind in den Betriebskosten enthalten. Schäden am Gebäude oder der Mietsache sind dem Vermieter unverzüglich anzuzeigen.`,

  haftungsbeschraenkung: `Der Vermieter haftet nicht für Schäden, die nicht auf seinem Verschulden beruhen, insbesondere nicht für Schäden durch Rohrbruch, Überschwemmung oder sonstige höhere Gewalt. Die Haftung für Personenschäden bleibt hiervon unberührt.`,
}

// ============================================
// § SCHLUSSBESTIMMUNGEN
// ============================================
export const SCHLUSS_TEXTE = {
  schriftform: `Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform. Dies gilt auch für die Aufhebung dieses Schriftformerfordernisses.`,

  salvatorische_klausel: `Sollten einzelne Bestimmungen dieses Vertrages unwirksam sein oder werden, wird die Wirksamkeit der übrigen Bestimmungen davon nicht berührt. Die Vertragsparteien verpflichten sich, die unwirksame Bestimmung durch eine wirksame Regelung zu ersetzen, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.`,

  mehrfertigung: `Der Mietvertrag wird in zweifacher Ausfertigung erstellt. Jede Vertragspartei erhält eine Ausfertigung.`,

  anlagen: `Folgende Anlagen sind Bestandteil dieses Mietvertrags:
- Hausordnung
- Übergabeprotokoll
- Energieausweis (zur Kenntnisnahme)
- Betriebskostenaufstellung
- ggf. Grundriss der Wohnung`,

  belehrung: `Hinweis: Dieser Mietvertrag ist für beide Parteien verbindlich. Dem Mieter steht kein gesetzliches Widerrufsrecht zu. Vor Unterzeichnung wird empfohlen, den Vertrag sorgfältig zu prüfen und ggf. rechtlichen Rat einzuholen.`,
}

// ============================================
// HILFSFUNKTION: Text mit Platzhaltern füllen
// ============================================
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  let result = template
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
  }
  return result
}

// ============================================
// WICHTIGE BGB-PARAGRAPHEN REFERENZEN
// ============================================
export const BGB_REFERENZEN = {
  '§ 535': 'Inhalt und Hauptpflichten des Mietvertrags',
  '§ 536': 'Mietminderung bei Sach- und Rechtsmängeln',
  '§ 536c': 'Während der Mietzeit auftretende Mängel; Mängelanzeige',
  '§ 537': 'Entrichtung der Miete bei persönlicher Verhinderung des Mieters',
  '§ 540': 'Gebrauchsüberlassung an Dritte',
  '§ 543': 'Außerordentliche fristlose Kündigung aus wichtigem Grund',
  '§ 551': 'Begrenzung und Anlage von Mietsicherheiten',
  '§ 553': 'Gestattung der Gebrauchsüberlassung an Dritte',
  '§ 555a-f': 'Erhaltungs- und Modernisierungsmaßnahmen',
  '§ 556': 'Vereinbarungen über Betriebskosten',
  '§ 556a': 'Abrechnungsmaßstab für Betriebskosten',
  '§ 557': 'Mieterhöhungen nach Vereinbarung oder Gesetz',
  '§ 557a': 'Staffelmiete',
  '§ 557b': 'Indexmiete',
  '§ 558': 'Mieterhöhung bis zur ortsüblichen Vergleichsmiete',
  '§ 559': 'Mieterhöhung nach Modernisierungsmaßnahmen',
  '§ 566': 'Kauf bricht nicht Miete',
  '§ 568': 'Form und Inhalt der Kündigung',
  '§ 569': 'Außerordentliche fristlose Kündigung aus wichtigem Grund',
  '§ 573': 'Ordentliche Kündigung des Vermieters',
  '§ 573c': 'Fristen der ordentlichen Kündigung',
  '§ 574': 'Widerspruch des Mieters gegen die Kündigung',
  '§ 575': 'Zeitmietvertrag',
}
