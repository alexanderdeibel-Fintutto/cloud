import { useParams, useSearchParams } from 'react-router-dom'
import { FormProvider } from '@/contexts/FormContext'
import { FormEditor } from '@/components/forms'

export default function FormularDetailPage() {
  const { formularId } = useParams<{ formularId: string }>()
  const [searchParams] = useSearchParams()

  // Get prefilled data from URL params (from checker)
  const prefilledData: Record<string, unknown> = {}
  searchParams.forEach((value, key) => {
    if (key !== 'from') {
      prefilledData[key] = value
    }
  })

  if (!formularId) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Formular nicht gefunden</h2>
      </div>
    )
  }

  return (
    <FormProvider>
      <FormEditor
        templateId={formularId}
        prefilledData={Object.keys(prefilledData).length > 0 ? prefilledData : undefined}
      />
    </FormProvider>
  )
}
