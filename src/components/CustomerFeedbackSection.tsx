import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  LogOut,
  MessageSquare,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from 'firebase/firestore';
import {
  CustomerReview,
  FarmContactConfig,
  REVIEW_FIELD_LIMITS,
} from '../data/farmData';
import {
  auth,
  db,
  ensureOwnerAdminRecord,
  handleFirestoreError,
  isOwnerUser,
  OperationType,
  OWNER_EMAIL,
  signInWithGooglePopup,
  signOutAccount,
} from '../firebase';

interface CustomerFeedbackSectionProps {
  contact: FarmContactConfig;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'KP';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function parseTimestampDate(val: unknown): Date | null {
  if (val instanceof Timestamp) {
    return val.toDate();
  }
  if (
    val &&
    typeof val === 'object' &&
    'toDate' in val &&
    typeof (val as { toDate: () => Date }).toDate === 'function'
  ) {
    return (val as { toDate: () => Date }).toDate();
  }
  return null;
}

function formatReviewDate(date: Date | null | undefined): string {
  if (!date) return 'Recently';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export const CustomerFeedbackSection: React.FC<CustomerFeedbackSectionProps> = () => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  // Reviews data
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Form toggle & inputs
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    location?: string;
    comment?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isOwner = isOwnerUser(currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
      if (user && isOwnerUser(user)) {
        void ensureOwnerAdminRecord(user);
      }
    });
    return () => unsub();
  }, []);

  // Real-time listener for published reviews
  useEffect(() => {
    if (!authReady) return;
    const q = query(
      collection(db, 'reviews'),
      where('status', '==', 'published')
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: CustomerReview[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            authorName: String(data.authorName || 'Farm Visitor'),
            location: String(data.location || 'Uttar Pradesh'),
            purchaseCategory: 'Kadaknath Chickens',
            rating: Math.min(5, Math.max(1, Math.round(Number(data.rating) || 5))),
            comment: String(data.comment || ''),
            status: 'published',
            helpfulCount: Number(data.helpfulCount) || 0,
            authorUid: String(data.authorUid || ''),
            verifiedAccount: Boolean(data.verifiedAccount),
            ownerReply: String(data.ownerReply || ''),
            ownerRepliedAt: parseTimestampDate(data.ownerRepliedAt),
            createdAt: parseTimestampDate(data.createdAt),
          };
        });

        // Client-side sort by newest first
        list.sort(
          (a, b) =>
            (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
        );

        setReviews(list);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'reviews');
      }
    );

    return () => unsub();
  }, [authReady]);

  const handleOwnerLogin = async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      const cred = await signInWithGooglePopup();
      if (!isOwnerUser(cred.user)) {
        setAuthError(
          `Signed in as ${cred.user.email || 'user'}. Owner moderation requires ${OWNER_EMAIL}.`
        );
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (!msg.includes('popup-closed-by-user')) {
        setAuthError('Sign in could not be completed. Please try again.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedLoc = location.trim();
    const trimmedComment = comment.trim();

    const nextErrors: typeof errors = {};
    if (
      trimmedName.length < REVIEW_FIELD_LIMITS.authorNameMin ||
      trimmedName.length > REVIEW_FIELD_LIMITS.authorNameMax
    ) {
      nextErrors.name = `Name should be between ${REVIEW_FIELD_LIMITS.authorNameMin} and ${REVIEW_FIELD_LIMITS.authorNameMax} characters.`;
    }
    if (
      trimmedLoc.length < REVIEW_FIELD_LIMITS.locationMin ||
      trimmedLoc.length > REVIEW_FIELD_LIMITS.locationMax
    ) {
      nextErrors.location = `Location should be between ${REVIEW_FIELD_LIMITS.locationMin} and ${REVIEW_FIELD_LIMITS.locationMax} characters.`;
    }
    if (
      trimmedComment.length < REVIEW_FIELD_LIMITS.commentMin ||
      trimmedComment.length > REVIEW_FIELD_LIMITS.commentMax
    ) {
      nextErrors.comment = `Please write at least ${REVIEW_FIELD_LIMITS.commentMin} characters about your experience.`;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setSuccessMessage(null);
    try {
      await addDoc(collection(db, 'reviews'), {
        authorName: trimmedName,
        location: trimmedLoc,
        purchaseCategory: 'Kadaknath Chickens',
        rating: Math.min(5, Math.max(1, Math.round(rating))),
        comment: trimmedComment,
        status: 'published',
        helpfulCount: 0,
        authorUid: '',
        verifiedAccount: false,
        ownerReply: '',
        ownerRepliedAt: null,
        createdAt: serverTimestamp(),
      });

      setName('');
      setLocation('');
      setRating(5);
      setComment('');
      setShowForm(false);
      setSuccessMessage('Thank you! Your review has been added successfully.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reviews');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isOwner) return;
    setDeletingId(id);
    const docPath = `reviews/${id}`;
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section
      id="reviews"
      className="py-14 sm:py-20 border-b border-[#E2CFAF]/80 scroll-mt-20"
    >
      <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1E241E] tracking-tight">
                Customer Reviews
              </h2>
              <span
                aria-hidden="true"
                className="hidden sm:inline-block h-[1px] w-20 bg-gradient-to-r from-[#C89B3C] to-transparent"
              />
            </div>
            <p className="text-xs sm:text-sm text-[#4A544A] mt-1.5">
              What our real customers say about Kadaknath Poultry Farm
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setShowForm((prev) => !prev);
                setSuccessMessage(null);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1B3B22] hover:bg-[#132B18] text-[#FAF3E3] text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer min-h-[42px]"
            >
              <MessageSquare className="w-4 h-4 text-[#DFB75E]" />
              <span>{showForm ? 'Close Form' : 'Write a Review'}</span>
            </button>

            {isOwner ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#FAF3E3] border border-[#DEC9A4] text-xs text-[#1E241E]">
                <ShieldCheck className="w-4 h-4 text-[#1B3B22]" />
                <span className="font-medium">Owner</span>
                <button
                  type="button"
                  onClick={() => void signOutAccount()}
                  title="Sign out"
                  className="text-[#4A544A] hover:text-[#1E241E] ml-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={signingIn}
                onClick={() => void handleOwnerLogin()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FAF3E3] hover:bg-[#EFE2C6] border border-[#DEC9A4] text-[#2A332A] text-xs font-medium transition-colors cursor-pointer min-h-[42px]"
              >
                <Lock className="w-3.5 h-3.5 text-[#1B3B22]" />
                <span>{signingIn ? '...' : 'Owner Login'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Auth Error Banner */}
        {authError && (
          <div className="mb-6 p-3.5 rounded-xl bg-[#FAF3E3] border border-[#C93B2B]/40 text-xs text-[#7A2018] flex items-center justify-between gap-3">
            <span>{authError}</span>
            <button
              type="button"
              onClick={() => setAuthError(null)}
              className="text-xs font-semibold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Success Confirmation */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-[#1B3B22] text-[#FAF3E3] text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#DFB75E] shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              aria-label="Dismiss"
              className="text-[#D8CBB0] hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Simple "Write a Review" Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mb-8 aged-paper-card border border-[#D4BE98] rounded-2xl p-6 shadow-sm max-w-xl mx-auto"
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#D4BE98]/60">
              <h3 className="font-display text-lg font-bold text-[#1E241E]">
                Write Your Review
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-[#4A544A] hover:text-[#1E241E] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="simple-review-name"
                  className="block text-xs font-semibold text-[#1E241E] mb-1"
                >
                  Your Name <span className="text-[#C93B2B]">*</span>
                </label>
                <input
                  id="simple-review-name"
                  type="text"
                  maxLength={REVIEW_FIELD_LIMITS.authorNameMax}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#FCF8EE] border border-[#D4BE98] text-sm text-[#1E241E] placeholder:text-[#6B7268]"
                />
                {errors.name && (
                  <p className="text-[11px] text-[#9E2A2B] mt-1 font-medium">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="simple-review-loc"
                  className="block text-xs font-semibold text-[#1E241E] mb-1"
                >
                  City or Village <span className="text-[#C93B2B]">*</span>
                </label>
                <input
                  id="simple-review-loc"
                  type="text"
                  maxLength={REVIEW_FIELD_LIMITS.locationMax}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Shivli, Kanpur Dehat"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#FCF8EE] border border-[#D4BE98] text-sm text-[#1E241E] placeholder:text-[#6B7268]"
                />
                {errors.location && (
                  <p className="text-[11px] text-[#9E2A2B] mt-1 font-medium">
                    {errors.location}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E241E] mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      className={`w-10 h-10 rounded-lg border inline-flex items-center justify-center cursor-pointer transition-colors ${
                        starVal <= rating
                          ? 'bg-[#1B3B22] border-[#1B3B22] text-[#DFB75E]'
                          : 'bg-[#FCF8EE] border-[#D4BE98] text-[#8C8474]'
                      }`}
                      aria-label={`${starVal} star`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#1E241E] ml-2 tabular-nums">
                    {rating} / 5
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="simple-review-comment"
                  className="block text-xs font-semibold text-[#1E241E] mb-1"
                >
                  Your Review <span className="text-[#C93B2B]">*</span>
                </label>
                <textarea
                  id="simple-review-comment"
                  rows={3}
                  maxLength={REVIEW_FIELD_LIMITS.commentMax}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with our Kadaknath birds, chicks, or eggs..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#FCF8EE] border border-[#D4BE98] text-sm text-[#1E241E] placeholder:text-[#6B7268] resize-none"
                />
                {errors.comment && (
                  <p className="text-[11px] text-[#9E2A2B] mt-1 font-medium">
                    {errors.comment}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#1B3B22] hover:bg-[#132B18] text-[#FAF3E3] text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 min-h-[44px]"
              >
                <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
                <ArrowRight className="w-4 h-4 text-[#DFB75E]" />
              </button>
            </div>
          </form>
        )}

        {/* Reviews Cards List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className="bg-[#FAF3E3] border border-[#E2CFAF] rounded-2xl p-6 h-36 animate-pulse"
              />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-[#FAF3E3] border border-[#E2CFAF] rounded-2xl p-8 text-center max-w-lg mx-auto shadow-xs">
            <p className="text-base font-bold text-[#1E241E]">
              No Customer Reviews Yet
            </p>
            <p className="text-xs sm:text-sm text-[#4A544A] mt-1.5 leading-relaxed">
              Be the first to leave a review for our Bhoshana farm.
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1B3B22] hover:bg-[#132B18] text-[#FAF3E3] text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#DFB75E]" />
              <span>Write the First Review</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((r) => (
              <article
                key={r.id}
                className="bg-[#FAF3E3] border border-[#E2CFAF] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        aria-hidden="true"
                        className="w-10 h-10 rounded-full bg-[#1B3B22] text-[#DFB75E] font-display font-bold text-xs flex items-center justify-center shrink-0 border border-[#C89B3C]/40"
                      >
                        {getInitials(r.authorName)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#1E241E] truncate">
                          {r.authorName}
                        </h4>
                        <p className="text-[11px] text-[#5C665C] truncate">
                          {r.location} · {formatReviewDate(r.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-0.5 text-[#D49B2A] shrink-0"
                      aria-label={`${r.rating} out of 5 stars`}
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < r.rating ? 'fill-current' : 'text-[#D6C6A7]'
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#2A332A] leading-relaxed italic">
                    &ldquo;{r.comment}&rdquo;
                  </p>
                </div>

                {isOwner && (
                  <div className="mt-4 pt-3 border-t border-[#EDE0C6] flex justify-end">
                    <button
                      type="button"
                      disabled={deletingId === r.id}
                      onClick={() => void handleDelete(r.id)}
                      className="inline-flex items-center gap-1 text-[11px] text-[#B83227] hover:underline cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{deletingId === r.id ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
