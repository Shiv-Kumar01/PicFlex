import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Sparkles, Mail, Home, Menu, X, Image as ImageIcon, Video } from 'lucide-react'

function scrollToId(sectionId) {
  const el = document.getElementById(sectionId)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/image', label: 'Image Editor', icon: ImageIcon },
  { path: '/video', label: 'Video Editor', icon: Video },
  { path: '/contact', label: 'Contact Us', icon: Mail }
]

export function Navbar({ show = true }) {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)


  // Mark Home, How to Use, Why Use as active when you're on the Home route
  const currentPath = location.pathname


  const isActiveForItem = (item) => {
    if (item.path === '/') return currentPath === '/'
    return currentPath === item.path
  }


  const handleNavClick = (e, item) => {
    // For Home-page anchors (How to Use / Why Use), keep route as '/' and scroll.
    if (item.path === '/' && item.scrollToId) {
      e.preventDefault()
      scrollToId(item.scrollToId)
      setIsMobileMenuOpen(false)
      return
    }

    setIsMobileMenuOpen(false)
  }

  if (!show) return null

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">

      <nav className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-3" aria-label="PicFlex Studio Home">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            PicFlex Studio
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900/60 border border-slate-800/50 rounded-xl p-1">
          {navItems.map((item) => {
            const isActive = isActiveForItem(item)

            const Icon = item.icon
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={(e) => handleNavClick(e, item)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {item.label}
                {item.label === 'Video Editor' && (
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold uppercase tracking-wider">Beta</span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/50 bg-slate-950/95 backdrop-blur-xl">
          <div className="px-6 py-4 flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = isActiveForItem(item)

              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  {item.label}
                  {item.label === 'Video Editor' && (
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold uppercase tracking-wider">Beta</span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}
