import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Loader2, Quote, Star, Trash2 } from 'lucide-react'
import { Reveal, SectionHeading, Stagger, StaggerItem } from './ui/Primitives'
import Scene3D from './ui/Scene3D'
import WhatsAppIcon from './ui/WhatsAppIcon'
import { whatsappLink } from '../lib/links'
import {
  createLocalReview,
  fetchPublishedReviews,
  loadLocalReviews,
  publishReview,
  reviewCategories,
  reviewLimits,
  saveLocalReviews,
} from '../lib/reviews'

const ease = [0.22, 1, 0.36, 1]
const dateFormat = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

const emptyForm = {
  authorName: '',
  location: '',
  purchaseCategory: '',
  rating: 0,
  comment: '',
}

function formatDate(date) {
  return date ? dateFormat.format(date) : ''
}

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function reviewMessage(values) {
  return [
    `Hello Kadaknath Poultry Farm, please publish this review on the website:`,
    '',
    `Name: ${values.authorName.trim()}`,
    `Location: ${values.location.trim()}`,
    `Rating: ${values.rating}/5`,
    `About: ${values.purchaseCategory}`,
    '',
    `"${values.comment.trim()}"`,
  ].join('\n')
}

function Stars({ value, size = 'h-3.5 w-3.5' }) {
  return (
    <span className="flex shrink-0 items-center gap-0.5 text-gold">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`${size} ${index < value ? 'text-gold' : 'text-ink/20'}`}
          fill={index < value ? 'currentColor' : 'none'}
          strokeWidth={1.5}
        />
      ))}
    </span>
  )
}

function validate(values) {
  const errors = {}
  const name = values.authorName.trim()
  const location = values.location.trim()
  const comment = values.comment.trim()

  if (name.length < reviewLimits.authorName.min || name.length > reviewLimits.authorName.max) {
    errors.authorName = 'Please add your name (2–60 characters).'
  }
  if (location.length < reviewLimits.location.min || location.length > reviewLimits.location.max) {
    errors.location = 'Please add your village, town or city.'
  }
  if (!reviewCategories.includes(values.purchaseCategory)) {
    errors.purchaseCategory = 'Please choose what you bought or visited for.'
  }
  if (!(values.rating >= 1 && values.rating <= 5)) {
    errors.rating = 'Please choose a star rating.'
  }
  if (comment.length < reviewLimits.comment.min) {
    errors.comment = 'Please write at least 10 characters.'
  } else if (comment.length > reviewLimits.comment.max) {
    errors.comment = 'Please keep your review under 500 characters.'
  }

  return errors
}

