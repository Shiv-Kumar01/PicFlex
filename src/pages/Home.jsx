import { Link } from 'react-router-dom'
import {
  ImageIcon,
  VideoIcon,
  ShieldCheck,
  BarChart3,
  Zap,
  Lock,
  Gem,
  Upload,
  Sliders,
  Download,
  Sparkles,
  ArrowRight,
  Star
} from 'lucide-react'

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
    icon: Lock,
    title: 'Privacy Guaranteed',
    description: 'All processing happens in your browser. Your images are never uploaded to any server—everything stays private on your device.'

  },
  {
    icon: Gem,
    title: "It's Free",
    description: 'Since 2012 we have compressed millions of images for free! There is no software to install, registrations, or watermarks.'
  },
  {
    icon: ImageIcon,
    title: 'Image Formats',
    description: 'Export optimized JPEG and WebP files with quality controls—right in your browser.'

  }
]

const STEPS = [
  {
    step: '01',
    title: 'Upload Your File',
    description: 'Drag and drop any JPEG, PNG, or WebP image — or a video file. Or click to browse files. You can also try our sample images to test instantly.',
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
    description: 'Click the Download button to save your processed file. Choose JPEG or WebP format. Your original file is never uploaded — everything stays private on your device.',
    icon: Download
  }
]

function Home() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" aria-hidden="true" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-semibold mb-8">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            100% Free — No Sign-up Required
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-tight mb-6">
            What Would You Like
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              To Edit & Compress?
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Choose your media type below. Our powerful browser-based tools process everything locally — fast, private, and free.
          </p>

          {/* Image / Video Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link
              to="/image"
              className="group relative p-8 md:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_60px_-12px_rgba(168,85,247,0.3)] hover:-translate-y-1 text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                  <ImageIcon className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-3">
                  Edit & Compress Image
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Resize, crop, enhance, add frames, and compress JPEG, PNG, WebP images with precision controls.
                </p>
                <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                  Get Started
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
            </Link>

            <Link
              to="/video"
              className="group relative p-8 md:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-[0_0_60px_-12px_rgba(99,102,241,0.3)] hover:-translate-y-1 text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                  <VideoIcon className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-3">
                  Edit & Compress Video
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Trim, compress, and apply filters to MP4, WebM, MOV videos — right in your browser.
                </p>
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">Beta</span>
                  Try Video Editor
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Use Section */}
      <section id="why-use" className="max-w-[1600px] mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-semibold mb-6">
            <Star className="w-4 h-4" aria-hidden="true" />
            Trusted by Millions
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent m-0">
            Why Choose PicFlex Studio
          </h2>
          <p className="text-slate-400 mt-4 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Professional media processing trusted by millions since 2012. All processing happens in your browser.
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
      <section id="how-to-use" className="max-w-[1600px] mx-auto px-6 py-16 md:py-24 border-t border-slate-800/50">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-semibold mb-6">
            <Zap className="w-4 h-4" aria-hidden="true" />
            Quick & Simple
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent m-0">
            How to Use PicFlex Studio
          </h2>
          <p className="text-slate-400 mt-4 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Process media in 3 simple steps — no uploads to servers, everything runs locally in your browser.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step, idx) => (
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

      {/* CTA Section */}
      <section className="max-w-[1600px] mx-auto px-6 py-16 md:py-24 border-t border-slate-800/50">
        <div className="relative text-center p-12 md:p-16 rounded-3xl bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/20 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 pointer-events-none" aria-hidden="true" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
              Choose your media type and start processing instantly. No sign-up, no watermarks, completely free.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/image"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-500/20 hover:shadow-purple-500/30 active:scale-[0.98] transition-all duration-200"
              >
                <ImageIcon className="w-5 h-5" aria-hidden="true" />
                Edit Image
              </Link>
              <Link
                to="/video"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all duration-200"
              >
                <VideoIcon className="w-5 h-5" aria-hidden="true" />
                Edit Video
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home