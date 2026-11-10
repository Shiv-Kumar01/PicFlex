import { useState, useRef, useEffect, useMemo } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

import {
  Upload,
  Video as VideoIcon,
  Play,
  Pause,
  Download,
  Scissors,
  Layers,
  Sliders,
  Trash2,
  RefreshCw,
  Zap,
  ShieldCheck,
  BarChart3,
  Lock,
  Gem,
  Heart
} from 'lucide-react'

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Perfect Quality',
    description: 'Smart encoding maintains high visual quality while giving you full control over output resolution.'
  },
  {
    icon: BarChart3,
    title: 'Best Compression',
    description: 'Adjustable bitrate to reduce file sizes significantly. Find the right balance for your needs.'
  },
  {
    icon: Zap,
    title: 'Fast Processing',
    description: 'Browser-based video processing with real-time preview. No server uploads, no waiting around.'
  },
  {
    icon: Lock,
    title: 'Privacy Guaranteed',
    description: 'All processing happens locally in your browser. Your videos are never uploaded to any server.'
  },
  {
    icon: Gem,
    title: "It's Free",
    description: 'Professional video tools completely free. No watermarks, no sign-ups, no hidden fees.'
  },
  {
    icon: VideoIcon,
    title: 'Multiple Formats',
    description: 'Supports MP4, WebM, and MOV input. Export to MP4 or WebM format directly from your browser.'
  }
]

