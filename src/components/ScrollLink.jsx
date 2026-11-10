import { Link, useLocation } from 'react-router-dom'

/**
 * ScrollLink
 * - Works like a normal Link, but also scrolls to a section id when you land on the same route.
 * - If you navigate from another route, it will scroll after the route change.
 */
export default function ScrollLink({ to, sectionId, className, children, ...rest }) {
  const location = useLocation()
  const isSamePath = location.pathname === to

  return (
    <Link
      to={to}
      className={className}
      onClick={(e) => {
        // Keep default navigation behavior for Link.
        // Scroll after navigation (next tick) so the element exists.
        // If already on the same page, scroll immediately.
        const doScroll = () => {
          const el = document.getElementById(sectionId)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }

        if (isSamePath) {
          doScroll()
        } else {
          window.setTimeout(doScroll, 50)
        }

        if (rest?.onClick) rest.onClick(e)
      }}
      {...rest}
    >
      {children}
    </Link>
  )
}

