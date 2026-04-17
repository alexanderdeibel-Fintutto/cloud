/**
 * DocumentEntityLinker
 *
 * Komponente für die Detailansicht eines Dokuments in SecondBrain.
 * Ermöglicht die Zuordnung eines Dokuments zu Entitäten aus anderen Apps:
 *   - Gebäude (Vermietify)
 *   - Einheiten (Vermietify)
 *   - Mieter (Vermietify)
 *   - Firmen (Financial Compass)
 *   - Ausgaben (Financial Compass)
 *   - Zähler (Ablesung)
 */

import { useState } from 'react';
import { Building2, Briefcase, User, Zap, Plus, X, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import supabase from '@/integrations/supabase';

// ── Typen ────────────────────────────────────────────────────────────────────

type EntityType = 'building' | 'unit' | 'tenant' | 'business' | 'meter';

interface EntityLink {
  entity_type: EntityType;
  entity_id: string;
  linked_at: string;
  notes?: string | null;
  // Aufgelöste Anzeigenamen (werden separat geladen)
  display_name?: string;
}

interface Suggestion {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  confidence: number;
  reason?: string;
  display_name?: string;
}

interface DocumentEntityLinkerProps {
  documentId: string;
}

// ── Hilfsfunktionen ──────────────────────────────────────────────────────────

const ENTITY_CONFIG: Record<EntityType, { label: string; icon: typeof Building2; color: string; table: string; nameField: string }> = {
  building: {
    label: 'Gebäude',
    icon: Building2,
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    table: 'buildings',
    nameField: 'name',
  },
  unit: {
    label: 'Einheit',
    icon: Building2,
    color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    table: 'units',
    nameField: 'unit_number',
  },
  tenant: {
    label: 'Mieter',
    icon: User,
    color: 'bg-green-500/10 text-green-400 border-green-500/20',
    table: 'tenants',
    nameField: 'first_name',
  },
  business: {
    label: 'Firma',
    icon: Briefcase,
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    table: 'biz_businesses',
    nameField: 'name',
  },
  meter: {
    label: 'Zähler',
    icon: Zap,
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    table: 'meters',
    nameField: 'meter_number',
  },
};

// ── Haupt-Komponente ─────────────────────────────────────────────────────────

export default function DocumentEntityLinker({ documentId }: DocumentEntityLinkerProps) {
  const [links, setLinks] = useState<EntityLink[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType>('building');
  const [availableEntities, setAvailableEntities] = useState<{ id: string; name: string }[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(false);

  // Verknüpfungen laden
  const loadLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_entity_links_for_document', {
        p_document_id: documentId,
      });
      if (error) throw error;

      // Anzeigenamen für jede Entität laden
      const linksWithNames = await Promise.all(
        (data as EntityLink[]).map(async (link) => {
          const config = ENTITY_CONFIG[link.entity_type];
          if (!config) return link;
          const { data: entity } = await supabase
            .from(config.table)
            .select(`id, ${config.nameField}`)
            .eq('id', link.entity_id)
            .single();
          return {
            ...link,
            display_name: entity
              ? link.entity_type === 'tenant'
                ? `${(entity as any).first_name} ${(entity as any).last_name || ''}`
                : (entity as any)[config.nameField]
              : link.entity_id,
          };
        })
      );
      setLinks(linksWithNames);

      // KI-Vorschläge laden
      const { data: suggestionsData } = await supabase
        .from('sb_document_suggestions')
        .select('*')
        .eq('document_id', documentId)
        .eq('status', 'pending')
        .order('confidence', { ascending: false });

      if (suggestionsData) {
        const suggestionsWithNames = await Promise.all(
          (suggestionsData as Suggestion[]).map(async (s) => {
            const config = ENTITY_CONFIG[s.entity_type];
            if (!config) return s;
            const { data: entity } = await supabase
              .from(config.table)
              .select(`id, ${config.nameField}`)
              .eq('id', s.entity_id)
              .single();
            return {
              ...s,
              display_name: entity ? (entity as any)[config.nameField] : s.entity_id,
            };
          })
        );
        setSuggestions(suggestionsWithNames);
      }
    } catch (err) {
      console.error('Fehler beim Laden der Verknüpfungen:', err);
    } finally {
      setLoading(false);
    }
  };

  // Verknüpfung hinzufügen
  const addLink = async (entityId: string) => {
    const { error } = await supabase
      .from('sb_document_entity_links')
      .upsert({
        document_id: documentId,
        entity_type: selectedEntityType,
        entity_id: entityId,
      });
    if (!error) {
      setAddDialogOpen(false);
      loadLinks();
    }
  };

  // Verknüpfung entfernen
  const removeLink = async (link: EntityLink) => {
    const { error } = await supabase
      .from('sb_document_entity_links')
      .delete()
      .eq('document_id', documentId)
      .eq('entity_type', link.entity_type)
      .eq('entity_id', link.entity_id);
    if (!error) loadLinks();
  };

  // KI-Vorschlag akzeptieren
  const acceptSuggestion = async (suggestion: Suggestion) => {
    await supabase
      .from('sb_document_suggestions')
      .update({ status: 'accepted' })
      .eq('id', suggestion.id);
    await supabase
      .from('sb_document_entity_links')
      .upsert({
        document_id: documentId,
        entity_type: suggestion.entity_type,
        entity_id: suggestion.entity_id,
        notes: `KI-Vorschlag akzeptiert (${Math.round(suggestion.confidence * 100)}%)`,
      });
    loadLinks();
  };

  // KI-Vorschlag ablehnen
  const rejectSuggestion = async (suggestion: Suggestion) => {
    await supabase
      .from('sb_document_suggestions')
      .update({ status: 'rejected' })
      .eq('id', suggestion.id);
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
  };

  // Verfügbare Entitäten für den Dialog laden
  const loadAvailableEntities = async (type: EntityType) => {
    setLoadingEntities(true);
    const config = ENTITY_CONFIG[type];
    const { data } = await supabase
      .from(config.table)
      .select(`id, ${config.nameField}`)
      .limit(50);
    setAvailableEntities(
      (data || []).map((e: any) => ({
        id: e.id,
        name: type === 'tenant'
          ? `${e.first_name} ${e.last_name || ''}`
          : e[config.nameField],
      }))
    );
    setLoadingEntities(false);
  };

  // Beim ersten Render laden
  if (!loading && links.length === 0 && suggestions.length === 0) {
    loadLinks();
  }

  return (
    <div className="space-y-4">
      {/* KI-Vorschläge */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            KI-Vorschläge
          </h4>
          {suggestions.map((suggestion) => {
            const config = ENTITY_CONFIG[suggestion.entity_type];
            if (!config) return null;
            const Icon = config.icon;
            return (
              <div
                key={suggestion.id}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-primary/20 bg-primary/5"
              >
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{suggestion.display_name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {config.label} · {Math.round(suggestion.confidence * 100)}% Konfidenz
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-green-500 hover:text-green-400"
                    onClick={() => acceptSuggestion(suggestion)}
                    title="Akzeptieren"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive/80"
                    onClick={() => rejectSuggestion(suggestion)}
                    title="Ablehnen"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bestehende Verknüpfungen */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Lade Verknüpfungen...
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(ENTITY_CONFIG).map(([type, config]) => {
            const typeLinks = links.filter((l) => l.entity_type === type);
            const Icon = config.icon;
            return (
              <div key={type} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{config.label}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs px-2"
                    onClick={() => {
                      setSelectedEntityType(type as EntityType);
                      loadAvailableEntities(type as EntityType);
                      setAddDialogOpen(true);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Hinzufügen
                  </Button>
                </div>
                {typeLinks.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {typeLinks.map((link) => (
                      <Badge
                        key={`${link.entity_type}-${link.entity_id}`}
                        variant="secondary"
                        className={`text-xs pr-1 ${config.color}`}
                      >
                        {link.display_name || link.entity_id}
                        <button
                          className="ml-1.5 hover:opacity-70"
                          onClick={() => removeLink(link)}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic">Keine Zuordnung</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog: Entität auswählen */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {ENTITY_CONFIG[selectedEntityType]?.label} zuordnen
            </DialogTitle>
          </DialogHeader>
          {loadingEntities ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : availableEntities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Keine Einträge gefunden.
            </p>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {availableEntities.map((entity) => (
                <button
                  key={entity.id}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent text-sm transition-colors"
                  onClick={() => addLink(entity.id)}
                >
                  {entity.name}
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
