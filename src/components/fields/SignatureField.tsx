'use client'

import * as React from 'react'
import { Pen, RotateCcw, Check, Calendar, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatDate } from '@/lib/utils'

export interface SignatureData {
  imageData: string | null
  signerName: string
  signedAt: string | null
  signedLocation?: string
}

interface SignatureFieldProps {
  value: SignatureData
  onChange: (value: SignatureData) => void
  label?: string
  required?: boolean
  showLocation?: boolean
  disabled?: boolean
}

export function SignatureField({
  value,
  onChange,
  label = "Unterschrift",
  required = false,
  showLocation = true,
  disabled = false
}: SignatureFieldProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = React.useState(false)
  const [hasSignature, setHasSignature] = React.useState(!!value.imageData)

  // Canvas initialisieren
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas-Größe setzen
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2 // Retina
    canvas.height = rect.height * 2
    ctx.scale(2, 2)

    // Hintergrund
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Stifteinstellungen
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Vorhandene Signatur laden
    if (value.imageData) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height)
      }
      img.src = value.imageData
    }
  }, [])

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      }
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    const { x, y } = getCoordinates(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    const { x, y } = getCoordinates(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    saveSignature()
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const imageData = canvas.toDataURL('image/png')
    onChange({
      ...value,
      imageData,
      signedAt: new Date().toISOString()
    })
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    const rect = canvas.getBoundingClientRect()
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, rect.width, rect.height)

    setHasSignature(false)
    onChange({
      ...value,
      imageData: null,
      signedAt: null
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {hasSignature && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSignature}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Neu unterschreiben
          </Button>
        )}
      </div>

      <Card className={cn(disabled && "opacity-50")}>
        <CardContent className="p-4">
          {/* Name des Unterzeichners */}
          <div className="mb-4">
            <Label htmlFor="signerName" className="text-sm text-muted-foreground">
              Name (in Druckbuchstaben)
            </Label>
            <Input
              id="signerName"
              value={value.signerName}
              onChange={(e) => onChange({ ...value, signerName: e.target.value })}
              placeholder="Max Mustermann"
              disabled={disabled}
              className="mt-1"
            />
          </div>

          {/* Unterschriften-Canvas */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              className={cn(
                "w-full h-32 border rounded-md bg-white cursor-crosshair touch-none",
                disabled && "cursor-not-allowed"
              )}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!hasSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-muted-foreground text-sm flex items-center gap-2">
                  <Pen className="h-4 w-4" />
                  Hier unterschreiben
                </div>
              </div>
            )}
          </div>

          {/* Unterschriftslinie */}
          <div className="border-t border-dashed border-muted-foreground/50 mt-2 pt-1">
            <p className="text-xs text-muted-foreground text-center">Unterschrift</p>
          </div>

          {/* Ort und Datum */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {showLocation && (
              <div>
                <Label htmlFor="signedLocation" className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Ort
                </Label>
                <Input
                  id="signedLocation"
                  value={value.signedLocation || ''}
                  onChange={(e) => onChange({ ...value, signedLocation: e.target.value })}
                  placeholder="Berlin"
                  disabled={disabled}
                  className="mt-1"
                />
              </div>
            )}
            <div>
              <Label className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Datum
              </Label>
              <div className="mt-1 h-10 px-3 flex items-center border rounded-md bg-muted text-sm">
                {value.signedAt ? formatDate(value.signedAt) : formatDate(new Date())}
              </div>
            </div>
          </div>

          {/* Status-Anzeige */}
          {value.signedAt && hasSignature && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2 text-green-800 text-sm">
                <Check className="h-4 w-4" />
                <span>
                  Unterschrieben am {formatDate(value.signedAt)}
                  {value.signedLocation && ` in ${value.signedLocation}`}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Mit Ihrer Unterschrift bestätigen Sie die Richtigkeit aller Angaben.
      </p>
    </div>
  )
}
