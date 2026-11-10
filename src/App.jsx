import { useState, useEffect, useRef, useTransition } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components/Navbar.jsx'


import Home from './pages/Home.jsx'
import Video from './pages/Video.jsx'
import Contact from './pages/Contact.jsx'


import {

  Upload,
  Crop,
  Sparkles,
  Maximize2,
  RotateCw,
  RotateCcw,
  RefreshCw,
  Download,
  Image as ImageIcon,
  Check,
  Sliders,
  Frame as FrameIcon,
  Trash2,
  Eye,
  Scaling,
  FlipHorizontal,
  FlipVertical,
  Layers,
  Heart,
  Wand2,
  ShieldCheck,
  BarChart3,
  Zap,
  Lock,
  Gem
} from 'lucide-react'

// Unsplash premium sample images with cache-busting signatures to guarantee CORS validation
const SAMPLE_IMAGES = [
  {
    name: 'Sunset Beach',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80&sig=sunset_beach_1',
    thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=150&q=80&sig=sunset_beach_thumb'
  },
  {
    name: 'Cyberpunk Alley',
    url: 'https://images.unsplash.com/photo-1515260268569-9271009adfdb?auto=format&fit=crop&w=1200&q=80&sig=cyber_alley_2',
    thumb: 'https://images.unsplash.com/photo-1515260268569-9271009adfdb?auto=format&fit=crop&w=150&q=80&sig=cyber_alley_thumb'
  },
  {
    name: 'Studio Portrait',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80&sig=portrait_3',
    thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80&sig=portrait_thumb'
  }
]

const FRAME_COLORS = [
  { name: 'Pure White', value: '#ffffff', bg: 'bg-white' },
  { name: 'Sleek Dark', value: '#0f172a', bg: 'bg-slate-900' },
  { name: 'Matte Grey', value: '#64748b', bg: 'bg-slate-500' },
  { name: 'Warm Gold', value: '#d97706', bg: 'bg-amber-600' },
  { name: 'Neon Purple', value: '#a855f7', bg: 'bg-purple-500' },
  { name: 'Electric Cyan', value: '#06b6d4', bg: 'bg-cyan-500' },
  { name: 'Acid Lime', value: '#84cc16', bg: 'bg-lime-500' }
]

const SIZE_PRESETS = [
  { label: 'Custom Size', value: 'custom', w: null, h: null },
  { label: 'Instagram Square (1:1)', value: 'ig-square', w: 1080, h: 1080 },
  { label: 'Instagram Story (9:16)', value: 'ig-story', w: 1080, h: 1920 },
  { label: 'YouTube Thumbnail (16:9)', value: 'yt-thumb', w: 1280, h: 720 },
  { label: 'Facebook Cover (2.6:1)', value: 'fb-cover', w: 820, h: 312 },
  { label: 'Twitter Header (3:1)', value: 'tw-header', w: 1500, h: 500 },
  { label: 'Full HD (16:9)', value: 'hd-1080p', w: 1920, h: 1080 }
]

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Perfect Quality',
    description: 'We intelligently apply compression to retain image quality while drastically reducing image size.'
  },
  {
    icon: BarChart3,
    title: 'Best Compression',
    description: 'Compress your images by up to 80% or more by applying lossy compression and other optimizations.'
  },
  {
    icon: Zap,
    title: 'Easy To Use',
    description: 'Simply upload your images and watch our tool do its magic. Even large images are compressed within seconds.'
  },
  {
    icon: ImageIcon,
    title: 'Image Formats',
    description: 'Export optimized JPEG and WebP files. Resize, crop, enhance, and compress right in your browser.'

  },
  {
    icon: Lock,
    title: 'Privacy Guaranteed',
    description: 'All processing happens locally in your browser. Your photos are never uploaded to any server—everything stays private on your device.'

  },
  {
    icon: Gem,
    title: 'It\u2019s Free',
    description: 'Since 2012 we have compressed millions of images for free! There is no software to install, registrations, or watermarks.'
  }
]

export function ImageEditorAppShell() {
  // App states
  const [imageSrc, setImageSrc] = useState(null)
  const [imageMeta, setImageMeta] = useState({ name: '', size: 0, type: '', width: 0, height: 0 })
  const [activeTab, setActiveTab] = useState('resize')
  const [isPending, startTransition] = useTransition()

  // Original image object ref
  const imageRef = useRef(null)
  const canvasRef = useRef(null)

  // Contrast/Enhance parameters
  const [filters, setFilters] = useState({
    brightness: 0,   // -100 to 100
    contrast: 0,     // -100 to 100
    saturation: 0,   // -100 to 100
    exposure: 0,     // -100 to 100
    blur: 0,         // 0 to 20
    grayscale: 0,    // 0 to 100
    sepia: 0,        // 0 to 100
    hueRotate: 0,    // 0 to 360
    invert: 0,       // 0 to 100
    sharpen: false   // toggle
  })
  
  const [isAutoEnhanced, setIsAutoEnhanced] = useState(false)

  // Resize and Layout settings
  const [resizeMode, setResizeMode] = useState('fit') // fit (contain), fill (cover), stretch
  const [sizePreset, setSizePreset] = useState('custom')
  const [targetWidth, setTargetWidth] = useState(800)
  const [targetHeight, setTargetHeight] = useState(600)
  const [scalePercentage, setScalePercentage] = useState(100)

  // Rotate and Flip settings
  const [rotation, setRotation] = useState(0) // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)

  // Crop settings
  const [isCroppingMode, setIsCroppingMode] = useState(false)
  const [cropRatio, setCropRatio] = useState('free') // free, 1:1, 4:3, 16:9, 9:16
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 100, height: 100 })
  
  // Frame settings
  const [frameType, setFrameType] = useState('none') // none, standard, polaroid, wooden, neon
  const [frameWidth, setFrameWidth] = useState(24)
  const [frameRadius, setFrameRadius] = useState(12)
  const [frameColor, setFrameColor] = useState('#ffffff')
  const [polaroidText, setPolaroidText] = useState('')
  const [neonGlowSize, setNeonGlowSize] = useState(20)

  // Export settings (PNG removed completely as requested. Supporting JPEG & WEBP)
  const [exportFormat, setExportFormat] = useState('image/jpeg') 
  // Compression level state (0% = high quality, large file; 95% = low quality, small file)
  // Increasing this slider value directly lowers the final file size
  const [compressionLevel, setCompressionLevel] = useState(20) 
  const [estimatedSize, setEstimatedSize] = useState(null)

