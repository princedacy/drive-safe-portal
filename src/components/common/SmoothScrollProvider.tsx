
import { ReactLenis, useLenis } from '@studio-freight/lenis/react'
import { ReactNode } from 'react'

interface SmoothScrollProviderProps {
  children: ReactNode
}

const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
  return (
    <ReactLenis 
      root 
      options={{
        lerp: 0.1,
        duration: 1.2,
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      }}
    >
      {children}
    </ReactLenis>
  )
}

export default SmoothScrollProvider
