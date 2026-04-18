# Fintutto AI Widget

Universelles Chat-Widget für alle Fintutto Apps.

## Einbinden (1 Zeile!)

Füge diesen Script-Tag in **jede App** ein (vor `</body>`):

```html
<script
  src="https://cdn.jsdelivr.net/gh/alexanderdeibel-Fintutto/fintutto-ecosystem@main/packages/ai-widget/dist/fintutto-ai-widget.js"
  data-app-id="vermieterportal"
  data-supabase-url="https://aaefocdqgdgexkcrjhks.supabase.co"
  data-supabase-key="DEIN_ANON_KEY">
</script>
```

## Parameter

| Attribut | Beschreibung | Beispiel |
|----------|--------------|----------|
| `data-app-id` | App-Identifier | `mieterportal`, `vermieterportal`, `vermietify`, etc. |
| `data-supabase-url` | Supabase URL | `https://xxx.supabase.co` |
| `data-supabase-key` | Supabase Anon Key | `eyJ...` |
| `data-color` | (Optional) Custom Farbe | `#ff0000` |
| `data-position` | (Optional) Position | `bottom-right` oder `bottom-left` |

## Verfügbare App-IDs

- `mieterportal` - Grün, Du-Form
- `vermieterportal` - Indigo, Sie-Form
- `vermietify` - Indigo, Sie-Form
- `mieterapp` - Grün, Du-Form
- `formulare` - Lila, Sie-Form
- `rechner` - Orange, Sie-Form
- `betriebskosten` - Blau, Sie-Form

## Selbst hosten

Kopiere `dist/fintutto-ai-widget.js` auf deinen Server oder CDN.

## Beispiel

```html
<!DOCTYPE html>
<html>
<head>
  <title>Meine App</title>
</head>
<body>
  <h1>Willkommen!</h1>

  <!-- Fintutto AI Widget -->
  <script
    src="./fintutto-ai-widget.js"
    data-app-id="vermieterportal"
    data-supabase-url="https://aaefocdqgdgexkcrjhks.supabase.co"
    data-supabase-key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
  </script>
</body>
</html>
```

Der Chat-Button erscheint automatisch unten rechts!
