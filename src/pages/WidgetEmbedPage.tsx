import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Code,
  Copy,
  CheckCircle,
  Shield,
  Calculator,
  FileText,
  Palette,
  ExternalLink,
  Eye,
} from 'lucide-react'

interface WidgetConfig {
  tool: string
  toolType: 'checker' | 'rechner'
  primaryColor: string
  partnerId: string
  width: string
  height: string
}

const EMBEDDABLE_TOOLS = {
  checker: [
    { id: 'mietpreisbremse', name: 'Mietpreisbremse-Checker', icon: Shield },
    { id: 'nebenkosten', name: 'Nebenkosten-Checker', icon: Shield },
    { id: 'mieterhoehung', name: 'Mieterhöhungs-Checker', icon: Shield },
    { id: 'kuendigung', name: 'Kündigungs-Checker', icon: Shield },
    { id: 'kaution', name: 'Kautions-Checker', icon: Shield },
    { id: 'mietminderung', name: 'Mietminderungs-Checker', icon: Shield },
    { id: 'eigenbedarf', name: 'Eigenbedarf-Checker', icon: Shield },
  ],
  rechner: [
    { id: 'kaution', name: 'Kautions-Rechner', icon: Calculator },
    { id: 'mieterhoehung', name: 'Mieterhöhungs-Rechner', icon: Calculator },
    { id: 'kaufnebenkosten', name: 'Kaufnebenkosten-Rechner', icon: Calculator },
    { id: 'rendite', name: 'Rendite-Rechner', icon: Calculator },
    { id: 'eigenkapital', name: 'Eigenkapital-Rechner', icon: Calculator },
    { id: 'grundsteuer', name: 'Grundsteuer-Rechner', icon: Calculator },
    { id: 'nebenkosten', name: 'Nebenkosten-Rechner', icon: Calculator },
  ],
}

const PORTAL_URL = 'https://portal.fintutto.cloud'

function generateEmbedCode(config: WidgetConfig): string {
  const params = new URLSearchParams({
    embed: 'true',
    partner: config.partnerId || 'default',
    color: config.primaryColor.replace('#', ''),
  })

  const toolPath = config.toolType === 'checker'
    ? `/checker/${config.tool}`
    : `/rechner/${config.tool}`

  return `<!-- Fintutto Widget: ${config.tool} -->
<iframe
  src="${PORTAL_URL}${toolPath}?${params.toString()}"
  width="${config.width}"
  height="${config.height}"
  frameborder="0"
  style="border:1px solid #e5e7eb;border-radius:12px;max-width:100%"
  title="Fintutto ${config.toolType === 'checker' ? 'Checker' : 'Rechner'}"
  loading="lazy"
></iframe>
<p style="font-size:11px;color:#9ca3af;margin:4px 0 0">
  Powered by <a href="${PORTAL_URL}" target="_blank" rel="noopener" style="color:#2563eb">Fintutto</a>
</p>`
}

function generateScriptCode(config: WidgetConfig): string {
  const toolPath = config.toolType === 'checker'
    ? `/checker/${config.tool}`
    : `/rechner/${config.tool}`

  return `<!-- Fintutto Widget (Script) -->
<div id="fintutto-widget" data-tool="${toolPath}" data-partner="${config.partnerId || 'default'}" data-color="${config.primaryColor}"></div>
<script src="${PORTAL_URL}/widget.js" async></script>`
}