function Video() {

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const animFrameRef = useRef(null)
  const exportAbortRef = useRef(false)
  const ffmpegRef = useRef(null)
  const ffmpegLoadedRef = useRef(false)

  const [videoSrc, setVideoSrc] = useState(null)
  const [videoMeta, setVideoMeta] = useState({ name: '', size: 0, type: '', duration: 0, width: 0, height: 0 })
  const [activeTab, setActiveTab] = useState('trim')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [ffmpegLoaded, setFFmpegLoaded] = useState(false)

  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)

  const [compressionLevel, setCompressionLevel] = useState(50)
  const [exportFormat, setExportFormat] = useState('video/webm')

  const [currentTime, setCurrentTime] = useState(0)

  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hueRotate: 0,
    blur: 0,
    grayscale: 0,
    sepia: 0,
  })

  // Keep a ref to filters so drawFrame always reads current values
  const filtersRef = useRef(filters)
  useEffect(() => { filtersRef.current = filters }, [filters])

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    if (!bytes) return 'N/A'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getFilterString = (f) => {
    const src = f || filtersRef.current
    return `brightness(${src.brightness}%) contrast(${src.contrast}%) saturate(${src.saturation}%) hue-rotate(${src.hueRotate}deg) blur(${src.blur}px) grayscale(${src.grayscale}%) sepia(${src.sepia}%)`
  }

  const handleVideoUpload = (file) => {
    if (!file || !file.type.startsWith('video/')) return
    const url = URL.createObjectURL(file)
    setVideoSrc(url)
    setVideoMeta({
      name: file.name,
      size: file.size,
      type: file.type,
      duration: 0,
      width: 0,
      height: 0
    })
  }

  const handleVideoLoaded = () => {
    const video = videoRef.current
    if (!video) return
    setVideoMeta(prev => ({
      ...prev,
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight
    }))
    setTrimEnd(video.duration)
  }

  const handleReset = () => {
    exportAbortRef.current = true
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
    if (videoSrc) URL.revokeObjectURL(videoSrc)
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    setVideoSrc(null)
    setVideoMeta({ name: '', size: 0, type: '', duration: 0, width: 0, height: 0 })
    setTrimStart(0)
    setTrimEnd(0)
    setCompressionLevel(50)
    setExportFormat('video/mp4')
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hueRotate: 0,
      blur: 0,
      grayscale: 0,
      sepia: 0,
    })
    setIsExporting(false)
    setExportProgress(0)
  }

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hueRotate: 0,
      blur: 0,
      grayscale: 0,
      sepia: 0,
    })
  }

  const togglePlay = async () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
      setIsPlaying(false)
    } else {
      try {
        await video.play()
        setIsPlaying(true)
      } catch (e) {
        console.warn('Playback blocked:', e)
      }
    }
  }

  const handleSeek = (e) => {
    const video = videoRef.current
    if (!video || !videoMeta.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = Math.max(0, Math.min(1, x / rect.width))
    video.currentTime = percent * videoMeta.duration
  }

  const estimatedSize = useMemo(() => {
    if (!videoMeta.size || !videoMeta.duration) return null
    const duration = Math.max(0, trimEnd - trimStart)
    const qualityFactor = (100 - compressionLevel) / 100

    const originalBitrate = (videoMeta.size * 8) / videoMeta.duration
    const targetBitrate = Math.max(600_000, Math.min(15_000_000, originalBitrate * qualityFactor))

    const estimatedSizeBytes = (targetBitrate * duration) / 8
    return Math.round(estimatedSizeBytes)
  }, [compressionLevel, trimEnd, trimStart, videoMeta.size, videoMeta.duration])

  const getBestMimeType = (preferred) => {
    const candidates = [
      'video/mp4',
      preferred,
      'video/webm; codecs=vp9,opus',
      'video/webm; codecs=vp9',
      'video/webm; codecs=vp8,opus',
      'video/webm; codecs=vp8',
      'video/webm',
    ]
    for (const mime of candidates) {
      if (MediaRecorder.isTypeSupported(mime)) return mime
    }
    return 'video/webm'
  }

  const getFileExtension = (mimeType) => {
    if (mimeType.startsWith('video/mp4')) return 'mp4'
    if (mimeType.startsWith('video/webm') || mimeType.startsWith('video/x-matroska')) return 'webm'
    return 'webm'
  }

  const loadFFmpeg = async () => {
    if (ffmpegLoadedRef.current) return true
    try {
      const ffmpeg = new FFmpeg()
      ffmpegRef.current = ffmpeg
      const base = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm'
      await ffmpeg.load({
        coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
      })
      ffmpegLoadedRef.current = true
      setFFmpegLoaded(true)
      return true
    } catch (e) {
      console.warn('FFmpeg load failed, will export as WebM:', e)
      ffmpegLoadedRef.current = false
      setFFmpegLoaded(false)
      return false
    }
  }

  const startExport = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || isExporting) return

    exportAbortRef.current = false
    setIsExporting(true)
    setExportProgress(0)

    // Load ffmpeg if MP4 is requested
    if (exportFormat === 'video/mp4' && !ffmpegLoadedRef.current) {
      setExportProgress(0)
      await loadFFmpeg()
      if (exportAbortRef.current) { setIsExporting(false); return }
    }

    video.pause()
    setIsPlaying(false)

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')

    // Seek to trim start
    video.currentTime = trimStart
    await new Promise((resolve) => {
      const onSeeked = () => { video.removeEventListener('seeked', onSeeked); resolve() }
      video.addEventListener('seeked', onSeeked, { once: true })
      setTimeout(resolve, 5000)
    })

    if (exportAbortRef.current) { setIsExporting(false); return }

    // Capture canvas stream for video frames
    const TARGET_FPS = 30
    const canvasStream = canvas.captureStream(TARGET_FPS)

    // Capture native audio from video element (avoids Web Audio API freezing)
    let hasAudio = false
    try {
      const nativeStream = video.captureStream()
      const audioTracks = nativeStream.getAudioTracks()
      if (audioTracks.length > 0) {
        canvasStream.addTrack(audioTracks[0])
        hasAudio = true
      }
    } catch (e) {
      console.warn('Native audio capture unavailable:', e)
    }

    const qualityFactor = (100 - compressionLevel) / 100
    let originalBitrate = 2_500_000
    if (videoMeta.size && videoMeta.duration) {
      originalBitrate = (videoMeta.size * 8) / videoMeta.duration
    }
    const targetBitrate = Math.max(600_000, Math.min(15_000_000, originalBitrate * qualityFactor))

    const mimeType = getBestMimeType('video/webm')
    chunksRef.current = []

    let recorder
    try {
      recorder = new MediaRecorder(canvasStream, {
        mimeType,
        videoBitsPerSecond: Math.round(targetBitrate),
        audioBitsPerSecond: hasAudio ? 128_000 : undefined,
      })
    } catch (e) {
      console.error('MediaRecorder init failed:', e)
      setIsExporting(false)
      return
    }

    mediaRecorderRef.current = recorder

    const trimDuration = trimEnd - trimStart
    const startTime = trimStart

    return new Promise((resolve) => {
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onerror = (e) => {
        console.error('Recorder error:', e)
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
        video.pause()
        setIsExporting(false)
        resolve()
      }

      recorder.onstop = async () => {
        canvasStream.getTracks().forEach(t => t.stop())

        if (exportAbortRef.current) {
          setIsExporting(false)
          setExportProgress(0)
          resolve()
          return
        }

        const blob = new Blob(chunksRef.current, { type: mimeType })
        if (blob.size > 0) {
          const baseName = videoMeta.name.replace(/\.[^/.]+$/, '')
          const wantMP4 = exportFormat === 'video/mp4'

          if (wantMP4 && ffmpegLoadedRef.current) {
            setExportProgress(99)
            try {
              const ffmpeg = ffmpegRef.current
              const inputName = 'input.webm'
              const outputName = 'output.mp4'
              await ffmpeg.writeFile(inputName, await fetchFile(blob))
              await ffmpeg.exec([
                '-i', inputName,
                '-c:v', 'libx264',
                '-preset', 'fast',
                '-crf', String(Math.round(qualityFactor * 51)),
                '-c:a', 'aac',
                '-movflags', '+faststart',
                outputName
              ])
              const data = await ffmpeg.readFile(outputName)
              const mp4Blob = new Blob([data], { type: 'video/mp4' })
              const url = URL.createObjectURL(mp4Blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `${baseName}-edited.mp4`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              setTimeout(() => URL.revokeObjectURL(url), 2000)
              ffmpeg.deleteFile(inputName).catch(() => {})
              ffmpeg.deleteFile(outputName).catch(() => {})
            } catch (e) {
              console.error('FFmpeg conversion failed, falling back to WebM:', e)
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `${baseName}-edited.webm`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              setTimeout(() => URL.revokeObjectURL(url), 2000)
            }
          } else {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${baseName}-edited.${getFileExtension(mimeType)}`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            setTimeout(() => URL.revokeObjectURL(url), 2000)
          }
        }

        setExportProgress(100)
        setIsExporting(false)
        setTimeout(() => setExportProgress(0), 2000)
        resolve()
      }

      // Prime canvas and start recorder
      ctx.filter = getFilterString()
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      recorder.start(100)

      video.play().catch((e) => {
        console.warn('Video play failed during export:', e)
        recorder.stop()
        setIsExporting(false)
        resolve()
      })

      // Throttled rAF loop: draw at TARGET_FPS max
      let lastFrameTime = 0
      const FRAME_INTERVAL = 1000 / TARGET_FPS

      const drawFrame = (now) => {
        if (exportAbortRef.current) {
          video.pause()
          if (recorder.state !== 'inactive') recorder.stop()
          if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
          return
        }

        if (video.ended || video.currentTime >= trimEnd) {
          video.pause()
          if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
          setTimeout(() => {
            if (recorder.state !== 'inactive') recorder.stop()
          }, 200)
          return
        }

        if (now - lastFrameTime >= FRAME_INTERVAL) {
          lastFrameTime = now
          ctx.filter = getFilterString()
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const elapsed = video.currentTime - startTime
          setExportProgress(Math.min(99, (elapsed / Math.max(0.001, trimDuration)) * 100))
        }

        animFrameRef.current = requestAnimationFrame(drawFrame)
      }

      animFrameRef.current = requestAnimationFrame(drawFrame)
    })
  }

  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [videoSrc])

  const previewFilterStyle = {
    filter: getFilterString(filters),
    width: '100%',
    height: 'auto',
    maxHeight: '500px',
    objectFit: 'contain',
    borderRadius: '0.5rem'
  }

  const timelinePercent = videoMeta.duration ? (currentTime / videoMeta.duration) * 100 : 0

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">

      <main className="flex-1 w-full max-w-[1600px] mx-auto pt-20 pb-4 px-4 md:pt-24 md:pb-6 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col gap-4">
          {!videoSrc ? (
            <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 glass-panel rounded-2xl border-2 border-dashed border-slate-800 hover:border-indigo-500/40 transition-all shadow-xl min-h-[500px]">
              <div className="max-w-md text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-xl">
                  <Upload className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">Upload your video</h3>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                  Drag and drop your video file, or click to browse. Supports MP4, WebM, and MOV formats.
                </p>
                <label className="cursor-pointer bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition flex items-center gap-2 mb-8">
                  <VideoIcon className="w-4 h-4" />
                  Browse Device Files
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleVideoUpload(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-slate-500">All processing happens locally. Your video never leaves your device.</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl relative min-h-[500px]">
              <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 p-4">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="font-semibold text-slate-200 truncate max-w-[150px] sm:max-w-[240px]">
                    {videoMeta.name}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                  <span>{videoMeta.width} × {videoMeta.height}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                  <span>{formatTime(videoMeta.duration)}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                  <span>{formatSize(videoMeta.size)}</span>
                </div>
              </div>

              <div className="flex-1 p-6 flex flex-col items-center justify-center bg-slate-950/60 overflow-hidden relative">
                <div className="relative w-full max-w-4xl">
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    preload="auto"
                    playsInline
                    crossOrigin="anonymous"
                    onLoadedMetadata={handleVideoLoaded}
                    onTimeUpdate={() => {
                      const v = videoRef.current
                      if (v) {
                        setCurrentTime(v.currentTime)
                        if (v.currentTime >= trimEnd && !isExporting) {
                          v.pause()
                          setIsPlaying(false)
                        }
                      }
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full"
                    style={previewFilterStyle}
                    controls={false}
                  />

                  <div className="mt-4 space-y-2">
                    <div
                      className="relative w-full h-2 bg-slate-800 rounded-full cursor-pointer group"
                      onClick={handleSeek}
                    >
                      <div
                        className="absolute h-full bg-indigo-500 rounded-full"
                        style={{ width: `${timelinePercent}%` }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-400 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ left: `${timelinePercent}%`, marginLeft: '-8px' }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={togglePlay}
                          disabled={isExporting}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <span className="text-xs text-slate-400 font-mono">
                          {formatTime(currentTime)} / {formatTime(videoMeta.duration)}
                        </span>
                      </div>
                      {activeTab === 'trim' && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="text-slate-500">Trim:</span>
                          <span className="font-mono text-indigo-400">{formatTime(trimStart)}</span>
                          <span>-</span>
                          <span className="font-mono text-indigo-400">{formatTime(trimEnd)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isExporting && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-20">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center shadow-2xl">
                      <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-slate-100 mb-2">Exporting Video...</h3>
                      <p className="text-sm text-slate-400 mb-4">
                        {exportProgress === 0 && exportFormat === 'video/mp4' && !ffmpegLoaded
                          ? 'Loading video encoder... (first time only)'
                          : exportProgress >= 99
                            ? 'Converting to MP4...'
                            : 'Capturing frames...'}
                      </p>
                      <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden mx-auto">
                        <div
                          className="h-full bg-indigo-500 transition-all duration-300"
                          style={{ width: `${exportProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">{Math.round(exportProgress)}%</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          {videoSrc && (
            <div className="flex justify-end">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset Workspace
              </button>
            </div>
          )}
          {!videoSrc ? (
            <div className="glass-panel rounded-2xl border border-slate-800/80 p-5 shadow-xl flex flex-col justify-between min-h-[300px]">
              <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                <VideoIcon className="w-8 h-8 text-slate-700 mb-3" />
                <h4 className="text-sm font-bold text-slate-400">Upload a video first</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                  Upload a video to access editing tools.
                </p>
              </div>
            </div>
          ) : (
            <>
               <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1 flex-wrap sm:flex-nowrap">
                 <TabButton icon={Scissors} label="Trim" active={activeTab === 'trim'} onClick={() => setActiveTab('trim')} />
                 <TabButton icon={Layers} label="Compress" active={activeTab === 'compress'} onClick={() => setActiveTab('compress')} />
                 <TabButton icon={Sliders} label="Enhance" active={activeTab === 'enhance'} onClick={() => setActiveTab('enhance')} />
               </div>

              <div className="flex-1 glass-panel rounded-2xl border border-slate-800/80 p-5 shadow-xl flex flex-col justify-between">
                {activeTab === 'trim' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Trim Video</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-400">Start Time</span>
                            <span className="text-indigo-400 font-mono font-bold">{formatTime(trimStart)}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max={videoMeta.duration || 0}
                            step="0.1"
                            value={trimStart}
                            onChange={(e) => setTrimStart(parseFloat(e.target.value))}
                            className="w-full accent-indigo-500 bg-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-400">End Time</span>
                            <span className="text-indigo-400 font-mono font-bold">{formatTime(trimEnd)}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max={videoMeta.duration || 0}
                            step="0.1"
                            value={trimEnd}
                            onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
                            className="w-full accent-indigo-500 bg-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Start (sec)</label>
                            <input
                              type="number"
                              min="0"
                              max={videoMeta.duration || 0}
                              step="0.1"
                              value={trimStart}
                              onChange={(e) => setTrimStart(parseFloat(e.target.value) || 0)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">End (sec)</label>
                            <input
                              type="number"
                              min="0"
                              max={videoMeta.duration || 0}
                              step="0.1"
                              value={trimEnd}
                              onChange={(e) => setTrimEnd(parseFloat(e.target.value) || 0)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                 {activeTab === 'compress' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2.5">Export Format</h3>
                      <div className="grid grid-cols-2 gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
                        {[
                          { label: 'MP4 (H.264)', value: 'video/mp4' },
                          { label: 'WebM (VP9)', value: 'video/webm; codecs=vp9,opus' }
                        ].map((fmt) => (
                          <button
                            key={fmt.value}
                            onClick={() => setExportFormat(fmt.value)}
                            className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              exportFormat === fmt.value
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {fmt.label.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2">
                        MP4 uses browser-based FFmpeg encoding (loads ~30MB on first use). WebM is native and instant.
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-slate-900 pt-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-medium">Compression Level</span>
                        <span className="text-indigo-400 font-mono font-bold">{compressionLevel}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={compressionLevel}
                        onChange={(e) => setCompressionLevel(parseInt(e.target.value))}
                        className="w-full accent-indigo-500 bg-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-600 font-semibold mt-1">
                        <span>Min (Large File, High Quality)</span>
                        <span>Max (Tiny File, Lower Quality)</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-900 pt-4">
                      {exportFormat === 'video/mp4' && !MediaRecorder.isTypeSupported('video/mp4') && (
                        <p className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 mb-3 leading-relaxed">
                          MP4 requires a one-time ~30MB FFmpeg download on first export. Subsequent exports are faster.
                        </p>
                      )}
                      <div className="flex justify-between text-xs items-center bg-slate-950/60 p-3.5 rounded-xl border border-slate-900">
                        <div>
                          <span className="text-slate-500 font-semibold block leading-none">Estimated File Size:</span>
                          <span className="text-[10px] text-slate-500 font-medium mt-1 block leading-none">
                            {formatTime(trimEnd - trimStart)} duration
                          </span>
                        </div>
                        <span className="text-indigo-400 font-mono font-bold text-sm">
                          {estimatedSize ? formatSize(estimatedSize) : 'Calculating...'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'enhance' && (
                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                    <div className="flex justify-between items-center border-t border-slate-900 pt-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider m-0">Video Filters</h3>
                      <button
                        onClick={resetFilters}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase transition cursor-pointer"
                      >
                        Reset All
                      </button>
                    </div>
                    {[
                      { key: 'brightness', label: 'Brightness', min: 0, max: 200, unit: '%', default: 100 },
                      { key: 'contrast', label: 'Contrast', min: 0, max: 200, unit: '%', default: 100 },
                      { key: 'saturation', label: 'Saturation', min: 0, max: 200, unit: '%', default: 100 },
                      { key: 'hueRotate', label: 'Hue Rotate', min: 0, max: 360, unit: '°', default: 0 },
                      { key: 'blur', label: 'Blur', min: 0, max: 10, unit: 'px', default: 0 },
                      { key: 'grayscale', label: 'Grayscale', min: 0, max: 100, unit: '%', default: 0 },
                      { key: 'sepia', label: 'Sepia', min: 0, max: 100, unit: '%', default: 0 },
                    ].map((slider) => (
                      <div key={slider.key} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <label className="text-slate-400 font-semibold">{slider.label}</label>
                          <div className="flex items-center gap-1.5 font-mono text-indigo-400 font-bold">
                            <span>{filters[slider.key]}{slider.unit}</span>
                            {filters[slider.key] !== slider.default && (
                              <button
                                onClick={() => setFilters(prev => ({ ...prev, [slider.key]: slider.default }))}
                                className="text-[9px] text-slate-500 hover:text-slate-300 font-sans font-bold uppercase transition cursor-pointer"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="range"
                          min={slider.min}
                          max={slider.max}
                          value={filters[slider.key]}
                          onChange={(e) => setFilters(prev => ({ ...prev, [slider.key]: parseInt(e.target.value) }))}
                          className="w-full accent-indigo-500 bg-slate-800 rounded-lg appearance-none h-1 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-900 mt-6 pt-5">
                <button
                  onClick={startExport}
                  disabled={isExporting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 py-3.5 rounded-xl text-sm font-bold text-white shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Exporting... {Math.round(exportProgress)}%
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export & Download Video
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {!videoSrc && (
        <section className="max-w-[1600px] mx-auto px-6 py-16 md:py-24">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent m-0">
              Powerful Video Editing
            </h2>
            <p className="text-slate-400 mt-4 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Everything runs in your browser. No uploads, no server processing, completely private.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, idx) => (
              <article
                key={idx}
                className="p-6 md:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 hover:bg-slate-900 transition-all duration-300"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-500/10 text-indigo-400 mx-auto mb-4">
                  <feature.icon className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-slate-100 text-center mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed text-center">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 mt-12">
        <div className="flex items-center gap-2">
          <span>© 2026 VideoForge Studio. Crafted with React & Tailwind CSS.</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Browser-based video editing. Private & Free.</span>
          <Heart className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600 animate-pulse" />
        </div>
      </footer>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

function TabButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-[10px] sm:text-xs font-semibold tracking-wide transition cursor-pointer ${
        active
          ? 'bg-indigo-600 text-white shadow-lg'
          : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}

export default function VideoPage(props) {
  return <Video {...props} />
}


