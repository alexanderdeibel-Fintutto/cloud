import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Play, 
  Square, 
  Pause,
  Camera, 
  Check, 
  Clock,
  MessageSquare,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useTask, useUpdateTaskStatus } from "@/hooks/useTasks";
import { useTaskNotes, useCreateTaskNote } from "@/hooks/useTaskNotes";
import { useCreateTimeEntry, useTotalTimeForTask } from "@/hooks/useTimeEntries";
import type { TaskStatus } from "@/types";

const priorityConfig = {
  low: { label: "Niedrig", className: "priority-low" },
  medium: { label: "Mittel", className: "priority-medium" },
  high: { label: "Hoch", className: "priority-high" },
  urgent: { label: "Dringend", className: "priority-urgent" },
};

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: task, isLoading } = useTask(id);
  const { data: notes = [] } = useTaskNotes(id);
  const totalMinutes = useTotalTimeForTask(id);
  
  const updateStatus = useUpdateTaskStatus();
  const createNote = useCreateTaskNote();
  const createTimeEntry = useCreateTimeEntry();

  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [trackingTime, setTrackingTime] = useState(0);
  const [newNote, setNewNote] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer interval effect
  useEffect(() => {
    if (isTracking && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTrackingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isTracking, isPaused]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTracking = () => {
    setIsTracking(true);
    setIsPaused(false);
    toast({
      title: "Zeiterfassung gestartet ⏱️",
      description: `Timer läuft für: ${task?.title}`,
    });
  };

  const handlePauseTracking = () => {
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? "Timer fortgesetzt ▶️" : "Timer pausiert ⏸️",
      description: `Aktuelle Zeit: ${formatTime(trackingTime)}`,
    });
  };

  const handleStopTracking = () => {
    if (!id) return;
    
    createTimeEntry.mutate(
      { taskId: id, durationSeconds: trackingTime },
      {
        onSuccess: () => {
          const minutes = Math.floor(trackingTime / 60);
          toast({
            title: "Zeit erfasst ✅",
            description: `${minutes > 0 ? `${minutes} Minuten` : `${trackingTime} Sekunden`} wurden gespeichert`,
          });
        },
        onError: () => {
          toast({
            title: "Fehler",
            description: "Die Zeit konnte nicht gespeichert werden",
            variant: "destructive",
          });
        },
      }
    );
    
    setIsTracking(false);
    setIsPaused(false);
    setTrackingTime(0);
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (!id) return;
    
    updateStatus.mutate(
      { taskId: id, status: newStatus },
      {
        onSuccess: () => {
          const statusLabels: Record<TaskStatus, string> = {
            open: "Offen",
            in_progress: "In Arbeit",
            completed: "Erledigt",
          };
          toast({
            title: "Status aktualisiert",
            description: `Aufgabe ist jetzt: ${statusLabels[newStatus]}`,
          });
        },
      }
    );
  };

  const handleMarkComplete = () => {
    if (!id) return;
    
    // Stop timer if running
    if (isTracking) {
      handleStopTracking();
    }
    
    updateStatus.mutate(
      { taskId: id, status: "completed" },
      {
        onSuccess: () => {
          toast({
            title: "Aufgabe erledigt! ✅",
            description: task?.title,
          });
        },
      }
    );
  };

  const handleSaveNote = () => {
    if (!newNote.trim() || !id) return;
    
    createNote.mutate(
      { taskId: id, content: newNote.trim() },
      {
        onSuccess: () => {
          setNewNote("");
          toast({
            title: "Notiz gespeichert 📝",
            description: "Die Notiz wurde hinzugefügt",
          });
        },
        onError: () => {
          toast({
            title: "Fehler",
            description: "Die Notiz konnte nicht gespeichert werden",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Aufgabe nicht gefunden</p>
        <Button variant="outline" onClick={() => navigate("/aufgaben")}>
          Zurück zu Aufgaben
        </Button>
      </div>
    );
  }

  const priority = priorityConfig[task.priority];
  const location = task.unit 
    ? `${task.building?.name} - ${task.unit.unit_number}`
    : task.building?.name;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="touch-target"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold truncate">{task.title}</h1>
            <p className="text-sm text-muted-foreground">{location}</p>
          </div>
          <Badge variant="outline" className={cn("text-xs", priority.className)}>
            {priority.label}
          </Badge>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={task.status} onValueChange={(v) => handleStatusChange(v as TaskStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Offen</SelectItem>
                <SelectItem value="in_progress">In Arbeit</SelectItem>
                <SelectItem value="completed">Erledigt</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Beschreibung</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {task.description || "Keine Beschreibung vorhanden"}
            </p>
            {task.reported_by_name && (
              <p className="text-xs text-muted-foreground mt-2">
                Gemeldet von: {task.reported_by_name}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Time Tracking */}
        <Card className={cn(
          "transition-all duration-300",
          isTracking && !isPaused && "border-primary/50 shadow-lg shadow-primary/10",
          isPaused && "border-warning/50"
        )}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className={cn(
                "h-4 w-4",
                isTracking && !isPaused && "text-primary animate-pulse"
              )} />
              Zeiterfassung
              {isTracking && (
                <Badge variant="outline" className={cn(
                  "text-xs ml-auto",
                  isPaused ? "text-warning border-warning/50" : "text-primary border-primary/50"
                )}>
                  {isPaused ? "Pausiert" : "Läuft"}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className={cn(
                  "text-3xl font-mono font-bold tabular-nums transition-colors",
                  isTracking && !isPaused && "text-primary",
                  isPaused && "text-warning"
                )}>
                  {formatTime(trackingTime)}
                </div>
                {totalMinutes > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Gesamt: {totalMinutes} Min. erfasst
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!isTracking ? (
                  <Button
                    size="lg"
                    onClick={handleStartTracking}
                    className="touch-target"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start
                  </Button>
                ) : (
                  <>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handlePauseTracking}
                      className="touch-target h-11 w-11"
                    >
                      {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                    </Button>
                    <Button
                      size="lg"
                      variant="destructive"
                      onClick={handleStopTracking}
                      className="touch-target"
                      disabled={createTimeEntry.isPending}
                    >
                      <Square className="h-5 w-5 mr-2" />
                      Stopp
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Notizen {notes.length > 0 && `(${notes.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Existing notes */}
            {notes.length > 0 && (
              <div className="space-y-2 mb-3">
                {notes.map((note) => (
                  <div key={note.id} className="p-3 bg-muted/50 rounded-lg text-sm">
                    <p>{note.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(note.created_at).toLocaleString("de-DE")}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <Textarea 
              placeholder="Notiz hinzufügen..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[80px]"
            />
            <Button 
              className="w-full" 
              disabled={!newNote.trim() || createNote.isPending} 
              onClick={handleSaveNote}
            >
              {createNote.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Notiz speichern
            </Button>
          </CardContent>
        </Card>

        {/* Documentation Photos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Dokumentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full touch-target"
              onClick={() => toast({ title: "Kamera", description: "Foto-Upload wird in einer zukünftigen Version verfügbar sein" })}
            >
              <Camera className="h-5 w-5 mr-2" />
              Foto aufnehmen
            </Button>
          </CardContent>
        </Card>

        {/* Complete Button */}
        <Button 
          size="lg" 
          className="w-full touch-target"
          disabled={task.status === "completed" || updateStatus.isPending}
          onClick={handleMarkComplete}
        >
          <Check className="h-5 w-5 mr-2" />
          {task.status === "completed" ? "Bereits erledigt" : "Als erledigt markieren"}
        </Button>
      </div>
    </div>
  );
}
