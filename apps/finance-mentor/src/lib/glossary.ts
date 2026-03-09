/**
 * Financial glossary – German definitions for common financial terms.
 */

export interface GlossaryEntry {
  term: string;
  definition: string;
  category: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  // Grundlagen
  { term: "Aktie", definition: "Ein Wertpapier, das einen Anteil an einem Unternehmen repraesentiert. Als Aktionaer bist du Mitinhaber und profitierst von Kurssteigerungen und Dividenden.", category: "Grundlagen" },
  { term: "Anleihe", definition: "Ein Wertpapier, mit dem du einem Staat oder Unternehmen Geld leihst. Im Gegenzug erhaeltst du regelmaessige Zinszahlungen und am Ende der Laufzeit dein Kapital zurueck.", category: "Grundlagen" },
  { term: "Brutto / Netto", definition: "Brutto ist der Gesamtbetrag vor Abzuegen (Steuern, Sozialabgaben). Netto ist das, was tatsaechlich auf deinem Konto landet.", category: "Grundlagen" },
  { term: "Diversifikation", definition: "Die Verteilung deines Kapitals auf verschiedene Anlageklassen, Regionen und Branchen, um das Risiko zu reduzieren. 'Nicht alle Eier in einen Korb legen.'", category: "Grundlagen" },
  { term: "Inflation", definition: "Der allgemeine Anstieg des Preisniveaus ueber die Zeit. Bei 3% Inflation kostet etwas, das heute 100 Euro kostet, naechstes Jahr 103 Euro. Dein Geld verliert an Kaufkraft.", category: "Grundlagen" },
  { term: "Liquiditaet", definition: "Wie schnell du einen Vermoegenswert in Bargeld umwandeln kannst. Aktien sind liquide (sofort verkaufbar), Immobilien sind illiquide (Verkauf dauert Monate).", category: "Grundlagen" },
  { term: "Rendite", definition: "Der Ertrag einer Geldanlage, meist als Prozentsatz pro Jahr angegeben. Eine Rendite von 7% bedeutet: Aus 10.000 Euro werden in einem Jahr 10.700 Euro.", category: "Grundlagen" },
  { term: "Volatilitaet", definition: "Das Mass fuer die Schwankungsbreite eines Wertpapiers. Hohe Volatilitaet = grosse Kursschwankungen. Oft als Risikomass verwendet.", category: "Grundlagen" },
  { term: "Zinseszins", definition: "Zinsen, die auf bereits erhaltene Zinsen gezahlt werden. Der Effekt beschleunigt das Vermoegenswachstum exponentiell ueber lange Zeitraeume.", category: "Grundlagen" },

  // ETFs & Fonds
  { term: "ETF", definition: "Exchange Traded Fund – ein boersengehandelter Fonds, der einen Index (z.B. MSCI World) nachbildet. ETFs bieten breite Diversifikation zu niedrigen Kosten.", category: "ETFs & Fonds" },
  { term: "TER", definition: "Total Expense Ratio – die jaehrlichen Gesamtkosten eines ETFs oder Fonds in Prozent. Ein ETF mit 0,2% TER kostet bei 10.000 Euro Anlage 20 Euro pro Jahr.", category: "ETFs & Fonds" },
  { term: "Thesaurierend", definition: "Ein thesaurierender ETF/Fonds reinvestiert Ertraege (Dividenden, Zinsen) automatisch. Das Gegenteil ist 'ausschuettend', wo Ertraege an dich ausgezahlt werden.", category: "ETFs & Fonds" },
  { term: "MSCI World", definition: "Ein Index, der ca. 1.500 Unternehmen aus 23 Industrielaendern abbildet. Einer der beliebtesten Indizes fuer breit gestreutes Investieren.", category: "ETFs & Fonds" },
  { term: "Sparplan", definition: "Eine automatische, regelmaessige Investition (z.B. 200 Euro/Monat in einen ETF). Sparplaene nutzen den Cost-Average-Effekt und entfernen Emotionen.", category: "ETFs & Fonds" },
  { term: "Tracking Difference", definition: "Die Abweichung zwischen der Rendite eines ETFs und seinem Referenzindex. Eine negative TD bedeutet, der ETF war sogar besser als der Index.", category: "ETFs & Fonds" },
  { term: "Rebalancing", definition: "Die regelmaessige Wiederherstellung der urspruenglichen Gewichtung im Portfolio. Wenn Aktien stark steigen, verkaufst du einen Teil und kaufst Anleihen nach.", category: "ETFs & Fonds" },

