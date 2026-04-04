import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Cpu, MessageSquare, Shield, Gauge, AlertTriangle, DollarSign } from 'lucide-react';
import {
  useAIModels, useAIPersonas, useAISystemPrompts, useAIRateLimits,
  useAIFeatureGates, useAICostsSummary, useAIErrors, useUpdateAIModel
} from '@/hooks/useAIConfig';

export default function AIConfig() {
  const { data: models, isLoading: modelsLoading } = useAIModels();
  const { data: personas } = useAIPersonas();
  const { data: prompts } = useAISystemPrompts();
  const { data: rateLimits } = useAIRateLimits();
  const { data: featureGates } = useAIFeatureGates();
  const { data: costs } = useAICostsSummary();
  const { data: errors } = useAIErrors();
  const updateModel = useUpdateAIModel();

  const totalCost = costs?.reduce((sum, c) => sum + (c.cost_usd || 0), 0) || 0;
  const totalRequests = costs?.reduce((sum, c) => sum + (c.requests || 0), 0) || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">KI-Konfiguration</h1>
          <p className="text-muted-foreground">Modelle, Personas, Prompts, Rate Limits und Feature Gates</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Modelle</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{models?.length || 0}</div>
              <p className="text-xs text-muted-foreground">{models?.filter(m => m.is_active).length || 0} aktiv</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Kosten (30T)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{totalRequests.toLocaleString()} Requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Personas</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{personas?.length || 0}</div>
              <p className="text-xs text-muted-foreground">{personas?.filter(p => p.is_active).length || 0} aktiv</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Fehler</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{errors?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="models" className="space-y-4">
          <TabsList>
            <TabsTrigger value="models">Modelle ({models?.length || 0})</TabsTrigger>
            <TabsTrigger value="personas">Personas ({personas?.length || 0})</TabsTrigger>
            <TabsTrigger value="prompts">System Prompts ({prompts?.length || 0})</TabsTrigger>
            <TabsTrigger value="limits">Rate Limits ({rateLimits?.length || 0})</TabsTrigger>
            <TabsTrigger value="gates">Feature Gates ({featureGates?.length || 0})</TabsTrigger>
            <TabsTrigger value="costs">Kosten</TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Modell</th>
                    <th className="p-3 text-left text-sm font-medium">Provider</th>
                    <th className="p-3 text-right text-sm font-medium">Input $/1k</th>
                    <th className="p-3 text-right text-sm font-medium">Output $/1k</th>
                    <th className="p-3 text-right text-sm font-medium">Max Tokens</th>
                    <th className="p-3 text-center text-sm font-medium">Aktiv</th>
                  </tr>
                </thead>
                <tbody>
                  {modelsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b"><td colSpan={6} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>
                    ))
                  ) : models?.map((model) => (
                    <tr key={model.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="font-medium">{model.display_name}</div>
                        <div className="text-xs text-muted-foreground">{model.model_key}</div>
                      </td>
                      <td className="p-3"><Badge variant="outline">{model.provider || '–'}</Badge></td>
                      <td className="p-3 text-right">${model.input_cost_per_1k || 0}</td>
                      <td className="p-3 text-right">${model.output_cost_per_1k || 0}</td>
                      <td className="p-3 text-right">{model.max_tokens?.toLocaleString() || '–'}</td>
                      <td className="p-3 text-center">
                        <Switch checked={model.is_active ?? false} onCheckedChange={() => updateModel.mutate({ id: model.id, is_active: !model.is_active })} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="personas" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {personas?.map((persona) => (
                <Card key={persona.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{persona.name}</CardTitle>
                      <Badge className={persona.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700'}>
                        {persona.is_active ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{persona.description}</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-muted-foreground">Ton:</span><span>{persona.tone || '–'}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Formalitat:</span><span>{persona.formality || '–'}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">User Typ:</span><span>{persona.user_type || '–'}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Tier:</span><span>{persona.subscription_tier || '–'}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Upgrade Sens.:</span><span>{persona.upgrade_sensitivity || '–'}</span></div>
                    </div>
                    {persona.relevant_apps && persona.relevant_apps.length > 0 && (
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {persona.relevant_apps.map(app => <Badge key={app} variant="outline" className="text-xs">{app}</Badge>)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="prompts" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Name</th>
                    <th className="p-3 text-left text-sm font-medium">Key</th>
                    <th className="p-3 text-left text-sm font-medium">Kategorie</th>
                    <th className="p-3 text-right text-sm font-medium">Max Tokens</th>
                    <th className="p-3 text-left text-sm font-medium">Prompt (Vorschau)</th>
                  </tr>
                </thead>
                <tbody>
                  {prompts?.map((prompt) => (
                    <tr key={prompt.prompt_key} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{prompt.name || '–'}</td>
                      <td className="p-3"><code className="text-xs bg-muted px-1 py-0.5 rounded">{prompt.prompt_key}</code></td>
                      <td className="p-3"><Badge variant="outline">{prompt.category || '–'}</Badge></td>
                      <td className="p-3 text-right">{prompt.max_tokens || '–'}</td>
                      <td className="p-3 text-sm text-muted-foreground truncate max-w-[300px]">{prompt.system_prompt?.slice(0, 80) || '–'}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="limits" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">App ID</th>
                    <th className="p-3 text-left text-sm font-medium">Tier</th>
                    <th className="p-3 text-right text-sm font-medium">Taglich</th>
                    <th className="p-3 text-right text-sm font-medium">Monatlich</th>
                    <th className="p-3 text-right text-sm font-medium">Req/Min</th>
                  </tr>
                </thead>
                <tbody>
                  {rateLimits?.map((limit) => (
                    <tr key={limit.id} className="border-b hover:bg-muted/50">
                      <td className="p-3"><code className="text-xs">{limit.app_id?.slice(0, 12) || 'global'}...</code></td>
                      <td className="p-3"><Badge variant="outline">{limit.tier || 'all'}</Badge></td>
                      <td className="p-3 text-right">{limit.daily_limit?.toLocaleString() || '∞'}</td>
                      <td className="p-3 text-right">{limit.monthly_limit?.toLocaleString() || '∞'}</td>
                      <td className="p-3 text-right">{limit.requests_per_minute || '∞'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="gates" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Feature</th>
                    <th className="p-3 text-left text-sm font-medium">App ID</th>
                    <th className="p-3 text-left text-sm font-medium">Min. Tier</th>
                    <th className="p-3 text-center text-sm font-medium">Aktiv</th>
                  </tr>
                </thead>
                <tbody>
                  {featureGates?.map((gate) => (
                    <tr key={gate.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{gate.feature_key || '–'}</td>
                      <td className="p-3"><code className="text-xs">{gate.app_id?.slice(0, 12) || 'global'}...</code></td>
                      <td className="p-3"><Badge variant="outline">{gate.min_tier || 'free'}</Badge></td>
                      <td className="p-3 text-center">
                        <Badge className={gate.is_enabled ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700'}>
                          {gate.is_enabled ? 'Ja' : 'Nein'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="costs" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Datum</th>
                    <th className="p-3 text-right text-sm font-medium">Requests</th>
                    <th className="p-3 text-right text-sm font-medium">Tokens</th>
                    <th className="p-3 text-right text-sm font-medium">Kosten (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {costs?.map((c, i) => (
                    <tr key={i} className="border-b hover:bg-muted/50">
                      <td className="p-3">{c.date ? new Date(c.date).toLocaleDateString('de-DE') : '–'}</td>
                      <td className="p-3 text-right">{c.requests?.toLocaleString() || 0}</td>
                      <td className="p-3 text-right">{c.tokens?.toLocaleString() || 0}</td>
                      <td className="p-3 text-right font-medium">${(c.cost_usd || 0).toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
