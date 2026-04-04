# Fintutto.World Design System Katalog

Dieses Dokument ist der umfassende Katalog aller Design-Elemente, Komponenten und Stile, die auf der Fintutto.World Plattform verwendet werden. Es dient als Referenz für Entwickler und KI-Agenten, um sicherzustellen, dass jede neue Seite den "Goldstandard" erreicht.

## 1. Kern-Philosophie

Das Fintutto-Design ist inspiriert von modernen, hochwertigen Tech-Brands (Apple-Style). Es kombiniert:
- **Dunkle, tiefe Hintergründe** (Deep Space / Violett)
- **Leuchtende, neon-artige Akzente** (Cyan, Pink, Emerald)
- **Glassmorphism** (Durchscheinende Karten mit weichen Rändern)
- **Klare, fette Typografie** (Inter)
- **Großzügiges Spacing** (Viel Weißraum/Negativraum)

## 2. Farbpalette

### 2.1 Hintergrund
Der globale Hintergrund ist immer dunkel. Es gibt keine weißen Seiten.
- **Base Background:** `#2d1b4e` (Wird in `index.css` auf `html` gesetzt)

### 2.2 Akzent-Gradients (Text)
Verwende diese Tailwind-Klassen für Überschriften und Highlights:

| Name | Tailwind-Klassen | Verwendung |
|---|---|---|
| **Premium Pink** | `bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent` | Haupt-Headlines, Hero-Sektionen |
| **Tech Cyan** | `bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent` | Technologie, Features, Trust |
| **Success Emerald** | `bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent` | ROI, Preise, Erfolg |
| **Brand Translator** | `.gradient-text-translator` (Custom CSS) | Markenname, Kernprodukt |

### 2.3 Semantische Farben
- **Text Primary:** `text-white` (Für Headlines)
- **Text Secondary:** `text-gray-300` oder `text-white/70` (Für Fließtext)
- **Borders:** `border-white/10` (Subtile Trennlinien)

## 3. Glassmorphism & Karten

Das wichtigste visuelle Element sind die Glass-Cards. Sie schweben über dem Hintergrund.

### 3.1 Die Standard Glass-Card
Verwende immer die Klasse `.glass-card`.

```tsx
<div className="glass-card p-8">
  <h3 className="text-xl font-bold text-white mb-2">Titel</h3>
  <p className="text-gray-300">Beschreibungstext hier.</p>
</div>
```

### 3.2 Interaktive Glass-Card (Hover)
Für klickbare Elemente (Links, Buttons, Feature-Karten):

```tsx
<div className="glass-card p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-black/50 hover:border-white/30 cursor-pointer">
  {/* Inhalt */}
</div>
```

## 4. Komponenten-Bibliothek

### 4.1 Hero Section
Die Hero-Sektion ist das erste, was der Nutzer sieht. Sie muss knallen.

```tsx
<section className="relative pt-32 pb-20 overflow-hidden">
  <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center">
    <div className="inline-flex items-center px-4 py-2 rounded-full glass-card text-sm font-medium text-purple-300 mb-8">
      <span className="flex w-2 h-2 rounded-full bg-purple-400 mr-2 animate-pulse"></span>
      Neu: Das Feature
    </div>
    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8">
      Die Headline <br />
      <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        mit Gradient
      </span>
    </h1>
    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
      Ein starker Subtext, der das Problem löst und den Nutzen klar kommuniziert.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button className="px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25">
        Primary Action
      </button>
      <button className="px-8 py-4 rounded-xl font-semibold text-white glass-card hover:bg-white/10 transition-all">
        Secondary Action
      </button>
    </div>
  </div>
</section>
```

### 4.2 Feature Grid (3 Spalten)
Für die Darstellung von Funktionen oder Use-Cases.

```tsx
<section className="py-24 relative">
  <div className="container max-w-7xl mx-auto px-4">
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Features</h2>
      <p className="text-gray-300 max-w-2xl mx-auto">Was das Produkt kann.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Feature Card 1 */}
      <div className="glass-card p-8">
        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 mb-6">
          <IconName className="w-6 h-6 text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">Feature Titel</h3>
        <p className="text-gray-300 leading-relaxed">
          Beschreibung des Features mit Fokus auf den Nutzen für den Anwender.
        </p>
      </div>
      {/* Weitere Karten... */}
    </div>
  </div>
</section>
```

### 4.3 Pain-Point Sektion ("Das kennst du")
Eine emotionale Sektion, die das Problem der Persona anspricht.

```tsx
<section className="py-24 relative">
  <div className="container max-w-7xl mx-auto px-4">
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Das kennst du.</h2>
      <p className="text-gray-300 max-w-2xl mx-auto">Der Alltag ist oft kompliziert.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="glass-card p-8 border-red-500/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/50 to-transparent"></div>
        <h3 className="text-xl font-bold text-white mb-3">Das Problem</h3>
        <p className="text-gray-300">Die emotionale Beschreibung des Schmerzes.</p>
      </div>
    </div>
  </div>
</section>
```

## 5. Best Practices für Agenten

1. **Niemals weiße Hintergründe:** Nutze immer den globalen dunklen Hintergrund.
2. **Immer Glass-Cards:** Nutze `.glass-card` für alle Container, die sich vom Hintergrund abheben sollen.
3. **Gradients sparsam einsetzen:** Nutze Gradients für Headlines und Primary Buttons, aber nicht für Fließtext.
4. **Mobile First:** Stelle sicher, dass Grids auf Mobile (`grid-cols-1`) umbrechen und Paddings angepasst sind.
5. **Kontrast:** Fließtext muss immer gut lesbar sein (`text-gray-300` auf dunklem Grund).
6. **Konsistenz:** Kopiere keine alten, abweichenden Stile. Nutze exakt diese Vorlagen.
