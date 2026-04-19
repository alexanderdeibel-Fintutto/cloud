import { useState } from "react";
import { FileText, HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmailSetupCard } from "@/components/documents/EmailSetupCard";
import { DocumentList } from "@/components/documents/DocumentList";
import { QuestionsList } from "@/components/documents/QuestionsList";
import { useDocuments, useDocumentQuestions } from "@/hooks/useDocuments";
import { cn } from "@/lib/utils";

const statusFilters = [
  { value: "all", label: "Alle" },
  { value: "pending", label: "Ausstehend" },
  { value: "processed", label: "Verarbeitet" },
  { value: "needs_review", label: "Prüfung nötig" },
  { value: "booked", label: "Gebucht" },
] as const;

export default function DocumentsPage() {
  const { data: documents = [], isLoading: docsLoading } = useDocuments();
  const { data: questions = [], isLoading: questionsLoading } = useDocumentQuestions();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const openQuestionsCount = questions.length;

  const filteredDocuments =
    statusFilter === "all"
      ? documents
      : documents.filter((d) => d.status === statusFilter);

  return (
    <div className="min-h-screen">
      <PageHeader title="Belege" />

      <div className="px-4 py-4 space-y-4">
        {/* Email Setup */}
        <EmailSetupCard />

        {/* Tabs: Belege / Offene Fragen */}
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="documents" className="flex-1 gap-1.5">
              <FileText className="h-4 w-4" />
              Belege
              {documents.length > 0 && (
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                  {documents.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex-1 gap-1.5">
              <HelpCircle className="h-4 w-4" />
              Offene Fragen
              {openQuestionsCount > 0 && (
                <Badge
                  variant="destructive"
                  className="text-[10px] h-5 px-1.5"
                >
                  {openQuestionsCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-4 space-y-3">
            {/* Status Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
              {statusFilters.map((f) => {
                const count =
                  f.value === "all"
                    ? documents.length
                    : documents.filter((d) => d.status === f.value).length;
                const isActive = statusFilter === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors border",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {f.label}
                    {count > 0 && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold",
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <DocumentList documents={filteredDocuments} isLoading={docsLoading} />
          </TabsContent>

          <TabsContent value="questions" className="mt-4">
            <QuestionsList questions={questions} isLoading={questionsLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}