export default function Reviews() {
  const reduce = useReducedMotion()
  const [published, setPublished] = useState([])
  const [deviceReviews, setDeviceReviews] = useState(() => loadLocalReviews())
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [hoverRating, setHoverRating] = useState(0)
  const [status, setStatus] = useState('idle')
  const [submitted, setSubmitted] = useState(null)

  useEffect(() => {
    let active = true
    fetchPublishedReviews()
      .then((rows) => {
        if (active) setPublished(rows)
      })
      .catch((error) => {
        if (active) setLoadError(error instanceof Error ? error.message : 'Reviews could not be loaded right now.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const reviews = [...deviceReviews, ...published].sort(
    (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
  )

  const storeDeviceReviews = (next) => {
    setDeviceReviews(next)
    saveLocalReviews(next)
  }

  const retryLoad = async () => {
    setLoading(true)
    setLoadError('')
    try {
      setPublished(await fetchPublishedReviews())
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Reviews could not be loaded right now.')
    } finally {
      setLoading(false)
    }
  }

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setSubmitted(null)
  }

  const chooseRating = (value) => {
    setForm((current) => ({ ...current, rating: value }))
    setErrors((current) => ({ ...current, rating: undefined }))
    setSubmitted(null)
  }

  const removeDeviceReview = (id) => {
    storeDeviceReviews(deviceReviews.filter((review) => review.id !== id))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const values = { ...form }
    const draft = createLocalReview(values)
    const withDraft = [draft, ...deviceReviews]
    setSubmitted(null)
    setStatus('submitting')
    storeDeviceReviews(withDraft)
    setForm(emptyForm)

    try {
      // The review is published for every visitor as soon as Firestore confirms it.
      const created = await publishReview(values)
      const withoutDraft = withDraft.filter((review) => review.id !== draft.id)
      storeDeviceReviews(withoutDraft)
      setPublished((current) => [created, ...current.filter((review) => review.id !== created.id)])
      setSubmitted({ shared: true })
    } catch {
      setSubmitted({ shared: false, whatsapp: whatsappLink(reviewMessage(values)) })
    } finally {
      setStatus('idle')
    }
  }

  const average = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : 0
  const sending = status === 'submitting'
  const showingSkeletons = loading && !reviews.length

  return (
    <section id="reviews" className="grain relative scroll-mt-24 overflow-hidden bg-parchment py-16 sm:py-20 lg:py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 60% at 50% 0%, rgba(255,253,246,.7), transparent 60%), radial-gradient(70% 60% at 0% 100%, rgba(168,137,86,.18), transparent 65%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1240px] px-5 sm:px-8">
        <SectionHeading
          eyebrow="In their words"
          title="Customer Reviews"
          subtitle="Words from people who have bought birds, chicks or eggs from us and from visitors who stopped by the farm."
        />

        <div className="mt-9 flex justify-center lg:mt-10">
          <Scene3D variant="band" />
        </div>

        <div className="mt-11 grid gap-6 lg:mt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-8">
          {/* ── Reviews ── */}
          <div>
            <Reveal y={22}>
              <div className="card-paper flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[14px] px-5 py-4 sm:px-6">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-[2.1rem] leading-none text-ink">
                    {reviews.length ? average.toFixed(1) : '—'}
                  </span>
                  <span className="text-[0.72rem] text-ink-soft/60">/ 5</span>
                </div>
                <div>
                  <span className="flex items-center gap-2">
                    <Stars value={Math.round(average)} />
                    <span className="text-[0.76rem] text-ink-soft/75">
                      {loading && !reviews.length ? 'Loading reviews…' : `${reviews.length} review${reviews.length === 1 ? '' : 's'}`}
                    </span>
                  </span>
                  <p className="mt-0.5 text-[0.7rem] text-ink-soft/55">From customers of the farm</p>
                </div>
                <span className="ml-auto hidden max-w-[15rem] font-serif text-[0.82rem] italic leading-snug text-ink-soft/65 sm:block">
                  Every review is written by a visitor and appears here straight away.
                </span>
              </div>
            </Reveal>

            {loadError && (
              <div
                className="mt-4 flex flex-wrap items-center gap-3 rounded-[12px] border border-[#9c3b2a]/25 bg-[#9c3b2a]/6 px-4 py-3 text-[0.82rem] text-[#7d2f21]"
                role="status"
              >
                <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                <span className="flex-1">{loadError}</span>
                <button
                  type="button"
                  onClick={retryLoad}
                  className="rounded-full border border-[#9c3b2a]/35 px-3 py-1 text-[0.74rem] font-medium transition-colors hover:bg-[#9c3b2a]/10"
                >
                  Try again
                </button>
              </div>
            )}

            {showingSkeletons ? (
              <div className="mt-4 space-y-4">
                <p className="sr-only">Loading customer reviews…</p>
                {[0, 1, 2].map((placeholder) => (
                  <div
                    key={placeholder}
                    aria-hidden="true"
                    className="card-paper h-40 animate-pulse rounded-[14px] opacity-60"
                  />
                ))}
              </div>
            ) : reviews.length ? (
              <Stagger className="mt-4 space-y-4" gap={0.08}>
                {reviews.map((review) => (
                  <StaggerItem key={`${review.source}-${review.id}`}>
                    <motion.figure
                      whileHover={reduce ? undefined : { y: -5 }}
                      transition={{ duration: 0.4, ease }}
                      className="card-paper relative flex h-full flex-col rounded-[14px] p-6"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Stars value={review.rating} />
                          <span className="sr-only">{review.rating} out of 5 stars</span>
                          {review.source === 'device' && (
                            <span className="rounded-full border border-gold/40 bg-gold/8 px-2 py-0.5 text-[0.55rem] font-medium tracking-[0.14em] text-clay uppercase">
                              On this device
                            </span>
                          )}
                        </div>
                        {review.createdAt && (
                          <time
                            dateTime={review.createdAt.toISOString()}
                            className="text-[0.68rem] tracking-wide text-ink-soft/50"
                          >
                            {formatDate(review.createdAt)}
                          </time>
                        )}
                      </div>

                      <blockquote className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-ink-soft/90 italic">
                        <Quote className="mb-1 h-4 w-4 text-gold/40" strokeWidth={1.6} />
                        “{review.comment}”
                      </blockquote>

                      {review.ownerReply && (
                        <div className="mt-4 rounded-[10px] border border-forest/15 bg-forest/5 p-3">
                          <p className="label-caps text-[0.55rem] text-forest/70">Reply from the farm</p>
                          <p className="mt-1 text-[0.84rem] leading-relaxed text-ink-soft/85">{review.ownerReply}</p>
                        </div>
                      )}

                      <figcaption className="mt-5 flex items-center gap-3 border-t border-ink/10 pt-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest/10 font-display text-[0.9rem] text-forest">
                          {initials(review.authorName)}
                        </span>
                        <span className="min-w-0 flex-1 leading-tight">
                          <span className="block truncate text-[0.86rem] font-medium text-ink">{review.authorName}</span>
                          <span className="block truncate text-[0.72rem] text-ink-soft/65">
                            {[review.location, review.purchaseCategory].filter(Boolean).join(' · ')}
                          </span>
                        </span>
                        {review.source === 'device' && (
                          <button
                            type="button"
                            onClick={() => removeDeviceReview(review.id)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink-soft/60 transition-colors hover:border-[#9c3b2a]/40 hover:text-[#9c3b2a]"
                            aria-label="Remove your review from this device"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.7} />
                          </button>
                        )}
                      </figcaption>
                    </motion.figure>
                  </StaggerItem>
                ))}
              </Stagger>
            ) : (
              <Reveal y={20}>
                <div className="mt-4 rounded-[14px] border border-dashed border-gold/40 bg-cream/50 px-6 py-10 text-center">
                  <Quote className="mx-auto h-6 w-6 text-gold/50" strokeWidth={1.5} />
                  <p className="mt-3 font-display text-[1.2rem] text-ink">No reviews yet</p>
                  <p className="mx-auto mt-1.5 max-w-sm text-[0.86rem] leading-relaxed text-ink-soft/75">
                    Be the first to share your experience with our Kadaknath birds, chicks or eggs.
                  </p>
                </div>
              </Reveal>
            )}
          </div>

          {/* ── Review form ── */}
          <Reveal y={24} delay={0.1} className="lg:sticky lg:top-24">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="card-paper relative overflow-hidden rounded-[16px] p-6 sm:p-7"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
              <h3 className="font-display text-[1.45rem] text-ink">Write a review</h3>
              <p className="mt-1.5 text-[0.84rem] leading-relaxed text-ink-soft/75">
                Bought birds, chicks or eggs from us? Tell other customers how it went — your review appears on this page
                straight away.
              </p>

              <AnimatePresence initial={false}>
                {submitted && (
                  <motion.div
                    key={submitted.shared ? 'published' : 'saved'}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.4, ease }}
                    className={`mt-5 rounded-[12px] border px-4 py-3.5 text-[0.84rem] ${
                      submitted.shared
                        ? 'border-forest/20 bg-forest/6 text-forest'
                        : 'border-gold/45 bg-gold/8 text-clay'
                    }`}
                    role="status"
                    aria-live="polite"
                  >
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} />
                      <div className="flex-1">
                        <p className="font-medium">
                          {submitted.shared
                            ? 'Thank you — your review is published for everyone to see.'
                            : 'Thank you — your review is saved on this device.'}
                        </p>
                        {!submitted.shared && (
                          <>
                            <p className="mt-1 leading-relaxed">
                              Send it to the farm on WhatsApp so it can be added to the site for all visitors.
                            </p>
                            <a
                              href={submitted.whatsapp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2.5 inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-[0.78rem] font-medium text-cream transition-colors hover:bg-forest-deep"
                            >
                              <WhatsAppIcon className="h-3.5 w-3.5" /> Send review to the farm
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Your name" htmlFor="review-name" error={errors.authorName}>
                    <input
                      id="review-name"
                      name="authorName"
                      type="text"
                      autoComplete="name"
                      maxLength={reviewLimits.authorName.max}
                      value={form.authorName}
                      onChange={update('authorName')}
                      aria-invalid={Boolean(errors.authorName)}
                      aria-describedby={errors.authorName ? 'review-name-error' : undefined}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full rounded-[10px] border border-ink/15 bg-cream/60 px-4 py-3 text-[0.92rem] text-ink outline-none transition-colors placeholder:text-ink-soft/40 focus:border-forest/60 focus:bg-cream"
                    />
                  </Field>

                  <Field label="Village / city" htmlFor="review-location" error={errors.location}>
                    <input
                      id="review-location"
                      name="location"
                      type="text"
                      autoComplete="address-level2"
                      maxLength={reviewLimits.location.max}
                      value={form.location}
                      onChange={update('location')}
                      aria-invalid={Boolean(errors.location)}
                      aria-describedby={errors.location ? 'review-location-error' : undefined}
                      placeholder="e.g. Shivli, Kanpur"
                      className="w-full rounded-[10px] border border-ink/15 bg-cream/60 px-4 py-3 text-[0.92rem] text-ink outline-none transition-colors placeholder:text-ink-soft/40 focus:border-forest/60 focus:bg-cream"
                    />
                  </Field>
                </div>

                <Field label="What did you buy or visit for?" htmlFor="review-category" error={errors.purchaseCategory}>
                  <select
                    id="review-category"
                    name="purchaseCategory"
                    value={form.purchaseCategory}
                    onChange={update('purchaseCategory')}
                    aria-invalid={Boolean(errors.purchaseCategory)}
                    aria-describedby={errors.purchaseCategory ? 'review-category-error' : undefined}
                    className={`w-full rounded-[10px] border border-ink/15 bg-cream/60 px-4 py-3 text-[0.92rem] outline-none transition-colors focus:border-forest/60 focus:bg-cream ${
                      form.purchaseCategory ? 'text-ink' : 'text-ink-soft/50'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {reviewCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </Field>

                <fieldset>
                  <legend className="mb-1.5 block text-[0.72rem] font-medium tracking-[0.12em] text-ink-soft/80 uppercase">
                    Your rating
                  </legend>
                  <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map((value) => {
                      const filled = value <= (hoverRating || form.rating)
                      return (
                        <label
                          key={value}
                          onMouseEnter={() => setHoverRating(value)}
                          className="cursor-pointer rounded p-0.5"
                        >
                          <input
                            type="radio"
                            name="rating"
                            value={value}
                            checked={form.rating === value}
                            onChange={() => chooseRating(value)}
                            className="peer sr-only"
                          />
                          <Star
                            className={`h-7 w-7 transition-[transform,color] duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-forest/50 ${
                              filled ? 'scale-105 text-gold' : 'text-ink/25 hover:text-gold/60'
                            }`}
                            fill={filled ? 'currentColor' : 'none'}
                            strokeWidth={1.4}
                          />
                          <span className="sr-only">
                            {value} star{value === 1 ? '' : 's'}
                          </span>
                        </label>
                      )
                    })}
                    <span className="ml-2 text-[0.78rem] text-ink-soft/60">
                      {form.rating ? `${form.rating} / 5` : 'Tap to rate'}
                    </span>
                  </div>
                  {errors.rating && (
                    <p id="review-rating-error" className="mt-1.5 text-[0.75rem] text-[#9c3b2a]">
                      {errors.rating}
                    </p>
                  )}
                </fieldset>

                <Field label="Your review" htmlFor="review-comment" error={errors.comment}>
                  <textarea
                    id="review-comment"
                    name="comment"
                    rows={4}
                    maxLength={reviewLimits.comment.max}
                    value={form.comment}
                    onChange={update('comment')}
                    aria-invalid={Boolean(errors.comment)}
                    aria-describedby={errors.comment ? 'review-comment-error' : undefined}
                    placeholder="How were the birds, the chicks, the eggs or your visit?"
                    className="w-full resize-none rounded-[10px] border border-ink/15 bg-cream/60 px-4 py-3 text-[0.92rem] leading-relaxed text-ink outline-none transition-colors placeholder:text-ink-soft/40 focus:border-forest/60 focus:bg-cream"
                  />
                  <p className="mt-1 text-right text-[0.7rem] text-ink-soft/45">
                    {form.comment.length} / {reviewLimits.comment.max}
                  </p>
                </Field>

                <button
                  type="submit"
                  disabled={sending}
                  className="btn btn-primary group w-full disabled:cursor-wait disabled:opacity-70"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
                  ) : (
                    <Star className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" strokeWidth={1.8} />
                  )}
                  {sending ? 'Saving…' : 'Submit review'}
                </button>
                <p className="text-center text-[0.72rem] leading-relaxed text-ink-soft/60">
                  Your name and town are shown with the review. Please review your own experience only — the farm may
                  remove abusive or unrelated reviews.
                </p>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Field({ label, htmlFor, error, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[0.72rem] font-medium tracking-[0.12em] text-ink-soft/80 uppercase"
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-[0.75rem] text-[#9c3b2a]">
          {error}
        </p>
      )}
    </div>
  )
}
