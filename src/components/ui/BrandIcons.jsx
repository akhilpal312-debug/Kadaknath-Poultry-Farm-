export function Facebook({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  )
}

export function Instagram({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5.2" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function Youtube({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M23.1 7.2a2.9 2.9 0 0 0-2-2C19.3 4.7 12 4.7 12 4.7s-7.3 0-9.1.5a2.9 2.9 0 0 0-2 2A30 30 0 0 0 .5 12a30 30 0 0 0 .4 4.8 2.9 2.9 0 0 0 2 2c1.8.5 9.1.5 9.1.5s7.3 0 9.1-.5a2.9 2.9 0 0 0 2-2 30 30 0 0 0 .4-4.8 30 30 0 0 0-.4-4.8ZM9.7 15.4V8.6l6.1 3.4-6.1 3.4Z" />
    </svg>
  )
}
