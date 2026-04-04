# Fintutto.World Design System & Style Guide

> **WICHTIG FÜR ALLE AGENTEN UND ENTWICKLER:**
> Diese Datei ist die "Single Source of Truth" für das visuelle Design von fintutto.world.
> Jede neue Seite, jede neue Komponente und jedes Redesign MUSS diesen Richtlinien folgen.
> Das Ziel ist ein konsistentes, hochwertiges "Apple-Style" Design mit Glassmorphism und Mesh-Gradienten.

## 1. Globale Architektur & Hintergrund

Das gesamte Fintutto-Universum nutzt einen dunklen, vollflächigen Hintergrund. Es gibt **keine** weißen Seiten im Sales- oder Landing-Bereich.

### 1.1 Der globale Hintergrund
Der Hintergrund wird zentral in `src/index.css` und `LandingLayout.tsx` gesteuert.
- **Base Color:** `#2d1b4e` (Dunkles Violett)
- **Mesh Gradient:** Ein weicher, animierter oder statischer Mesh-Gradient liegt über der Base Color.
- **Regel:** Setze NIEMALS `bg-white` oder `bg-gray-50` auf Haupt-Containern.

## 2. Glassmorphism (Das Kern-Element)

Alle Karten, Container und hervorgehobenen Sektionen nutzen den Glassmorphism-Effekt. Dies schafft Tiefe und lässt den Mesh-Gradienten durchscheinen.

### 2.1 Die Standard Glass-Card
Verwende immer die globale CSS-Klasse `.glass-card` aus `index.css`.

```css
/* Definition in index.css */
.glass-card {
  background: rgba(0, 0, 0, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

**Verwendung in React/Tailwind:**
```tsx
<div className="glass-card p-6">
  <h3>Inhalt</h3>
</div>
```

### 2.2 Interaktive Glass-Cards (Hover-Effekte)
Für klickbare Karten (z.B. Branchen-Auswahl, Features) wird die Glass-Card mit Tailwind-Hover-Klassen erweitert:

```tsx
<Link 
  to="/route" 
  className="glass-card p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-black/50 hover:border-white/30"
>
  Inhalt
</Link>
```

## 3. Farbpalette & Akzente

Fintutto nutzt leuchtende, neon-artige Akzentfarben auf dem dunklen Hintergrund.

### 3.1 Primäre Akzentfarben (Gradients)
Texte und Icons werden oft mit Gradienten hervorgehoben.

**Standard Translator Gradient:**
```css
.gradient-text-translator {
  background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 50%, #38bdf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

**Häufig genutzte Tailwind-Gradients für Text:**
- **Violett/Pink (Premium/Hero):** `bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent`
- **Cyan/Blau (Tech/Trust):** `bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent`
- **Emerald/Teal (Erfolg/ROI):** `bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent`

### 3.2 Semantische Farben (Tailwind)
- **Primary:** `text-primary` (Cyan/Blau)
- **Muted Text:** `text-gray-300` oder `text-white/70` (für Fließtext auf dunklem Grund)
- **Borders:** `border-white/10` oder `border-white/20`

## 4. Typografie

- **Font-Family:** Inter (sans-serif)
- **Headings:** Bold (`font-bold`), oft mit Tracking-Tight (`tracking-tight`)
- **Fließtext:** Regular oder Medium, immer gut lesbar mit ausreichend Line-Height (`leading-relaxed`)

### 4.1 Hierarchie-Beispiele
```tsx
{/* Hero Headline */}
<h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
  Die <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Zukunft</span> der Übersetzung
</h1>

{/* Section Headline */}
<h2 className="text-3xl font-bold text-white mb-4">
  Features
</h2>

{/* Fließtext */}
<p className="text-lg text-gray-300 leading-relaxed">
  Beschreibungstext mit gutem Kontrast zum dunklen Hintergrund.
</p>
```

## 5. Komponenten-Katalog

### 5.1 Badges / Tags
Kleine, leuchtende Labels für Kategorien oder Status.

```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
  Neu
</span>
```

### 5.2 Buttons
**Primary Button (Call to Action):**
```tsx
<button className="px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25">
  Jetzt starten
</button>
```

**Secondary Button (Outline/Glass):**
```tsx
<button className="px-8 py-4 rounded-xl font-semibold text-white glass-card hover:bg-white/10 transition-all">
  Mehr erfahren
</button>
```

### 5.3 Feature Icons (Glow Effect)
Icons in Features bekommen oft einen weichen Glow-Hintergrund.

```tsx
<div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 mb-4">
  <Icon className="w-6 h-6 text-purple-400" />
</div>
```

## 6. Layout & Spacing

- **Container:** Verwende `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` für Hauptinhalte.
- **Section Spacing:** Großzügiger Abstand zwischen Sektionen (`py-24` oder `py-32`).
- **Grid:** Verwende CSS Grid für Karten-Layouts (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`).

## 7. Mobile Optimization

- **Touch Targets:** Buttons und Links müssen mindestens 44x44px groß sein.
- **Stacking:** Grids brechen auf Mobile immer auf 1 Spalte um (`grid-cols-1`).
- **Padding:** Reduziere Padding auf Mobile (`p-4` statt `p-8`).
- **Text:** Reduziere Schriftgrößen auf Mobile (`text-3xl` statt `text-5xl`).

## 8. Animationen

Dezente Animationen erhöhen die Wertigkeit.
- **Fade In Up:** Für Sektionen beim Scrollen.
- **Pulse:** Für Live-Indikatoren (siehe `.pulse-mic` in `index.css`).
- **Hover:** Weiche Transitions (`transition-all duration-300`).

---
**Agenten-Instruktion:**
Wenn du eine neue Seite erstellst, kopiere NICHT einfach alte Seiten. Nutze diese Bausteine, um eine saubere, performante und visuell konsistente Seite im Fintutto-Goldstandard zu bauen.
