import { useState } from "react";
import { Mail, Copy, Check, Plus, X, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  useEmailInbox,
  useCreateInbox,
  useVerifiedSenders,
  useAddVerifiedSender,
  useRemoveVerifiedSender,
  useUserCompany,
} from "@/hooks/useDocuments";

export function EmailSetupCard() {
  const { data: inbox, isLoading: inboxLoading } = useEmailInbox();
  const { data: senders = [] } = useVerifiedSenders();
  const { data: userCompany } = useUserCompany();
  const createInbox = useCreateInbox();
  const addSender = useAddVerifiedSender();
  const removeSender = useRemoveVerifiedSender();

  const [copied, setCopied] = useState(false);
  const [newSenderEmail, setNewSenderEmail] = useState("");
  const [showAddSender, setShowAddSender] = useState(false);

  const handleCopy = () => {
    if (inbox?.email_address) {
      navigator.clipboard.writeText(inbox.email_address);
      setCopied(true);
      toast.success("E-Mail-Adresse kopiert");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateInbox = () => {
    if (!userCompany) {
      toast.error("Keine Firma zugeordnet");
      return;
    }
    const companyName = userCompany.companies.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    createInbox.mutate({
      companyId: userCompany.company_id,
      prefix: `belege-${companyName}`,
    });
  };

  const handleAddSender = () => {
    if (!newSenderEmail || !userCompany) return;
    addSender.mutate(
      { companyId: userCompany.company_id, email: newSenderEmail },
      {
        onSuccess: () => {
          setNewSenderEmail("");
          setShowAddSender(false);
        },
      }
    );
  };

  if (inboxLoading) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4" />
          E-Mail-Eingang
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email Address */}
        {inbox ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Sende Belege als PDF an diese Adresse:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-accent/50 text-sm px-3 py-2 rounded-lg font-mono truncate">
                {inbox.email_address}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Mail className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Erstelle eine E-Mail-Adresse für den Belegempfang
            </p>
            <Button
              onClick={handleCreateInbox}
              disabled={createInbox.isPending || !userCompany}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              E-Mail-Adresse generieren
            </Button>
          </div>
        )}

        {inbox && (
          <>
            <Separator />

            {/* Verified Senders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Verifizierte Absender
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowAddSender(!showAddSender)}
                >
                  {showAddSender ? (
                    <X className="h-3 w-3" />
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                </Button>
              </div>

              {showAddSender && (
                <div className="flex gap-2">
                  <Input
                    placeholder="absender@beispiel.de"
                    type="email"
                    value={newSenderEmail}
                    onChange={(e) => setNewSenderEmail(e.target.value)}
                    className="text-sm h-9"
                    onKeyDown={(e) => e.key === "Enter" && handleAddSender()}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddSender}
                    disabled={addSender.isPending || !newSenderEmail}
                    className="h-9"
                  >
                    Hinzufügen
                  </Button>
                </div>
              )}

              {senders.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  Noch keine Absender hinterlegt
                </p>
              ) : (
                <div className="space-y-1.5">
                  {senders.map((sender) => (
                    <div
                      key={sender.id}
                      className="flex items-center justify-between bg-accent/30 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm truncate">{sender.email}</span>
                        {sender.is_verified && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 border-success/50 text-success"
                          >
                            Verifiziert
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeSender.mutate(sender.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
