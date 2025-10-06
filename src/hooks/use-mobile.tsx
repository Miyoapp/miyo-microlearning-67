import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) {
      setIsMobile(false)
      return
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Initial set
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // Safari compatibility: addEventListener('change') is not supported on older versions
    try {
      if (typeof mql.addEventListener === "function") {
        mql.addEventListener("change", onChange)
        return () => mql.removeEventListener("change", onChange)
      } else if (typeof mql.addListener === "function") {
        mql.addListener(onChange)
        return () => mql.removeListener(onChange)
      }
    } catch {}

    // Fallback to window resize
    window.addEventListener("resize", onChange)
    return () => window.removeEventListener("resize", onChange)
  }, [])

  return !!isMobile
}
