"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import HeroIllustration from "@/components/HeroIllustration";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const, delay: i * 0.1 },
  }),
};

export default function HeroSection() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="aurora-blob left-[-10%] top-[-20%] h-[420px] w-[420px]" />
      <div className="aurora-blob right-[-15%] top-[10%] h-[360px] w-[360px]" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 pt-16 pb-16 sm:pt-24 lg:grid-cols-2 lg:gap-8">
        <div>
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-text-muted"
          >
            A NexAuras product
          </motion.p>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          >
            The <span className="aurora-text">ultimate</span>
            <br />
            app sharing platform.
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-lg text-base text-text-muted sm:text-lg"
          >
            Discover, download, and track apps — all in one place. Live on the
            web today, with native Android and desktop apps arriving next.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/shop"
              className="flex items-center gap-2 rounded-full neu-raised px-6 py-3 text-sm font-medium text-accent transition-transform hover:scale-[1.03]"
            >
              Start Now <ArrowRight size={15} />
            </Link>
            {user ? (
              <Link
                href="/downloads"
                className="glass-card aurora-border rounded-full px-6 py-3 text-sm font-medium transition-transform hover:scale-[1.03]"
              >
                My Downloads
              </Link>
            ) : (
              <Link
                href="/signup"
                className="glass-card aurora-border rounded-full px-6 py-3 text-sm font-medium transition-transform hover:scale-[1.03]"
              >
                Create an account
              </Link>
            )}
          </motion.div>
        </div>

        <HeroIllustration />
      </div>
    </section>
  );
}
