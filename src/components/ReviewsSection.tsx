"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import StarRating from "@/components/StarRating";
import { toast } from "@/lib/toast";
import { submitReview, deleteReview } from "@/app/shop/[slug]/reviews-actions";
import type { Review } from "@/lib/types";

export default function ReviewsSection({
  appId,
  slug,
  reviews,
  ratingAvg,
  ratingCount,
  currentUserId,
}: {
  appId: string;
  slug: string;
  reviews: Review[];
  ratingAvg: number;
  ratingCount: number;
  currentUserId: string | null;
}) {
  const myReview = reviews.find((r) => r.user_id === currentUserId) ?? null;
  const otherReviews = reviews.filter((r) => r.user_id !== currentUserId);

  const [rating, setRating] = useState(myReview?.rating ?? 0);
  const [comment, setComment] = useState(myReview?.comment ?? "");
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    if (rating === 0) {
      toast("Select a star rating first", "error");
      return;
    }
    if (!comment.trim()) {
      toast("Add a short comment with your rating", "error");
      return;
    }
    startTransition(async () => {
      const { error } = await submitReview({ appId, slug, rating, comment });
      if (error) {
        toast(error, "error");
      } else {
        toast(myReview ? "Review updated" : "Review posted", "success");
      }
    });
  }

  function handleDelete(reviewId: string) {
    startTransition(async () => {
      const { error } = await deleteReview({ reviewId, slug });
      if (error) {
        toast(error, "error");
      } else {
        toast("Review removed", "success");
        setRating(0);
        setComment("");
      }
    });
  }

  return (
    <div className="mt-12 border-t border-border pt-8">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-lg font-semibold">Ratings & Reviews</h2>
        {ratingCount > 0 ? (
          <div className="flex items-center gap-1.5 text-sm text-text-muted">
            <StarRating value={ratingAvg} size={14} />
            <span>
              {ratingAvg.toFixed(1)} · {ratingCount} review{ratingCount === 1 ? "" : "s"}
            </span>
          </div>
        ) : (
          <span className="text-sm text-text-muted">No reviews yet</span>
        )}
      </div>

      {currentUserId ? (
        <div className="glass-card mt-5 rounded-2xl p-4">
          <p className="mb-2 text-sm font-medium">
            {myReview ? "Your review" : "Leave a review"}
          </p>
          <StarRating value={rating} interactive size={22} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this app"
            required
            rows={3}
            maxLength={1000}
            className="mt-3 w-full rounded-xl bg-surface-2 px-3 py-2 text-sm outline-none placeholder:text-text-muted"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={pending}
              className="flex items-center gap-2 rounded-full neu-raised px-4 py-2 text-xs font-medium text-accent transition-transform hover:scale-[1.03] disabled:opacity-60"
            >
              {pending && <Loader2 size={13} className="animate-spin" />}
              {myReview ? "Update review" : "Post review"}
            </button>
            {myReview && (
              <button
                onClick={() => handleDelete(myReview.id)}
                disabled={pending}
                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-red-400"
              >
                <Trash2 size={13} /> Delete
              </button>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-text-muted">Sign in to leave a review.</p>
      )}

      <div className="mt-6 flex flex-col gap-5">
        {otherReviews.length === 0 && !myReview && ratingCount === 0 && (
          <p className="text-sm text-text-muted">Be the first to review this app.</p>
        )}
        {otherReviews.map((r) => (
          <div key={r.id} className="border-b border-border pb-4 last:border-none">
            <div className="flex items-center gap-2">
              <StarRating value={r.rating} size={13} />
              <span className="text-sm font-medium">
                {r.profiles?.full_name ?? "Anonymous"}
              </span>
              <span className="font-mono text-xs text-text-muted">
                {new Date(r.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            {r.comment && <p className="mt-1.5 text-sm text-text-muted">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
