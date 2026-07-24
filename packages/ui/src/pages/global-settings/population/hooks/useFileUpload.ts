import { useState } from 'react'

export default function useFileUpload() {
  const [importFile, setImportFile] = useState<File | null>(null)
  const [errorFile, setErrorFile] = useState('')

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e?.target?.files?.[0]) {
      setImportFile(e?.target?.files?.[0])
      setErrorFile('')
    }
  }

  const reset = () => {
    setErrorFile('')
    setImportFile(null)
  }

  return {
    errorFile,
    importFile,
    reset,
    handleChangeFile,
    setErrorFile,
  }
}
