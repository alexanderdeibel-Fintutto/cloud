import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Camera,
  X,
  RotateCcw,
  Check,
  ScanLine,
  FlipHorizontal,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BescheidScannerProps {
  onCapture: (file: File) => void
  onClose: () => void
  pageCount: number
}

export default function BescheidScanner({ onCapture, onClose, pageCount }: BescheidScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [flash, setFlash] = useState(false)

  const startCamera = useCallback(async () => {
    setCameraError(null)
    setCameraReady(false)

    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 2048 },
          height: { ideal: 2048 },
        },
        audio: false,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setCameraReady(true)
        }
      }
    } catch (err) {
      console.error('Camera error:', err)
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setCameraError('Kamera-Zugriff wurde verweigert. Bitte erlaube den Zugriff in den Browser-Einstellungen.')
        } else if (err.name === 'NotFoundError') {
          setCameraError('Keine Kamera gefunden. Bitte stelle sicher, dass eine Kamera angeschlossen ist.')
        } else {
          setCameraError(`Kamera-Fehler: ${err.message}`)
        }
      } else {
        setCameraError('Kamera konnte nicht gestartet werden.')
      }
    }
  }, [facingMode])

  useEffect(() => {
    startCamera()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [startCamera])

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Use actual video resolution
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Flash effect
    setFlash(true)
    setTimeout(() => setFlash(false), 150)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    setCapturedImage(dataUrl)
  }

  const acceptPhoto = () => {
    if (!capturedImage || !canvasRef.current) return

    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          const file = new File(
            [blob],
            `bescheid_seite_${pageCount + 1}_${Date.now()}.jpg`,
            { type: 'image/jpeg' },
          )
          onCapture(file)
          setCapturedImage(null)
        }
      },
      'image/jpeg',
      0.92,
    )
  }

  const retakePhoto = () => {
    setCapturedImage(null)
  }

  const switchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
    setCapturedImage(null)
  }

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 text-white z-10">
        <button onClick={handleClose} className="p-2">
          <X className="h-6 w-6" />
        </button>
        <div className="text-center">
          <p className="text-sm font-medium">Bescheid scannen</p>
          <p className="text-xs opacity-70">Seite {pageCount + 1}</p>
        </div>
        <button onClick={switchCamera} className="p-2">
          <FlipHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        {/* Error state */}
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="text-center text-white">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-70" />
              <p className="text-sm mb-4">{cameraError}</p>
              <Button variant="outline" size="sm" onClick={startCamera} className="text-white border-white/30">
                Erneut versuchen
              </Button>
            </div>
          </div>
        )}

        {/* Loading */}
        {!cameraReady && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm opacity-70">Kamera wird gestartet...</p>
            </div>
          </div>
        )}

        {/* Video feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${capturedImage ? 'hidden' : ''}`}
        />

        {/* Captured preview */}
        {capturedImage && (
          <img
            src={capturedImage}
            alt="Aufnahme"
            className="w-full h-full object-contain bg-black"
          />
        )}

        {/* Flash effect */}
        {flash && (
          <div className="absolute inset-0 bg-white animate-pulse pointer-events-none" />
        )}

        {/* Scan frame overlay */}
        {!capturedImage && cameraReady && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner markers */}
            <div className="absolute top-[10%] left-[5%] w-8 h-8 border-t-2 border-l-2 border-white/60 rounded-tl-lg" />
            <div className="absolute top-[10%] right-[5%] w-8 h-8 border-t-2 border-r-2 border-white/60 rounded-tr-lg" />
            <div className="absolute bottom-[10%] left-[5%] w-8 h-8 border-b-2 border-l-2 border-white/60 rounded-bl-lg" />
            <div className="absolute bottom-[10%] right-[5%] w-8 h-8 border-b-2 border-r-2 border-white/60 rounded-br-lg" />

            {/* Scan line animation */}
            <div className="absolute top-[10%] left-[5%] right-[5%] flex items-center justify-center">
              <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full">
                <ScanLine className="h-4 w-4 text-white" />
                <span className="text-xs text-white">Seite gerade halten</span>
              </div>
            </div>
          </div>
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="bg-black/80 p-6">
        {!capturedImage ? (
          <div className="flex items-center justify-center">
            <button
              onClick={capturePhoto}
              disabled={!cameraReady}
              className="relative w-20 h-20 rounded-full border-4 border-white disabled:opacity-30 transition-opacity"
            >
              <div className="absolute inset-2 rounded-full bg-white" />
              <Camera className="absolute inset-0 m-auto h-6 w-6 text-black z-10" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={retakePhoto}
              className="flex flex-col items-center gap-1 text-white"
            >
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <RotateCcw className="h-6 w-6" />
              </div>
              <span className="text-xs">Wiederholen</span>
            </button>

            <button
              onClick={acceptPhoto}
              className="flex flex-col items-center gap-1 text-white"
            >
              <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="h-6 w-6" />
              </div>
              <span className="text-xs">Uebernehmen</span>
            </button>
          </div>
        )}

        {/* Page counter */}
        {pageCount > 0 && !capturedImage && (
          <p className="text-center text-white/60 text-xs mt-3">
            {pageCount} {pageCount === 1 ? 'Seite' : 'Seiten'} bereits aufgenommen
          </p>
        )}
      </div>
    </div>
  )
}
