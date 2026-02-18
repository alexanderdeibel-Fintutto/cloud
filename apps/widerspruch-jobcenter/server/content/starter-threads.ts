// ══════════════════════════════════════════════════════════════
// Starter-Threads: Eröffnungs-Beiträge für alle 8 Foren
// Authentische, natürlich klingende Posts als Seed-Content
// ══════════════════════════════════════════════════════════════

export interface StarterThread {
  forum_id: string
  forum_label: string
  title: string
  body: string
  persona_hint: string // Welche Art Persona passt
  situation: string    // Matching situation type
  posted?: boolean
}

export const STARTER_THREADS: StarterThread[] = [

  // ── Hilfe Bescheid ──

  {
    forum_id: 'hilfe-bescheid',
    forum_label: 'Hilfe Bescheid',
    title: 'Bescheid bekommen aber verstehe die Berechnung nicht??',
    body: `Hallo zusammen,

hab heute meinen Bescheid bekommen und blicke null durch. Da stehen irgendwelche Beträge drin die hinten und vorne nicht stimmen können.

Regelbedarf steht 563€ aber dann ziehen die mir was ab wegen "Einkommen aus geringfügiger Beschäftigung" obwohl ich nur 200€ auf Minijob verdiene. Am Ende bleiben nur 480€ übrig??

Hat jemand Ahnung wie die das berechnen? Darf das Jobcenter einfach so viel abziehen?

Bin echt verzweifelt gerade...`,
    persona_hint: 'Neubezieher, verunsichert',
    situation: 'neubezieher',
  },
  {
    forum_id: 'hilfe-bescheid',
    forum_label: 'Hilfe Bescheid',
    title: 'Weiterbewilligungsantrag – Bescheid kommt nicht',
    body: `Moin,

hab vor 5 Wochen meinen Weiterbewilligungsantrag abgegeben und warte immer noch auf den Bescheid. Nächste Woche müsste eigentlich Geld kommen aber ich hab noch nix schriftliches.

Ist das normal dass die so lange brauchen? Was mach ich wenn das Geld nicht kommt?

Beim Jobcenter erreicht man ja auch keinen am Telefon, bin schon total genervt.

Danke für eure Hilfe!`,
    persona_hint: 'Langzeitbezieher, pragmatisch',
    situation: 'langzeitbezieher',
  },
  {
    forum_id: 'hilfe-bescheid',
    forum_label: 'Hilfe Bescheid',
    title: 'Aufhebungsbescheid wegen Umzug – ist das rechtens?',
    body: `Hi,

ich bin letzten Monat in eine andere Stadt gezogen (anderes Jobcenter zuständig) und jetzt hab ich einen Aufhebungsbescheid vom alten Jobcenter bekommen. Die wollen 2 Monate Leistungen zurück haben??

Ich hab doch alles ordnungsgemäß gemeldet und beim neuen Jobcenter auch direkt Antrag gestellt. Trotzdem soll ich jetzt über 1100€ zurückzahlen.

Kann das stimmen? Hat jemand ähnliches erlebt?`,
    persona_hint: 'Single, kämpferisch',
    situation: 'single',
  },

  // ── Widerspruch ──

  {
    forum_id: 'widerspruch',
    forum_label: 'Widerspruch',
    title: 'Widerspruch einlegen – wie formuliere ich das?',
    body: `Hallo,

mein Bescheid ist definitiv falsch berechnet. Mir fehlen ca. 85€ pro Monat. Jetzt will ich Widerspruch einlegen aber weiß nicht genau wie ich das formulieren soll.

Muss ich da juristisch korrekt schreiben oder reicht es wenn ich sage was falsch ist? Und wohin schicke ich das – an die Adresse die auf dem Bescheid steht?

Ach ja und ich hab gelesen man hat nur 4 Wochen Zeit. Bescheid ist vom 28. Januar, also muss ich mich beeilen oder?

Bin für jeden Tipp dankbar.`,
    persona_hint: 'Alleinerziehend, pragmatisch',
    situation: 'alleinerziehend',
  },
  {
    forum_id: 'widerspruch',
    forum_label: 'Widerspruch',
    title: 'Widerspruch abgelehnt – was jetzt? Klage?',
    body: `So Leute, mein Widerspruch wurde abgelehnt. Widerspruchsbescheid ist heute gekommen.

Es ging um die Übernahme meiner Heizkosten. Die wollen nur einen "angemessenen" Betrag zahlen aber meine Wohnung ist halt ein Altbau und die Heizkosten sind höher. Ich kann ja nix dafür.

Im Widerspruchsbescheid steht ich kann innerhalb eines Monats Klage beim Sozialgericht erheben. Hat das schon mal jemand gemacht? Brauche ich dafür einen Anwalt? Kostet das was?

Irgendwie hab ich Angst davor aber es geht um 120€ pro Monat, das ist schon viel Geld.`,
    persona_hint: 'Langzeitbezieher, kämpferisch',
    situation: 'langzeitbezieher',
  },
  {
    forum_id: 'widerspruch',
    forum_label: 'Widerspruch',
    title: 'Erfahrung mit Widerspruch – 3 Monate keine Antwort',
    body: `Wollte mal fragen ob das normal ist...

Hab im November Widerspruch eingelegt wegen falscher Anrechnung von Kindergeld. Seitdem: NICHTS. Keine Antwort, kein Bescheid, nichtmal eine Eingangsbestätigung.

Auf Nachfrage am Telefon hieß es nur "das ist in Bearbeitung". Das war vor 6 Wochen.

Wie lange darf sich das Jobcenter dafür Zeit lassen? Gibt es da Fristen?`,
    persona_hint: 'Paar mit Kindern, frustriert',
    situation: 'paar_mit_kindern',
  },

  // ── Sanktionen ──

  {
    forum_id: 'sanktionen',
    forum_label: 'Sanktionen',
    title: 'Sanktion weil ich einen Termin verpasst habe – 10% Kürzung',
    body: `Mir wurde eine Sanktion angedroht weil ich angeblich einen Termin beim Jobcenter verpasst habe. Aber ich hab die Einladung erst NACH dem Termin im Briefkasten gehabt!

Der Brief war vom Montag, der Termin am Mittwoch. Ich hab den Brief aber erst Donnerstag bekommen. Wie soll das bitte gehen??

Jetzt sollen mir 10% gekürzt werden. Das sind über 56€ die mir fehlen. Kann ich dagegen vorgehen?`,
    persona_hint: 'Neubezieher, verunsichert',
    situation: 'neubezieher',
  },
  {
    forum_id: 'sanktionen',
    forum_label: 'Sanktionen',
    title: 'Maßnahme abgebrochen – droht mir jetzt eine Sanktion?',
    body: `Hallo,

ich war in so einer Maßnahme vom Jobcenter (Bewerbungstraining). Hab die nach 2 Wochen abgebrochen weil es einfach nur Zeitverschwendung war. Da lernt man nix was man nicht schon weiß.

Jetzt hat mein Sachbearbeiter gesagt es könnte eine Sanktion geben weil ich die Maßnahme eigenmächtig abgebrochen hab.

Stimmt das? Wie hoch wäre die Sanktion? Und was ist wenn ich gesundheitliche Gründe hatte (ich hab Rückenprobleme und konnte nicht 8 Stunden auf dem harten Stuhl sitzen)?`,
    persona_hint: 'Langzeitbezieher, pragmatisch',
    situation: 'langzeitbezieher',
  },
  {
    forum_id: 'sanktionen',
    forum_label: 'Sanktionen',
    title: 'Totalsanktion nach Bürgergeld-Reform – gibts das noch?',
    body: `kurze frage: seit dem bürgergeld-gesetz 2023 gibts doch keine totalsanktionen mehr oder? mein sachbearbeiter hat mir letztens gesagt wenn ich nochmal nen termin verpasse wird mir alles gestrichen. das kann doch nicht stimmen??

was ist das maximum was die kürzen dürfen?`,
    persona_hint: 'Single, verunsichert',
    situation: 'single',
  },

  // ── KdU / Miete ──

  {
    forum_id: 'kdu-miete',
    forum_label: 'KdU / Miete',
    title: 'Miete "unangemessen" – Aufforderung zum Umzug',
    body: `Hab ein Schreiben vom Jobcenter bekommen dass meine Miete "unangemessen hoch" sei und ich mich um eine günstigere Wohnung bemühen soll. Frist: 6 Monate.

Meine Miete ist 650€ warm für 65qm in Köln. Das ist doch für Köln absolut normal?! Wo soll ich denn billiger wohnen?

Die "angemessene" Miete laut Jobcenter wäre 540€. In Köln. Haha.

Hat jemand Erfahrung damit? Muss ich wirklich umziehen oder kann ich das irgendwie verhindern? Meine Kinder gehen hier in die Schule, ich will auf keinen Fall umziehen.`,
    persona_hint: 'Alleinerziehend, kämpferisch',
    situation: 'alleinerziehend',
  },
  {
    forum_id: 'kdu-miete',
    forum_label: 'KdU / Miete',
    title: 'Nebenkostennachzahlung – übernimmt das Jobcenter?',
    body: `Ich hab eine Nebenkostennachzahlung von 380€ bekommen. Gas ist halt teuer geworden letztes Jahr.

Übernimmt das Jobcenter sowas? Hab ich gehört dass die das zahlen müssen wenn man im Leistungsbezug ist. Aber muss ich das extra beantragen?

Die Frist zur Zahlung ist in 2 Wochen und ich hab das Geld definitiv nicht.`,
    persona_hint: 'Single, verunsichert',
    situation: 'single',
  },
  {
    forum_id: 'kdu-miete',
    forum_label: 'KdU / Miete',
    title: 'Kaution für neue Wohnung – zahlt Jobcenter?',
    body: `Habe endlich eine bezahlbare Wohnung gefunden aber brauch 3 Monatsmieten Kaution. Das sind 1.350€. Die hab ich natürlich nicht.

Kann ich beim Jobcenter beantragen dass die die Kaution als Darlehen übernehmen? Wie läuft das ab – muss ich das VOR der Unterschrift machen oder danach?

Vermieter will morgen Bescheid wissen ob ich nehme. Zeitdruck halt mal wieder...`,
    persona_hint: 'Neubezieher, pragmatisch',
    situation: 'neubezieher',
  },

  // ── Zuverdienst ──

  {
    forum_id: 'zuverdienst',
    forum_label: 'Zuverdienst',
    title: 'Minijob und Bürgergeld – wie viel darf ich behalten?',
    body: `Habe ein Angebot für einen Minijob bekommen (520€/Monat). Jetzt frage ich mich wie viel davon beim Jobcenter angerechnet wird.

Ich hab gelesen die ersten 100€ sind frei und vom Rest darf man 20% behalten. Stimmt das so?

Lohnt sich das überhaupt oder arbeite ich dann quasi für nichts? Wäre mein erster Job seit 2 Jahren, würde eigentlich gerne.`,
    persona_hint: 'Langzeitbezieher, pragmatisch',
    situation: 'langzeitbezieher',
  },
  {
    forum_id: 'zuverdienst',
    forum_label: 'Zuverdienst',
    title: 'Selbständig und Bürgergeld – geht das?',
    body: `Hallo,

ich mache nebenbei ein bisschen Webdesign (Freelance). Manchmal verdiene ich 200€ im Monat, manchmal 800€, manchmal nichts.

Wie wird das beim Jobcenter angerechnet? Muss ich jede Rechnung melden? Und was ist mit Betriebsausgaben (Laptop, Software etc.) – werden die vorher abgezogen?

Mein Sachbearbeiter ist da nicht wirklich hilfreich, der sagt nur ich soll alles melden und die rechnen das dann aus...`,
    persona_hint: 'Single, pragmatisch',
    situation: 'aufstocker',
  },

  // ── Erfolge ──

  {
    forum_id: 'erfolge',
    forum_label: 'Erfolge',
    title: 'Widerspruch gewonnen – 640€ nachgezahlt bekommen!',
    body: `Muss ich hier mal loswerden: HAB GEWONNEN!

Im September hab ich Widerspruch eingelegt weil das Jobcenter meinen Mehrbedarf als Alleinerziehende nicht anerkannt hat. Die haben einfach behauptet ich hätte kein Recht drauf obwohl ich 2 Kinder alleine großziehe.

Hab mich dann informiert, Widerspruch geschrieben mit Verweis auf §21 Abs. 3 SGB II. Und jetzt: Nachzahlung von 640€ für 4 Monate!

Leute, IMMER den Bescheid prüfen. Die machen ständig Fehler, ob absichtlich oder nicht sei mal dahingestellt.

Nie aufgeben!`,
    persona_hint: 'Alleinerziehend, kämpferisch, positiv',
    situation: 'alleinerziehend',
  },
  {
    forum_id: 'erfolge',
    forum_label: 'Erfolge',
    title: 'Nach 3 Jahren endlich raus aus Bürgergeld',
    body: `Wollte euch nur kurz berichten: Hab nach 3 Jahren Bürgergeld endlich einen festen Job gefunden! Sachbearbeitung in der Verwaltung, unbefristet.

Der Weg war nicht einfach. Hab zwei Maßnahmen über mich ergehen lassen, unzählige Bewerbungen geschrieben, wurde sanktioniert weil ich mal einen Termin verpasst hab. Aber jetzt ist es geschafft.

Was mir am meisten geholfen hat: Nicht aufgeben und sich bei anderen Betroffenen informieren. In diesem Forum hab ich viele hilfreiche Tipps bekommen.

Allen die noch drin stecken: Es geht weiter, auch wenn es manchmal nicht so aussieht. Haltet durch!`,
    persona_hint: 'Langzeitbezieher, positiv, warmherzig',
    situation: 'langzeitbezieher',
  },
  {
    forum_id: 'erfolge',
    forum_label: 'Erfolge',
    title: 'Sozialgericht hat mir Recht gegeben! Heizkosten voll übernommen',
    body: `Kurzes Update zu meinem Fall: Ich hatte hier mal geschrieben dass das JC meine Heizkosten nur teilweise übernimmt. Widerspruch wurde abgelehnt, dann hab ich Klage eingereicht.

Gestern kam der Beschluss vom Sozialgericht: Heizkosten werden VOLL übernommen. Plus Nachzahlung für 8 Monate!

Falls jemand in einer ähnlichen Situation ist: Nicht einschüchtern lassen. Die Klage beim Sozialgericht ist kostenlos und man braucht keinen Anwalt. Ich hab alles selber gemacht.

Ist ein gutes Gefühl wenn das System mal funktioniert.`,
    persona_hint: 'Langzeitbezieher, pragmatisch',
    situation: 'langzeitbezieher',
  },

  // ── Auskotzen ──

  {
    forum_id: 'auskotzen',
    forum_label: 'Auskotzen',
    title: 'Sachbearbeiterin behandelt mich wie Dreck',
    body: `Sorry muss mich mal auskotzen.

War heute beim Jobcenter und meine Sachbearbeiterin hat mich mal wieder behandelt als wäre ich ein Verbrecher. Laut angepflaumt vor allen anderen Wartenden, Unterlagen die ich mitgebracht hab waren angeblich "unvollständig" obwohl sie mir genau diese Liste gegeben hat.

Dann noch der Spruch: "Wenn Sie sich mal richtig bemühen würden hätten Sie längst einen Job." Ja klar, ich hab 150 Bewerbungen geschrieben in 6 Monaten aber ICH bemühe mich nicht.

Wie kann so jemand in einer Behörde arbeiten? Gibt es da eine Beschwerdestelle?

Musste ich einfach mal loswerden.`,
    persona_hint: 'Langzeitbezieher, frustriert, sarkastisch',
    situation: 'langzeitbezieher',
  },
  {
    forum_id: 'auskotzen',
    forum_label: 'Auskotzen',
    title: 'System macht einen kaputt',
    body: `bin so müde von dem ganzen. jeden monat bangen ob das geld kommt. jedes halbe jahr wieder den ganzen papierkram. ständig irgendwelche maßnahmen die eh nix bringen.

und dann hört man in den nachrichten wie über "die bürgergeld-empfänger" geredet wird als wären wir alle faul und asozial. keiner fragt sich mal wie es ist davon zu leben.

hab zwei kinder und am ende des monats reicht es nicht mal für neue schuhe für den kleinen. das kann doch nicht sein in einem der reichsten länder der welt.

sorry, musste raus. morgen geht's weiter.`,
    persona_hint: 'Alleinerziehend, frustriert, emotionaler Stil',
    situation: 'alleinerziehend',
  },

  // ── Allgemeines ──

  {
    forum_id: 'allgemeines',
    forum_label: 'Allgemeines',
    title: 'Neu hier – wie funktioniert das Forum?',
    body: `Hallo zusammen,

bin neu hier und wollte mich kurz vorstellen. Beziehe seit 3 Monaten Bürgergeld nach einer Kündigung und finde es gut dass es so ein Forum gibt wo man sich austauschen kann.

Hab einige Fragen zu meinem Bescheid aber wollte erstmal schauen ob es hier schon ähnliche Themen gibt bevor ich alles doppelt frage.

Freue mich auf den Austausch!`,
    persona_hint: 'Neubezieher, höflich, vorsichtig',
    situation: 'neubezieher',
  },
  {
    forum_id: 'allgemeines',
    forum_label: 'Allgemeines',
    title: 'Gute Bücher/Webseiten zum Thema Sozialrecht?',
    body: `Kennt jemand gute Quellen wo man sich über seine Rechte als Bürgergeld-Empfänger informieren kann?

Ich meine jetzt nicht die offiziellen Seiten der BA (die sind ja eher aus Sicht der Behörde geschrieben), sondern Sachen die wirklich aus Betroffenensicht helfen.

Bücher, Webseiten, YouTube-Kanäle – bin für alles offen. Möchte mich einfach besser auskennen damit ich mich besser wehren kann wenn nötig.

Danke vorab!`,
    persona_hint: 'Langzeitbezieher, pragmatisch, wissbegierig',
    situation: 'langzeitbezieher',
  },
  {
    forum_id: 'allgemeines',
    forum_label: 'Allgemeines',
    title: 'Wie sind eure Erfahrungen mit Sozialberatung?',
    body: `Frage in die Runde: Hat jemand Erfahrung mit Sozialberatungsstellen gemacht? Also sowas wie Caritas, Diakonie oder diese unabhängigen Beratungsstellen die es in manchen Städten gibt.

Bringt das was? Helfen die einem wirklich oder sagen die einem auch nur was man im Internet lesen kann?

Bei mir geht es um einen komplizierten Fall mit Aufrechnung und ich komme alleine nicht weiter.`,
    persona_hint: 'Paar mit Kindern, pragmatisch',
    situation: 'paar_mit_kindern',
  },
]
