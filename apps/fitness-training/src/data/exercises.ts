import type { Exercise, ExerciseCategory, MuscleGroup, Equipment, FitnessLevel } from '../lib/types'

// Helper to create exercise entries efficiently
function ex(
  id: string, name: string, nameEn: string, desc: string,
  instructions: string[], category: ExerciseCategory,
  muscleGroups: MuscleGroup[], primaryMuscle: MuscleGroup,
  equipment: Equipment[], difficulty: FitnessLevel,
  caloriesPerMinute: number, tags: string[]
): Exercise {
  return { id, name, nameEn, description: desc, instructions, category, muscleGroups, primaryMuscle, equipment, difficulty, caloriesPerMinute, tags }
}

export const EXERCISES: Exercise[] = [
  // ==================== STRENGTH: CHEST (10) ====================
  ex('bankdruecken', 'Bankdrücken', 'Bench Press',
    'Grundübung für die Brustmuskulatur mit der Langhantel auf der Flachbank.',
    ['Lege dich auf die Flachbank und greife die Stange schulterbreit.', 'Senke die Stange kontrolliert zur Brust ab.', 'Drücke die Stange explosiv nach oben bis die Arme gestreckt sind.', 'Halte die Schulterblätter zusammengezogen.'],
    'strength', ['chest', 'triceps', 'shoulders'], 'chest', ['barbell', 'bench'], 'intermediate', 8, ['Brust', 'Grundübung', 'Drücken']),

  ex('schraegbankdruecken', 'Schrägbankdrücken', 'Incline Bench Press',
    'Trainiert den oberen Anteil der Brustmuskulatur auf der Schrägbank.',
    ['Stelle die Bank auf ca. 30-45 Grad ein.', 'Greife die Langhantel schulterbreit.', 'Senke die Stange zur oberen Brust ab.', 'Drücke kontrolliert nach oben.'],
    'strength', ['chest', 'shoulders', 'triceps'], 'chest', ['barbell', 'bench'], 'intermediate', 7, ['Brust', 'Obere Brust', 'Schrägbank']),

  ex('kurzhantel-flys', 'Kurzhantel-Flys', 'Dumbbell Flyes',
    'Isolationsübung für die Brustmuskulatur mit Kurzhanteln.',
    ['Lege dich auf die Flachbank mit Kurzhanteln über der Brust.', 'Senke die Arme seitlich mit leicht gebeugten Ellenbogen ab.', 'Bringe die Hanteln in einer Umarmungsbewegung zurück zusammen.'],
    'strength', ['chest'], 'chest', ['dumbbells', 'bench'], 'beginner', 6, ['Brust', 'Isolation', 'Flys']),

  ex('liegestuetze', 'Liegestütze', 'Push-Ups',
    'Klassische Eigengewichtsübung für Brust, Schultern und Trizeps.',
    ['Stütze dich auf Hände und Zehenspitzen, Körper bildet eine gerade Linie.', 'Senke den Körper ab, bis die Brust fast den Boden berührt.', 'Drücke dich wieder nach oben.', 'Halte den Rumpf stabil.'],
    'strength', ['chest', 'triceps', 'shoulders', 'abs'], 'chest', ['none'], 'beginner', 7, ['Brust', 'Bodyweight', 'Grundübung']),

  ex('kabelzug-crossover', 'Kabelzug Crossover', 'Cable Crossover',
    'Isolationsübung für die Brustmuskulatur am Kabelzug.',
    ['Stelle dich zwischen zwei Kabelzüge mit den Griffen oben.', 'Ziehe die Griffe mit leicht gebeugten Armen vor der Brust zusammen.', 'Lasse kontrolliert zurück und spüre die Dehnung.'],
    'strength', ['chest'], 'chest', ['cable_machine'], 'intermediate', 5, ['Brust', 'Kabelzug', 'Isolation']),

  ex('dips-brust', 'Dips (Brust)', 'Chest Dips',
    'Compound-Übung am Barren mit Fokus auf die untere Brust.',
    ['Greife die Holme und stütze dich hoch.', 'Neige den Oberkörper leicht nach vorne.', 'Senke dich ab, bis die Oberarme parallel sind.', 'Drücke dich kontrolliert wieder hoch.'],
    'strength', ['chest', 'triceps', 'shoulders'], 'chest', ['none'], 'intermediate', 8, ['Brust', 'Dips', 'Bodyweight']),

  ex('kurzhantel-bankdruecken', 'Kurzhantel-Bankdrücken', 'Dumbbell Bench Press',
    'Bankdrücken mit Kurzhanteln für mehr Bewegungsumfang.',
    ['Lege dich mit Kurzhanteln auf die Flachbank.', 'Drücke die Hanteln nach oben über die Brust.', 'Senke sie kontrolliert seitlich ab.', 'Drücke explosiv wieder nach oben.'],
    'strength', ['chest', 'triceps', 'shoulders'], 'chest', ['dumbbells', 'bench'], 'beginner', 7, ['Brust', 'Kurzhanteln', 'Drücken']),

  ex('schraegbank-kurzhantel', 'Schrägbank Kurzhantel-Drücken', 'Incline Dumbbell Press',
    'Schrägbank-Drücken mit Kurzhanteln für die obere Brust.',
    ['Stelle die Bank auf 30-45 Grad und nimm die Kurzhanteln.', 'Drücke die Hanteln über die obere Brust.', 'Senke kontrolliert ab und drücke wieder hoch.'],
    'strength', ['chest', 'shoulders', 'triceps'], 'chest', ['dumbbells', 'bench'], 'intermediate', 7, ['Obere Brust', 'Schrägbank', 'Kurzhanteln']),

  ex('maschinen-brustpresse', 'Maschinen-Brustpresse', 'Machine Chest Press',
    'Geführte Brustpresse an der Maschine für kontrolliertes Training.',
    ['Setze dich in die Maschine und greife die Griffe auf Brusthöhe.', 'Drücke die Griffe nach vorne bis die Arme fast gestreckt sind.', 'Lasse kontrolliert zurück.'],
    'strength', ['chest', 'triceps'], 'chest', ['cable_machine'], 'beginner', 6, ['Brust', 'Maschine', 'Anfänger']),

  ex('decline-bankdruecken', 'Decline Bankdrücken', 'Decline Bench Press',
    'Bankdrücken mit negativer Neigung für die untere Brust.',
    ['Lege dich auf die Decline-Bank und fixiere die Beine.', 'Greife die Langhantel schulterbreit.', 'Senke zur unteren Brust und drücke wieder hoch.'],
    'strength', ['chest', 'triceps'], 'chest', ['barbell', 'bench'], 'intermediate', 7, ['Untere Brust', 'Decline', 'Langhantel']),

  // ==================== STRENGTH: BACK (10) ====================
  ex('latzug', 'Latzug', 'Lat Pulldown',
    'Zug-Übung für den breiten Rückenmuskel am Kabelzug.',
    ['Greife die Stange breit und setze dich hin.', 'Ziehe die Stange zur oberen Brust.', 'Halte die Schulterblätter zusammen.', 'Lasse kontrolliert zurück.'],
    'strength', ['back', 'biceps'], 'back', ['cable_machine'], 'beginner', 6, ['Rücken', 'Lat', 'Zugübung']),

  ex('langhantelrudern', 'Langhantelrudern', 'Barbell Row',
    'Schwere Compound-Übung für den gesamten Rücken.',
    ['Stehe leicht gebeugt, Langhantel vor den Schienbeinen.', 'Ziehe die Stange zum Bauchnabel.', 'Halte den Rücken gerade.', 'Senke kontrolliert ab.'],
    'strength', ['back', 'biceps', 'lower_back'], 'back', ['barbell'], 'intermediate', 7, ['Rücken', 'Rudern', 'Grundübung']),

  ex('kabelrudern', 'Kabelrudern', 'Cable Row',
    'Rudern am Kabelzug für den mittleren Rücken.',
    ['Setze dich an den Kabelzug, Füße auf die Plattform.', 'Ziehe den Griff zum Bauch mit geradem Rücken.', 'Drücke die Schulterblätter zusammen.', 'Lasse kontrolliert zurück.'],
    'strength', ['back', 'biceps'], 'back', ['cable_machine'], 'beginner', 6, ['Rücken', 'Kabelzug', 'Rudern']),

  ex('klimmzuege', 'Klimmzüge', 'Pull-Ups',
    'König der Rückenübungen – Ziehen mit dem eigenen Körpergewicht.',
    ['Hänge an der Stange mit breitem Obergriff.', 'Ziehe dich hoch, bis das Kinn über der Stange ist.', 'Senke dich kontrolliert ab.', 'Vermeide Schwung.'],
    'strength', ['back', 'biceps', 'shoulders'], 'back', ['pull_up_bar'], 'advanced', 9, ['Rücken', 'Bodyweight', 'Klimmzüge']),

  ex('kinnzuege', 'Kinnzüge', 'Chin-Ups',
    'Klimmzug-Variante mit Untergriff für mehr Bizeps-Beteiligung.',
    ['Hänge an der Stange mit schulterbreitem Untergriff.', 'Ziehe dich hoch, Kinn über die Stange.', 'Senke kontrolliert ab.'],
    'strength', ['back', 'biceps'], 'back', ['pull_up_bar'], 'intermediate', 9, ['Rücken', 'Bizeps', 'Bodyweight']),

  ex('t-bar-rudern', 'T-Bar Rudern', 'T-Bar Row',
    'Rudern mit der T-Bar für dicke Rückenmuskulatur.',
    ['Stelle dich über die T-Bar und greife den Griff.', 'Ziehe das Gewicht zum Bauch.', 'Halte den Rücken gerade und Knie leicht gebeugt.'],
    'strength', ['back', 'biceps', 'lower_back'], 'back', ['barbell'], 'intermediate', 7, ['Rücken', 'Rudern', 'T-Bar']),

  ex('einarmiges-kurzhantelrudern', 'Einarmiges Kurzhantelrudern', 'Single Arm Dumbbell Row',
    'Einseitiges Rudern mit der Kurzhantel auf der Bank.',
    ['Stütze Knie und Hand auf der Bank, Kurzhantel in der freien Hand.', 'Ziehe die Hantel zum Hüftknochen.', 'Drücke das Schulterblatt zusammen.', 'Senke kontrolliert ab.'],
    'strength', ['back', 'biceps'], 'back', ['dumbbells', 'bench'], 'beginner', 6, ['Rücken', 'Einarmig', 'Kurzhantel']),

  ex('face-pull', 'Face Pull', 'Face Pull',
    'Übung für die hintere Schulter und Rotatorenmanschette.',
    ['Befestige ein Seil am oberen Kabelzug.', 'Ziehe das Seil zum Gesicht, Ellenbogen hoch.', 'Rotiere die Hände nach außen.', 'Halte kurz und lasse zurück.'],
    'strength', ['shoulders', 'back'], 'back', ['cable_machine'], 'beginner', 5, ['Schultern', 'Rotatorenmanschette', 'Kabelzug']),

  ex('kreuzheben', 'Kreuzheben', 'Deadlift',
    'Die Königsübung – trainiert den gesamten hinteren Kettenmuskel.',
    ['Stelle dich vor die Langhantel, Füße hüftbreit.', 'Greife die Stange, Rücken gerade, Brust raus.', 'Hebe die Stange durch Strecken von Beinen und Hüfte.', 'Senke kontrolliert ab.'],
    'strength', ['back', 'hamstrings', 'glutes', 'lower_back'], 'back', ['barbell'], 'advanced', 10, ['Rücken', 'Grundübung', 'Ganzkörper']),

  ex('hyperextension', 'Hyperextension', 'Back Extension',
    'Rückenstrecker-Übung auf dem Hyperextension-Gerät.',
    ['Lege dich bäuchlings auf das Gerät, Oberkörper hängt frei.', 'Senke den Oberkörper kontrolliert ab.', 'Hebe ihn wieder an, bis der Körper eine Linie bildet.'],
    'strength', ['lower_back', 'glutes', 'hamstrings'], 'lower_back', ['none'], 'beginner', 5, ['Unterer Rücken', 'Rückenstrecker', 'Stabilisation']),

  // ==================== STRENGTH: SHOULDERS (8) ====================
  ex('schulterdruecken', 'Schulterdrücken', 'Military Press',
    'Grundübung für die Schultern mit der Langhantel.',
    ['Stehe aufrecht, Langhantel auf Schulterhöhe.', 'Drücke die Stange über den Kopf.', 'Senke kontrolliert zurück zur Schulter.', 'Halte den Rumpf stabil.'],
    'strength', ['shoulders', 'triceps'], 'shoulders', ['barbell'], 'intermediate', 7, ['Schultern', 'Drücken', 'Overhead']),

  ex('seitheben', 'Seitheben', 'Lateral Raise',
    'Isolationsübung für den seitlichen Deltamuskel.',
    ['Stehe aufrecht mit Kurzhanteln seitlich.', 'Hebe die Arme seitlich bis auf Schulterhöhe.', 'Senke kontrolliert ab.', 'Vermeide Schwung.'],
    'strength', ['shoulders'], 'shoulders', ['dumbbells'], 'beginner', 5, ['Schultern', 'Seitlich', 'Isolation']),

  ex('frontheben', 'Frontheben', 'Front Raise',
    'Isolationsübung für den vorderen Deltamuskel.',
    ['Stehe aufrecht mit Kurzhanteln vor dem Körper.', 'Hebe einen oder beide Arme nach vorne bis Schulterhöhe.', 'Senke kontrolliert ab.'],
    'strength', ['shoulders'], 'shoulders', ['dumbbells'], 'beginner', 5, ['Schultern', 'Vorne', 'Isolation']),

  ex('reverse-flys', 'Reverse Flys', 'Rear Delt Fly',
    'Übung für die hintere Schulter mit Kurzhanteln.',
    ['Beuge dich nach vorne, Kurzhanteln hängen.', 'Hebe die Arme seitlich nach hinten.', 'Drücke die Schulterblätter zusammen.', 'Senke kontrolliert ab.'],
    'strength', ['shoulders', 'back'], 'shoulders', ['dumbbells'], 'beginner', 5, ['Hintere Schulter', 'Flys', 'Isolation']),

  ex('arnold-press', 'Arnold Press', 'Arnold Press',
    'Schulterdrücken mit Rotation, benannt nach Arnold Schwarzenegger.',
    ['Sitze aufrecht mit Kurzhanteln vor der Brust im Untergriff.', 'Drücke die Hanteln nach oben und rotiere dabei.', 'Oben angekommen, Handflächen zeigen nach vorne.', 'Rotiere zurück beim Absenken.'],
    'strength', ['shoulders', 'triceps'], 'shoulders', ['dumbbells'], 'intermediate', 6, ['Schultern', 'Rotation', 'Arnold']),

  ex('aufrechtes-rudern', 'Aufrechtes Rudern', 'Upright Row',
    'Zug-Übung für Schultern und Nacken.',
    ['Stehe aufrecht, Langhantel vor dem Körper.', 'Ziehe die Stange eng am Körper nach oben.', 'Führe die Ellenbogen hoch.', 'Senke kontrolliert ab.'],
    'strength', ['shoulders', 'biceps'], 'shoulders', ['barbell'], 'intermediate', 6, ['Schultern', 'Nacken', 'Rudern']),

  ex('schulterdruecken-maschine', 'Schulterdrücken Maschine', 'Shoulder Press Machine',
    'Geführtes Schulterdrücken an der Maschine.',
    ['Setze dich in die Maschine, Griffe auf Schulterhöhe.', 'Drücke die Griffe nach oben.', 'Senke kontrolliert zurück.'],
    'strength', ['shoulders', 'triceps'], 'shoulders', ['cable_machine'], 'beginner', 6, ['Schultern', 'Maschine', 'Drücken']),

  ex('kabel-seitheben', 'Kabel-Seitheben', 'Cable Lateral Raise',
    'Seitheben am Kabelzug für konstante Spannung.',
    ['Stelle dich seitlich zum Kabelzug, Griff unten.', 'Hebe den Arm seitlich bis Schulterhöhe.', 'Halte kurz und senke kontrolliert.'],
    'strength', ['shoulders'], 'shoulders', ['cable_machine'], 'intermediate', 5, ['Schultern', 'Kabelzug', 'Seitlich']),

  // ==================== STRENGTH: BICEPS (6) ====================
  ex('langhantel-curls', 'Langhantel-Curls', 'Barbell Curl',
    'Grundübung für den Bizeps mit der Langhantel.',
    ['Stehe aufrecht, Langhantel im Untergriff.', 'Beuge die Arme und ziehe die Stange zur Schulter.', 'Senke kontrolliert ab.', 'Halte die Ellenbogen am Körper.'],
    'strength', ['biceps', 'forearms'], 'biceps', ['barbell'], 'beginner', 5, ['Bizeps', 'Curls', 'Langhantel']),

  ex('kurzhantel-curls', 'Kurzhantel-Curls', 'Dumbbell Curl',
    'Bizeps-Curls mit Kurzhanteln, abwechselnd oder gleichzeitig.',
    ['Stehe mit Kurzhanteln seitlich.', 'Beuge einen Arm und drehe die Hantel dabei.', 'Senke kontrolliert ab und wechsle die Seite.'],
    'strength', ['biceps', 'forearms'], 'biceps', ['dumbbells'], 'beginner', 5, ['Bizeps', 'Curls', 'Kurzhanteln']),

  ex('hammercurls', 'Hammercurls', 'Hammer Curl',
    'Bizeps-Curls im neutralen Griff für Bizeps und Unterarm.',
    ['Halte Kurzhanteln mit neutralem Griff seitlich.', 'Beuge die Arme, Daumen zeigen nach oben.', 'Senke kontrolliert ab.'],
    'strength', ['biceps', 'forearms'], 'biceps', ['dumbbells'], 'beginner', 5, ['Bizeps', 'Hammer', 'Unterarm']),

  ex('preacher-curls', 'Preacher Curls', 'Preacher Curl',
    'Bizeps-Curls auf der Schrägbank für strikte Isolation.',
    ['Stütze die Oberarme auf das Preacher-Polster.', 'Curle die Hantel nach oben.', 'Senke kontrolliert bis zur vollen Streckung.'],
    'strength', ['biceps'], 'biceps', ['barbell', 'bench'], 'intermediate', 5, ['Bizeps', 'Preacher', 'Isolation']),

  ex('konzentrations-curls', 'Konzentrations-Curls', 'Concentration Curl',
    'Einarmiger Bizeps-Curl im Sitzen für maximale Kontraktion.',
    ['Sitze auf einer Bank, Ellenbogen am Oberschenkel.', 'Curle die Kurzhantel nach oben.', 'Drücke den Bizeps oben zusammen.', 'Senke langsam ab.'],
    'strength', ['biceps'], 'biceps', ['dumbbells'], 'beginner', 4, ['Bizeps', 'Konzentration', 'Isolation']),

  ex('kabel-curls', 'Kabel-Curls', 'Cable Curl',
    'Bizeps-Curls am Kabelzug für konstante Spannung.',
    ['Stelle dich vor den Kabelzug, Griff unten.', 'Curle den Griff nach oben.', 'Halte die Ellenbogen am Körper.', 'Senke kontrolliert ab.'],
    'strength', ['biceps'], 'biceps', ['cable_machine'], 'beginner', 5, ['Bizeps', 'Kabelzug', 'Curls']),

  // ==================== STRENGTH: TRICEPS (6) ====================
  ex('trizeps-pushdown', 'Trizeps-Pushdown', 'Tricep Pushdown',
    'Klassische Trizeps-Übung am Kabelzug.',
    ['Stelle dich vor den Kabelzug, Griff oben.', 'Drücke den Griff nach unten, Ellenbogen am Körper.', 'Strecke die Arme vollständig.', 'Lasse kontrolliert zurück.'],
    'strength', ['triceps'], 'triceps', ['cable_machine'], 'beginner', 5, ['Trizeps', 'Pushdown', 'Kabelzug']),

  ex('ueberkopf-extension', 'Überkopf-Extension', 'Overhead Extension',
    'Trizeps-Extension über dem Kopf mit Kurzhantel oder Kabel.',
    ['Halte eine Kurzhantel mit beiden Händen über dem Kopf.', 'Senke die Hantel hinter dem Kopf ab.', 'Strecke die Arme wieder.', 'Halte die Ellenbogen nah am Kopf.'],
    'strength', ['triceps'], 'triceps', ['dumbbells'], 'beginner', 5, ['Trizeps', 'Überkopf', 'Extension']),

  ex('skull-crushers', 'Skull Crushers', 'Skull Crushers',
    'Trizeps-Übung liegend auf der Bank mit der Langhantel.',
    ['Lege dich auf die Bank, Langhantel über der Stirn.', 'Senke die Stange durch Beugen der Ellenbogen zur Stirn.', 'Strecke die Arme wieder.'],
    'strength', ['triceps'], 'triceps', ['barbell', 'bench'], 'intermediate', 5, ['Trizeps', 'Skull Crusher', 'Liegend']),

  ex('enge-bankdruecken', 'Enges Bankdrücken', 'Close Grip Bench Press',
    'Bankdrücken mit engem Griff für den Trizeps.',
    ['Lege dich auf die Flachbank, enger Griff an der Stange.', 'Senke die Stange zur unteren Brust.', 'Drücke mit Fokus auf den Trizeps nach oben.'],
    'strength', ['triceps', 'chest'], 'triceps', ['barbell', 'bench'], 'intermediate', 7, ['Trizeps', 'Bankdrücken', 'Eng']),

  ex('trizeps-dips', 'Trizeps-Dips', 'Tricep Dips',
    'Dips mit aufrechtem Oberkörper für Trizeps-Fokus.',
    ['Greife die Holme und stütze dich mit gestreckten Armen.', 'Halte den Oberkörper aufrecht.', 'Senke dich ab und drücke wieder hoch.'],
    'strength', ['triceps', 'chest', 'shoulders'], 'triceps', ['none'], 'intermediate', 8, ['Trizeps', 'Dips', 'Bodyweight']),

  ex('kickbacks', 'Trizeps-Kickbacks', 'Tricep Kickbacks',
    'Isolationsübung für den Trizeps mit Kurzhanteln.',
    ['Beuge dich vor, Oberarm parallel zum Boden.', 'Strecke den Unterarm nach hinten.', 'Drücke den Trizeps zusammen.', 'Senke kontrolliert.'],
    'strength', ['triceps'], 'triceps', ['dumbbells'], 'beginner', 4, ['Trizeps', 'Kickback', 'Isolation']),

  // ==================== STRENGTH: LEGS (12) ====================
  ex('kniebeugen', 'Kniebeugen', 'Squat',
    'Die Königin der Beinübungen – Grundübung für die gesamte Beinmuskulatur.',
    ['Stelle dich schulterbreit hin, Langhantel auf dem Trapez.', 'Gehe in die Hocke, Knie über den Zehenspitzen.', 'Halte den Rücken gerade.', 'Drücke dich durch die Fersen wieder hoch.'],
    'strength', ['quadriceps', 'glutes', 'hamstrings'], 'quadriceps', ['barbell'], 'intermediate', 9, ['Beine', 'Grundübung', 'Kniebeugen']),

  ex('beinpresse', 'Beinpresse', 'Leg Press',
    'Geführte Beinübung an der Beinpresse.',
    ['Setze dich in die Beinpresse, Füße schulterbreit.', 'Senke die Plattform kontrolliert ab.', 'Drücke die Plattform nach oben, Knie nicht durchstrecken.'],
    'strength', ['quadriceps', 'glutes', 'hamstrings'], 'quadriceps', ['leg_press'], 'beginner', 8, ['Beine', 'Beinpresse', 'Maschine']),

  ex('ausfallschritte', 'Ausfallschritte', 'Lunges',
    'Einbeinige Übung für Oberschenkel und Gesäß.',
    ['Stehe aufrecht, mache einen großen Schritt nach vorne.', 'Senke das hintere Knie Richtung Boden.', 'Drücke dich mit dem vorderen Bein wieder hoch.', 'Wechsle die Seite.'],
    'strength', ['quadriceps', 'glutes', 'hamstrings'], 'quadriceps', ['none'], 'beginner', 7, ['Beine', 'Ausfallschritt', 'Einbeinig']),

  ex('rumaenisches-kreuzheben', 'Rumänisches Kreuzheben', 'Romanian Deadlift',
    'Kreuzheben-Variante mit gestreckten Beinen für die Hamstrings.',
    ['Stehe mit der Langhantel, leicht gebeugte Knie.', 'Schiebe die Hüfte nach hinten und senke die Stange.', 'Halte den Rücken gerade.', 'Richte dich durch Hüftstreckung auf.'],
    'strength', ['hamstrings', 'glutes', 'lower_back'], 'hamstrings', ['barbell'], 'intermediate', 7, ['Hamstrings', 'Kreuzheben', 'Hinterkette']),

  ex('beinstrecker', 'Beinstrecker', 'Leg Extension',
    'Isolationsübung für den Quadrizeps an der Maschine.',
    ['Setze dich in die Maschine, Polster über den Schienbeinen.', 'Strecke die Beine nach vorne.', 'Halte kurz oben.', 'Senke kontrolliert ab.'],
    'strength', ['quadriceps'], 'quadriceps', ['cable_machine'], 'beginner', 5, ['Quadrizeps', 'Maschine', 'Isolation']),

  ex('beinbeuger', 'Beinbeuger', 'Leg Curl',
    'Isolationsübung für die Hamstrings an der Maschine.',
    ['Lege dich auf die Maschine, Polster über den Fersen.', 'Beuge die Beine und ziehe das Polster Richtung Gesäß.', 'Senke kontrolliert ab.'],
    'strength', ['hamstrings'], 'hamstrings', ['cable_machine'], 'beginner', 5, ['Hamstrings', 'Maschine', 'Isolation']),

  ex('wadenheben', 'Wadenheben', 'Calf Raises',
    'Isolationsübung für die Wadenmuskulatur.',
    ['Stelle dich auf eine Erhöhung, Fersen hängen frei.', 'Drücke dich auf die Zehenspitzen.', 'Halte kurz oben.', 'Senke die Fersen langsam ab.'],
    'strength', ['calves'], 'calves', ['none'], 'beginner', 4, ['Waden', 'Wadenheben', 'Isolation']),

  ex('bulgarische-kniebeugen', 'Bulgarische Kniebeugen', 'Bulgarian Split Squat',
    'Einbeinige Kniebeuge mit erhöhtem Hinterfuß.',
    ['Stelle einen Fuß auf eine Bank hinter dir.', 'Senke das hintere Knie Richtung Boden.', 'Drücke dich mit dem vorderen Bein hoch.', 'Halte den Oberkörper aufrecht.'],
    'strength', ['quadriceps', 'glutes', 'hamstrings'], 'quadriceps', ['dumbbells', 'bench'], 'intermediate', 7, ['Beine', 'Einbeinig', 'Bulgarisch']),

  ex('hip-thrust', 'Hip Thrust', 'Hip Thrust',
    'Die effektivste Übung für das Gesäß.',
    ['Lehne den oberen Rücken an eine Bank, Langhantel auf der Hüfte.', 'Drücke die Hüfte nach oben bis zum vollen Lockout.', 'Halte kurz oben und drücke das Gesäß zusammen.', 'Senke kontrolliert ab.'],
    'strength', ['glutes', 'hamstrings'], 'glutes', ['barbell', 'bench'], 'intermediate', 7, ['Gesäß', 'Hip Thrust', 'Hüfte']),

  ex('goblet-squat', 'Goblet Squat', 'Goblet Squat',
    'Kniebeuge mit Kurzhantel vor der Brust.',
    ['Halte eine Kurzhantel vertikal vor der Brust.', 'Gehe in die tiefe Hocke.', 'Halte die Ellenbogen zwischen den Knien.', 'Drücke dich wieder hoch.'],
    'strength', ['quadriceps', 'glutes'], 'quadriceps', ['dumbbells'], 'beginner', 7, ['Beine', 'Kniebeuge', 'Anfänger']),

  ex('hackenschmidt', 'Hackenschmidt', 'Hack Squat',
    'Kniebeuge an der Hackenschmidt-Maschine.',
    ['Stelle dich in die Maschine, Schultern unter den Polstern.', 'Senke dich kontrolliert ab.', 'Drücke dich durch die Fersen hoch.'],
    'strength', ['quadriceps', 'glutes'], 'quadriceps', ['smith_machine'], 'intermediate', 8, ['Beine', 'Hack Squat', 'Maschine']),

  ex('step-ups', 'Step-Ups', 'Step-Ups',
    'Einbeiniges Aufsteigen auf eine erhöhte Plattform.',
    ['Stelle dich vor eine Bank oder Box.', 'Steige mit einem Bein auf und drücke dich hoch.', 'Senke dich kontrolliert ab.', 'Wechsle die Seite nach dem Satz.'],
    'strength', ['quadriceps', 'glutes'], 'quadriceps', ['dumbbells', 'bench'], 'beginner', 6, ['Beine', 'Step-Up', 'Einbeinig']),

  // ==================== STRENGTH: ABS/CORE (10) ====================
  ex('plank', 'Plank', 'Plank',
    'Isometrische Rumpfübung für die gesamte Kernmuskulatur.',
    ['Stütze dich auf Unterarme und Zehenspitzen.', 'Körper bildet eine gerade Linie.', 'Spanne Bauch und Gesäß an.', 'Halte die Position.'],
    'strength', ['abs', 'obliques', 'lower_back'], 'abs', ['mat'], 'beginner', 4, ['Core', 'Plank', 'Isometrisch']),

  ex('crunches', 'Crunches', 'Crunches',
    'Klassische Bauchübung für den geraden Bauchmuskel.',
    ['Lege dich auf den Rücken, Knie angewinkelt.', 'Hebe die Schultern vom Boden ab.', 'Drücke den unteren Rücken in den Boden.', 'Senke kontrolliert ab.'],
    'strength', ['abs'], 'abs', ['mat'], 'beginner', 5, ['Bauch', 'Crunches', 'Anfänger']),

  ex('russian-twist', 'Russian Twist', 'Russian Twist',
    'Rotationsübung für die seitlichen Bauchmuskeln.',
    ['Sitze mit angewinkelten Beinen, Oberkörper leicht zurückgelehnt.', 'Rotiere den Oberkörper abwechselnd links und rechts.', 'Halte die Füße angehoben für mehr Intensität.'],
    'strength', ['obliques', 'abs'], 'obliques', ['mat'], 'beginner', 6, ['Bauch', 'Rotation', 'Seitlich']),

  ex('beinheben', 'Beinheben', 'Leg Raise',
    'Übung für den unteren Bauchmuskel.',
    ['Lege dich auf den Rücken, Beine gestreckt.', 'Hebe die Beine bis zur Senkrechten an.', 'Senke kontrolliert ab, ohne den Boden zu berühren.'],
    'strength', ['abs'], 'abs', ['mat'], 'intermediate', 5, ['Bauch', 'Unterer Bauch', 'Beinheben']),

  ex('mountain-climbers', 'Mountain Climbers', 'Mountain Climbers',
    'Dynamische Rumpfübung mit Cardio-Effekt.',
    ['Gehe in die Liegestütz-Position.', 'Ziehe abwechselnd die Knie zur Brust.', 'Halte den Rumpf stabil.', 'Steigere das Tempo.'],
    'strength', ['abs', 'obliques', 'quadriceps'], 'abs', ['none'], 'beginner', 10, ['Core', 'Cardio', 'Dynamisch']),

  ex('bicycle-crunches', 'Bicycle Crunches', 'Bicycle Crunches',
    'Dynamische Crunch-Variante für gerade und seitliche Bauchmuskeln.',
    ['Lege dich auf den Rücken, Hände hinter dem Kopf.', 'Bringe den rechten Ellenbogen zum linken Knie.', 'Wechsle fließend die Seite.', 'Strecke das jeweils andere Bein.'],
    'strength', ['abs', 'obliques'], 'abs', ['mat'], 'beginner', 7, ['Bauch', 'Bicycle', 'Rotation']),

  ex('ab-rollout', 'Ab Rollout', 'Ab Rollout',
    'Anspruchsvolle Bauchübung mit dem Ab-Roller.',
    ['Knie auf der Matte, Hände am Ab-Roller.', 'Rolle nach vorne, Körper streckt sich.', 'Spanne den Bauch an und rolle zurück.', 'Halte den Rücken gerade.'],
    'strength', ['abs', 'lower_back', 'shoulders'], 'abs', ['mat'], 'advanced', 7, ['Bauch', 'Ab Roller', 'Fortgeschritten']),

  ex('haengendes-beinheben', 'Hängendes Beinheben', 'Hanging Leg Raise',
    'Beinheben im Hang an der Klimmzugstange.',
    ['Hänge an der Stange mit gestreckten Armen.', 'Hebe die Beine gestreckt nach oben.', 'Halte kurz und senke kontrolliert ab.', 'Vermeide Schwung.'],
    'strength', ['abs', 'obliques'], 'abs', ['pull_up_bar'], 'advanced', 6, ['Bauch', 'Hängend', 'Fortgeschritten']),

  ex('seitlicher-plank', 'Seitlicher Plank', 'Side Plank',
    'Isometrische Übung für die seitlichen Bauchmuskeln.',
    ['Stütze dich auf einen Unterarm, Körper seitlich.', 'Hebe die Hüfte an, Körper bildet eine gerade Linie.', 'Halte die Position.', 'Wechsle die Seite.'],
    'strength', ['obliques', 'abs'], 'obliques', ['mat'], 'beginner', 4, ['Seitlich', 'Plank', 'Stabilisation']),

  ex('dead-bug', 'Dead Bug', 'Dead Bug',
    'Stabilisationsübung für die tiefe Kernmuskulatur.',
    ['Lege dich auf den Rücken, Arme und Beine senkrecht.', 'Strecke gegenüberliegende Arm und Bein aus.', 'Halte den unteren Rücken am Boden.', 'Wechsle die Seite.'],
    'strength', ['abs', 'lower_back'], 'abs', ['mat'], 'beginner', 4, ['Core', 'Stabilisation', 'Anfänger']),

  // ==================== STRENGTH: FULL BODY (8) ====================
  ex('burpees', 'Burpees', 'Burpees',
    'Ganzkörperübung mit hohem Kalorienverbrauch.',
    ['Stehe aufrecht, gehe in die Hocke.', 'Springe in die Liegestütz-Position.', 'Mache einen Liegestütz.', 'Springe zurück und nach oben.'],
    'strength', ['full_body', 'chest', 'quadriceps'], 'full_body', ['none'], 'intermediate', 12, ['Ganzkörper', 'HIIT', 'Bodyweight']),

  ex('thrusters', 'Thrusters', 'Thrusters',
    'Kombination aus Kniebeuge und Schulterdrücken.',
    ['Halte Kurzhanteln auf Schulterhöhe.', 'Gehe in die tiefe Kniebeuge.', 'Drücke dich hoch und drücke die Hanteln über den Kopf.'],
    'strength', ['quadriceps', 'shoulders', 'glutes'], 'full_body', ['dumbbells'], 'intermediate', 10, ['Ganzkörper', 'Compound', 'CrossFit']),

  ex('clean-and-press', 'Clean & Press', 'Clean and Press',
    'Explosiver Zug vom Boden mit anschließendem Überkopf-Drücken.',
    ['Stehe mit der Langhantel vor den Schienbeinen.', 'Ziehe die Stange explosiv zur Schulter.', 'Drücke die Stange über den Kopf.', 'Senke kontrolliert ab.'],
    'strength', ['full_body', 'shoulders', 'back'], 'full_body', ['barbell'], 'advanced', 10, ['Ganzkörper', 'Olympisch', 'Explosiv']),

  ex('turkish-getup', 'Turkish Get-Up', 'Turkish Get-Up',
    'Komplexe Ganzkörperübung mit der Kettlebell.',
    ['Lege dich auf den Rücken, Kettlebell in einer Hand gestreckt.', 'Stehe Schritt für Schritt auf, Arm bleibt oben.', 'Kehre die Bewegung um.'],
    'strength', ['full_body', 'shoulders', 'abs'], 'full_body', ['kettlebell'], 'advanced', 7, ['Ganzkörper', 'Kettlebell', 'Stabilisation']),

  ex('farmers-walk', 'Farmers Walk', 'Farmers Walk',
    'Gehe mit schweren Gewichten in beiden Händen.',
    ['Greife schwere Kurzhanteln.', 'Gehe mit aufrechtem Oberkörper und geradem Rücken.', 'Halte die Schultern stabil.', 'Gehe eine bestimmte Strecke oder Zeit.'],
    'strength', ['full_body', 'forearms', 'abs'], 'full_body', ['dumbbells'], 'beginner', 7, ['Ganzkörper', 'Grip', 'Tragen']),

  ex('bear-crawl', 'Bear Crawl', 'Bear Crawl',
    'Vierfüßler-Fortbewegung für Ganzkörper-Stabilität.',
    ['Gehe auf alle Viere, Knie schweben über dem Boden.', 'Bewege gegenüberliegende Hand und Fuß gleichzeitig.', 'Halte den Rücken flach.'],
    'strength', ['full_body', 'abs', 'shoulders'], 'full_body', ['none'], 'beginner', 8, ['Ganzkörper', 'Bodyweight', 'Animal Movement']),

  ex('kettlebell-swings', 'Kettlebell Swings', 'Kettlebell Swings',
    'Explosive Hüftstreckung mit der Kettlebell.',
    ['Stehe breitbeinig, Kettlebell zwischen den Beinen.', 'Schwinge die Kettlebell durch Hüftstreckung nach vorne.', 'Lasse sie kontrolliert zurückschwingen.', 'Die Kraft kommt aus der Hüfte.'],
    'strength', ['glutes', 'hamstrings', 'lower_back', 'shoulders'], 'full_body', ['kettlebell'], 'intermediate', 10, ['Kettlebell', 'Hüfte', 'Explosiv']),

  ex('man-maker', 'Man Maker', 'Man Maker',
    'Komplexe Übungskombination: Burpee + Rudern + Thruster.',
    ['Starte mit Kurzhanteln, gehe in die Liegestütz-Position.', 'Mache einen Liegestütz und rudere jede Seite.', 'Springe die Füße vor und mache einen Thruster.'],
    'strength', ['full_body', 'chest', 'back', 'shoulders'], 'full_body', ['dumbbells'], 'advanced', 12, ['Ganzkörper', 'Komplex', 'CrossFit']),

  // ==================== CARDIO (20) ====================
  ex('laufband', 'Laufband', 'Treadmill Running',
    'Ausdauertraining auf dem Laufband.',
    ['Stelle das gewünschte Tempo ein.', 'Laufe mit natürlichem Laufstil.', 'Halte den Oberkörper aufrecht.'],
    'cardio', ['cardio', 'quadriceps', 'calves'], 'cardio', ['treadmill'], 'beginner', 10, ['Cardio', 'Laufen', 'Ausdauer']),

  ex('radfahren', 'Radfahren', 'Cycling',
    'Cardio-Training auf dem Ergometer oder Spinning-Bike.',
    ['Stelle Sitz und Lenker richtig ein.', 'Trete gleichmäßig in die Pedale.', 'Variiere die Intensität.'],
    'cardio', ['cardio', 'quadriceps', 'calves'], 'cardio', ['bike'], 'beginner', 8, ['Cardio', 'Radfahren', 'Gelenkschonend']),

  ex('rudergeraet', 'Rudergerät', 'Rowing Machine',
    'Ganzkörper-Cardio am Rudergerät.',
    ['Setze dich ins Rudergerät, Füße fixiert.', 'Strecke die Beine und ziehe den Griff zum Bauch.', 'Kehre kontrolliert in die Ausgangsposition zurück.'],
    'cardio', ['cardio', 'back', 'quadriceps'], 'cardio', ['rowing_machine'], 'beginner', 10, ['Cardio', 'Rudern', 'Ganzkörper']),

  ex('seilspringen', 'Seilspringen', 'Jump Rope',
    'Hochintensives Cardio-Training mit dem Springseil.',
    ['Halte die Enden des Seils auf Hüfthöhe.', 'Springe mit leicht gebeugten Knien.', 'Drehe das Seil aus den Handgelenken.'],
    'cardio', ['cardio', 'calves', 'quadriceps'], 'cardio', ['none'], 'beginner', 12, ['Cardio', 'Seilspringen', 'HIIT']),

  ex('jumping-jacks', 'Jumping Jacks', 'Jumping Jacks',
    'Klassische Aufwärm- und Cardio-Übung.',
    ['Stehe aufrecht, Arme an den Seiten.', 'Springe und spreize Beine und Arme.', 'Springe zurück in die Ausgangsposition.'],
    'cardio', ['cardio', 'full_body'], 'cardio', ['none'], 'beginner', 8, ['Cardio', 'Aufwärmen', 'Bodyweight']),

  ex('high-knees', 'High Knees', 'High Knees',
    'Laufen auf der Stelle mit hohen Knien.',
    ['Laufe auf der Stelle.', 'Ziehe die Knie abwechselnd hoch zur Brust.', 'Pumpe die Arme mit.'],
    'cardio', ['cardio', 'quadriceps', 'abs'], 'cardio', ['none'], 'beginner', 10, ['Cardio', 'High Knees', 'HIIT']),

  ex('box-jumps', 'Box Jumps', 'Box Jumps',
    'Plyometrische Sprünge auf eine erhöhte Box.',
    ['Stehe vor einer stabilen Box.', 'Springe mit beiden Füßen auf die Box.', 'Lande weich in der Hocke.', 'Steige kontrolliert ab.'],
    'cardio', ['cardio', 'quadriceps', 'glutes'], 'cardio', ['none'], 'intermediate', 10, ['Plyometrie', 'Springen', 'Explosiv']),

  ex('battle-ropes', 'Battle Ropes', 'Battle Ropes',
    'Hochintensives Arm- und Cardio-Training mit dicken Seilen.',
    ['Greife jeweils ein Seilende.', 'Bewege die Seile abwechselnd oder gleichzeitig auf und ab.', 'Halte den Rumpf stabil.'],
    'cardio', ['cardio', 'shoulders', 'abs'], 'cardio', ['none'], 'intermediate', 12, ['Cardio', 'Arme', 'HIIT']),

  ex('treppensteiger', 'Treppensteiger', 'Stair Climber',
    'Cardio-Training auf dem Treppensteiger.',
    ['Stelle dich auf den Treppensteiger.', 'Steige gleichmäßig Stufe für Stufe.', 'Halte dich nur leicht fest.'],
    'cardio', ['cardio', 'quadriceps', 'glutes', 'calves'], 'cardio', ['none'], 'beginner', 9, ['Cardio', 'Treppen', 'Beine']),

  ex('sprint-intervalle', 'Sprint-Intervalle', 'Sprint Intervals',
    'Hochintensive Sprints mit Erholungsphasen.',
    ['Sprinte für 20-30 Sekunden mit voller Kraft.', 'Erhole dich 60-90 Sekunden im Gehen.', 'Wiederhole 8-12 Mal.'],
    'cardio', ['cardio', 'quadriceps', 'hamstrings', 'glutes'], 'cardio', ['none'], 'advanced', 15, ['HIIT', 'Sprints', 'Intervalle']),

  ex('schwimmen', 'Schwimmen', 'Swimming',
    'Ganzkörper-Cardio im Wasser – gelenkschonend und effektiv.',
    ['Wähle deinen Schwimmstil (Kraul, Brust, Rücken).', 'Schwimme gleichmäßig Bahnen.', 'Achte auf die Atemtechnik.'],
    'cardio', ['cardio', 'full_body', 'back', 'shoulders'], 'cardio', ['none'], 'beginner', 10, ['Cardio', 'Schwimmen', 'Gelenkschonend']),

  ex('ellipsentrainer', 'Ellipsentrainer', 'Elliptical',
    'Gelenkschonendes Cardio auf dem Crosstrainer.',
    ['Stelle dich auf den Ellipsentrainer.', 'Bewege Arme und Beine rhythmisch.', 'Variiere den Widerstand.'],
    'cardio', ['cardio', 'full_body', 'quadriceps'], 'cardio', ['none'], 'beginner', 8, ['Cardio', 'Crosstrainer', 'Gelenkschonend']),

  ex('assault-bike', 'Assault Bike', 'Assault Bike',
    'Hochintensives Ganzkörper-Cardio auf dem Air Bike.',
    ['Setze dich auf das Assault Bike.', 'Trete und drücke/ziehe die Griffe gleichzeitig.', 'Variiere Tempo und Widerstand.'],
    'cardio', ['cardio', 'full_body', 'quadriceps'], 'cardio', ['bike'], 'intermediate', 14, ['HIIT', 'Ganzkörper', 'Intensiv']),

  ex('shadow-boxing', 'Shadow Boxing', 'Shadow Boxing',
    'Boxen ohne Gegner für Cardio und Koordination.',
    ['Stehe in der Boxerstellung.', 'Schlage Kombinationen in die Luft.', 'Bewege dich ständig und halte die Deckung.'],
    'cardio', ['cardio', 'shoulders', 'abs'], 'cardio', ['none'], 'beginner', 8, ['Cardio', 'Boxen', 'Koordination']),

  ex('tanzen', 'Tanzen', 'Dancing',
    'Bewegung zu Musik als spaßiges Cardio-Training.',
    ['Wähle motivierende Musik.', 'Bewege dich frei und rhythmisch.', 'Variiere Intensität und Bewegungen.'],
    'cardio', ['cardio', 'full_body'], 'cardio', ['none'], 'beginner', 7, ['Cardio', 'Tanzen', 'Spaß']),

  ex('kniehebelauf', 'Kniehebelauf', 'Butt Kicks',
    'Laufen auf der Stelle mit Fersenschlag zum Gesäß.',
    ['Laufe auf der Stelle.', 'Ziehe die Fersen zum Gesäß.', 'Halte einen schnellen Rhythmus.'],
    'cardio', ['cardio', 'hamstrings', 'quadriceps'], 'cardio', ['none'], 'beginner', 9, ['Cardio', 'Aufwärmen', 'Dynamisch']),

  ex('hampelmann', 'Hampelmann', 'Star Jumps',
    'Dynamischer Strecksprung mit gespreizten Armen und Beinen.',
    ['Stehe aufrecht.', 'Springe hoch und spreize Arme und Beine sternförmig.', 'Lande weich und wiederhole.'],
    'cardio', ['cardio', 'full_body'], 'cardio', ['none'], 'beginner', 9, ['Cardio', 'Plyometrie', 'Bodyweight']),

  ex('bergsteiger-cardio', 'Bergsteiger (Cardio)', 'Mountain Climbers (Cardio)',
    'Schnelle Mountain Climbers als Cardio-Variante.',
    ['Starte in der Liegestütz-Position.', 'Ziehe die Knie schnell abwechselnd zur Brust.', 'Halte das Tempo hoch.'],
    'cardio', ['cardio', 'abs', 'quadriceps'], 'cardio', ['none'], 'beginner', 11, ['Cardio', 'HIIT', 'Core']),

  ex('seilklettern', 'Seilklettern', 'Rope Climb',
    'Klettere an einem Seil nach oben.',
    ['Greife das Seil mit beiden Händen.', 'Klemme das Seil zwischen den Füßen.', 'Ziehe dich Hand über Hand hoch.'],
    'cardio', ['cardio', 'back', 'biceps', 'abs'], 'cardio', ['none'], 'advanced', 10, ['Klettern', 'Oberkörper', 'Funktionell']),

  ex('skater-jumps', 'Skater Jumps', 'Skater Jumps',
    'Seitliche Sprünge wie beim Eislaufen.',
    ['Springe seitlich auf ein Bein.', 'Schwinge das andere Bein hinter dem Standbein.', 'Springe zur anderen Seite.'],
    'cardio', ['cardio', 'quadriceps', 'glutes'], 'cardio', ['none'], 'intermediate', 9, ['Cardio', 'Lateral', 'Balance']),

  // ==================== MOBILITY/STRETCHING (30) ====================
  ex('katz-kuh', 'Katz-Kuh', 'Cat-Cow',
    'Mobilisation der Wirbelsäule im Vierfüßlerstand.',
    ['Gehe in den Vierfüßlerstand.', 'Runde den Rücken nach oben (Katzenbuckel).', 'Senke den Bauch und schaue nach oben (Kuh).', 'Wechsle fließend.'],
    'mobility', ['lower_back', 'abs'], 'lower_back', ['mat'], 'beginner', 2, ['Mobility', 'Wirbelsäule', 'Aufwärmen']),

  ex('kindshaltung', 'Kindshaltung', 'Child\'s Pose',
    'Entspannende Dehnung für Rücken und Schultern.',
    ['Knie auf der Matte, Gesäß auf den Fersen.', 'Strecke die Arme nach vorne.', 'Senke die Stirn zum Boden.', 'Halte und atme tief.'],
    'mobility', ['back', 'shoulders'], 'back', ['mat'], 'beginner', 2, ['Dehnung', 'Entspannung', 'Rücken']),

  ex('herabschauender-hund', 'Herabschauender Hund', 'Downward Dog',
    'Yoga-Pose für Waden, Hamstrings und Schultern.',
    ['Starte im Vierfüßlerstand.', 'Drücke die Hüfte nach oben und hinten.', 'Strecke Arme und Beine.', 'Drücke die Fersen zum Boden.'],
    'mobility', ['hamstrings', 'calves', 'shoulders'], 'hamstrings', ['mat'], 'beginner', 3, ['Yoga', 'Dehnung', 'Ganzkörper']),

  ex('taubenhaltung', 'Taubenhaltung', 'Pigeon Pose',
    'Tiefe Hüftöffnung und Dehnung des Gesäßmuskels.',
    ['Bringe ein Knie nach vorne, Unterschenkel quer.', 'Strecke das hintere Bein nach hinten.', 'Senke den Oberkörper nach vorne.', 'Halte und wechsle die Seite.'],
    'mobility', ['glutes', 'quadriceps'], 'glutes', ['mat'], 'intermediate', 2, ['Hüfte', 'Dehnung', 'Gesäß']),

  ex('hueftoeffner', 'Hüftöffner', 'Hip Opener',
    'Dynamische Übung zur Mobilisation der Hüftgelenke.',
    ['Stehe aufrecht oder knie auf der Matte.', 'Kreise die Hüfte in großen Bewegungen.', 'Mache Ausfallschritte mit Rotation.'],
    'mobility', ['glutes', 'quadriceps', 'hamstrings'], 'glutes', ['mat'], 'beginner', 3, ['Hüfte', 'Mobilisation', 'Dynamisch']),

  ex('thorakale-rotation', 'Thorakale Rotation', 'Thoracic Rotation',
    'Rotation der Brustwirbelsäule für bessere Beweglichkeit.',
    ['Knie im Vierfüßlerstand, eine Hand hinter dem Kopf.', 'Rotiere den Oberkörper zur Seite nach oben.', 'Kehre zurück und wiederhole.', 'Wechsle die Seite.'],
    'mobility', ['back', 'obliques'], 'back', ['mat'], 'beginner', 2, ['Brustwirbelsäule', 'Rotation', 'Mobilisation']),

  ex('schulter-dislocate', 'Schulter-Dislocate', 'Shoulder Dislocate',
    'Schultermobilisation mit einem Stock oder Band.',
    ['Halte einen Stock breit vor dem Körper.', 'Führe ihn mit gestreckten Armen über den Kopf.', 'Bringe ihn hinter den Rücken und zurück.'],
    'mobility', ['shoulders'], 'shoulders', ['resistance_band'], 'beginner', 2, ['Schulter', 'Mobilisation', 'Flexibilität']),

  ex('worlds-greatest-stretch', 'World\'s Greatest Stretch', 'World\'s Greatest Stretch',
    'Kombinierte Dehnung für Hüfte, Rücken und Schultern.',
    ['Mache einen tiefen Ausfallschritt.', 'Rotiere den Oberkörper und strecke einen Arm nach oben.', 'Strecke das hintere Bein.', 'Wechsle die Seite.'],
    'mobility', ['glutes', 'hamstrings', 'back', 'shoulders'], 'glutes', ['mat'], 'beginner', 3, ['Ganzkörper', 'Dehnung', 'Komplex']),

  ex('faszienrolle-oberschenkel', 'Faszienrolle Oberschenkel', 'Foam Roll Quads',
    'Selbstmassage des Oberschenkels mit der Faszienrolle.',
    ['Lege dich bäuchlings, Faszienrolle unter dem Oberschenkel.', 'Rolle langsam über den gesamten Quadrizeps.', 'Halte bei Schmerzpunkten an.'],
    'mobility', ['quadriceps'], 'quadriceps', ['foam_roller'], 'beginner', 2, ['Faszienrolle', 'Recovery', 'Oberschenkel']),

  ex('faszienrolle-it-band', 'Faszienrolle IT-Band', 'Foam Roll IT Band',
    'Faszienrolle für das iliotibiale Band an der Oberschenkelaußenseite.',
    ['Lege dich seitlich, Rolle unter dem Oberschenkel.', 'Rolle von Hüfte bis Knie.', 'Stütze dich mit den Händen ab.'],
    'mobility', ['quadriceps', 'glutes'], 'quadriceps', ['foam_roller'], 'beginner', 2, ['Faszienrolle', 'IT-Band', 'Recovery']),

  ex('faszienrolle-lat', 'Faszienrolle Lat', 'Foam Roll Lats',
    'Faszienrolle für den breiten Rückenmuskel.',
    ['Lege dich seitlich, Rolle unter der Achsel.', 'Rolle über den seitlichen Rücken.', 'Strecke den Arm über den Kopf.'],
    'mobility', ['back'], 'back', ['foam_roller'], 'beginner', 2, ['Faszienrolle', 'Lat', 'Recovery']),

  ex('nacken-stretching', 'Nacken-Stretching', 'Neck Stretches',
    'Sanfte Dehnung der Nackenmuskulatur.',
    ['Neige den Kopf seitlich zum Ohr.', 'Halte 15-30 Sekunden.', 'Wechsle die Seite.', 'Neige den Kopf nach vorne.'],
    'stretching', ['shoulders'], 'shoulders', ['none'], 'beginner', 1, ['Nacken', 'Dehnung', 'Entspannung']),

  ex('handgelenk-kreise', 'Handgelenk-Kreise', 'Wrist Circles',
    'Mobilisation der Handgelenke durch kreisende Bewegungen.',
    ['Strecke die Arme vor dir aus.', 'Kreise die Handgelenke in beide Richtungen.', 'Mache je 10 Kreise.'],
    'warmup', ['forearms'], 'forearms', ['none'], 'beginner', 1, ['Handgelenk', 'Aufwärmen', 'Mobilisation']),

  ex('knoechel-kreise', 'Knöchel-Kreise', 'Ankle Circles',
    'Mobilisation der Fußgelenke durch Kreisen.',
    ['Hebe einen Fuß an.', 'Kreise den Fuß in beide Richtungen.', 'Mache je 10 Kreise pro Seite.'],
    'warmup', ['calves'], 'calves', ['none'], 'beginner', 1, ['Knöchel', 'Aufwärmen', 'Mobilisation']),

  ex('schmetterlings-stretch', 'Schmetterlings-Stretch', 'Butterfly Stretch',
    'Dehnung der Innenseite der Oberschenkel und Hüftöffner.',
    ['Sitze auf dem Boden, Fußsohlen zusammen.', 'Drücke die Knie sanft nach unten.', 'Lehne dich leicht nach vorne.'],
    'stretching', ['glutes', 'quadriceps'], 'glutes', ['mat'], 'beginner', 2, ['Hüfte', 'Dehnung', 'Innenoberschenkel']),

  ex('hamstring-stretch', 'Hamstring-Stretch', 'Hamstring Stretch',
    'Dehnung der hinteren Oberschenkelmuskulatur.',
    ['Setze dich, ein Bein gestreckt, das andere angewinkelt.', 'Beuge dich mit geradem Rücken nach vorne.', 'Halte 20-30 Sekunden pro Seite.'],
    'stretching', ['hamstrings'], 'hamstrings', ['mat'], 'beginner', 2, ['Hamstrings', 'Dehnung', 'Flexibilität']),

  ex('quadrizeps-stretch', 'Quadrizeps-Stretch', 'Quad Stretch',
    'Dehnung des vorderen Oberschenkels im Stehen.',
    ['Stehe auf einem Bein.', 'Ziehe den Fuß des anderen Beins zum Gesäß.', 'Halte die Knie zusammen.', 'Wechsle die Seite.'],
    'stretching', ['quadriceps'], 'quadriceps', ['none'], 'beginner', 2, ['Quadrizeps', 'Dehnung', 'Stehend']),

  ex('waden-stretch', 'Waden-Stretch', 'Calf Stretch',
    'Dehnung der Wadenmuskulatur an einer Wand.',
    ['Stehe vor einer Wand, ein Fuß nach hinten.', 'Drücke die Ferse des hinteren Fußes in den Boden.', 'Lehne dich leicht zur Wand.'],
    'stretching', ['calves'], 'calves', ['none'], 'beginner', 2, ['Waden', 'Dehnung', 'Flexibilität']),

  ex('hueftbeuger-stretch', 'Hüftbeuger-Stretch', 'Hip Flexor Stretch',
    'Dehnung des Hüftbeugers im Kniestand.',
    ['Knie auf einem Knie, anderer Fuß vorne.', 'Schiebe die Hüfte nach vorne.', 'Halte den Oberkörper aufrecht.', 'Wechsle die Seite.'],
    'stretching', ['quadriceps', 'glutes'], 'quadriceps', ['mat'], 'beginner', 2, ['Hüftbeuger', 'Dehnung', 'Mobilität']),

  ex('brust-oeffner', 'Brust-Öffner', 'Chest Opener',
    'Dehnung der Brustmuskulatur und vorderen Schulter.',
    ['Stehe in einer Tür oder an einer Ecke.', 'Lege den Unterarm an den Rahmen.', 'Drehe den Körper weg.', 'Halte und wechsle die Seite.'],
    'stretching', ['chest', 'shoulders'], 'chest', ['none'], 'beginner', 2, ['Brust', 'Dehnung', 'Haltung']),

  ex('lat-stretch', 'Lat-Stretch', 'Lat Stretch',
    'Dehnung des breiten Rückenmuskels.',
    ['Greife mit einer Hand hoch an einen Türrahmen.', 'Lehne dich seitlich weg.', 'Spüre die Dehnung an der Seite.', 'Wechsle die Seite.'],
    'stretching', ['back'], 'back', ['none'], 'beginner', 2, ['Lat', 'Dehnung', 'Rücken']),

  ex('trizeps-stretch', 'Trizeps-Stretch', 'Tricep Stretch',
    'Dehnung des Trizeps über dem Kopf.',
    ['Bringe einen Arm über den Kopf hinter den Rücken.', 'Drücke den Ellenbogen mit der anderen Hand nach unten.', 'Halte 20-30 Sekunden.'],
    'stretching', ['triceps'], 'triceps', ['none'], 'beginner', 1, ['Trizeps', 'Dehnung', 'Arm']),

  ex('kobra', 'Kobra', 'Cobra Pose',
    'Rückenbeuge-Yoga-Pose für Wirbelsäule und Bauch.',
    ['Lege dich auf den Bauch, Hände neben der Brust.', 'Drücke den Oberkörper nach oben.', 'Halte die Hüfte am Boden.', 'Schaue nach oben.'],
    'mobility', ['abs', 'lower_back'], 'lower_back', ['mat'], 'beginner', 2, ['Yoga', 'Rückenbeuge', 'Dehnung']),

  ex('bruecke', 'Brücke', 'Bridge',
    'Hüftbrücke für Gesäß und Rückenstrecker.',
    ['Lege dich auf den Rücken, Knie angewinkelt.', 'Drücke die Hüfte nach oben.', 'Drücke das Gesäß zusammen.', 'Senke kontrolliert ab.'],
    'mobility', ['glutes', 'lower_back', 'hamstrings'], 'glutes', ['mat'], 'beginner', 3, ['Gesäß', 'Brücke', 'Aktivierung']),

  ex('wirbelsaeulen-rotation', 'Wirbelsäulen-Rotation', 'Spinal Twist',
    'Liegende Rotation der Wirbelsäule.',
    ['Lege dich auf den Rücken, Arme seitlich.', 'Bringe die Knie zur Seite.', 'Schaue zur gegenüberliegenden Seite.', 'Halte und wechsle.'],
    'mobility', ['lower_back', 'obliques'], 'lower_back', ['mat'], 'beginner', 2, ['Wirbelsäule', 'Rotation', 'Entspannung']),

  ex('vierer-stretch', 'Vierer-Stretch', 'Figure Four Stretch',
    'Dehnung für das Gesäß und den Piriformis.',
    ['Lege dich auf den Rücken.', 'Lege einen Knöchel über das andere Knie.', 'Ziehe das untere Bein zur Brust.', 'Halte 30 Sekunden pro Seite.'],
    'stretching', ['glutes'], 'glutes', ['mat'], 'beginner', 2, ['Gesäß', 'Piriformis', 'Dehnung']),

  ex('seitneigung', 'Seitneigung', 'Standing Side Bend',
    'Seitliche Dehnung im Stehen.',
    ['Stehe aufrecht, ein Arm über dem Kopf.', 'Neige den Oberkörper zur Seite.', 'Spüre die Dehnung an der Flanke.', 'Wechsle die Seite.'],
    'stretching', ['obliques'], 'obliques', ['none'], 'beginner', 2, ['Seitlich', 'Dehnung', 'Flanke']),

  ex('armkreise', 'Armkreise', 'Arm Circles',
    'Aufwärm-Übung für die Schultergelenke.',
    ['Strecke die Arme seitlich aus.', 'Mache kleine Kreise und vergrößere sie.', 'Wechsle die Richtung.'],
    'warmup', ['shoulders'], 'shoulders', ['none'], 'beginner', 2, ['Aufwärmen', 'Schultern', 'Kreise']),

  ex('beinschwuenge', 'Beinschwünge', 'Leg Swings',
    'Dynamische Dehnung der Beine durch Schwungbewegungen.',
    ['Halte dich an einer Wand oder Stange fest.', 'Schwinge ein Bein nach vorne und hinten.', 'Mache auch seitliche Schwünge.', 'Wechsle die Seite.'],
    'warmup', ['hamstrings', 'quadriceps', 'glutes'], 'hamstrings', ['none'], 'beginner', 3, ['Aufwärmen', 'Dynamisch', 'Beine']),

  ex('glute-bridge-mobility', 'Glute Bridge (Mobility)', 'Glute Bridge Mobility',
    'Langsame Brücke als Aufwärm- und Mobilisations-Übung.',
    ['Lege dich auf den Rücken, Knie angewinkelt.', 'Hebe die Hüfte langsam Wirbel für Wirbel an.', 'Halte oben kurz.', 'Senke langsam Wirbel für Wirbel ab.'],
    'mobility', ['glutes', 'lower_back'], 'glutes', ['mat'], 'beginner', 2, ['Mobility', 'Gesäß', 'Aufwärmen']),
]

