import { useMemo } from 'react'
import { useBescheidContext } from '../contexts/BescheidContext'

interface ProgressRingProps {
  size?: number
  strokeWidth?: number
}

function AnimatedRing({ percentage, size, strokeWidth, color }: {
  percentage: number
  size: number
  strokeWidth: number
  color: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/50"
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  )
}

export default function FortschrittsRing({ size = 140, strokeWidth = 10 }: ProgressRingProps) {
  const { bescheide, fristen, einsprueche } = useBescheidContext()

  const { percentage, tasks } = useMemo(() => {
    const taskList: { label: string; done: boolean }[] = []

    // 1. Mindestens einen Bescheid erfasst
    taskList.push({
      label: 'Bescheid erfasst',
      done: bescheide.length > 0,
    })

    // 2. Mindestens einen Bescheid geprueft
    taskList.push({
      label: 'Analyse durchgefuehrt',
      done: bescheide.some(b => b.pruefungsergebnis != null),
    })

    // 3. Alle offenen Fristen im Blick (mindestens 50% erledigt oder keine Fristen)
    const erledigteFristen = fristen.filter(f => f.erledigt)
    taskList.push({
      label: 'Fristen verwaltet',
      done: fristen.length === 0 || erledigteFristen.length >= fristen.length * 0.5,
    })

    // 4. Einspruch bei Empfehlung erstellt
    const empfohleneEinsprueche = bescheide.filter(b => b.pruefungsergebnis?.empfehlung === 'einspruch')
    const hatEinsprueche = einsprueche.length > 0
    taskList.push({
      label: 'Einsprueche bearbeitet',
      done: empfohleneEinsprueche.length === 0 || hatEinsprueche,
    })

    // 5. Bescheide erledigt
    const erledigteB = bescheide.filter(b => b.status === 'erledigt')
    taskList.push({
      label: 'Bescheide abgeschlossen',
      done: bescheide.length > 0 && erledigteB.length >= bescheide.length * 0.5,
    })

    const doneTasks = taskList.filter(t => t.done).length
    const pct = taskList.length > 0 ? Math.round((doneTasks / taskList.length) * 100) : 0

    return { percentage: pct, tasks: taskList }
  }, [bescheide, fristen, einsprueche])

  const color = percentage >= 80 ? 'hsl(142, 71%, 45%)' : percentage >= 50 ? 'hsl(38, 92%, 50%)' : 'hsl(210, 70%, 50%)'

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Ring */}
      <div className="relative">
        <AnimatedRing
          percentage={percentage}
          size={size}
          strokeWidth={strokeWidth}
          color={color}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{percentage}%</span>
          <span className="text-xs text-muted-foreground">erledigt</span>
        </div>
      </div>

      {/* Task Checklist */}
      <div className="w-full space-y-2">
        {tasks.map((task, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
              task.done
                ? 'border-green-500 bg-green-500'
                : 'border-border bg-background'
            }`}>
              {task.done && (
                <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={`text-sm ${task.done ? 'text-foreground' : 'text-muted-foreground'}`}>
              {task.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
