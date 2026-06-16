import { useEffect, useRef, useState } from 'react'
import { AOIService } from '../../services/aoi/aoiService'

const POLLING_INTERVAL_MS = 3000

function getErrorMessage(error, fallback = 'Ocurrió un error inesperado') {
  return error?.response?.data?.detail || error?.message || fallback
}

export default function useAoi() {
  const [previewUrl, setPreviewUrl] = useState('')
  const [result, setResult] = useState(null)
  const [serviceStatus, setServiceStatus] = useState(null)
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)
  const [error, setError] = useState('')
  const [folderStatus, setFolderStatus] = useState(null)
  const [currentImageData, setCurrentImageData] = useState(null)

  const pollingRef = useRef(null)
  const pollingInProgressRef = useRef(false)
  const currentBatchIdRef = useRef(null)

  useEffect(() => {
    loadInitialData()

    return () => {
      stopPolling()
    }
  }, [])

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  const startPolling = () => {
    if (pollingRef.current) return

    pollingRef.current = setInterval(async () => {
      if (pollingInProgressRef.current || loading || initialLoading) return

      pollingInProgressRef.current = true

      try {
        const imageData = await AOIService.getCurrentImage()

        if (!imageData?.batch_id) return

        const isNewBatch = currentBatchIdRef.current !== imageData.batch_id
        const hasNoImageLoaded = !currentImageData

        if (isNewBatch || hasNoImageLoaded) {
          setError('')
          applyImageData(imageData)
          await analyzeCurrentImage()
          stopPolling()
        }
      } catch {
        // Si no hay lotes todavía, seguimos esperando silenciosamente
      } finally {
        pollingInProgressRef.current = false
      }
    }, POLLING_INTERVAL_MS)
  }

  const clearCurrentView = () => {
    setPreviewUrl('')
    setResult(null)
    setCurrentImageData(null)
    setFolderStatus(null)
    currentBatchIdRef.current = null
  }

  const applyImageData = (imageData) => {
    setCurrentImageData(imageData)
    currentBatchIdRef.current = imageData.batch_id

    setFolderStatus({
      current_index: imageData.current_index,
      total_images: imageData.total_images,
      batch_name: imageData.batch_name,
    })

    setPreviewUrl(`data:${imageData.mime_type};base64,${imageData.image_data}`)
  }

  const analyzeCurrentImage = async () => {
    const predictionResponse = await AOIService.predictCurrentImage()
    setResult(predictionResponse)
  }

  const loadCurrentImageAndAnalyze = async () => {
    const imageData = await AOIService.getCurrentImage()
    applyImageData(imageData)
    await analyzeCurrentImage()
    stopPolling()
  }

  const loadInitialData = async () => {
    try {
      setInitialLoading(true)
      setError('')

      const [healthData, classesData] = await Promise.all([
        AOIService.health(),
        AOIService.getClasses(),
      ])

      setServiceStatus(healthData)
      setClasses(classesData)

      await loadCurrentImageAndAnalyze()
    } catch (error) {
      clearCurrentView()
      setError(getErrorMessage(error, 'No hay lotes disponibles.'))
      startPolling()
    } finally {
      setInitialLoading(false)
    }
  }

  const handleNextImage = async () => {
    if (!currentImageData) {
      setError('No hay imagen cargada.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const nextImageData = await AOIService.getNextImage()
      applyImageData(nextImageData)
      await analyzeCurrentImage()
    } catch (error) {
      setError(getErrorMessage(error, 'No se pudo cargar o analizar la siguiente imagen.'))
    } finally {
      setLoading(false)
    }
  }

  const handleFinishBatch = async () => {
    try {
      setLoading(true)
      setError('')

      await AOIService.finishCurrentBatch()

      try {
        await loadCurrentImageAndAnalyze()
      } catch {
        clearCurrentView()
        setError('No hay lotes disponibles.')
        startPolling()
      }
    } catch (error) {
      setError(getErrorMessage(error, 'No se pudo finalizar el lote actual.'))
    } finally {
      setLoading(false)
    }
  }

  return {
    previewUrl,
    result,
    serviceStatus,
    classes,
    loading,
    initialLoading,
    error,
    folderStatus,
    currentImageData,
    loadInitialData,
    handleNextImage,
    handleFinishBatch,
  }
}