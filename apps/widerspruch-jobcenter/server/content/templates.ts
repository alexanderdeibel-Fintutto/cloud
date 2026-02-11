// ══════════════════════════════════════════════════════════════
// Content-Templates – Bausteine für realistische Forum-Inhalte
// ══════════════════════════════════════════════════════════════

import type { ForumId, ContentTag } from '../personas/types'

// ── Post-Titel-Templates nach Forum ──

export const TITLE_TEMPLATES: Record<ForumId, string[]> = {
  'hilfe-bescheid': [
    'Bescheid falsch berechnet – {betrag}€ zu wenig?',
    'Kann jemand meinen Bescheid gegenchecken?',
    'Bewilligungsbescheid verstehen – was bedeutet {fachbegriff}?',
    'Neuer Bescheid nach Änderung – stimmt das so?',
    '{monat} Bescheid: Mehrbedarf nicht berücksichtigt',
    'Frage zum Regelsatz – bekomme ich zu wenig?',
    'Bescheid prüfen lassen – wo am besten?',
    'Nachberechnung nach {ereignis} – Fehler?',
    'Aufhebungsbescheid bekommen – HILFE!',
    'Erstantrag durch – Bescheid komisch',
    'Frage: Wird {leistung} bei euch auch so berechnet?',
    'Rückforderung {betrag}€ – Bescheid richtig?',
  ],
  'widerspruch': [
    'Widerspruch eingelegt – {wochen} Wochen keine Antwort',
    'UPDATE: Widerspruch gewonnen! {betrag}€ Nachzahlung!',
    'Widerspruch Vorlage – hat jemand eine?',
    'Wie formuliere ich den Widerspruch richtig?',
    'Mein Widerspruch wurde abgelehnt – was jetzt?',
    'Widerspruchsfrist verpasst – noch Chancen?',
    'Überprüfungsantrag nach §44 SGB X – Erfahrungen?',
    'Sozialgericht – lohnt sich die Klage?',
    'Anwalt für Sozialrecht in {stadt} gesucht',
    'Erfolg nach Widerspruch – so habe ich es gemacht',
    'Widerspruch wegen {thema} – Formulierungshilfe',
    'Eilantrag beim Sozialgericht – Erfahrungen?',
  ],
  'sanktionen': [
    'Sanktion wegen verpasstem Termin – was jetzt?',
    'Sanktion wegen {grund} – rechtmäßig?',
    'Kind krank, Termin verpasst → 10% Sanktion???',
    'Totalentzug angedroht – gibt es das noch?',
    'Meldeaufforderung nicht bekommen – trotzdem Sanktion',
    'Sanktion aufgehoben nach Widerspruch!',
    'Pflichtverletzung: {grund} – was soll ich tun?',
    'Seit Bürgergeld: Wie funktionieren Sanktionen jetzt?',
    'Kooperationsplan nicht unterschrieben – Konsequenzen?',
    'Wie beweise ich, dass ich krank war?',
  ],
  'kdu-miete': [
    'Mietobergrenze überschritten – Umzugsaufforderung!',
    'KdU in {stadt} – was wird anerkannt?',
    'Heizkosten komplett gestrichen – normal???',
    'Nebenkostennachzahlung – zahlt das Jobcenter?',
    'Muss ich in eine billigere Wohnung umziehen?',
    'Warmwasserpauschale – was steht mir zu?',
    'Renovierungskosten bei Auszug – wer zahlt?',
    'Wohnungssuche als Bürgergeld-Empfänger – ein Albtraum',
    'KdU-Richtlinie {stadt}: kennt die jemand?',
    'Betriebskostennachzahlung {betrag}€ – muss das Jobcenter zahlen?',
  ],
  'zuverdienst': [
    'Minijob 538€ – wie viel wird angerechnet?',
    'Freibetrag bei Zuverdienst – richtig berechnet?',
    'Selbstständig und Bürgergeld – geht das?',
    'Ehrenamtspauschale – wird die angerechnet?',
    'Einmaliges Einkommen – wie wird das berechnet?',
    'Praktikum im Bürgergeld – Anrechnung?',
    'Ferienjob der Kinder – wird das angerechnet??',
    '1-Euro-Job angeboten – muss ich das machen?',
  ],
  'erfolge': [
    'GEWONNEN! {betrag}€ Nachzahlung nach Widerspruch! 🎉',
    'Sozialgericht hat entschieden – FÜR MICH!',
    'Nach {monate} Monaten Kampf: Mehrbedarf bewilligt!',
    'Endlich raus aus dem Bürgergeld – so habe ich es geschafft',
    'Bescheid geprüft, Fehler gefunden, {betrag}€ zurück!',
    'Sanktion aufgehoben – danke an alle hier!',
    'Klage gewonnen – Jobcenter muss KdU voll zahlen!',
    'Update: Alles gut ausgegangen! Danke Community! ❤️',
  ],
  'auskotzen': [
    '3 STUNDEN gewartet und dann sowas...',
    'Sachbearbeiterin lacht mich aus – Ernsthaft?!',
    'Ich kann nicht mehr. Einfach nur noch frustriert.',
    'Das System ist KAPUTT. Punkt.',
    'Anruf beim JC: {anzahl} Minuten Warteschleife. Aufgelegt.',
    'Termin um 8 Uhr, drankommen um 11. Willkommen im JC.',
    'Schon wieder ein neuer Sachbearbeiter... der 5. in {zeit}!',
    'Post vom Jobcenter = instant Panik. Kennt ihr das?',
    'Fühle mich wie ein Mensch zweiter Klasse',
    'Warum behandeln die uns so? Ernsthaft???',
  ],
  'allgemeines': [
    'Bin neu hier – kurz vorstellen',
    'Danke an diese Community! ❤️',
    'Wie findet ihr das neue Bürgergeld-Gesetz?',
    'Sammelthread: Nützliche Links und Ressourcen',
    'Off-Topic: Wie geht es euch so?',
    'Tipp: Beratungsstellen in {stadt}',
    'Frage: Kennt jemand gute Infoseiten?',
    'Abstimmung: Was nervt euch am meisten?',
  ],
}