export default function WidgetEmbedPage() {
  const [config, setConfig] = useState<WidgetConfig>({
    tool: 'mietpreisbremse',
    toolType: 'checker',
    primaryColor: '#2563eb',
    partnerId: '',
    width: '100%',
    height: '700',
  })
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'iframe' | 'script'>('iframe')

  const embedCode = activeTab === 'iframe'
    ? generateEmbedCode(config)
    : generateScriptCode(config)

  const handleCopy = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Code className="h-7 w-7 text-fintutto-primary" />
            <h1 className="text-3xl font-bold text-gray-900">Widget-Einbettung</h1>
          </div>
          <p className="text-gray-600">
            Betten Sie Fintutto-Tools auf Ihrer Website ein. White-Label-fähig und anpassbar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Konfiguration */}
          <div className="space-y-6">
            {/* Tool-Auswahl */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">1. Tool auswählen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Type Toggle */}
                <div className="flex gap-2">
                  <Button
                    variant={config.toolType === 'checker' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setConfig({ ...config, toolType: 'checker', tool: 'mietpreisbremse' })}
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    Checker
                  </Button>
                  <Button
                    variant={config.toolType === 'rechner' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setConfig({ ...config, toolType: 'rechner', tool: 'kaution' })}
                  >
                    <Calculator className="h-4 w-4 mr-1" />
                    Rechner
                  </Button>
                </div>

                {/* Tool Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {EMBEDDABLE_TOOLS[config.toolType].map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => setConfig({ ...config, tool: tool.id })}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-left text-sm transition-all ${
                        config.tool === tool.id
                          ? 'border-fintutto-primary bg-blue-50 text-fintutto-primary'
                          : 'border-border hover:border-gray-300'
                      }`}
                    >
                      <tool.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{tool.name}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Anpassung */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  2. Anpassen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs">Partner-ID (optional)</Label>
                  <Input
                    placeholder="z.B. ihr-firmenname"
                    value={config.partnerId}
                    onChange={(e) => setConfig({ ...config, partnerId: e.target.value })}
                    className="mt-1"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Für Tracking und Provisionsabrechnung
                  </p>
                </div>
                <div>
                  <Label className="text-xs">Primärfarbe</Label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                      className="w-10 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={config.primaryColor}
                      onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Breite</Label>
                    <Input
                      value={config.width}
                      onChange={(e) => setConfig({ ...config, width: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Höhe (px)</Label>
                    <Input
                      value={config.height}
                      onChange={(e) => setConfig({ ...config, height: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preise */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base">White-Label Preise</CardTitle>
                <CardDescription>Einbettung auf Ihrer Website</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Einzelnes Widget</p>
                      <p className="text-xs text-muted-foreground">1 Checker oder Rechner</p>
                    </div>
                    <span className="text-lg font-bold text-fintutto-primary">€99/Mo</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Paket (5 Widgets)</p>
                      <p className="text-xs text-muted-foreground">Beliebige Kombination</p>
                    </div>
                    <span className="text-lg font-bold text-fintutto-primary">€349/Mo</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Unlimitiert + API</p>
                      <p className="text-xs text-muted-foreground">Alle Tools + REST-API</p>
                    </div>
                    <span className="text-lg font-bold text-fintutto-primary">€999/Mo</span>
                  </div>
                </div>
                <Button variant="fintutto" className="w-full mt-4" asChild>
                  <a href="mailto:business@fintutto.com">
                    <FileText className="h-4 w-4 mr-2" />
                    Angebot anfordern
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Code & Preview */}
          <div className="space-y-6">
            {/* Code Output */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">3. Embed-Code</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant={activeTab === 'iframe' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('iframe')}
                    >
                      iFrame
                    </Button>
                    <Button
                      variant={activeTab === 'script' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('script')}
                    >
                      Script
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs leading-relaxed">
                    <code>{embedCode}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-slate-400 hover:text-white"
                    onClick={() => handleCopy(embedCode, 'embed')}
                  >
                    {copied === 'embed' ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Vorschau
                  </CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`${PORTAL_URL}/${config.toolType}/${config.tool}?embed=true&partner=${config.partnerId || 'default'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Öffnen
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                  style={{ height: '400px' }}
                >
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-gray-50">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: config.primaryColor + '20' }}
                    >
                      {config.toolType === 'checker' ? (
                        <Shield className="h-8 w-8" style={{ color: config.primaryColor }} />
                      ) : (
                        <Calculator className="h-8 w-8" style={{ color: config.primaryColor }} />
                      )}
                    </div>
                    <h3 className="text-lg font-bold mb-1">
                      {[...EMBEDDABLE_TOOLS.checker, ...EMBEDDABLE_TOOLS.rechner].find((t) => t.id === config.tool)?.name || config.tool}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Widget-Vorschau · {config.width} × {config.height}px
                    </p>
                    <div className="w-full max-w-xs space-y-2">
                      <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                      <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                      <div
                        className="h-10 rounded-lg text-white flex items-center justify-center font-medium text-sm"
                        style={{ backgroundColor: config.primaryColor }}
                      >
                        Jetzt {config.toolType === 'checker' ? 'prüfen' : 'berechnen'}
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-4">
                      Powered by Fintutto
                      {config.partnerId && ` · Partner: ${config.partnerId}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