  // Investieren
  { term: "Asset Allocation", definition: "Die Aufteilung deines Vermoegens auf verschiedene Anlageklassen (Aktien, Anleihen, Immobilien, Cash). Die wichtigste Entscheidung fuer deinen Anlageerfolg.", category: "Investieren" },
  { term: "Bull Market / Bear Market", definition: "Bull Market = steigende Kurse (Bullen stossen nach oben). Bear Market = fallende Kurse ueber 20% (Baeren schlagen nach unten). Beides ist normal.", category: "Investieren" },
  { term: "Cost-Average-Effekt", definition: "Durch regelmaessiges Investieren eines festen Betrags kaufst du bei niedrigen Kursen mehr Anteile und bei hohen weniger. Das glaettet den durchschnittlichen Einstiegskurs.", category: "Investieren" },
  { term: "Dividende", definition: "Ein Teil des Unternehmensgewinns, der an Aktionaere ausgezahlt wird. Typische Dividendenrenditen liegen bei 2-5% pro Jahr.", category: "Investieren" },
  { term: "KGV (Kurs-Gewinn-Verhaeltnis)", definition: "Der Aktienkurs geteilt durch den Gewinn pro Aktie. Ein KGV von 15 bedeutet: Du zahlst das 15-fache des Jahresgewinns. Niedrig = guenstig, hoch = teuer (vereinfacht).", category: "Investieren" },
  { term: "Market Timing", definition: "Der Versuch, den besten Zeitpunkt zum Kaufen oder Verkaufen vorherzusagen. Studien zeigen: Es funktioniert langfristig fast nie – Time IN the market schlaegt Timing THE market.", category: "Investieren" },
  { term: "Ordertypen", definition: "Market Order = sofort zum aktuellen Kurs kaufen/verkaufen. Limit Order = nur zu einem bestimmten Preis oder besser. Stop-Loss = automatisch verkaufen, wenn ein Kurs unterschritten wird.", category: "Investieren" },

  // Psychologie
  { term: "Ankereffekt", definition: "Die Tendenz, sich zu stark an einer ersten Zahl zu orientieren. Wenn eine Aktie mal 100 Euro wert war, fuehlen sich 70 Euro 'guenstig' an – unabhaengig vom tatsaechlichen Wert.", category: "Psychologie" },
  { term: "Confirmation Bias", definition: "Die Tendenz, nur Informationen wahrzunehmen, die die eigene Meinung bestaetigen. Wer bullisch auf eine Aktie ist, ignoriert Warnzeichen.", category: "Psychologie" },
  { term: "FOMO", definition: "Fear Of Missing Out – die Angst, eine Gelegenheit zu verpassen. Treibt Anleger dazu, in ueberhitzte Maerkte einzusteigen, oft nahe am Hoch.", category: "Psychologie" },
  { term: "Herdentrieb", definition: "Die Tendenz, dem Verhalten der Masse zu folgen. Wenn alle kaufen, kaufen wir auch – wenn alle panisch verkaufen, verkaufen wir auch. Selten eine gute Strategie.", category: "Psychologie" },
  { term: "Sunk-Cost-Fallacy", definition: "Der Fehler, an einer Investition festzuhalten, weil man bereits viel investiert hat – obwohl es rational waere, den Verlust zu akzeptieren und umzuschichten.", category: "Psychologie" },
  { term: "Verlustaversion", definition: "Der psychologische Effekt, dass Verluste ca. doppelt so stark empfunden werden wie gleich grosse Gewinne. Fuehrt dazu, Verlust-Aktien zu lange zu halten.", category: "Psychologie" },

