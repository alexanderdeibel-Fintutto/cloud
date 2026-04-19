import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { de } from "date-fns/locale";
import type { CalendarEvent } from "@/types";

// Mock events
const mockEvents: CalendarEvent[] = [
  {
    id: "e1",
    company_id: "c1",
    building_id: "b1",
    title: "Heizungswartung",
    event_type: "maintenance",
    start_date: "2024-01-18T09:00:00Z",
    all_day: false,
    created_by: "user1",
    created_at: "",
  },
  {
    id: "e2",
    company_id: "c1",
    building_id: "b2",
    title: "Begehung Lindenallee",
    event_type: "inspection",
    start_date: "2024-01-22T14:00:00Z",
    all_day: false,
    created_by: "user1",
    created_at: "",
  },
  {
    id: "e3",
    company_id: "c1",
    title: "Fortbildung Brandschutz",
    event_type: "other",
    start_date: "2024-01-25T10:00:00Z",
    all_day: true,
    created_by: "user1",
    created_at: "",
  },
];

const eventTypeConfig = {
  maintenance: { label: "Wartung", className: "bg-blue-500" },
  inspection: { label: "Begehung", className: "bg-primary" },
  other: { label: "Sonstiges", className: "bg-muted-foreground" },
};

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad to start on Monday
  const startDay = monthStart.getDay();
  const paddingDays = startDay === 0 ? 6 : startDay - 1;

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getEventsForDate = (date: Date) => {
    return mockEvents.filter(event => 
      isSameDay(new Date(event.start_date), date)
    );
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Kalender" 
        action={
          <Button size="icon" className="touch-target">
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      {/* Month Navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <Button variant="ghost" size="icon" onClick={prevMonth} className="touch-target">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy", { locale: de })}
        </h2>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="touch-target">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="px-4 py-3">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2">
          {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Padding for days before month start */}
          {Array.from({ length: paddingDays }).map((_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}

          {days.map((day) => {
            const events = getEventsForDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "aspect-square flex flex-col items-center justify-center rounded-lg transition-colors touch-target relative",
                  isToday(day) && "bg-primary/10",
                  isSelected && "bg-primary text-primary-foreground",
                  !isSelected && "hover:bg-muted"
                )}
              >
                <span className={cn(
                  "text-sm font-medium",
                  !isSameMonth(day, currentMonth) && "text-muted-foreground opacity-50"
                )}>
                  {format(day, "d")}
                </span>
                {events.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {events.slice(0, 3).map((event) => (
                      <div 
                        key={event.id}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          eventTypeConfig[event.event_type].className
                        )}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="px-4 py-3 border-t">
          <h3 className="font-semibold mb-3">
            {format(selectedDate, "EEEE, d. MMMM", { locale: de })}
          </h3>
          
          {selectedDateEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Keine Termine an diesem Tag
            </p>
          ) : (
            <div className="space-y-2">
              {selectedDateEvents.map((event) => {
                const typeConfig = eventTypeConfig[event.event_type];
                return (
                  <Card key={event.id}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={cn("w-1 h-full rounded-full min-h-[40px]", typeConfig.className)} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{event.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {typeConfig.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {event.all_day 
                              ? "Ganztägig" 
                              : format(new Date(event.start_date), "HH:mm", { locale: de }) + " Uhr"
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
