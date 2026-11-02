import { useEffect } from 'react'

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useRevealOnScroll() {
  useEffect(() => {
    document.documentElement.classList.add('motion-ready')
    let pending = [...document.querySelectorAll('[data-reveal]:not(.is-visible)')]
    let frame = 0
    const revealReached = () => {
      frame = 0
      const threshold = window.innerHeight * 0.9
      pending = pending.filter((block) => {
        if (block.getBoundingClientRect().top < threshold) {
          block.classList.add('is-visible')
          return false
        }
        return true
      })
    }
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(revealReached)
      }
    }
    revealReached()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  })
}

export function useScrollProgress(wrapperRef, travel) {
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper || prefersReducedMotion()) {
      return undefined
    }
    let frame = 0
    const update = () => {
      frame = 0
      const viewportHeight = window.innerHeight
      const scrolled = -wrapper.getBoundingClientRect().top
      const length = travel ? travel * viewportHeight : wrapper.offsetHeight - viewportHeight
      const progress = Math.min(1, Math.max(0, scrolled / Math.max(1, length)))
      wrapper.style.setProperty('--p', progress.toFixed(4))
      wrapper.toggleAttribute('data-complete', progress >= 1)
    }
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(update)
      }
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [wrapperRef, travel])
}