  // Persoenliche Finanzen
  { term: "Notgroschen", definition: "Eine Geldreserve fuer unvorhergesehene Ausgaben. Empfohlen: 3-6 Monatsausgaben auf einem Tagesgeldkonto. Das Fundament jeder Finanzplanung.", category: "Persoenliche Finanzen" },
  { term: "50-30-20-Regel", definition: "Ein Budget-Modell: 50% fuer Beduerfnisse (Miete, Essen), 30% fuer Wuensche (Freizeit, Shopping), 20% fuer Sparen und Investieren.", category: "Persoenliche Finanzen" },
  { term: "Berufsunfaehigkeitsversicherung (BU)", definition: "Versichert dein Einkommen, falls du aus gesundheitlichen Gruenden deinen Beruf nicht mehr ausueben kannst. Eine der wichtigsten Versicherungen fuer Arbeitnehmer.", category: "Persoenliche Finanzen" },
  { term: "Dispositionskredit", definition: "Die Ueberziehungsmoeglichkeit deines Girokontos. Mit typisch 10-15% Zinsen eine der teuersten Kreditformen – sofort abloesen, wenn moeglich.", category: "Persoenliche Finanzen" },
  { term: "Freistellungsauftrag", definition: "Erlaubt dir, Kapitalertraege bis 1.000 Euro (Einzelperson) bzw. 2.000 Euro (Paare) steuerfrei zu vereinnahmen. Bei deiner Bank einrichten!", category: "Persoenliche Finanzen" },
  { term: "Haftpflichtversicherung", definition: "Schuetzt dich, wenn du anderen Schaden zufuegst. In Deutschland haftest du unbegrenzt mit deinem Vermoegen. Kostet ca. 50-80 Euro/Jahr – ein Muss.", category: "Persoenliche Finanzen" },
  { term: "Riester-Rente", definition: "Eine staatlich gefoerderte private Altersvorsorge in Deutschland. Attraktiv vor allem fuer Familien und Geringverdiener durch Zulagen und Steuervorteile.", category: "Persoenliche Finanzen" },

  // Steuern
  { term: "Abgeltungssteuer", definition: "Die pauschale Steuer auf Kapitalertraege in Deutschland: 25% plus Soli und ggf. Kirchensteuer. Wird automatisch von Banken und Brokern abgefuehrt.", category: "Steuern" },
  { term: "Sparerpauschbetrag", definition: "Der jaehrliche Freibetrag fuer Kapitalertraege: 1.000 Euro (Einzelperson) bzw. 2.000 Euro (Paare). Ertraege bis zu dieser Grenze sind steuerfrei.", category: "Steuern" },
  { term: "EUeR", definition: "Einnahmen-Ueberschuss-Rechnung – die einfachste Form der Gewinnermittlung fuer Selbststaendige und Freiberufler. Einnahmen minus Ausgaben = Gewinn.", category: "Steuern" },
  { term: "Progressiver Steuersatz", definition: "In Deutschland steigt der Steuersatz mit dem Einkommen von 14% bis 45%. Aber: Jeder Euro wird nur mit dem Satz seiner Stufe besteuert (Grenzsteuersatz).", category: "Steuern" },

  // Krypto
  { term: "Blockchain", definition: "Eine dezentrale, faelschungssichere Datenbank. Transaktionen werden in 'Bloecken' gespeichert und miteinander verkettet. Die Technologie hinter Bitcoin und anderen Kryptowaehrungen.", category: "Krypto" },
  { term: "Bitcoin", definition: "Die erste und groesste Kryptowaehrung (seit 2009). Maximalmenge: 21 Millionen Stueck. Wird als 'digitales Gold' und Wertspeicher diskutiert.", category: "Krypto" },
  { term: "Wallet", definition: "Eine digitale 'Geldboerse' fuer Kryptowaehrungen. Es gibt Hot Wallets (online, bequem) und Cold Wallets (offline, sicherer). 'Not your keys, not your coins.'", category: "Krypto" },
  { term: "DeFi", definition: "Decentralized Finance – Finanzdienstleistungen (Kredite, Zinsen, Handel) auf der Blockchain, ohne Banken als Mittelsmaenner.", category: "Krypto" },
  { term: "Staking", definition: "Das Halten und 'Sperren' von Kryptowaehrungen zur Unterstuetzung eines Blockchain-Netzwerks. Dafuer erhaeltst du Belohnungen – aehnlich wie Zinsen.", category: "Krypto" },
];

export const GLOSSARY_CATEGORIES = [...new Set(GLOSSARY.map((g) => g.category))];
