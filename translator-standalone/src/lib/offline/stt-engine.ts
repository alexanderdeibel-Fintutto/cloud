// Offline Speech-to-Text engine using Whisper via Transformers.js
// Works fully offline once the model is downloaded (~40MB)
// Non-streaming: records audio, then transcribes in one pass

import type { STTEngine, STTResult } from '../stt'
import { isModelDownloaded, recordModelDownload } from './model-manager'

const WHISPER_MODEL = 'Xenova/whisper-small'

let pipeline: unknown = null
let isLoading = false

async function getWhisperPipeline(onProgress?: (pct: number) => void) {
  if (pipeline) return pipeline
  if (isLoading) throw new Error('Whisper model is still loading')

  isLoading = true
  try {
    const { pipeline: createPipeline } = await import('@huggingface/transformers')
    pipeline = await createPipeline('automatic-speech-recognition', WHISPER_MODEL, {
      progress_callback: (data: { status: string; progress?: number; loaded?: number }) => {
        if (data.status === 'progress' && data.progress !== undefined && onProgress) {
          onProgress(data.progress)
        }
        if (data.status === 'done' && data.loaded) {
          recordModelDownload(WHISPER_MODEL, 'stt', data.loaded).catch(() => {})
        }
      },
    })
    return pipeline
  } finally {
    isLoading = false
  }
}

/**
 * Check if the Whisper STT model is downloaded and ready.
 */
export async function isWhisperAvailable(): Promise<boolean> {
  return isModelDownloaded(WHISPER_MODEL)
}

/**
 * Preload the Whisper model into memory.
 */
export async function preloadWhisper(onProgress?: (pct: number) => void): Promise<void> {
  await getWhisperPipeline(onProgress)
}

/**
 * Create an offline STT engine using Whisper.
 * Records audio from the microphone, then transcribes on stop.
 */
export function createWhisperSTTEngine(): STTEngine {
  let stream: MediaStream | null = null
  let audioContext: AudioContext | null = null
  let recorder: ScriptProcessorNode | null = null
  let audioChunks: Float32Array[] = []
  let onResultCallback: ((result: STTResult) => void) | null = null
  let isActive = false

  return {
    provider: 'whisper' as STTEngine['provider'],
    isSupported: typeof WebAssembly !== 'undefined' && typeof AudioContext !== 'undefined',

    async start(lang, onResult, onError) {
      onResultCallback = onResult

      // Get microphone
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000 } })
      } catch (e) {
        if (e instanceof DOMException && e.name === 'NotAllowedError') {
          onError('Mikrofon-Zugriff verweigert.')
        } else {
          onError('Mikrofon nicht verfügbar.')
        }
        return
      }

      // Verify model is loaded
      try {
        await getWhisperPipeline()
      } catch {
        onError('Whisper-Modell nicht geladen. Bitte unter Einstellungen herunterladen.')
        if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
        return
      }

      // Set up audio recording
      audioContext = new AudioContext({ sampleRate: 16000 })
      const source = audioContext.createMediaStreamSource(stream)
      recorder = audioContext.createScriptProcessor(4096, 1, 1)
      audioChunks = []

      recorder.onaudioprocess = (e) => {
        if (!isActive) return
        const data = e.inputBuffer.getChannelData(0)
        audioChunks.push(new Float32Array(data))
      }

      source.connect(recorder)
      recorder.connect(audioContext.destination)
      isActive = true

      // Show interim "listening" result
      onResult({ text: '...', isFinal: false })

      // Auto-transcribe every 5 seconds for interim results
      const transcribeInterval = setInterval(async () => {
        if (!isActive || audioChunks.length === 0) return
        try {
          const audio = mergeAudioChunks(audioChunks)
          const pipe = await getWhisperPipeline() as (audio: Float32Array, opts?: { language: string }) => Promise<{ text: string }>
          const result = await pipe(audio, { language: lang.split('-')[0] })
          if (result.text.trim() && onResultCallback) {
            onResultCallback({ text: result.text.trim(), isFinal: false })
          }
        } catch {
          // Transcription failed — silently continue recording
        }
      }, 5000)

      // Store interval for cleanup
      ;(recorder as unknown as Record<string, unknown>)._transcribeInterval = transcribeInterval
    },

    stop() {
      isActive = false

      // Clear interval
      if (recorder) {
        const interval = (recorder as unknown as Record<string, unknown>)._transcribeInterval as ReturnType<typeof setInterval>
        if (interval) clearInterval(interval)
      }

      // Final transcription
      if (audioChunks.length > 0 && onResultCallback) {
        const audio = mergeAudioChunks(audioChunks)
        const callback = onResultCallback

        getWhisperPipeline().then(async (pipe) => {
          const typedPipe = pipe as (audio: Float32Array, opts?: { language: string }) => Promise<{ text: string }>
          const result = await typedPipe(audio)
          if (result.text.trim()) {
            callback({ text: result.text.trim(), isFinal: true })
          }
        }).catch(() => {})
      }

      // Cleanup
      if (recorder) {
        recorder.disconnect()
        recorder = null
      }
      if (audioContext) {
        audioContext.close().catch(() => {})
        audioContext = null
      }
      if (stream) {
        stream.getTracks().forEach(t => t.stop())
        stream = null
      }
      audioChunks = []
      onResultCallback = null
    },
  }
}

function mergeAudioChunks(chunks: Float32Array[]): Float32Array {
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0)
  const merged = new Float32Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.length
  }
  return merged
}
