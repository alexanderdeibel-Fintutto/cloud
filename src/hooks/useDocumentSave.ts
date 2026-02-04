import { useAuth } from '@/contexts/AuthContext'
import { saveDocument, DOCUMENT_TYPES } from '@/services/documentStorage'
import { useToast } from '@/hooks/use-toast'
import { useNavigate, useSearchParams } from 'react-router-dom'

interface UseDocumentSaveOptions {
  type: string
  generateTitle: (data: any) => string
}

export function useDocumentSave({ type, generateTitle }: UseDocumentSaveOptions) {
  const { user, isAuthenticated, showLoginModal } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const documentId = searchParams.get('id')

  const handleSave = (data: any) => {
    if (!isAuthenticated || !user) {
      showLoginModal()
      // Store data temporarily so we can save after login
      sessionStorage.setItem('pending_save', JSON.stringify({ type, data }))
      return false
    }

    try {
      const title = generateTitle(data)
      saveDocument(user.id, type, title, data, documentId || undefined)

      toast({
        title: 'Gespeichert',
        description: `${DOCUMENT_TYPES[type] || 'Dokument'} wurde in "Meine Dokumente" gespeichert.`
      })

      navigate('/meine-dokumente')
      return true
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Dokument konnte nicht gespeichert werden.',
        variant: 'destructive'
      })
      return false
    }
  }

  return {
    handleSave,
    isAuthenticated,
    documentId
  }
}