// === Helper Functions ===

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find(e => e.id === id)
}

export function getExercisesByCategory(category: ExerciseCategory): Exercise[] {
  return EXERCISES.filter(e => e.category === category)
}

export function getExercisesByMuscle(muscle: MuscleGroup): Exercise[] {
  return EXERCISES.filter(e => e.muscleGroups.includes(muscle))
}

export function getExercisesByEquipment(equipment: Equipment): Exercise[] {
  return EXERCISES.filter(e => e.equipment.includes(equipment))
}

export function getExercisesByDifficulty(level: FitnessLevel): Exercise[] {
  return EXERCISES.filter(e => e.difficulty === level)
}

export function searchExercises(query: string): Exercise[] {
  const q = query.toLowerCase()
  return EXERCISES.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.nameEn.toLowerCase().includes(q) ||
    e.description.toLowerCase().includes(q) ||
    e.tags.some(t => t.toLowerCase().includes(q))
  )
}

const HOME_EQUIPMENT: Equipment[] = ['none', 'dumbbells', 'resistance_band', 'mat', 'foam_roller', 'pull_up_bar', 'kettlebell']
const OUTDOOR_EQUIPMENT: Equipment[] = ['none', 'resistance_band']

export function getExercisesForLocation(location: 'gym' | 'home' | 'outdoor'): Exercise[] {
  if (location === 'gym') return EXERCISES
  const allowed = location === 'home' ? HOME_EQUIPMENT : OUTDOOR_EQUIPMENT
  return EXERCISES.filter(e => e.equipment.some(eq => allowed.includes(eq)))
}
