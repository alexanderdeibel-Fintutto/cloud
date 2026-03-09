import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload } from 'lucide-react'

export default function GlobalDropZone() {
  const [isDragging, setIsDragging] = useState(false)
  const navigate = useNavigate()
  let dragCounter = 0

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    dragCounter++
    if (e.dataTransfer?.types.includes('Files')) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    dragCounter--
    if (dragCounter === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    dragCounter = 0
    setIsDragging(false)

    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      // Store files in sessionStorage for the upload page to pick up
      const fileNames = Array.from(files).map(f => f.name)
      sessionStorage.setItem('pendingUploadFiles', JSON.stringify(fileNames))

      // Store actual files in a global ref (sessionStorage can't hold File objects)
      ;(window as unknown as { __pendingFiles?: File[] }).__pendingFiles = Array.from(files)

      navigate('/upload?dropped=true')
    }
  }, [navigate])

  useEffect(() => {
    document.addEventListener('dragenter', handleDragEnter)
    document.addEventListener('dragleave', handleDragLeave)
    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)

    return () => {
      document.removeEventListener('dragenter', handleDragEnter)
      document.removeEventListener('dragleave', handleDragLeave)
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('drop', handleDrop)
    }
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop])

  if (!isDragging) return null

  return (
    <div className="fixed inset-0 z-[100] bg-primary/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
      <div className="bg-card border-2 border-dashed border-primary rounded-2xl p-12 text-center shadow-2xl animate-fade-in-up">
        <Upload className="w-16 h-16 text-primary mx-auto mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-foreground mb-2">Dokument hochladen</h2>
        <p className="text-sm text-muted-foreground">Lass die Datei(en) los um sie zu importieren</p>
      </div>
    </div>
  )
}
