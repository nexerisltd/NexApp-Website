"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function submitReview({
  appId,
  slug,
  rating,
  comment,
}: {
  appId: string;
  slug: string;
  rating: number;
  comment: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to sign in to leave a review." };
  }
  if (rating < 1 || rating > 5) {
    return { error: "Pick a rating between 1 and 5 stars." };
  }
  if (!comment.trim()) {
    return { error: "Please add a short comment with your rating." };
  }

  const { error } = await supabase.from("reviews").upsert(
    {
      app_id: appId,
      user_id: user.id,
      rating,
      comment: comment.trim(),
    },
    { onConflict: "app_id,user_id" }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/shop/${slug}`);
  return { error: null };
}

export async function deleteReview({ reviewId, slug }: { reviewId: string; slug: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to sign in." };
  }

  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/shop/${slug}`);
  return { error: null };
}