// ── Post-Content Bausteine ──

export const CONTENT_OPENERS: Record<string, string[]> = {
  frage: [
    'Hallo zusammen,\n\nich habe eine Frage und hoffe ihr könnt mir helfen.',
    'Hey, bin noch relativ neu hier und bräuchte mal eure Meinung.',
    'Moin Leute,\n\nkurze Frage an die Erfahrenen unter euch:',
    'Hallo in die Runde,\n\nfolgendes Problem:',
    'Hi, ich dreh gleich durch und brauch dringend Rat.',
  ],
  bericht: [
    'Wollte euch mal berichten, was bei mir passiert ist.',
    'Heute ist es passiert. Muss das einfach mal loswerden.',
    'Kurzes Update von mir:',
    'Also ich erzähl mal was mir heute/gestern passiert ist...',
  ],
  erfolg: [
    'LEUTE, ich muss euch das erzählen!!! 🎉',
    'Endlich mal gute Nachrichten von mir!',
    'UPDATE: Es hat geklappt!!!',
    'Ich kann es selbst kaum glauben, aber:',
  ],
  tipp: [
    'Kleiner Tipp für alle die das gleiche Problem haben:',
    'Hab was rausgefunden das euch vielleicht hilft:',
    'Für alle die sich fragen wie das geht – hier meine Erfahrung:',
  ],
  frust: [
    'Ich muss mich einfach mal auskotzen, sorry.',
    'ES REICHT. Ich bin so unfassbar wütend gerade.',
    'Leute ich kann nicht mehr. Ehrlich nicht.',
    'Was ist das bitte für ein System in dem wir leben?',
  ],
}

