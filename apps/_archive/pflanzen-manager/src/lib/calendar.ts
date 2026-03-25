import { VacationTask, UserPlant } from '@/types';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

interface CalendarEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
}

function formatDateForICS(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss");
}

function escapeICS(text: string): string {
  return text.replace(/[,;\\]/g, (match) => '\\' + match).replace(/\n/g, '\\n');
}

export function generateICSEvent(event: CalendarEvent): string {
  const lines = [
    'BEGIN:VEVENT',
    `DTSTART:${formatDateForICS(event.startDate)}`,
    `DTEND:${formatDateForICS(event.endDate)}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(event.description)}`,
  ];

  if (event.location) {
    lines.push(`LOCATION:${escapeICS(event.location)}`);
  }

  lines.push(
    `UID:${Date.now()}-${Math.random().toString(36).substring(2)}@pflanzen-manager`,
    `DTSTAMP:${formatDateForICS(new Date())}`,
    'END:VEVENT'
  );

  return lines.join('\r\n');
}

export function generateICSCalendar(events: CalendarEvent[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fintutto//Pflanzen-Manager//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Pflanzen-Gießplan',
    'X-WR-TIMEZONE:Europe/Berlin',
  ];

  events.forEach(event => {
    lines.push(generateICSEvent(event));
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadICSFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    dates: `${format(event.startDate, "yyyyMMdd'T'HHmmss")}/${format(event.endDate, "yyyyMMdd'T'HHmmss")}`,
  });

  if (event.location) {
    params.set('location', event.location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function vacationTasksToCalendarEvents(
  tasks: VacationTask[],
  plants: UserPlant[]
): CalendarEvent[] {
  return tasks.map(task => {
    const plant = plants.find(p => p.id === task.plant_id);
    const plantName = plant?.nickname || plant?.species?.common_name || 'Pflanze';
    const taskDate = parseISO(task.task_date);

    const typeLabels: Record<string, string> = {
      water: 'Gießen',
      fertilize: 'Düngen',
      mist: 'Besprühen',
    };

    const startDate = new Date(taskDate);
    startDate.setHours(9, 0, 0);
    const endDate = new Date(taskDate);
    endDate.setHours(9, 30, 0);

    return {
      title: `🌱 ${typeLabels[task.task_type] || task.task_type}: ${plantName}`,
      description: task.instructions || `Bitte ${(typeLabels[task.task_type] || task.task_type).toLowerCase()}: ${plantName}`,
      startDate,
      endDate,
      location: plant?.room?.apartment?.name,
    };
  });
}

export function generateVacationPlanEmail(
  helperName: string,
  ownerName: string,
  startDate: string,
  endDate: string,
  tasks: VacationTask[],
  plants: UserPlant[]
): string {
  const start = format(parseISO(startDate), 'dd. MMMM yyyy', { locale: de });
  const end = format(parseISO(endDate), 'dd. MMMM yyyy', { locale: de });

  const tasksByDate = tasks.reduce((acc, task) => {
    const date = format(parseISO(task.task_date), 'EEEE, dd. MMMM', { locale: de });
    if (!acc[date]) acc[date] = [];
    const plant = plants.find(p => p.id === task.plant_id);
    acc[date].push({
      type: task.task_type,
      plant: plant?.nickname || plant?.species?.common_name || 'Pflanze',
      instructions: task.instructions,
    });
    return acc;
  }, {} as Record<string, Array<{ type: string; plant: string; instructions: string }>>);

  const typeEmojis: Record<string, string> = {
    water: '💧',
    fertilize: '🧪',
    mist: '💨',
  };

  let body = `Hallo ${helperName},\n\n`;
  body += `${ownerName} hat dich gebeten, sich um die Pflanzen zu kümmern.\n`;
  body += `Zeitraum: ${start} bis ${end}\n\n`;
  body += `=== GIESPLAN ===\n\n`;

  Object.entries(tasksByDate).forEach(([date, dateTasks]) => {
    body += `📅 ${date}\n`;
    dateTasks.forEach(t => {
      body += `  ${typeEmojis[t.type] || '🌱'} ${t.plant}`;
      if (t.instructions) body += ` - ${t.instructions}`;
      body += '\n';
    });
    body += '\n';
  });

  body += `Vielen Dank für deine Hilfe! 🌿\n`;
  body += `\n-- Erstellt mit Pflanzen-Manager von Fintutto`;

  return body;
}