// UI state
   const [zoomLevel, setZoomLevel] = useState('fit') // fit, fill
   const [isComparing, setIsComparing] = useState(false) // hold to compare original
   const dragStartInfo = useRef(null)
  const previewContainerRef = useRef(null)
  const previewImageRef = useRef(null)

  // Quality parameter passed to Canvas: (100 - compressionLevel) / 100
  const exportQuality = (100 - compressionLevel) / 100

  // Handle image upload
  const handleImageUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        imageRef.current = img
        setImageMeta({
          name: file.name,
          size: file.size,
          type: file.type,
          width: img.naturalWidth,
          height: img.naturalHeight
        })
        setTargetWidth(img.naturalWidth)
        setTargetHeight(img.naturalHeight)
        setCropBox({ x: 0, y: 0, width: 100, height: 100 })
        setRotation(0)
        setFlipH(false)
        setFlipV(false)
        resetFilters()
        setIsAutoEnhanced(false)
        setFrameType('none')
        setImageSrc(e.target.result)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }

  // Load sample image with cache busting query to prevent canvas taint
  const loadSampleImage = (sample) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageRef.current = img
      setImageMeta({
        name: sample.name + '.jpg',
        size: 342000,
        type: 'image/jpeg',
        width: img.naturalWidth,
        height: img.naturalHeight
      })
      setTargetWidth(img.naturalWidth)
      setTargetHeight(img.naturalHeight)
      setCropBox({ x: 0, y: 0, width: 100, height: 100 })
      setRotation(0)
      setFlipH(false)
      setFlipV(false)
      resetFilters()
      setIsAutoEnhanced(false)
      setFrameType('none')
      setImageSrc(sample.url)
    }
    img.src = sample.url
  }

  // Auto Enhance toggler - applies a calculated mix of parameters to enhance aesthetics
  const toggleAutoEnhance = () => {
    if (isAutoEnhanced) {
      resetFilters()
      setIsAutoEnhanced(false)
    } else {
      setFilters({
        brightness: 8,
        contrast: 14,
        saturation: 18,
        exposure: 5,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        hueRotate: 0,
        invert: 0,
        sharpen: true
      })
      setIsAutoEnhanced(true)
    }
  }

  // Reset Filters
  const resetFilters = () => {
    setFilters({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      hueRotate: 0,
      invert: 0,
      sharpen: false
    })
    setIsAutoEnhanced(false)
  }

  // Reset Workspace (now completely clears the current image and returns to upload dropzone)
  const handleResetAll = () => {
    setImageSrc(null)
    imageRef.current = null
    setImageMeta({ name: '', size: 0, type: '', width: 0, height: 0 })
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
    resetFilters()
    setIsAutoEnhanced(false)
    setFrameType('none')
    setFrameWidth(24)
    setFrameRadius(12)
    setFrameColor('#ffffff')
    setPolaroidText('')
    setNeonGlowSize(20)
    setSizePreset('custom')
    setScalePercentage(100)
    setCropRatio('free')
    setCropBox({ x: 0, y: 0, width: 100, height: 100 })
    setCompressionLevel(20)
    setExportFormat('image/jpeg')
  }

  // Width & height custom input changes (independent custom values)
  const handleWidthChange = (val) => {
    const width = Math.max(1, parseInt(val) || 0)
    setTargetWidth(width)
    setSizePreset('custom')
  }

  const handleHeightChange = (val) => {
    const height = Math.max(1, parseInt(val) || 0)
    setTargetHeight(height)
    setSizePreset('custom')
  }

  // Presets
  const handlePresetChange = (presetValue) => {
    setSizePreset(presetValue)
    const preset = SIZE_PRESETS.find(p => p.value === presetValue)
    if (preset && preset.w && preset.h) {
      setTargetWidth(preset.w)
      setTargetHeight(preset.h)
    }
  }

  // Scale percent change slider
  const handleScalePercentChange = (percent) => {
    setScalePercentage(percent)
    if (imageRef.current) {
      const croppedW = imageRef.current.naturalWidth * (cropBox.width / 100)
      const croppedH = imageRef.current.naturalHeight * (cropBox.height / 100)
      const baseW = (rotation === 90 || rotation === 270) ? croppedH : croppedW
      const baseH = (rotation === 90 || rotation === 270) ? croppedW : croppedH
      setTargetWidth(Math.round(baseW * (percent / 100)))
      setTargetHeight(Math.round(baseH * (percent / 100)))
    }
  }

  // Rotate handler that swaps output dimensions to prevent image squeezing
  const handleRotateCW = () => {
    setRotation((prev) => (prev + 90) % 360)
    setTargetWidth(targetHeight)
    setTargetHeight(targetWidth)
  }

  const handleRotateCCW = () => {
    setRotation((prev) => (prev - 90 + 360) % 360)
    setTargetWidth(targetHeight)
    setTargetHeight(targetWidth)
  }

  // Interactive crop box calculations based on container dragging
  const handleCropDragStart = (e, dragType) => {
    e.preventDefault()
    e.stopPropagation()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    const previewContainer = previewContainerRef.current
    if (!previewContainer) return
    
    const rect = previewContainer.getBoundingClientRect()
    
    dragStartInfo.current = {
      dragType,
      startX: clientX,
      startY: clientY,
      startBox: { ...cropBox },
      containerWidth: rect.width,
      containerHeight: rect.height
    }

    if (e.touches) {
      window.addEventListener('touchmove', handleCropDragMove, { passive: false })
      window.addEventListener('touchend', handleCropDragEnd)
    } else {
      window.addEventListener('mousemove', handleCropDragMove)
      window.addEventListener('mouseup', handleCropDragEnd)
    }
  }

  const handleCropDragMove = (e) => {
    if (!dragStartInfo.current) return
    const info = dragStartInfo.current
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    const dx = ((clientX - info.startX) / info.containerWidth) * 100
    const dy = ((clientY - info.startY) / info.containerHeight) * 100
    
    let newBox = { ...info.startBox }
    
    switch (info.dragType) {
      case 'move':
        newBox.x = Math.max(0, Math.min(100 - newBox.width, info.startBox.x + dx))
        newBox.y = Math.max(0, Math.min(100 - newBox.height, info.startBox.y + dy))
        break
      case 'se': 
        newBox.width = Math.max(10, Math.min(100 - newBox.x, info.startBox.width + dx))
        if (cropRatio !== 'free') {
          const ratioVal = getCropRatioValue()
          const containerRatio = info.containerWidth / info.containerHeight
          newBox.height = (newBox.width / ratioVal) * containerRatio
        } else {
          newBox.height = Math.max(10, Math.min(100 - newBox.y, info.startBox.height + dy))
        }
        break
case 'sw': {
         const diffX = Math.max(-info.startBox.x, dx)
         newBox.x = info.startBox.x + diffX
         newBox.width = info.startBox.width - diffX
         if (newBox.width < 10) {
           const limitX = info.startBox.x + info.startBox.width - 10
           newBox.x = limitX
           newBox.width = 10
         }
         if (cropRatio !== 'free') {
           const ratioVal = getCropRatioValue()
           const containerRatio = info.containerWidth / info.containerHeight
           newBox.height = (newBox.width / ratioVal) * containerRatio
         } else {
           newBox.height = Math.max(10, Math.min(100 - newBox.y, info.startBox.height + dy))
         }
         break
       }
      case 'ne': 
        newBox.width = Math.max(10, Math.min(100 - newBox.x, info.startBox.width + dx))
        if (cropRatio !== 'free') {
          const ratioVal = getCropRatioValue()
          const containerRatio = info.containerWidth / info.containerHeight
          const targetH = (newBox.width / ratioVal) * containerRatio
          const diffH = targetH - newBox.height
          newBox.y = Math.max(0, newBox.y - diffH)
          newBox.height = targetH
        } else {
          const diffY = Math.max(-info.startBox.y, dy)
          newBox.y = info.startBox.y + diffY
          newBox.height = info.startBox.height - diffY
          if (newBox.height < 10) {
            const limitY = info.startBox.y + info.startBox.height - 10
            newBox.y = limitY
            newBox.height = 10
          }
        }
        break
case 'nw': {
         const dxNW = Math.max(-info.startBox.x, dx)
         newBox.x = info.startBox.x + dxNW
         newBox.width = info.startBox.width - dxNW
         if (newBox.width < 10) {
           const limitX = info.startBox.x + info.startBox.width - 10
           newBox.x = limitX
           newBox.width = 10
         }
         
         if (cropRatio !== 'free') {
           const ratioVal = getCropRatioValue()
           const containerRatio = info.containerWidth / info.containerHeight
           const targetH = (newBox.width / ratioVal) * containerRatio
           const diffH = targetH - newBox.height
           newBox.y = Math.max(0, newBox.y - diffH)
           newBox.height = targetH
         } else {
           const dyNW = Math.max(-info.startBox.y, dy)
           newBox.y = info.startBox.y + dyNW
           newBox.height = info.startBox.height - dyNW
           if (newBox.height < 10) {
             const limitY = info.startBox.y + info.startBox.height - 10
             newBox.y = limitY
             newBox.height = 10
           }
         }
         break
       }
      case 'n': 
        if (cropRatio === 'free') {
          const diffY = Math.max(-info.startBox.y, dy)
          newBox.y = info.startBox.y + diffY
          newBox.height = info.startBox.height - diffY
          if (newBox.height < 10) {
            newBox.y = info.startBox.y + info.startBox.height - 10
            newBox.height = 10
          }
        }
        break
      case 's': 
        if (cropRatio === 'free') {
          newBox.height = Math.max(10, Math.min(100 - newBox.y, info.startBox.height + dy))
        }
        break
      case 'e': 
        if (cropRatio === 'free') {
          newBox.width = Math.max(10, Math.min(100 - newBox.x, info.startBox.width + dx))
        }
        break
      case 'w': 
        if (cropRatio === 'free') {
          const diffX = Math.max(-info.startBox.x, dx)
          newBox.x = info.startBox.x + diffX
          newBox.width = info.startBox.width - diffX
          if (newBox.width < 10) {
            newBox.x = info.startBox.x + info.startBox.width - 10
            newBox.width = 10
          }
        }
        break
    }
    
    if (newBox.y + newBox.height > 100) newBox.height = 100 - newBox.y
    if (newBox.x + newBox.width > 100) newBox.width = 100 - newBox.x
    
    setCropBox(newBox)
  }

  const handleCropDragEnd = () => {
    window.removeEventListener('mousemove', handleCropDragMove)
    window.removeEventListener('mouseup', handleCropDragEnd)
    window.removeEventListener('touchmove', handleCropDragMove)
    window.removeEventListener('touchend', handleCropDragEnd)
    dragStartInfo.current = null
    
    // Automatically trigger canvas dimensions adjustments based on newly cropped box
    if (imageRef.current) {
      const croppedW = imageRef.current.naturalWidth * (cropBox.width / 100)
      const croppedH = imageRef.current.naturalHeight * (cropBox.height / 100)
      const isRotated = rotation === 90 || rotation === 270
      const w = isRotated ? croppedH : croppedW
      const h = isRotated ? croppedW : croppedH
      
      setTargetWidth(Math.round(w * (scalePercentage / 100)))
      setTargetHeight(Math.round(h * (scalePercentage / 100)))
    }
  }

  const getCropRatioValue = () => {
    if (cropRatio === '1:1') return 1
    if (cropRatio === '16:9') return 16 / 9
    if (cropRatio === '4:3') return 4 / 3
    if (cropRatio === '9:16') return 9 / 16
    if (cropRatio === '3:2') return 3 / 2
    if (cropRatio === '2:3') return 2 / 3
    return 1
  }

  // Adjust crop aspect ratio boxes
  const applyCropRatio = (ratioKey) => {
    setCropRatio(ratioKey)
    if (ratioKey === 'free') return
    
    let ratioVal = 1
    if (ratioKey === '1:1') ratioVal = 1
    if (ratioKey === '16:9') ratioVal = 16 / 9
    if (ratioKey === '4:3') ratioVal = 4 / 3
    if (ratioKey === '9:16') ratioVal = 9 / 16
    if (ratioKey === '3:2') ratioVal = 3 / 2
    if (ratioKey === '2:3') ratioVal = 2 / 3
    
    let newWidth = 90
    let newHeight = 90
    
    if (imageRef.current) {
      const imageRatio = imageRef.current.naturalWidth / imageRef.current.naturalHeight
      const relativeRatio = ratioVal / imageRatio
      
      if (relativeRatio > 1) {
        newWidth = 90
        newHeight = 90 / relativeRatio
      } else {
        newHeight = 90
        newWidth = 90 * relativeRatio
      }
    }
    
    setCropBox({
      x: (100 - newWidth) / 2,
      y: (100 - newHeight) / 2,
      width: newWidth,
      height: newHeight
    })
  }

  // Sharpening helper (convolution kernel)
  const sharpenImageData = (ctx, w, h) => {
    try {
      const imgData = ctx.getImageData(0, 0, w, h)
      const data = imgData.data
      const originalData = new Uint8ClampedArray(data)
      const kernel = [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
      ]
      
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = (y * w + x) * 4
          let r = 0, g = 0, b = 0
          
          for (let ky = 0; ky < 3; ky++) {
            for (let kx = 0; kx < 3; kx++) {
              const px = x + kx - 1
              const py = y + ky - 1
              const pidx = (py * w + px) * 4
              const kVal = kernel[ky * 3 + kx]
              
              r += originalData[pidx] * kVal
              g += originalData[pidx + 1] * kVal
              b += originalData[pidx + 2] * kVal
            }
          }
          
          data[idx] = Math.min(255, Math.max(0, r))
          data[idx + 1] = Math.min(255, Math.max(0, g))
          data[idx + 2] = Math.min(255, Math.max(0, b))
        }
      }
      ctx.putImageData(imgData, 0, 0)
    } catch (e) {
      console.warn("Sharpen convolution skipped: canvas is likely dirty (cross-origin).", e)
    }
  }

  // Render processed photo onto final canvas
  useEffect(() => {
    if (!imageRef.current) return

    startTransition(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const originalImage = imageRef.current

      // 1. Calculate Crop box coordinates in physical pixels
      const cx = (cropBox.x / 100) * originalImage.naturalWidth
      const cy = (cropBox.y / 100) * originalImage.naturalHeight
      const cw = (cropBox.width / 100) * originalImage.naturalWidth
      const ch = (cropBox.height / 100) * originalImage.naturalHeight

      // 2. Base dimensions (after crop, resize, and rotation)
      const baseW = targetWidth
      const baseH = targetHeight
      
      const isRotated = rotation === 90 || rotation === 270
      
      const drawW = isRotated ? baseH : baseW
      const drawH = isRotated ? baseW : baseH

      // 3. Create Offscreen Canvas for transformations & filter effects
      const offscreen = document.createElement('canvas')
      offscreen.width = baseW
      offscreen.height = targetHeight
      const oCtx = offscreen.getContext('2d')

      // Set offscreen filters
      const filterStr = `
        brightness(${100 + filters.brightness}%)
        contrast(${100 + filters.contrast}%)
        saturate(${100 + filters.saturation}%)
        blur(${filters.blur}px)
        grayscale(${filters.grayscale}%)
        sepia(${filters.sepia}%)
        hue-rotate(${filters.hueRotate}deg)
        invert(${filters.invert}%)
      `
      oCtx.filter = filterStr.trim()

      oCtx.save()
      oCtx.translate(baseW / 2, targetHeight / 2)
      oCtx.rotate((rotation * Math.PI) / 180)
      oCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1)

      // Draw original cropped image
      oCtx.drawImage(
        originalImage,
        cx, cy, cw, ch, // Crop Source
        -drawW / 2, -drawH / 2, drawW, drawH // Destination on offscreen
      )
      oCtx.restore()

      // Apply exposure manually
      if (filters.exposure !== 0) {
        oCtx.save()
        if (filters.exposure > 0) {
          oCtx.fillStyle = `rgba(255, 255, 255, ${filters.exposure / 100})`
          oCtx.globalCompositeOperation = 'source-over'
        } else {
          oCtx.fillStyle = `rgba(0, 0, 0, ${Math.abs(filters.exposure) / 100})`
          oCtx.globalCompositeOperation = 'multiply'
        }
        oCtx.fillRect(0, 0, baseW, targetHeight)
        oCtx.restore()
      }

      // Apply sharpen kernel on offscreen canvas
      if (filters.sharpen) {
        sharpenImageData(oCtx, baseW, targetHeight)
      }

      // 4. Calculate Final Canvas dimensions including Frame/Borders
      let finalW = baseW
      let finalH = targetHeight
      let borderW = parseInt(frameWidth) || 0
      let radius = parseInt(frameRadius) || 0

      let pBorder = 0
      let pBottom = 0

      if (frameType === 'standard' || frameType === 'wooden' || frameType === 'neon') {
        finalW = baseW + borderW * 2
        finalH = targetHeight + borderW * 2
      } else if (frameType === 'polaroid') {
        pBorder = Math.max(16, Math.round(baseW * 0.05))
        pBottom = Math.max(64, Math.round(targetHeight * 0.18))
        finalW = baseW + pBorder * 2
        finalH = targetHeight + pBorder + pBottom
      }

      canvas.width = finalW
      canvas.height = finalH

      ctx.clearRect(0, 0, finalW, finalH)

      // 5. Draw Frame Background & Textures
      if (frameType === 'standard') {
        ctx.save()
        ctx.fillStyle = frameColor
        if (radius > 0) {
          ctx.beginPath()
          ctx.roundRect(0, 0, finalW, finalH, radius)
          ctx.fill()
        } else {
          ctx.fillRect(0, 0, finalW, finalH)
        }
        ctx.restore()

        ctx.save()
        if (radius > 0) {
          ctx.beginPath()
          const innerRadius = Math.max(0, radius - borderW)
          ctx.roundRect(borderW, borderW, baseW, targetHeight, innerRadius)
          ctx.clip()
        }
        ctx.drawImage(offscreen, borderW, borderW)
        ctx.restore()

      } else if (frameType === 'polaroid') {
        ctx.save()
        ctx.fillStyle = '#fafaf9'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)'
        ctx.shadowBlur = 16
        ctx.shadowOffsetY = 6
        ctx.fillRect(0, 0, finalW, finalH)
        ctx.restore()

        ctx.save()
        ctx.strokeStyle = '#e4e4e7'
        ctx.lineWidth = 1
        ctx.strokeRect(pBorder - 1, pBorder - 1, baseW + 2, targetHeight + 2)
        ctx.restore()

        ctx.drawImage(offscreen, pBorder, pBorder)

        if (polaroidText) {
          ctx.save()
          ctx.fillStyle = '#1c1917'
          const fontSize = Math.max(12, Math.round(pBottom * 0.35))
          ctx.font = `500 ${fontSize}px "Caveat", cursive`
          ctx.textAlign = 'center'
          ctx.fillText(polaroidText, finalW / 2, targetHeight + pBorder + pBottom * 0.55)
          ctx.restore()
        }

      } else if (frameType === 'wooden') {
        ctx.save()
        
        const drawMiteredBorder = (x1, y1, x2, y2, x3, y3, x4, y4, gradColors) => {
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.lineTo(x3, y3)
          ctx.lineTo(x4, y4)
          ctx.closePath()
          
          const grad = ctx.createLinearGradient(x1, y1, x3, y3)
          gradColors.forEach(([pos, color]) => grad.addColorStop(pos, color))
          ctx.fillStyle = grad
          ctx.fill()
        }

        const lighterWood = [
          [0, '#854d0e'],
          [0.5, '#a16207'],
          [1, '#713f12']
        ]
        const darkerWood = [
          [0, '#451a03'],
          [0.5, '#78350f'],
          [1, '#451a03']
        ]

        drawMiteredBorder(0, 0, finalW, 0, finalW - borderW, borderW, borderW, borderW, lighterWood)
        drawMiteredBorder(0, finalH, 0, 0, borderW, borderW, borderW, finalH - borderW, lighterWood)
        drawMiteredBorder(finalW, finalH, 0, finalH, borderW, finalH - borderW, finalW - borderW, finalH - borderW, darkerWood)
        drawMiteredBorder(finalW, 0, finalW, finalH, finalW - borderW, finalH - borderW, finalW - borderW, borderW, darkerWood)
        
        ctx.restore()

        ctx.drawImage(offscreen, borderW, borderW)

        ctx.save()
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)'
        ctx.lineWidth = 1
        ctx.strokeRect(borderW, borderW, baseW, targetHeight)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
        ctx.strokeRect(0, 0, finalW, finalH)
        ctx.restore()

      } else if (frameType === 'neon') {
        ctx.save()
        ctx.fillStyle = '#090d16'
        ctx.fillRect(0, 0, finalW, finalH)
        ctx.restore()

        ctx.save()
        ctx.strokeStyle = frameColor
        ctx.lineWidth = Math.max(2, borderW / 3)
        ctx.shadowColor = frameColor
        ctx.shadowBlur = neonGlowSize
        
        if (radius > 0) {
          ctx.beginPath()
          const offset = borderW / 2
          ctx.roundRect(offset, offset, finalW - borderW, finalH - borderW, radius)
          ctx.stroke()
        } else {
          const offset = borderW / 2
          ctx.strokeRect(offset, offset, finalW - borderW, finalH - borderW)
        }
        ctx.restore()

        ctx.save()
        if (radius > 0) {
          ctx.beginPath()
          const innerRadius = Math.max(0, radius - borderW)
          ctx.roundRect(borderW, borderW, baseW, targetHeight, innerRadius)
          ctx.clip()
        }
        ctx.drawImage(offscreen, borderW, borderW)
        ctx.restore()
      } else {
        ctx.drawImage(offscreen, 0, 0)
      }

      // Estimate output size using export Quality formula: (100 - compressionLevel) / 100
      try {
        canvas.toBlob((blob) => {
          if (blob) {
            setEstimatedSize(blob.size)
          }
        }, exportFormat, exportQuality)
      } catch (err) {
        console.warn("Unable to estimate size dynamically due to cross-origin restriction.", err)
        setEstimatedSize(null)
      }
    })
  }, [
    imageSrc,
    cropBox,
    targetWidth,
    targetHeight,
    rotation,
    flipH,
    flipV,
    filters,
    frameType,
    frameWidth,
    frameRadius,
    frameColor,
    polaroidText,
    neonGlowSize,
    exportFormat,
    exportQuality,
    compressionLevel,
    isCroppingMode
  ])

  // Download logic
  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    try {
      const dataURL = canvas.toDataURL(exportFormat, exportQuality)
      const link = document.createElement('a')
      
      const formatExt = exportFormat.split('/')[1]
      const originalName = imageMeta.name.substring(0, imageMeta.name.lastIndexOf('.')) || 'picflex-edit'
      
      link.download = `${originalName}-resized.${formatExt}`
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
} catch {
       alert("Cross-Origin restriction: The image was loaded from an external domain, preventing save. Please upload a local image from your device.")
    }
  }

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    if (!bytes) return 'N/A'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Main App Editor Container */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto pt-20 pb-4 px-4 md:pt-24 md:pb-6 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Workspace Display Area (Left Column) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {imageSrc ? (
            <div className="flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl relative min-h-[500px]">
              
              <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 p-4">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="font-semibold text-slate-200 truncate max-w-[150px] sm:max-w-[240px]">
                    {imageMeta.name}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                  <span>{imageMeta.width} × {imageMeta.height} px</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                  <span>{formatSize(imageMeta.size)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onMouseDown={() => setIsComparing(true)}
                    onMouseUp={() => setIsComparing(false)}
                    onTouchStart={() => setIsComparing(true)}
                    onTouchEnd={() => setIsComparing(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 text-xs font-semibold cursor-pointer active:scale-95 transition-all select-none"
                    title="Hold down to compare with original image"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Hold to Compare Original
                  </button>

                  <button
                    onClick={() => setZoomLevel(zoomLevel === 'fit' ? 'fill' : 'fit')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition cursor-pointer"
                    title="Toggle zoom fit"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-6 flex items-center justify-center bg-slate-950/60 overflow-hidden relative">
                
                {isComparing && (
                  <div className="absolute inset-0 z-30 bg-slate-950 flex items-center justify-center p-6">
                    <img
                      src={imageSrc}
                      className="max-w-full max-h-[500px] object-contain"
                      alt="Original"
                    />
                    <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                      Viewing Original Photo
                    </div>
                  </div>
                )}

                <div 
                  className={`relative select-none ${
                    zoomLevel === 'fill' ? 'w-full h-full' : 'max-w-full max-h-[550px]'
                  } flex items-center justify-center`}
                >
                  
                  {isCroppingMode ? (
                    <div 
                      ref={previewContainerRef}
                      className="relative max-w-full max-h-[500px] overflow-hidden"
                    >
                      <img
                        ref={previewImageRef}
                        src={imageSrc}
                        className="max-h-[500px] object-contain select-none pointer-events-none"
                        alt="Crop source preview"
                      />
                      
                      <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>

                      <div
                        className="absolute border border-dashed border-purple-400 box-border bg-transparent cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
                        style={{
                          left: `${cropBox.x}%`,
                          top: `${cropBox.y}%`,
                          width: `${cropBox.width}%`,
                          height: `${cropBox.height}%`,
                        }}
                        onMouseDown={(e) => handleCropDragStart(e, 'move')}
                        onTouchStart={(e) => handleCropDragStart(e, 'move')}
                      >
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                          <div className="border-r border-b border-white/50"></div>
                          <div className="border-r border-b border-white/50"></div>
                          <div className="border-b border-white/50"></div>
                          <div className="border-r border-b border-white/50"></div>
                          <div className="border-r border-b border-white/50"></div>
                          <div className="border-b border-white/50"></div>
                          <div className="border-r border-white/50"></div>
                          <div className="border-r border-white/50"></div>
                          <div></div>
                        </div>

                        <div 
                          className="absolute w-4 h-4 bg-purple-500 border border-white -top-1.5 -left-1.5 cursor-nwse-resize rounded-full hover:scale-125 transition-transform"
                          onMouseDown={(e) => handleCropDragStart(e, 'nw')}
                          onTouchStart={(e) => handleCropDragStart(e, 'nw')}
                        ></div>
                        <div 
                          className="absolute w-4 h-4 bg-purple-500 border border-white -top-1.5 -right-1.5 cursor-nesw-resize rounded-full hover:scale-125 transition-transform"
                          onMouseDown={(e) => handleCropDragStart(e, 'ne')}
                          onTouchStart={(e) => handleCropDragStart(e, 'ne')}
                        ></div>
                        <div 
                          className="absolute w-4 h-4 bg-purple-500 border border-white -bottom-1.5 -left-1.5 cursor-nesw-resize rounded-full hover:scale-125 transition-transform"
                          onMouseDown={(e) => handleCropDragStart(e, 'sw')}
                          onTouchStart={(e) => handleCropDragStart(e, 'sw')}
                        ></div>
                        <div 
                          className="absolute w-4 h-4 bg-purple-500 border border-white -bottom-1.5 -right-1.5 cursor-nwse-resize rounded-full hover:scale-125 transition-transform"
                          onMouseDown={(e) => handleCropDragStart(e, 'se')}
                          onTouchStart={(e) => handleCropDragStart(e, 'se')}
                        ></div>

                        {cropRatio === 'free' && (
                          <>
                            <div 
                              className="absolute h-1 bg-transparent top-0 inset-x-2 cursor-n-resize"
                              onMouseDown={(e) => handleCropDragStart(e, 'n')}
                              onTouchStart={(e) => handleCropDragStart(e, 'n')}
                            ></div>
                            <div 
                              className="absolute h-1 bg-transparent bottom-0 inset-x-2 cursor-s-resize"
                              onMouseDown={(e) => handleCropDragStart(e, 's')}
                              onTouchStart={(e) => handleCropDragStart(e, 's')}
                            ></div>
                            <div 
                              className="absolute w-1 bg-transparent right-0 inset-y-2 cursor-e-resize"
                              onMouseDown={(e) => handleCropDragStart(e, 'e')}
                              onTouchStart={(e) => handleCropDragStart(e, 'e')}
                            ></div>
                            <div 
                              className="absolute w-1 bg-transparent left-0 inset-y-2 cursor-w-resize"
                              onMouseDown={(e) => handleCropDragStart(e, 'w')}
                              onTouchStart={(e) => handleCropDragStart(e, 'w')}
                            ></div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="relative shadow-2xl overflow-hidden max-w-full max-h-[500px] flex items-center justify-center">
                      <canvas
                        ref={canvasRef}
                        className="max-w-full max-h-[480px] object-contain rounded border border-slate-850 bg-slate-900"
                      />
                      {isPending && (
                        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] flex items-center justify-center">
                          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center gap-2 shadow-2xl">
                            <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
                            <span className="text-xs font-semibold text-slate-300">Processing...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

              <div className="border-t border-slate-800/80 bg-slate-900/40 p-4 flex flex-wrap items-center justify-between gap-4">
                
                <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={handleRotateCCW}
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition cursor-pointer"
                    title="Rotate 90 degrees CCW"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRotateCW}
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition cursor-pointer"
                    title="Rotate 90 degrees CW"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <div className="w-px h-5 bg-slate-800 mx-1"></div>
                  <button
                    onClick={() => setFlipH(!flipH)}
                    className={`p-2 rounded-lg transition cursor-pointer ${
                      flipH ? 'bg-purple-600/20 text-purple-400' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                    title="Flip horizontally"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setFlipV(!flipV)}
                    className={`p-2 rounded-lg transition cursor-pointer ${
                      flipV ? 'bg-purple-600/20 text-purple-400' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                    title="Flip vertically"
                  >
                    <FlipVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {isCroppingMode ? (
                    <>
                      <button
                        onClick={() => {
                          setCropBox({ x: 0, y: 0, width: 100, height: 100 })
                          setIsCroppingMode(false)
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition cursor-pointer"
                      >
                        Cancel Crop
                      </button>
                      <button
                        onClick={() => setIsCroppingMode(false)}
                        className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-500/20 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Apply Crop
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsCroppingMode(true)
                        setActiveTab('crop')
                      }}
                      className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Crop className="w-3.5 h-3.5 text-purple-400" />
                      Adjust Crop Window
                    </button>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 glass-panel rounded-2xl border-2 border-dashed border-slate-800 hover:border-purple-500/40 transition-all shadow-xl min-h-[500px]">
              
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

              <div className="max-w-md text-center flex flex-col items-center relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-xl relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Upload className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-100 mb-2">Upload your photograph</h3>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                  Drag and drop your image anywhere on this page, or select a file to process instantly in your browser (JPG, WEBP, GIF).
                </p>

                <label className="cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-xl shadow-purple-500/10 hover:shadow-purple-500/20 active:scale-[0.98] transition flex items-center gap-2 mb-8">
                  <ImageIcon className="w-4 h-4" />
                  Browse Device Files
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0])}
                    className="hidden"
                  />
                </label>

                  <div className="w-full border-t border-slate-800/80 pt-6">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-4">
                      Or start with a preset sample
                    </p>
                    
                    <div className="flex justify-center gap-4">
                      {SAMPLE_IMAGES.map((sample, idx) => (
                        <button
                          key={idx}
                          onClick={() => loadSampleImage(sample)}
                          className="group flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer"
                        >
                          <div className="w-16 h-12 rounded-lg border border-slate-800 group-hover:border-purple-500/50 overflow-hidden shadow-lg transition-all scale-100 group-hover:scale-105">
                            <img
                              src={sample.thumb}
                              className="w-full h-full object-cover"
                              alt={sample.name}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 group-hover:text-purple-300 font-medium transition">
                            {sample.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

              </div>
            </div>
          )}
        </div>

        {/* Control Config Sidebar Panel (Right Column) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {imageSrc && (
            <div className="flex justify-end">
              <button
                onClick={handleResetAll}
                id="reset-btn"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset Workspace
              </button>
            </div>
          )}
          
          {/* Active navigation tabs */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => {
                setActiveTab('resize')
                setIsCroppingMode(false)
              }}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-[10px] sm:text-xs font-semibold tracking-wide transition cursor-pointer ${
                activeTab === 'resize'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scaling className="w-4 h-4" />
              Resize
            </button>
            <button
              onClick={() => {
                setActiveTab('compress')
                setIsCroppingMode(false)
              }}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-[10px] sm:text-xs font-semibold tracking-wide transition cursor-pointer ${
                activeTab === 'compress'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              Compress
            </button>
            <button
              onClick={() => {
                setActiveTab('crop')
                setIsCroppingMode(true)
              }}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-[10px] sm:text-xs font-semibold tracking-wide transition cursor-pointer ${
                activeTab === 'crop'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Crop className="w-4 h-4" />
              Crop
            </button>
            <button
              onClick={() => {
                setActiveTab('enhance')
                setIsCroppingMode(false)
              }}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-[10px] sm:text-xs font-semibold tracking-wide transition cursor-pointer ${
                activeTab === 'enhance'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Enhance
            </button>
            <button
              onClick={() => {
                setActiveTab('frame')
                setIsCroppingMode(false)
              }}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-[10px] sm:text-xs font-semibold tracking-wide transition cursor-pointer ${
                activeTab === 'frame'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FrameIcon className="w-4 h-4" />
              Frame
            </button>
          </div>

          <div className="flex-1 glass-panel rounded-2xl border border-slate-800/80 p-5 shadow-xl flex flex-col justify-between">
            
            {!imageSrc ? (
              <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                <ImageIcon className="w-8 h-8 text-slate-700 mb-3" />
                <h4 className="text-sm font-bold text-slate-400">Settings Locked</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                  Please upload an image first to activate editor tools.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* TAB 1: RESIZE (Only resizing dimensions) */}
                {activeTab === 'resize' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider mb-2.5">Dimensions Preset</h3>
                      <div className="grid grid-cols-1 gap-2">
                        <select
                          id="preset-select"
                          value={sizePreset}
                          onChange={(e) => handlePresetChange(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                        >
                          {SIZE_PRESETS.map((preset) => (
                            <option key={preset.value} value={preset.value}>
                              {preset.label} {preset.w ? `(${preset.w}×${preset.h}px)` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="border-t border-slate-900 pt-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider m-0">Custom Output Size</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Width (px)</label>
                          <input
                            type="number"
                            id="resize-width"
                            value={targetWidth}
                            onChange={(e) => handleWidthChange(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-purple-500 transition"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Height (px)</label>
                          <input
                            type="number"
                            id="resize-height"
                            value={targetHeight}
                            onChange={(e) => handleHeightChange(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-purple-500 transition"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-900 pt-4">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-slate-400 font-medium">Quick Scaling (Dimension Scale)</span>
                        <span className="text-purple-400 font-mono font-bold">{scalePercentage}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        value={scalePercentage}
                        onChange={(e) => handleScalePercentChange(parseInt(e.target.value))}
                        className="w-full accent-purple-500 bg-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-650 font-semibold mt-1">
                        <span>10%</span>
                        <span>100%</span>
                        <span>200%</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-900 pt-4">
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Fit/Scaling Behavior</h3>
                      <div className="grid grid-cols-3 gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
                        {['fit', 'fill', 'stretch'].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setResizeMode(mode)}
                            className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                              resizeMode === mode
                                ? 'bg-slate-800 text-purple-400 border border-purple-500/20'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: COMPRESS (Export Formats & Compression level where high slider = small file) */}
                {activeTab === 'compress' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2.5">Export Format</h3>
                      <div className="grid grid-cols-2 gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 mb-3">
                        {[
                          { label: 'JPEG (Standard)', value: 'image/jpeg' },
                          { label: 'WEBP (Modern)', value: 'image/webp' }
                        ].map((fmt) => (
                          <button
                            key={fmt.value}
                            onClick={() => setExportFormat(fmt.value)}
                            className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              exportFormat === fmt.value
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {fmt.label.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-slate-900 pt-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-medium">Compression Level</span>
                        <span className="text-purple-400 font-mono font-bold">{compressionLevel}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="95"
                        value={compressionLevel}
                        onChange={(e) => setCompressionLevel(parseInt(e.target.value))}
                        className="w-full accent-purple-500 bg-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-600 font-semibold mt-1">
                        <span>Min (Large File, 100% Quality)</span>
                        <span>Max (Tiny File, 5% Quality)</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal mt-1.5">
                        * **Increasing** the compression slider value reduces image quality to **lower the final file size** (in KB/MB) while maintaining identical dimensions.
                      </p>
                    </div>

                    <div className="border-t border-slate-900 pt-4">
                      <div className="flex justify-between text-xs items-center bg-slate-950/60 p-3.5 rounded-xl border border-slate-900">
                        <div>
                          <span className="text-slate-500 font-semibold block leading-none">Estimated File Size:</span>
                          <span className="text-[10px] text-slate-650 font-medium mt-1 block leading-none">
                            {targetWidth} × {targetHeight} px ({exportFormat.split('/')[1].toUpperCase()})
                          </span>
                        </div>
                        <span className="text-purple-400 font-mono font-bold text-sm">
                          {estimatedSize ? formatSize(estimatedSize) : 'Estimating...'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: CROP SETTINGS */}
                {activeTab === 'crop' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Crop Ratio Lock</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {['free', '1:1', '16:9', '4:3', '9:16', '3:2', '2:3'].map((ratio) => (
                          <button
                            key={ratio}
                            onClick={() => applyCropRatio(ratio)}
                            className={`py-2 px-1 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                              cropRatio === ratio
                                ? 'bg-purple-600/10 text-purple-400 border-purple-500/40 shadow-sm shadow-purple-500/5'
                                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            {ratio === 'free' ? 'Free Form' : ratio}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-900 pt-4 p-3 bg-purple-500/5 rounded-xl border border-purple-500/10">
                      <div className="flex gap-2.5 items-start">
                        <Crop className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-purple-300 mb-1">Cropping Workspace Active</h4>
                          <p className="text-[11px] text-slate-400 leading-normal">
                            Use the circular drag handles surrounding the image box in the main preview pane to resize or position your crop zone.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCropBox({ x: 0, y: 0, width: 100, height: 100 })
                          setCropRatio('free')
                        }}
                        className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 rounded-xl border border-slate-800 transition cursor-pointer"
                      >
                        Reset Bounding Box
                      </button>
                      <button
                        onClick={() => setIsCroppingMode(false)}
                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white rounded-xl transition cursor-pointer"
                      >
                        Finalize Crop
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 4: FILTERS, ENHANCEMENTS & AUTO ENHANCE */}
                {activeTab === 'enhance' && (
                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                    
                    {/* Auto Enhance Header & Button */}
                    <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/10 shadow-inner">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wand2 className="w-4.5 h-4.5 text-purple-400" />
                          <h4 className="text-xs font-bold text-purple-350">Quick Auto-Enhance</h4>
                        </div>
                        <span className="text-[9px] bg-purple-500/20 text-purple-350 font-bold px-1.5 py-0.5 rounded-md uppercase">Smart filters</span>
                      </div>
                      <button
                        onClick={toggleAutoEnhance}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                          isAutoEnhanced
                            ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-purple-500/30'
                        }`}
                      >
                        <Sparkles className={`w-4 h-4 ${isAutoEnhanced ? 'animate-spin' : ''}`} />
                        {isAutoEnhanced ? 'Auto Enhance Enabled' : 'Auto Enhance Photo'}
                      </button>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-900 pt-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider m-0">Manual Adjustments</h3>
                      <button
                        onClick={resetFilters}
                        className="text-[10px] text-purple-400 hover:text-purple-300 font-bold uppercase transition cursor-pointer"
                      >
                        Reset All
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-purple-400" />
                        <div>
                          <h4 className="text-xs font-semibold text-slate-200">Sharpen Details</h4>
                          <p className="text-[10px] text-slate-500">Apply a 3x3 convolution sharpen matrix</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={filters.sharpen}
                        onChange={(e) => setFilters(prev => ({ ...prev, sharpen: e.target.checked }))}
                        className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                      />
                    </div>

                    {[
                      { key: 'brightness', label: 'Brightness', min: -100, max: 100, unit: '%' },
                      { key: 'contrast', label: 'Contrast', min: -100, max: 100, unit: '%' },
                      { key: 'saturation', label: 'Saturation', min: -100, max: 100, unit: '%' },
                      { key: 'exposure', label: 'Exposure', min: -100, max: 100, unit: '%' },
                      { key: 'blur', label: 'Blur', min: 0, max: 20, unit: 'px' },
                      { key: 'grayscale', label: 'Grayscale', min: 0, max: 100, unit: '%' },
                      { key: 'sepia', label: 'Sepia', min: 0, max: 100, unit: '%' },
                      { key: 'invert', label: 'Invert Color', min: 0, max: 100, unit: '%' },
                      { key: 'hueRotate', label: 'Hue Rotate', min: 0, max: 360, unit: '°' }
                    ].map((slider) => (
                      <div key={slider.key} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <label className="text-slate-400 font-semibold">{slider.label}</label>
                          <div className="flex items-center gap-1.5 font-mono text-purple-400 font-bold">
                            <span>{filters[slider.key] > 0 && slider.min < 0 ? `+${filters[slider.key]}` : filters[slider.key]}{slider.unit}</span>
                            {filters[slider.key] !== 0 && (
                              <button
                                onClick={() => setFilters(prev => ({ ...prev, [slider.key]: 0 }))}
                                className="text-[9px] text-slate-505 hover:text-slate-300 font-sans font-bold uppercase transition cursor-pointer"
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
                          className="w-full accent-purple-500 bg-slate-850 rounded-lg appearance-none h-1 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 5: FRAMING & BORDERS */}
                {activeTab === 'frame' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Frame/Border Preset</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'none', label: 'No Frame' },
                          { key: 'standard', label: 'Modern Border' },
                          { key: 'polaroid', label: 'Retro Polaroid' },
                          { key: 'wooden', label: 'Wood Gallery' },
                          { key: 'neon', label: 'Neon Cyberpunk' }
                        ].map((frame) => (
                          <button
                            key={frame.key}
                            onClick={() => setFrameType(frame.key)}
                            className={`py-2 px-2.5 rounded-xl text-xs font-semibold border text-center transition cursor-pointer ${
                              frameType === frame.key
                                ? 'bg-purple-600/10 text-purple-400 border-purple-500/40 shadow-sm'
                                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            {frame.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {frameType !== 'none' && (
                      <div className="border-t border-slate-900 pt-4 space-y-4">
                        
                        {frameType === 'polaroid' && (
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Polaroid Bottom Caption</label>
                            <input
                              type="text"
                              value={polaroidText}
                              maxLength={40}
                              onChange={(e) => setPolaroidText(e.target.value)}
                              placeholder="Write a custom caption..."
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition"
                            />
                            <span className="text-[9px] text-slate-505 mt-1 block">Character limit: 40. Caveat signature handwriting is loaded automatically.</span>
                          </div>
                        )}

                        {frameType !== 'polaroid' && (
                          <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400 font-medium">Border Width</span>
                              <span className="text-purple-400 font-mono font-bold">{frameWidth}px</span>
                            </div>
                            <input
                              type="range"
                              min="2"
                              max="100"
                              value={frameWidth}
                              onChange={(e) => setFrameWidth(parseInt(e.target.value))}
                              className="w-full accent-purple-500 bg-slate-800 rounded-lg appearance-none h-1 cursor-pointer"
                            />
                          </div>
                        )}

                        {(frameType === 'standard' || frameType === 'neon') && (
                          <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400 font-medium">Corner Smoothness</span>
                              <span className="text-purple-400 font-mono font-bold">{frameRadius}px</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="50"
                              value={frameRadius}
                              onChange={(e) => setFrameRadius(parseInt(e.target.value))}
                              className="w-full accent-purple-500 bg-slate-800 rounded-lg appearance-none h-1 cursor-pointer"
                            />
                          </div>
                        )}

                        {frameType === 'neon' && (
                          <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400 font-medium">Neon Glow Size</span>
                              <span className="text-purple-400 font-mono font-bold">{neonGlowSize}px</span>
                            </div>
                            <input
                              type="range"
                              min="5"
                              max="50"
                              value={neonGlowSize}
                              onChange={(e) => setNeonGlowSize(parseInt(e.target.value))}
                              className="w-full accent-purple-500 bg-slate-800 rounded-lg appearance-none h-1 cursor-pointer"
                            />
                          </div>
                        )}

                        {(frameType === 'standard' || frameType === 'neon') && (
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase block mb-2">Border Color</label>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              {FRAME_COLORS.map((col, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setFrameColor(col.value)}
                                  className={`w-6 h-6 rounded-full ${col.bg} border transition-all cursor-pointer ${
                                    frameColor === col.value
                                      ? 'border-purple-400 scale-110 ring-2 ring-purple-600/30'
                                      : 'border-slate-800 hover:scale-105'
                                  }`}
                                  title={col.name}
                                ></button>
                              ))}
                              
                              <div className="relative w-6 h-6 rounded-full border border-slate-800 overflow-hidden cursor-pointer bg-slate-900 flex items-center justify-center hover:scale-105 transition-all">
                                <input
                                  type="color"
                                  value={frameColor}
                                  onChange={(e) => setFrameColor(e.target.value)}
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                                />
                                <span className="text-slate-400 text-[10px] font-bold">+</span>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

            {/* Bottom Download Panel */}
            {imageSrc && (
              <div className="border-t border-slate-900 mt-6 pt-5 space-y-4">
                <button
                  onClick={handleDownload}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3.5 rounded-xl text-sm font-bold text-white shadow-xl shadow-purple-500/10 hover:shadow-purple-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Processed Photo
                </button>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Features Section */}
      <section className="max-w-[1600px] mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent m-0">
            Why Choose PicFlex Studio
          </h2>
          <p className="text-slate-400 mt-4 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Professional image processing trusted by millions since 2012. All processing happens in your browser.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => (
            <article
              key={idx}
              className="p-6 md:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/30 hover:bg-slate-900 transition-all duration-300"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-purple-500/10 text-purple-400 mx-auto mb-4">
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

      {/* How to Use Section */}
      <section className="max-w-[1600px] mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent m-0">
            How to Use PicFlex Studio
          </h2>
          <p className="text-slate-400 mt-4 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Process images in 3 simple steps — no uploads to servers, everything runs locally in your browser.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Upload Your Image',
              description: 'Drag and drop any JPEG, PNG, or WebP image onto the upload area. Or click to browse files. You can also try our sample images to test the tool instantly.',
              icon: Upload
            },
            {
              step: '02',
              title: 'Edit & Compress',
              description: 'Use the sidebar tabs to resize, crop, enhance, add frames, or compress. All changes preview in real-time. Adjust compression level to balance quality and file size.',
              icon: Sliders
            },
            {
              step: '03',
              title: 'Download Result',
              description: 'Click the Download button to save your processed image. Choose JPEG or WebP format. Your original file is never uploaded — everything stays private on your device.',
              icon: Download
            }
          ].map((step, idx) => (
            <article
              key={idx}
              className="relative p-6 md:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/30 hover:bg-slate-900 transition-all duration-300"
            >
              <div className="absolute -top-3 left-6 w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold text-sm border border-purple-500/30">
                {step.step}
              </div>
              <div className="pt-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-purple-500/10 text-purple-400 mx-auto mb-4">
                  <step.icon className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-slate-100 text-center mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed text-center">
                  {step.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Styled Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 mt-12">
        <div className="flex items-center gap-2">
          <span>© 2026 PicFlex Studio. Crafted with React & Tailwind CSS.</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Made for developers and creatives. Private processing.</span>
          <Heart className="w-3.5 h-3.5 text-purple-600 fill-purple-600 animate-pulse" />
        </div>
      </footer>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/image" element={<ImageEditorAppShell />} />
      <Route path="/video" element={<Video />} />

      <Route path="/contact" element={<Contact />} />
      <Route path="/how-to-use" element={<Home />} />
      <Route path="/why-use" element={<Home />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}



export function VideoEditorAppShell() {

  const [videoSrc, setVideoSrc] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  
  const handleFileChange = (e) => {
    const file = e.target?.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setVideoSrc(objectUrl);
    }
  };
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="px-6 pt-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent mb-6">
          Video Editor
        </h1>
        <p className="text-slate-400 mb-4">
          Upload a video file to preview and edit
        </p>
        
        <div className="mb-6">
          <input 
            type="file" 
            accept="video/*" 
            onClick={(e) => e.target.value = ""} 
            onChange={handleFileChange} 
            className="mb-4"
          />
          {videoSrc ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">
                  {videoSrc.startsWith('blob:') ? 'Video loaded' : 'Invalid video'}
                </span>
                <button 
                  onClick={togglePlay}
                  className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-500 disabled:opacity-50"
                  disabled={!videoSrc}
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
              </div>
              <div className="relative h-4 bg-slate-200 rounded-full">
                <div 
                  className="absolute left-0 top-0 h-4 w-0 bg-purple-600 rounded-full"
                  style={{ width: isPlaying ? '100%' : '0%' }}
                ></div>
              </div>
              <video 
                ref={videoRef}
                src={videoSrc} 
                controls 
                className="w-full max-w-4xl mt-4"
                style={{ maxHeight: '60vh' }}
              />
            </div>
          ) : (
            <p className="text-slate-500">No video selected</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <Navbar show={true} />
      <AppRoutes />
    </div>
  );
}