export const CONTENT_BODIES: Record<ForumId, string[]> = {
  'hilfe-bescheid': [
    'Ich habe gerade meinen Bescheid bekommen und irgendwas stimmt da nicht. Der Regelsatz ist {betrag}€ aber laut Tabelle müssten es {betrag2}€ sein. Hat jemand ähnliche Erfahrungen?',
    'Mein Bescheid vom {monat} zeigt {betrag}€ Gesamtleistung an. Ich habe {kinder} Kinder und bin alleinerziehend. Der Mehrbedarf für Alleinerziehende ist nicht aufgeführt. Ist das ein Fehler?',
    'Bin total verwirrt. Die haben meinen Bescheid geändert ohne Vorwarnung. Plötzlich {betrag}€ weniger im Monat. Kann die jemand erklären was "vorläufige Bewilligung" bedeutet?',
    'Habe den Bescheid jetzt dreimal gelesen und verstehe immer noch nicht warum die {betrag}€ für Heizkosten nicht übernommen werden. Wir heizen ganz normal!',
    'Nach meinem Umzug hat das JC die neuen Mietkosten nicht voll übernommen. Angeblich "unangemessen". Aber ich hatte vorher eine Zusicherung!',
  ],
  'widerspruch': [
    'Habe vor {wochen} Wochen Widerspruch eingelegt wegen falsch berechnetem Regelsatz. Bis heute keine Antwort. Ist das normal? Wie lange muss man warten?',
    'Mein Widerspruch wurde abgelehnt mit der Begründung "{grund}". Das kann doch nicht rechtens sein? Hat jemand Erfahrung mit Klagen vorm Sozialgericht?',
    'So Leute, kurzes Update: WIDERSPRUCH GEWONNEN! {betrag}€ Nachzahlung! Danke an alle die mir hier geholfen haben! Die Fehler im Bescheid waren: {fehler}.',
    'Bin am Überlegen ob ich Widerspruch einlegen soll. Es geht um {betrag}€ pro Monat. Lohnt sich das? Wie sind die Erfolgsaussichten?',
    'Hat jemand eine gute Vorlage für einen Widerspruch wegen {thema}? Will das selbst machen ohne Anwalt.',
  ],
  'sanktionen': [
    'Habe eine Sanktion bekommen weil ich angeblich einen Termin verpasst habe. Problem: Mein Kind war krank und ich habe VORHER angerufen! Die sagen jetzt ich hätte kein Attest gebracht.',
    'Die wollen mich sanktionieren weil ich eine "zumutbare Arbeit" nicht angenommen habe. Es war ein Minijob 40km entfernt, nur Nachtschicht. Mit Kindern unmöglich! Ist das überhaupt zumutbar?',
    'Frage: Seit dem Bürgergeld sind doch die Sanktionen geändert worden? Kann die immer noch 30% kürzen? Was ist das Maximum?',
    'Sanktion wegen nicht unterschriebener EGV. Aber die EGV enthielt Punkte die ich unmöglich erfüllen kann! 20 Bewerbungen pro Monat bei meiner Gesundheit??',
  ],
  'kdu-miete': [
    'Unsere Miete liegt {betrag}€ über der Angemessenheitsgrenze. Das Jobcenter sagt wir sollen umziehen. Aber wir finden NICHTS in der Preisklasse! Was tun?',
    'Die Heizkostennachzahlung von {betrag}€ wird nicht übernommen. Angeblich "unangemessen hoher Verbrauch". Wir heizen ganz normal, die Wohnung ist halt schlecht isoliert!',
    'Kurze Frage: Werden Betriebskostennachzahlungen vom Jobcenter übernommen? Habe {betrag}€ Nachzahlung bekommen.',
    'Hat jemand die aktuelle KdU-Richtlinie für {stadt}? Brauche die genauen Obergrenzen für {personen} Personen.',
  ],
  'zuverdienst': [
    'Ich arbeite im Minijob für 538€. Laut meiner Berechnung sollten {betrag}€ anrechnungsfrei sein. Das Jobcenter rechnet aber mehr an. Wer hat Recht?',
    'Frage: Mein Kind (16) hat einen Ferienjob. Wird das Einkommen auf unser Bürgergeld angerechnet? Das wäre ja absurd!',
    'Überlege mich selbständig zu machen (Kleinunternehmer). Hat jemand Erfahrung damit, wie das Jobcenter damit umgeht?',
  ],
  'erfolge': [
    'Nach {monate} Monaten Kampf habe ich es geschafft: {betrag}€ Nachzahlung!!! Der Fehler war dass der Mehrbedarf für {grund} nicht berechnet wurde.',
    'KLAGE GEWONNEN!!! Das Sozialgericht hat entschieden dass die KdU voll übernommen werden müssen. {betrag}€ pro Monat mehr! Wer kämpft kann gewinnen!',
    'Kleine Erfolgsgeschichte: Habe meinen Bescheid prüfen lassen und es stellte sich heraus dass {fehler}. Widerspruch eingelegt und innerhalb von {wochen} Wochen die Nachzahlung erhalten!',
  ],
  'auskotzen': [
    'Heute 3 Stunden im Jobcenter gewartet. DREI STUNDEN. Termin war um 9. Drankommen um 12. Und dann sagt die Sachbearbeiterin mir: "Oh, ich bin nicht zuständig, Sie müssen einen neuen Termin machen."',
    'Schon wieder neuer Sachbearbeiter. Der 4. in {monate} Monaten. Jedes Mal alles von vorne erklären. Die kennen meine Akte nicht, fragen Sachen die drin stehen, und am Ende kommt trotzdem ein falscher Bescheid.',
    'Heute Post vom Jobcenter bekommen. Herz rast sofort. Ist das normal dass man Panikattacken kriegt wenn man den Briefkasten aufmacht? Ich kann so nicht mehr leben.',
    'Die Sachbearbeiterin hat mich heute behandelt als wäre ich ein Verbrecher. Ich sitze da, alleinerziehend, suche Hilfe – und die redet mit mir wie mit einem ungezogenen Kind. Wo ist da die Würde?',
  ],
  'allgemeines': [
    'Hey, bin neu hier und wollte mich kurz vorstellen. Bin {alter} Jahre alt, aus {stadt}, und seit {seit} im Bürgergeld. Freue mich auf den Austausch!',
    'Wollte einfach mal DANKE sagen an diese Community. Ohne euch hätte ich meinen letzten Bescheid einfach hingenommen. Ihr seid Gold wert!',
    'Was haltet ihr von den neuen Änderungen beim Bürgergeld ab 2026? Ich habe gehört dass {thema}. Stimmt das?',
  ],
}

