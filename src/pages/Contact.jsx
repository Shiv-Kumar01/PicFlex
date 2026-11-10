import { useState, useRef } from 'react'
import emailjs from '@emailjs/browser'
import {
  Mail,
  Bug,
  Briefcase,
  Lightbulb,
  MessageCircle,
  Heart,
  Send,
  CheckCircle2,
  Loader2
} from 'lucide-react'

const CONTACT_REASONS = [
  { id: 'bug', label: 'Report a Bug', icon: Bug, description: 'Something isn\'t working right' },
  { id: 'business', label: 'Business Inquiry', icon: Briefcase, description: 'Partnerships, advertising, or sponsorship' },
  { id: 'feature', label: 'Feature Request', icon: Lightbulb, description: 'Suggest a new feature or improvement' },
  { id: 'feedback', label: 'Feedback', icon: Heart, description: 'Share your experience or ideas' },
  { id: 'general', label: 'General Inquiry', icon: MessageCircle, description: 'Anything else on your mind' }
]

const RECEIVER_EMAIL = 'invincible010206@gmail.com'

export default function Contact() {
  const [selectedReason, setSelectedReason] = useState(null)
  const [senderEmail, setSenderEmail] = useState('')
  const [senderName, setSenderName] = useState('')
  const [description, setDescription] = useState('')
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})
  const formRef = useRef(null)

  const validate = () => {
    const newErrors = {}
    if (!selectedReason) newErrors.reason = 'Please select a reason'
    if (!senderName.trim()) newErrors.name = 'Name is required'
    if (!senderEmail.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) newErrors.email = 'Enter a valid email'
    if (!description.trim()) newErrors.description = 'Please describe your message'
    else if (description.trim().length < 10) newErrors.description = 'Description must be at least 10 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const reason = CONTACT_REASONS.find(r => r.id === selectedReason)

    setSending(true)
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: senderName.trim(),
          from_email: senderEmail.trim(),
          reason: reason.label,
          message: description.trim(),
          to_email: RECEIVER_EMAIL
        },
        { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY }
      )
      setSubmitted(true)
    } catch (err) {
      console.error('EmailJS error:', err)
      setErrors({ submit: 'Failed to send message. Please try again or email us directly.' })
    } finally {
      setSending(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 px-6 pt-16">
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent mb-4">
            Message Sent!
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md mb-8">
            Thanks for reaching out. We&apos;ve received your message and will get back to you at <span className="text-slate-300 font-medium">{senderEmail}</span> soon.
          </p>
          <button
            onClick={() => {
              setSubmitted(false)
              setSelectedReason(null)
              setSenderEmail('')
              setSenderName('')
              setDescription('')
              setErrors({})
            }}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-bold text-slate-200 transition cursor-pointer"
          >
            Send Another Message
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 pt-16">
      <div className="max-w-2xl mx-auto pb-16">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-semibold mb-6">
            <Mail className="w-4 h-4" aria-hidden="true" />
            Contact Us
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent mb-4">
            Get in Touch
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Have a question, idea, or issue? Pick a category below and send us a message.
            We read every submission.
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-8">
          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              What can we help with?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CONTACT_REASONS.map((reason) => {
                const Icon = reason.icon
                const isSelected = selectedReason === reason.id
                return (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => setSelectedReason(reason.id)}
                    className={`group relative flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600/10 border-purple-500/40 shadow-[0_0_20px_-4px_rgba(168,85,247,0.15)]'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                    }`}>
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-sm font-bold transition-colors ${
                        isSelected ? 'text-purple-300' : 'text-slate-200'
                      }`}>
                        {reason.label}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {reason.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-purple-400" />
                    )}
                  </button>
                )
              })}
            </div>
            {errors.reason && (
              <p className="text-red-400 text-xs mt-2 font-medium">{errors.reason}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-300 mb-2">
              Your Name
            </label>
            <input
              id="contact-name"
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="John Doe"
              className={`w-full px-4 py-3 rounded-xl bg-slate-900/60 border text-slate-100 text-sm placeholder:text-slate-600 outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-500/30 ${
                errors.name
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-slate-800 focus:border-purple-500/50'
              }`}
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-300 mb-2">
              Your Email
            </label>
            <input
              id="contact-email"
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="you@example.com"
              className={`w-full px-4 py-3 rounded-xl bg-slate-900/60 border text-slate-100 text-sm placeholder:text-slate-600 outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-500/30 ${
                errors.email
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-slate-800 focus:border-purple-500/50'
              }`}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="contact-description" className="block text-sm font-semibold text-slate-300 mb-2">
              Your Message
            </label>
            <textarea
              id="contact-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Tell us more about your issue, idea, or question..."
              className={`w-full px-4 py-3 rounded-xl bg-slate-900/60 border text-slate-100 text-sm placeholder:text-slate-600 outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-500/30 resize-none ${
                errors.description
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-slate-800 focus:border-purple-500/50'
              }`}
            />
            <div className="flex items-center justify-between mt-1.5">
              {errors.description ? (
                <p className="text-red-400 text-xs font-medium">{errors.description}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-slate-600">{description.length} / 2000</span>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
              {errors.submit}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={sending}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-500/15 hover:shadow-purple-500/25 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" aria-hidden="true" />
                Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
