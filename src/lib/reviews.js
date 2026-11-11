import firebaseConfig from '../../firebase-applet-config.json'

/**
 * Customer reviews, stored in the project's Firestore database.
 *
 * The site is fully static, so this talks to Firestore over its REST API with
 * the (public) web config that is already committed in firebase-applet-config.json.
 * No server, no SDK bundle and no secret keys are involved — access is governed
 * by firestore.rules, which allow anyone to publish a review and everyone to
 * read published ones. The farm can hide a review or reply to it from the
 * Firebase console (the rules permit the owner to do that).
 */

const { projectId, firestoreDatabaseId, apiKey } = firebaseConfig
const documentsUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents`
const documentName = (id) => `projects/${projectId}/databases/${firestoreDatabaseId}/documents/reviews/${id}`

export const reviewCategories = ['Kadaknath Chickens', 'Kadaknath Chicks', 'Kadaknath Eggs', 'Farm Visit']

/** Limits mirrored from firestore.rules and the CustomerReview blueprint. */
export const reviewLimits = {
  authorName: { min: 2, max: 60 },
  location: { min: 2, max: 60 },
  comment: { min: 10, max: 500 },
}

/** Reviews shown in the page at once. */
const PAGE_SIZE = 50

class ReviewServiceError extends Error {}

async function firestoreRequest(path, body) {
  let response
  try {
    response = await fetch(`${path}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ReviewServiceError('We could not reach the review service. Please check your connection and try again.')
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const status = payload?.error?.status

    if (response.status === 429) {
      throw new ReviewServiceError('Too many reviews are being sent right now. Please try again in a moment.')
    }
    if (status === 'PERMISSION_DENIED' || status === 'INVALID_ARGUMENT') {
      throw new ReviewServiceError('This review could not be published. Please check the details and try again.')
    }
    throw new ReviewServiceError('The review service is busy right now. Please try again in a moment.')
  }

  return response.json()
}

function text(field) {
  return typeof field?.stringValue === 'string' ? field.stringValue : ''
}

function timestamp(field) {
  if (typeof field?.timestampValue !== 'string') return null
  const parsed = new Date(field.timestampValue)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function parseReview(document) {
  const fields = document?.fields ?? {}
  const rating = Number(fields.rating?.integerValue ?? 0)

  return {
    id: (document?.name ?? '').split('/').pop() ?? '',
    authorName: text(fields.authorName).trim() || 'Customer',
    location: text(fields.location).trim(),
    purchaseCategory: text(fields.purchaseCategory),
    rating: Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 0,
    comment: text(fields.comment).trim(),
    ownerReply: text(fields.ownerReply).trim(),
    createdAt: timestamp(fields.createdAt),
    source: 'published',
  }
}

/** Every published review, newest first. */
export async function fetchPublishedReviews() {
  const rows = await firestoreRequest(`${documentsUrl}:runQuery`, {
    structuredQuery: {
      from: [{ collectionId: 'reviews' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'status' },
          op: 'EQUAL',
          value: { stringValue: 'published' },
        },
      },
      limit: PAGE_SIZE,
    },
  })

  return (Array.isArray(rows) ? rows : [])
    .filter((row) => row?.document)
    .map((row) => parseReview(row.document))
    .filter((review) => review.comment && review.rating >= 1)
    .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
}

/* ── Reviews written on this device ───────────────────────────────────────
 * The site is static and the deployed Firestore rules currently reject
 * anonymous submissions, so a visitor's own review is kept in localStorage.
 * If the rules ever allow public publishing, publishReview() succeeds and the
 * local copy is dropped in favour of the shared one.
 */
const LOCAL_STORAGE_KEY = 'kadaknath_reviews_v1'
const LOCAL_REVIEW_LIMIT = 12

function hasStorage() {
  try {
    return typeof window !== 'undefined' && Boolean(window.localStorage)
  } catch {
    return false
  }
}

export function loadLocalReviews() {
  if (!hasStorage()) return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((entry) => entry && typeof entry.comment === 'string' && Number(entry.rating) >= 1)
      .map((entry) => {
        const createdAt = entry.createdAt ? new Date(entry.createdAt) : null
        return createdAt && !Number.isNaN(createdAt.getTime())
          ? {
              id: String(entry.id),
              authorName: String(entry.authorName || 'Customer'),
              location: String(entry.location || ''),
              purchaseCategory: String(entry.purchaseCategory || ''),
              rating: Math.min(5, Math.max(1, Math.round(Number(entry.rating)))),
              comment: entry.comment,
              ownerReply: '',
              createdAt,
              source: 'device',
            }
          : null
      })
      .filter(Boolean)
  } catch {
    return []
  }
}

export function saveLocalReviews(reviews) {
  if (!hasStorage()) return
  try {
    const plain = reviews.slice(0, LOCAL_REVIEW_LIMIT).map((review) => ({
      ...review,
      createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : null,
    }))
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plain))
  } catch {
    // Storage can be full or blocked (private browsing); the review still shows for this visit.
  }
}

/** A review as it looks before it is published anywhere. */
export function createLocalReview(values) {
  return {
    id: `device-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    authorName: values.authorName.trim(),
    location: values.location.trim(),
    purchaseCategory: values.purchaseCategory,
    rating: values.rating,
    comment: values.comment.trim(),
    ownerReply: '',
    createdAt: new Date(),
    source: 'device',
  }
}

function newReviewId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Publish a review anonymously. Firestore stamps `createdAt` on the server and
 * firestore.rules validate every field, so the payload here must match the
 * CustomerReview blueprint exactly.
 */
export async function publishReview({ authorName, location, purchaseCategory, rating, comment }) {
  const id = newReviewId()
  const name = documentName(id)

  const fields = {
    authorName: { stringValue: authorName.trim() },
    location: { stringValue: location.trim() },
    purchaseCategory: { stringValue: purchaseCategory },
    rating: { integerValue: String(rating) },
    comment: { stringValue: comment.trim() },
    status: { stringValue: 'published' },
    helpfulCount: { integerValue: '0' },
    authorUid: { stringValue: '' },
    verifiedAccount: { booleanValue: false },
    ownerReply: { stringValue: '' },
    ownerRepliedAt: { nullValue: null },
  }

  await firestoreRequest(`${documentsUrl}:commit`, {
    writes: [
      {
        update: { name, fields },
        updateMask: { fieldPaths: Object.keys(fields) },
        // `updateTransforms` keeps the write atomic: Firestore stamps the
        // server time so firestore.rules can require createdAt == request.time.
        updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }],
      },
    ],
  })

  return {
    id,
    authorName: authorName.trim(),
    location: location.trim(),
    purchaseCategory,
    rating,
    comment: comment.trim(),
    ownerReply: '',
    createdAt: new Date(),
    source: 'published',
  }
}