// ── BescheidBoxer Mention Templates (natürlich, nicht werblich!) ──

export const BESCHEIDBOXER_MENTIONS = {
  beilaeufig: [
    'Hab meinen Bescheid dann online prüfen lassen bei bescheidboxer.de und tatsächlich waren {betrag}€ zu wenig berechnet.',
    'Ein Kumpel hat mir bescheidboxer.de empfohlen. Hab meinen Bescheid da mal durchgejagt und direkt {anzahl} Fehler gefunden.',
    'Seit ich meine Bescheide über bescheidboxer.de prüfe, hab ich schon {anzahl}x erfolgreich Widerspruch eingelegt.',
    'hab letztens so nen online-tool gefunden, bescheidboxer.de oder so. hat mir echt geholfen den fehler zu finden.',
  ],
  antwort_auf_frage: [
    'Versuch mal bescheidboxer.de – da kannst du deinen Bescheid kostenlos prüfen lassen. Hat bei mir auch funktioniert.',
    'Guck mal auf bescheidboxer.de, die checken Bescheide automatisch. Hab damit {betrag}€ Differenz gefunden.',
    'Mein Tipp: Jeden neuen Bescheid erstmal durch bescheidboxer.de jagen. Kostet nix und spart viel Ärger.',
    'Kennt ihr bescheidboxer.de? Da kann man seinen Bescheid prüfen lassen. Ich nutze das seit {monate} Monaten und bin echt zufrieden.',
  ],
  erfolgsgeschichte: [
    'Der Widerspruch hat geklappt! Hab die Fehler mit bescheidboxer.de gefunden. {betrag}€ Nachzahlung! Kann ich nur empfehlen.',
    'Update: bescheidboxer.de hat 2 Fehler in meinem Bescheid gefunden. Widerspruch eingelegt → {betrag}€ Nachzahlung! 🎉',
    'Dank bescheidboxer.de hab ich gemerkt dass der Mehrbedarf fehlte. {betrag}€ pro Monat mehr seit dem Widerspruch!',
  ],
  skeptisch_dann_ueberzeugt: [
    'War erst skeptisch wegen bescheidboxer.de, aber hab\'s dann doch probiert. Ergebnis: {betrag}€ falsch berechnet. Hätte ich ohne das Tool nie gemerkt.',
    'Ich geb zu, ich war skeptisch. Aber bescheidboxer.de hat tatsächlich einen Fehler gefunden den ich übersehen hatte. Respekt.',
  ],
  kurz: [
    '+1 für bescheidboxer.de, hat mir auch geholfen!',
    'bescheidboxer.de ist Gold wert! 👍',
    'Kann bescheidboxer.de bestätigen, hat bei mir auch Fehler gefunden.',
    'Nutze bescheidboxer.de seit Monaten, kann ich nur empfehlen.',
  ],
  verweis_auf_andere_tools: [
    'Auf bescheidboxer.de gibt\'s auch nen Widerspruchsgenerator, falls du den brauchst.',
    'Checkt auch mal kdu-checker.de für die Mietobergrenzen und bescheidboxer.de für den Bescheid insgesamt.',
    'bescheidboxer.de für den Bescheid, mehrbedarf-rechner.de für den Mehrbedarf – beides kostenlos und hilfreich.',
  ],
}

// ── Kommentar-Templates ──

