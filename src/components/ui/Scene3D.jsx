import { useCallback, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { farmScene } from '../../data/site'

const ease = [0.22, 1, 0.36, 1]
const spring = { stiffness: 120, damping: 18, mass: 0.5 }

const widths = {
  hero: 'max-w-[600px]',
  framed: 'max-w-[540px]',
  band: 'max-w-[560px]',
}

const artAlt =
  'Kadaknath Poultry Farm signboard with a black Kadaknath rooster, hen and chicks on a mossy rock, a basket of eggs and the farm shed at sunrise'

// Pointer tilt, and the extra range a finger may drag beyond it.
const MAX_YAW = 24
const MAX_PITCH = 15
const DRAG_YAW_PER_PX = 0.28
const DRAG_PITCH_PER_PX = 0.2
const DRAG_YAW_LIMIT = 32
const DRAG_PITCH_LIMIT = 22

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

/**
 * The farm artwork on a 3D stage: the scene stands inside a perspective field and
 * turns towards the pointer, or follows a finger dragged across it on touch
 * screens, then springs back to flat. A ground shadow slides the other way, so it
 * reads as an object in front of the page rather than a photo in a frame.
 */
export default function Scene3D({
  variant = 'hero',
  className = '',
  src = farmScene,
  alt = artAlt,
  priority = false,
  fallback = null,
}) {
  const reduce = useReducedMotion()
  const stage = useRef(null)
  const drag = useRef(null)
  const [hidden, setHidden] = useState(false)
  const [dragging, setDragging] = useState(false)

  const yaw = useMotionValue(0)
  const pitch = useMotionValue(0)
  const rotateY = useSpring(yaw, spring)
  const rotateX = useSpring(pitch, spring)
  const shadowX = useTransform(rotateY, [-DRAG_YAW_LIMIT, DRAG_YAW_LIMIT], [-24, 24])
  const shadowScale = useTransform(rotateX, [-DRAG_PITCH_LIMIT, DRAG_PITCH_LIMIT], [1.07, 0.9])

  const reset = useCallback(() => {
    yaw.set(0)
    pitch.set(0)
  }, [yaw, pitch])

  const handlePointerDown = useCallback(
    (event) => {
      if (reduce || event.pointerType === 'mouse') return
      drag.current = { x: event.clientX, y: event.clientY, yaw: yaw.get(), pitch: pitch.get() }
      stage.current?.setPointerCapture?.(event.pointerId)
      setDragging(true)
    },
    [reduce, yaw, pitch],
  )

  const handlePointerMove = useCallback(
    (event) => {
      if (reduce) return

      const active = drag.current
      if (active) {
        const dx = event.clientX - active.x
        const dy = event.clientY - active.y
        yaw.set(clamp(active.yaw + dx * DRAG_YAW_PER_PX, -DRAG_YAW_LIMIT, DRAG_YAW_LIMIT))
        pitch.set(clamp(active.pitch + dy * DRAG_PITCH_PER_PX, -DRAG_PITCH_LIMIT, DRAG_PITCH_LIMIT))
        return
      }

      if (event.pointerType !== 'mouse') return
      const rect = stage.current?.getBoundingClientRect()
      if (!rect) return
      yaw.set((0.5 - (event.clientX - rect.left) / rect.width) * 2 * MAX_YAW)
      pitch.set(((event.clientY - rect.top) / rect.height - 0.5) * 2 * MAX_PITCH)
    },
    [reduce, yaw, pitch],
  )

  const endDrag = useCallback(() => {
    if (!drag.current) return
    drag.current = null
    setDragging(false)
    reset()
  }, [reset])

  const handlePointerLeave = useCallback(() => {
    if (!drag.current) reset()
  }, [reset])

  return (
    <motion.div
      ref={stage}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={handlePointerLeave}
      className={`scene-3d ${widths[variant] ?? widths.hero} ${className}`}
      initial={reduce ? false : { opacity: 0, y: 30, scale: 0.97 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.1, ease }}
    >
      {!hidden && (
        <>
          <span className="scene-3d__aura" aria-hidden="true" />
          <span className="scene-3d__halo" aria-hidden="true" />
        </>
      )}
      <motion.div
        className={`scene-3d__stage ${dragging ? 'is-dragging' : ''}`}
        style={{ rotateX, rotateY }}
      >
        {hidden ? (
          fallback
        ) : (
          <>
            <motion.span className="scene-3d__shadow" style={{ x: shadowX, scaleX: shadowScale }} aria-hidden="true" />
            <img
              src={src}
              alt={alt}
              width="1536"
              height="864"
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding="async"
              draggable="false"
              onError={() => setHidden(true)}
              className={`scene-3d__art ${reduce ? '' : 'scene-float'}`}
            />
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
