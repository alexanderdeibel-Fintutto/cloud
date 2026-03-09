/**
 * Achievement badges earned by completing milestones.
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji
  condition: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  completedLessons: number;
  completedCourses: number;
  totalQuizzesPassed: number;
  categoriesStarted: number;
  learningHours: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-lesson",
    title: "Erster Schritt",
    description: "Erste Lektion abgeschlossen",
    icon: "\u{1F331}",
    condition: (s) => s.completedLessons >= 1,
  },
  {
    id: "10-lessons",
    title: "Wissensdurst",
    description: "10 Lektionen abgeschlossen",
    icon: "\u{1F4DA}",
    condition: (s) => s.completedLessons >= 10,
  },
  {
    id: "25-lessons",
    title: "Durchstarter",
    description: "25 Lektionen abgeschlossen",
    icon: "\u{1F680}",
    condition: (s) => s.completedLessons >= 25,
  },
  {
    id: "50-lessons",
    title: "Finanz-Profi",
    description: "50 Lektionen abgeschlossen",
    icon: "\u{1F3C6}",
    condition: (s) => s.completedLessons >= 50,
  },
  {
    id: "100-lessons",
    title: "Experte",
    description: "100 Lektionen abgeschlossen",
    icon: "\u{2B50}",
    condition: (s) => s.completedLessons >= 100,
  },
  {
    id: "first-course",
    title: "Kurs-Absolvent",
    description: "Ersten Kurs komplett abgeschlossen",
    icon: "\u{1F393}",
    condition: (s) => s.completedCourses >= 1,
  },
  {
    id: "5-courses",
    title: "Kurs-Sammler",
    description: "5 Kurse abgeschlossen",
    icon: "\u{1F4BC}",
    condition: (s) => s.completedCourses >= 5,
  },
  {
    id: "10-courses",
    title: "Meister-Lerner",
    description: "10 Kurse abgeschlossen",
    icon: "\u{1F451}",
    condition: (s) => s.completedCourses >= 10,
  },
  {
    id: "quiz-master",
    title: "Quiz-Meister",
    description: "3 Quizze bestanden",
    icon: "\u{1F9E0}",
    condition: (s) => s.totalQuizzesPassed >= 3,
  },
  {
    id: "diversified",
    title: "Breit aufgestellt",
    description: "In 5 verschiedenen Kategorien gelernt",
    icon: "\u{1F310}",
    condition: (s) => s.categoriesStarted >= 5,
  },
  {
    id: "5-hours",
    title: "Fleissig",
    description: "5 Stunden Lernzeit",
    icon: "\u{23F0}",
    condition: (s) => s.learningHours >= 5,
  },
  {
    id: "20-hours",
    title: "Engagiert",
    description: "20 Stunden Lernzeit",
    icon: "\u{1F525}",
    condition: (s) => s.learningHours >= 20,
  },
];

/**
 * Daily financial tips that rotate.
 */
export const DAILY_TIPS: { tip: string; source?: string }[] = [
  { tip: "Automatisiere deine Sparrate: Was du nicht siehst, gibst du nicht aus.", source: "The Richest Man in Babylon" },
  { tip: "Die beste Zeit zu investieren war vor 20 Jahren. Die zweitbeste Zeit ist jetzt." },
  { tip: "Diversifikation ist der einzige 'Free Lunch' an der Boerse.", source: "Harry Markowitz" },
  { tip: "Bezahle dich selbst zuerst – bevor Rechnungen und Wuensche kommen." },
  { tip: "Ein ETF-Sparplan mit 200 Euro/Monat bei 7% Rendite ergibt nach 30 Jahren ueber 230.000 Euro." },
  { tip: "Pruefe alle 6 Monate deine Abos – kuendige, was du nicht nutzt." },
  { tip: "Der Zinseszins-Effekt braucht Zeit. Starte frueh, auch mit kleinen Betraegen." },
  { tip: "Vermeide den Dispositionskredit – 10-15% Zinsen fressen dein Vermoegen." },
  { tip: "Investiere nur in Dinge, die du verstehst. Wenn du es nicht erklaeren kannst, investiere nicht.", source: "Warren Buffett" },
  { tip: "Dein Humankapital (Gehalt ueber dein Arbeitsleben) ist dein groesstes Asset. Investiere in dich selbst." },
  { tip: "Angst und Gier sind die groessten Feinde des Investors. Bleib bei deinem Plan." },
  { tip: "Ein Notgroschen von 3-6 Monatsausgaben schuetzt dich vor dem teuersten Fehler: unter Druck verkaufen zu muessen." },
  { tip: "Die 4%-Regel: Um 2.000 Euro/Monat passiv zu erhalten, brauchst du ca. 600.000 Euro Portfolio." },
  { tip: "Kosten zaehlen: 1% Fondsgebuehr vs. 0,2% ETF-Kosten kann ueber 30 Jahre den Unterschied von 100.000+ Euro machen." },
  { tip: "Vergiss nicht den Freistellungsauftrag bei deiner Bank einzurichten – 1.000 Euro Kapitalertraege sind steuerfrei." },
  { tip: "Time in the market beats timing the market. Langfristig investiert sein schlaegt Markt-Timing.", source: "John Bogle" },
  { tip: "Bevor du investierst: Hast du einen Notgroschen? Sind teure Schulden getilgt? Dann los!" },
  { tip: "Dein zukuenftiges Ich wird dir danken, dass du heute angefangen hast." },
  { tip: "Regel Nr. 1: Verliere kein Geld. Regel Nr. 2: Vergiss nicht Regel Nr. 1.", source: "Warren Buffett" },
  { tip: "Geld ist ein Werkzeug. Es bringt dir Freiheit, Optionen und Sicherheit – aber nur, wenn du es bewusst einsetzt." },
  { tip: "Pruefe deine Versicherungen: Haftpflicht und BU sind Pflicht, der Rest ist oft optional." },
  { tip: "Kaufe nie eine Aktie, bei der du nicht bereit waerst, sie 10 Jahre zu halten.", source: "Warren Buffett" },
  { tip: "Ein guter Finanzplan passt auf eine Seite: Notgroschen, Sparplan, Versicherungen, Ziele." },
  { tip: "Vergleiche dich nicht mit anderen. Dein Finanzweg ist individuell – Hauptsache, du gehst ihn." },
  { tip: "Der Unterschied zwischen reich und wohlhabend: Reich sein sieht man, wohlhabend sein nicht.", source: "Morgan Housel" },
  { tip: "Schulden fuer konsumierende Gueter = schlecht. Schulden fuer wertsteigernde Anlagen = kann klug sein." },
  { tip: "Lerne den Unterschied zwischen Preis und Wert. Ein guenstiger Preis bei einem wertlosen Produkt ist kein Schnaeppchen." },
  { tip: "Inflationsschutz: Dein Geld auf dem Sparkonto verliert jedes Jahr 2-3% an Kaufkraft. Investieren ist Pflicht." },
  { tip: "Finanzielle Bildung ist die beste Rendite: Sie kostet wenig und bringt ein Leben lang Ertrag." },
  { tip: "Setze dir konkrete Finanzziele mit Datum und Betrag. 'Mehr sparen' funktioniert nicht, '500 Euro/Monat ab April' schon." },
];

export function getDailyTip(): (typeof DAILY_TIPS)[number] {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
}