export const COMMENT_TEMPLATES = {
  empathie: [
    'Das kenne ich nur zu gut... Kopf hoch!',
    'Oh man, das tut mir leid. Bist du nicht allein damit. ❤️',
    'Fühl dich gedrückt. Wir sitzen alle im selben Boot.',
    'Kann ich total nachvollziehen. Ging mir genauso.',
    'Das ist echt heftig. Halte durch!',
  ],
  rat: [
    'Du musst innerhalb von 4 Wochen Widerspruch einlegen, sonst wird der Bescheid bestandskräftig!',
    'Wichtig: Immer alles SCHRIFTLICH machen. Mündliche Zusagen gelten nicht.',
    'Hol dir Hilfe bei einer Sozialberatungsstelle. Die machen das kostenlos.',
    'Geh auf keinen Fall alleine zum Termin. Nimm immer einen Beistand mit!',
    'Tipp: Kopie von allem machen was du beim JC abgibst. Eingangsbestätigung verlangen!',
  ],
  frage: [
    'Hast du den Bescheid schon prüfen lassen?',
    'Wie hoch ist denn der Unterschied genau?',
    'Seit wann beziehst du Bürgergeld?',
    'Hast du Kinder? Das kann den Anspruch ändern.',
    'In welcher Stadt bist du? Die KdU sind überall anders.',
  ],
  zustimmung: [
    'Genauso ist es!',
    'Da geb ich dir 100% Recht.',
    'Unterschreibe ich sofort.',
    'Exakt das Problem!',
    'Absolut. Sehe ich genauso.',
  ],
  rechtlich: [
    'Nach §31 SGB II ist die Sanktion nur unter bestimmten Bedingungen zulässig.',
    'Laut BSG-Urteil vom {datum} muss das Jobcenter in solchen Fällen...',
    'Das verstößt gegen den Gleichheitsgrundsatz (Art. 3 GG).',
    'Hinweis: Seit der Bürgergeld-Reform gelten andere Regeln für Sanktionen.',
    'Nach §22 Abs. 1 SGB II müssen die tatsächlichen Kosten der Unterkunft übernommen werden, solange sie angemessen sind.',
  ],
  danke: [
    'Danke für den Tipp! Werde ich sofort machen.',
    'Super hilfreich, vielen Dank! 🙏',
    'Das hat mir echt weitergeholfen, danke!',
    'Danke an alle die hier helfen. Ihr seid toll!',
  ],
  update: [
    'UPDATE: Hat geklappt! {betrag}€ Nachzahlung!',
    'Wollte nur kurz Bescheid geben: Widerspruch wurde stattgegeben!',
    'Update für alle: Die Sache hat sich geklärt. Danke an alle!',
  ],
}

// ── Variablen-Pools zum Einsetzen in Templates ──

export const TEMPLATE_VARS = {
  betrag: ['87','120','145','213','267','340','410','520','650','780','890','1.050','1.200','1.450','87,50','134,80','267,40','523,60'],
  betrag2: ['563','502','471','563','602','752','451','357'],
  wochen: ['2','3','4','6','8','10','12'],
  monate: ['2','3','4','5','6','8','10','12'],
  anzahl: ['2','3','4','5'],
  monat: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
  stadt: ['Berlin','Hamburg','München','Köln','Dortmund','Leipzig','Dresden','Frankfurt','Essen','Bremen','Hannover','Nürnberg'],
  kinder: ['1','2','3'],
  personen: ['1','2','3','4','5'],
  fachbegriff: ['vorläufige Bewilligung','Erstattungsforderung','Leistungszeitraum','Angemessenheitsgrenze','Kosten der Unterkunft','Mehrbedarf','Regelbedarfsstufe'],
  grund: ['nicht zur Maßnahme erschienen','Stellenangebot abgelehnt','EGV nicht unterschrieben','fehlende Mitwirkung','Meldeversäumnis','verspätete Vorlage'],
  fehler: ['Mehrbedarf für Alleinerziehende nicht berücksichtigt','Heizkosten falsch berechnet','Einkommen zu hoch angesetzt','KdU nicht vollständig übernommen','Freibetrag falsch berechnet'],
  thema: ['Mehrbedarf','KdU','Heizkosten','Sanktion','Einkommen','Regelsatz','Umzug','Bildungspaket'],
  ereignis: ['Geburt','Trennung','Umzug','Jobverlust','Gehaltsänderung'],
  leistung: ['Mehrbedarf','Heizkosten','KdU','Bildungspaket'],
  zeit: ['6 Monaten','einem Jahr','2 Jahren'],
  alter: ['24','28','32','36','41','45','52','58'],
  seit: ['2024','Anfang 2025','letztem Herbst','3 Monaten','einem halben Jahr'],
  datum: ['14.02.2024','03.05.2023','21.11.2024','08.01.2025'],
}

/**
 * Ersetzt {variable} Platzhalter in Templates durch zufällige Werte
 */
export function fillTemplate(template: string, rng: () => number): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const pool = TEMPLATE_VARS[key as keyof typeof TEMPLATE_VARS]
    if (!pool) return `{${key}}`
    return pool[Math.floor(rng() * pool.length)]
  })
}
