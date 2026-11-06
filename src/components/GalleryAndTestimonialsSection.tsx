import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Expand,
  Lock,
  LogOut,
  MessageSquarePlus,
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
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  CustomerReview,
  GALLERY_PHOTOS,
  GalleryCategory,
  REVIEW_PURCHASE_CATEGORIES,
  ReviewPurchaseCategory,
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
import { ResilientImage } from './ResilientImage';

const CATEGORIES: GalleryCategory[] = [
  'All',
  'Roosters & Hens',
  'Chicks',
  'Farm & Eggs',
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'KF';
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
  if (!date) return 'Just now';
  return date.toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
}

export const GalleryAndTestimonialsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<GalleryCategory>('All');
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Auth & Real Customer Reviews State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [approvedReviews, setApprovedReviews] = useState<CustomerReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [ownerReviews, setOwnerReviews] = useState<CustomerReview[]>([]);
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);

  // Write a Customer Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [location, setLocation] = useState('');
  const [purchaseCategory, setPurchaseCategory] =
    useState<ReviewPurchaseCategory>('Kadaknath Chickens');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [publishImmediately, setPublishImmediately] = useState<boolean>(true);
  const [formErrors, setFormErrors] = useState<{
    authorName?: string;
    location?: string;
    comment?: string;
    submit?: string;
  }>({});
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  // Inline Delete Confirmation State for Owner Moderation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busyReviewId, setBusyReviewId] = useState<string | null>(null);

  const isOwner = useMemo(() => isOwnerUser(currentUser), [currentUser]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
      if (user && isOwnerUser(user)) {
        void ensureOwnerAdminRecord(user);
        setShowOwnerPanel(true);
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to approved customer reviews in real time
  useEffect(() => {
    if (!authReady) return;
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('status', '==', 'approved')
    );

    const unsub = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        const items: CustomerReview[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            authorName: String(data.authorName || ''),
            location: String(data.location || ''),
            purchaseCategory: (data.purchaseCategory ||
              'Farm Visit') as ReviewPurchaseCategory,
            rating: Number(data.rating) || 5,
            comment: String(data.comment || ''),
            status: 'approved',
            createdAt: parseTimestampDate(data.createdAt),
          };
        });
        items.sort(
          (a, b) =>
            (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
        );
        setApprovedReviews(items);
        setReviewsLoading(false);
      },
      (error) => {
        setReviewsLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'reviews');
      }
    );

    return () => unsub();
  }, [authReady]);

  // Subscribe to all reviews (pending + approved) when signed in as verified owner
  useEffect(() => {
    if (!authReady || !isOwner) {
      setOwnerReviews([]);
      return;
    }

    const ownerQuery = query(
      collection(db, 'reviews'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      ownerQuery,
      (snapshot) => {
        const items: CustomerReview[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            authorName: String(data.authorName || ''),
            location: String(data.location || ''),
            purchaseCategory: (data.purchaseCategory ||
              'Farm Visit') as ReviewPurchaseCategory,
            rating: Number(data.rating) || 5,
            comment: String(data.comment || ''),
            status: data.status === 'approved' ? 'approved' : 'pending',
            createdAt: parseTimestampDate(data.createdAt),
          };
        });
        setOwnerReviews(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'reviews');
      }
    );

    return () => unsub();
  }, [authReady, isOwner]);

  const filteredPhotos =
    selectedCategory === 'All'
      ? GALLERY_PHOTOS
      : GALLERY_PHOTOS.filter((p) => p.category === selectedCategory);

  const visiblePhotos = showAllPhotos
    ? filteredPhotos
    : filteredPhotos.slice(0, 5);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? 0 : (prev + 1) % filteredPhotos.length
        );
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null
            ? 0
            : (prev - 1 + filteredPhotos.length) % filteredPhotos.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, filteredPhotos.length]);

  const activeLightboxPhoto =
    lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  const handleOwnerLogin = async () => {
    setAuthError(null);
    try {
      const cred = await signInWithGooglePopup();
      if (!isOwnerUser(cred.user)) {
        setAuthError(
          `Signed in as ${cred.user.email || 'guest'}. Only the verified farm owner account (${OWNER_EMAIL}) can moderate reviews.`
        );
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (!msg.includes('popup-closed-by-user')) {
        setAuthError('Unable to complete Google Sign-In. Please try again.');
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = authorName.trim();
    const trimmedLocation = location.trim();
    const trimmedComment = comment.trim();
    const nextErrors: typeof formErrors = {};

    if (trimmedName.length < 2 || trimmedName.length > 60) {
      nextErrors.authorName = 'Please enter your name (2–60 characters).';
    }
    if (trimmedLocation.length < 2 || trimmedLocation.length > 60) {
      nextErrors.location =
        'Please enter your village or city (2–60 characters).';
    }
    if (trimmedComment.length < 10 || trimmedComment.length > 450) {
      nextErrors.comment =
        'Please write at least 10 characters (max 450 characters).';
    }

    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmittingReview(true);
    setSubmittedNotice(null);

    const targetStatus =
      isOwner && publishImmediately ? 'approved' : 'pending';

    try {
      await addDoc(collection(db, 'reviews'), {
        authorName: trimmedName,
        location: trimmedLocation,
        purchaseCategory,
        rating: Math.min(5, Math.max(1, Math.round(rating))),
        comment: trimmedComment,
        status: targetStatus,
        createdAt: serverTimestamp(),
      });

      setAuthorName('');
      setLocation('');
      setRating(5);
      setComment('');
      setSubmittedNotice(
        targetStatus === 'approved'
          ? 'Review published directly to the farm page.'
          : 'Thank you! Your review has been submitted and will appear publicly once verified by the farm owner.'
      );
      setShowReviewForm(false);
    } catch (error) {
      setSubmittingReview(false);
      handleFirestoreError(error, OperationType.CREATE, 'reviews');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleToggleApproval = async (review: CustomerReview) => {
    if (!isOwner) return;
    setBusyReviewId(review.id);
    const nextStatus = review.status === 'approved' ? 'pending' : 'approved';
    const docPath = `reviews/${review.id}`;
    try {
      await updateDoc(doc(db, 'reviews', review.id), {
        status: nextStatus,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    } finally {
      setBusyReviewId(null);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!isOwner) return;
    setBusyReviewId(reviewId);
    const docPath = `reviews/${reviewId}`;
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      setConfirmDeleteId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    } finally {
      setBusyReviewId(null);
    }
  };

  const pendingCount = useMemo(
    () => ownerReviews.filter((r) => r.status === 'pending').length,
    [ownerReviews]
  );

  return (
    <>
      {/* Section G: Our Farm Gallery */}
      <section
        id="gallery"
        className="py-14 sm:py-20 border-b border-[#E2CFAF]/80"
      >
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-7">
            <div className="flex items-center justify-center gap-4">
              <span
                aria-hidden="true"
                className="h-[1px] w-14 sm:w-24 bg-gradient-to-r from-transparent to-[#C89B3C]"
              />
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1E241E] tracking-tight">
                Our Farm Gallery
              </h2>
              <span
                aria-hidden="true"
                className="h-[1px] w-14 sm:w-24 bg-gradient-to-l from-transparent to-[#C89B3C]"
              />
            </div>
            <p className="font-script italic text-lg text-[#4A544A] mt-1">
              A Glimpse of Our Poultry Farm
            </p>
          </div>

          {/* Interactive Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setSelectedCategory(category);
                  setLightboxIndex(null);
                }}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[38px] ${
                  selectedCategory === category
                    ? 'bg-[#1B3B22] text-[#FAF3E3] shadow-xs'
                    : 'bg-[#FAF3E3] text-[#2A332A] border border-[#DEC9A4] hover:bg-[#EFE2C6]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Responsive Photo Grid (5 across on desktop matching reference, expandable to all 8) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {visiblePhotos.map((photo, idx) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className="group relative rounded-xl overflow-hidden border-2 border-[#FAF3E3] shadow-sm hover:shadow-md bg-[#EFE2C6] text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C89B3C]"
              >
                <ResilientImage
                  src={photo.image}
                  alt={photo.alt}
                  fallbackTitle={photo.title}
                  loading="eager"
                  className="w-full aspect-4/3 object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                  <div className="self-end w-7 h-7 rounded-full bg-[#112616]/85 text-[#FAF3E3] inline-flex items-center justify-center">
                    <Expand className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#DFB75E] block">
                      {photo.category}
                    </span>
                    <span className="text-xs font-semibold text-white line-clamp-1">
                      {photo.title}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredPhotos.length > 5 && (
            <div className="mt-7 text-center">
              <button
                type="button"
                onClick={() => setShowAllPhotos((prev) => !prev)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1B3B22] hover:bg-[#132B18] active:scale-[0.98] text-[#FAF3E3] text-xs sm:text-sm font-semibold shadow-xs transition-all duration-150 whitespace-nowrap cursor-pointer min-h-[42px]"
              >
                <span>
                  {showAllPhotos
                    ? 'Show Compact Strip'
                    : `View More Photos (${filteredPhotos.length})`}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#DFB75E]" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Section H: Real Customer Reviews & Owner Management */}
      <section id="reviews" className="py-14 sm:py-16">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1E241E] tracking-tight">
                  What Our Customers Say
                </h2>
                <span
                  aria-hidden="true"
                  className="hidden sm:inline-block h-[1px] w-16 bg-gradient-to-r from-[#C89B3C] to-transparent"
                />
              </div>
              <p className="text-xs sm:text-sm text-[#4A544A] mt-1">
                Verified feedback submitted by visitors and buyers at our
                Bhoshana, Shivli Road farm
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm((prev) => !prev);
                  setSubmittedNotice(null);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1B3B22] hover:bg-[#132B18] text-[#FAF3E3] text-xs sm:text-sm font-semibold shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[42px]"
              >
                <MessageSquarePlus className="w-4 h-4 text-[#DFB75E]" />
                <span>{showReviewForm ? 'Close Form' : 'Write a Review'}</span>
              </button>

              {isOwner ? (
                <button
                  type="button"
                  onClick={() => setShowOwnerPanel((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FAF3E3] hover:bg-[#EFE2C6] border border-[#C6AF88] text-[#1E241E] text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[42px] tabular-nums"
                >
                  <ShieldCheck className="w-4 h-4 text-[#1B3B22]" />
                  <span>
                    {showOwnerPanel
                      ? 'Hide Moderation'
                      : `Manage Reviews (${pendingCount} Pending)`}
                  </span>
                </button>
              ) : currentUser ? (
                <button
                  type="button"
                  onClick={() => void signOutAccount()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-[#FAF3E3] hover:bg-[#EFE2C6] border border-[#DEC9A4] text-[#4A544A] text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[42px]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleOwnerLogin()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FAF3E3] hover:bg-[#EFE2C6] border border-[#DEC9A4] text-[#2A332A] text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[42px]"
                >
                  <Lock className="w-3.5 h-3.5 text-[#1B3B22]" />
                  <span>Owner Login</span>
                </button>
              )}
            </div>
          </div>

          {authError && (
            <div className="mb-6 p-4 rounded-xl bg-[#FAF3E3] border border-[#C93B2B]/40 text-xs sm:text-sm text-[#7A2018] flex items-center justify-between gap-3">
              <span>{authError}</span>
              <button
                type="button"
                onClick={() => setAuthError(null)}
                className="text-xs font-semibold underline shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {submittedNotice && (
            <div className="mb-6 p-4 rounded-xl bg-[#1B3B22] text-[#FAF3E3] text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#DFB75E] shrink-0" />
                <span>{submittedNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setSubmittedNotice(null)}
                aria-label="Dismiss confirmation"
                className="text-[#D8CBB0] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Customer Review Submission Form */}
          {showReviewForm && (
            <form
              onSubmit={handleSubmitReview}
              noValidate
              className="mb-8 aged-paper-card border border-[#D4BE98] rounded-2xl p-6 sm:p-7 shadow-sm max-w-2xl"
            >
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-[#1E241E]">
                    Share Your Farm Experience
                  </h3>
                  <p className="text-xs text-[#4A544A] mt-0.5">
                    Genuine reviews help local buyers and farmers across Kanpur
                    Dehat &amp; Uttar Pradesh.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  aria-label="Close review form"
                  className="w-9 h-9 rounded-lg bg-[#EFE2C6] hover:bg-[#E2CFAF] text-[#1E241E] inline-flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="review-author"
                    className="block text-xs font-semibold text-[#1E241E] mb-1"
                  >
                    Your Name
                  </label>
                  <input
                    id="review-author"
                    type="text"
                    maxLength={60}
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Rajesh Tiwari"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#FCF8EE] border border-[#D4BE98] text-sm text-[#1E241E]"
                  />
                  {formErrors.authorName && (
                    <p className="text-[11px] text-[#9E2A2B] mt-1 font-medium">
                      {formErrors.authorName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="review-location"
                    className="block text-xs font-semibold text-[#1E241E] mb-1"
                  >
                    Village / City
                  </label>
                  <input
                    id="review-location"
                    type="text"
                    maxLength={60}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Shivli, Kanpur Dehat"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#FCF8EE] border border-[#D4BE98] text-sm text-[#1E241E]"
                  />
                  {formErrors.location && (
                    <p className="text-[11px] text-[#9E2A2B] mt-1 font-medium">
                      {formErrors.location}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="review-category"
                    className="block text-xs font-semibold text-[#1E241E] mb-1"
                  >
                    Order / Visit Type
                  </label>
                  <select
                    id="review-category"
                    value={purchaseCategory}
                    onChange={(e) =>
                      setPurchaseCategory(
                        e.target.value as ReviewPurchaseCategory
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#FCF8EE] border border-[#D4BE98] text-sm text-[#1E241E]"
                  >
                    {REVIEW_PURCHASE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-[#1E241E] mb-1">
                    Rating ({rating} / 5)
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((starValue) => (
                      <button
                        key={starValue}
                        type="button"
                        onClick={() => setRating(starValue)}
                        aria-label={`Rate ${starValue} out of 5 stars`}
                        className={`w-10 h-10 rounded-lg border inline-flex items-center justify-center transition-colors cursor-pointer ${
                          starValue <= rating
                            ? 'bg-[#1B3B22] border-[#1B3B22] text-[#DFB75E]'
                            : 'bg-[#FCF8EE] border-[#D4BE98] text-[#8C8474]'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="review-comment"
                    className="block text-xs font-semibold text-[#1E241E]"
                  >
                    Your Experience
                  </label>
                  <span className="text-[11px] text-[#5C665C] tabular-nums">
                    {comment.trim().length} / 450
                  </span>
                </div>
                <textarea
                  id="review-comment"
                  rows={3}
                  maxLength={450}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about bird health, egg freshness, hygiene, or your visit to our Bhoshana farm..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#FCF8EE] border border-[#D4BE98] text-sm text-[#1E241E] resize-none"
                />
                {formErrors.comment && (
                  <p className="text-[11px] text-[#9E2A2B] mt-1 font-medium">
                    {formErrors.comment}
                  </p>
                )}
              </div>

              {isOwner && (
                <label className="mt-3 inline-flex items-center gap-2 text-xs text-[#1E241E] font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publishImmediately}
                    onChange={(e) => setPublishImmediately(e.target.checked)}
                    className="rounded border-[#C89B3C]"
                  />
                  <span>Publish immediately as verified farm owner</span>
                </label>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1B3B22] hover:bg-[#132B18] disabled:opacity-60 text-[#FAF3E3] text-xs sm:text-sm font-semibold shadow-xs transition-colors whitespace-nowrap cursor-pointer min-h-[42px]"
                >
                  <span>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#DFB75E]" />
                </button>
              </div>
            </form>
          )}

          {/* Owner Moderation Panel (Only visible to authenticated verified farm owner) */}
          {isOwner && showOwnerPanel && (
            <div className="mb-8 bg-[#142B18] text-[#FAF3E3] border border-[#C89B3C]/40 rounded-2xl p-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#C89B3C]/25">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#FAF3E3]">
                    Owner Review Moderation
                  </h3>
                  <p className="text-xs text-[#D8CBB0] mt-0.5 tabular-nums">
                    Signed in as {currentUser?.email} · {ownerReviews.length}{' '}
                    total submissions ({pendingCount} awaiting approval)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void signOutAccount()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1E3F24] hover:bg-[#285230] text-[#FAF3E3] text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#DFB75E]" />
                  <span>Sign Out</span>
                </button>
              </div>

              {ownerReviews.length === 0 ? (
                <p className="text-xs sm:text-sm text-[#D8CBB0] py-5">
                  No customer reviews have been submitted yet. When customers
                  submit reviews or when you add one via &ldquo;Write a
                  Review&rdquo;, they will appear here for approval.
                </p>
              ) : (
                <div className="divide-y divide-white/10 mt-2">
                  {ownerReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-white">
                            {rev.authorName}
                          </span>
                          <span aria-hidden="true" className="text-white/40">
                            ·
                          </span>
                          <span className="text-[#D8CBB0]">{rev.location}</span>
                          <span aria-hidden="true" className="text-white/40">
                            ·
                          </span>
                          <span className="text-[#DFB75E]">
                            {rev.purchaseCategory}
                          </span>
                          <span aria-hidden="true" className="text-white/40">
                            ·
                          </span>
                          <span className="tabular-nums text-[#DFB75E]">
                            {rev.rating}/5 ★
                          </span>
                          <span aria-hidden="true" className="text-white/40">
                            ·
                          </span>
                          <span
                            className={
                              rev.status === 'approved'
                                ? 'text-[#A7E3B4] font-semibold'
                                : 'text-[#F3C669] font-semibold'
                            }
                          >
                            {rev.status === 'approved'
                              ? 'Published'
                              : 'Pending Approval'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#FAF3E3]/90 leading-relaxed">
                          &ldquo;{rev.comment}&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={busyReviewId === rev.id}
                          onClick={() => void handleToggleApproval(rev)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer min-h-[38px] ${
                            rev.status === 'approved'
                              ? 'bg-[#1E3F24] hover:bg-[#2A5432] text-[#FAF3E3]'
                              : 'bg-[#DFB75E] hover:bg-[#CFA349] text-[#112616]'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {rev.status === 'approved'
                              ? 'Unpublish'
                              : 'Approve & Publish'}
                          </span>
                        </button>

                        {confirmDeleteId === rev.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={busyReviewId === rev.id}
                              onClick={() => void handleDeleteReview(rev.id)}
                              className="px-3 py-2 rounded-lg bg-[#B83227] hover:bg-[#99261D] text-white text-xs font-semibold cursor-pointer min-h-[38px]"
                            >
                              Confirm Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2.5 py-2 rounded-lg bg-white/10 text-[#FAF3E3] text-xs cursor-pointer min-h-[38px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(rev.id)}
                            aria-label={`Delete review by ${rev.authorName}`}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 hover:bg-[#B83227] text-[#FAF3E3] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Public Approved Reviews Grid or Transparent Empty State */}
          {reviewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="bg-[#FAF3E3] border border-[#E2CFAF] rounded-2xl p-5 h-40"
                />
              ))}
            </div>
          ) : approvedReviews.length === 0 ? (
            <div className="bg-[#FAF3E3] border border-[#E2CFAF] rounded-2xl p-8 text-center max-w-2xl mx-auto shadow-xs">
              <h3 className="font-display text-xl font-bold text-[#1E241E]">
                No Verified Reviews Published Yet
              </h3>
              <p className="text-xs sm:text-sm text-[#4A544A] mt-2 leading-relaxed">
                We only display authentic reviews from real visitors and buyers.
                If you have purchased Kadaknath birds, chicks, or fresh eggs
                from our Bhoshana farm on Shivli Road, be the first to share
                your experience.
              </p>
              <button
                type="button"
                onClick={() => setShowReviewForm(true)}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1B3B22] hover:bg-[#132B18] text-[#FAF3E3] text-xs sm:text-sm font-semibold shadow-xs transition-colors whitespace-nowrap cursor-pointer min-h-[42px]"
              >
                <MessageSquarePlus className="w-4 h-4 text-[#DFB75E]" />
                <span>Submit First Customer Review</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {approvedReviews.map((review) => (
                <article
                  key={review.id}
                  className="bg-[#FAF3E3] border border-[#E2CFAF] rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      aria-hidden="true"
                      className="w-12 h-12 rounded-full bg-[#1B3B22] text-[#DFB75E] font-display font-bold text-sm flex items-center justify-center shrink-0 border border-[#C89B3C]/40"
                    >
                      {getInitials(review.authorName)}
                    </div>
                    <div>
                      <p className="font-script italic text-base text-[#2A332A] leading-snug">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#EDE0C6] flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-[#1E241E]">
                        {review.authorName}
                      </p>
                      <p className="text-[11px] text-[#5C665C]">
                        {review.purchaseCategory} · {review.location} ·{' '}
                        {formatReviewDate(review.createdAt)}
                      </p>
                    </div>

                    <div
                      className="flex items-center gap-0.5 text-[#D49B2A] shrink-0"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {Array.from({ length: review.rating }).map((_, sIdx) => (
                        <Star
                          key={sIdx}
                          className="w-3.5 h-3.5 fill-current"
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Full-Screen Interactive Photo Lightbox */}
      {activeLightboxPhoto && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={activeLightboxPhoto.title}
        >
          <div className="flex items-center justify-between text-[#FAF3E3]">
            <div className="text-xs sm:text-sm">
              <span className="text-[#DFB75E] font-semibold">
                {activeLightboxPhoto.category}
              </span>
              <span className="mx-2 text-white/40">·</span>
              <span className="tabular-nums">
                {lightboxIndex + 1} / {filteredPhotos.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close photo lightbox"
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white inline-flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4 max-h-[75vh]">
            <button
              type="button"
              onClick={() =>
                setLightboxIndex(
                  (lightboxIndex - 1 + filteredPhotos.length) %
                    filteredPhotos.length
                )
              }
              aria-label="Previous photo"
              className="absolute left-1 sm:left-4 z-10 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 inline-flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <ResilientImage
              src={activeLightboxPhoto.image}
              alt={activeLightboxPhoto.alt}
              loading="eager"
              className="max-h-[72vh] max-w-full rounded-xl object-contain shadow-2xl"
            />

            <button
              type="button"
              onClick={() =>
                setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length)
              }
              aria-label="Next photo"
              className="absolute right-1 sm:right-4 z-10 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 inline-flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center max-w-xl mx-auto text-[#FAF3E3]">
            <h3 className="font-display text-lg sm:text-xl font-bold">
              {activeLightboxPhoto.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#D8CBB0] mt-1">
              {activeLightboxPhoto.caption}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
