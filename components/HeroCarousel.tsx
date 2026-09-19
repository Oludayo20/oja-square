"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Percent,
  ShieldCheck,
  Sparkles,
  Store as StoreIcon,
  Tag,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { getSignupAsStoreOwnerUrl } from "@/lib/oja-links";

type Slide = {
  badge: string;
  icon: LucideIcon;
  title: React.ReactNode;
  body: string;
  cta: string;
  href: string;
  external?: boolean;
  bg: string;
};

const AUTOPLAY_MS = 6000;

export default function HeroCarousel() {
  const slides: Slide[] = [
    {
      badge: "Oja Square",
      icon: Sparkles,
      title: (
        <>
          Every store. <br />
          <span className="oja-shimmer-text">One Square.</span>
        </>
      ),
      body: "Browse products from every independent merchant on Oja, then buy straight from the store that sells it.",
      cta: "Start browsing",
      href: "/products",
      bg: "bg-teal-600",
    },
    {
      badge: "Deals",
      icon: Percent,
      title: "Discounts from every store.",
      body: "See every product currently on sale across Oja, in one feed.",
      cta: "Shop deals",
      href: "/products?hasDiscount=true",
      bg: "bg-gradient-to-br from-orange-500 to-pink-500",
    },
    {
      badge: "Just landed",
      icon: Zap,
      title: "Fresh arrivals, every day.",
      body: "The newest products merchants have listed, before everyone else sees them.",
      cta: "See what's new",
      href: "/products?sortBy=createdAt:desc",
      bg: "bg-gradient-to-br from-indigo-500 to-violet-600",
    },
    {
      badge: "Stores",
      icon: StoreIcon,
      title: "Discover stores you'll love.",
      body: "Browse independent merchants, from established names to brand new shops.",
      cta: "Explore stores",
      href: "/stores",
      bg: "bg-gradient-to-br from-teal-700 to-emerald-600",
    },
    {
      badge: "Categories",
      icon: Tag,
      title: "Shop by what you need.",
      body: "Fashion, electronics, home, beauty and more, across every store at once.",
      cta: "Browse categories",
      href: "/categories",
      bg: "bg-gradient-to-br from-sky-500 to-teal-600",
    },
    {
      badge: "Safe to buy",
      icon: ShieldCheck,
      title: "Only in-stock, active listings.",
      body: "If it's here, you can buy it. Checkout is secured with Paystack.",
      cta: "Start browsing",
      href: "/products",
      bg: "bg-gradient-to-br from-teal-600 to-cyan-700",
    },
    {
      badge: "For merchants",
      icon: StoreIcon,
      title: "Sell on Oja, get found here.",
      body: "Open your store and your active products show up on Oja Square automatically.",
      cta: "Open your store",
      href: getSignupAsStoreOwnerUrl(),
      external: true,
      bg: "bg-gradient-to-br from-amber-500 to-orange-600",
    },
  ];

  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [index, setIndex] = useState(0);

  const goTo = useCallback((next: number) => {
    const el = trackRef.current;
    if (!el) return;
    const count = el.children.length;
    const target = (next + count) % count;
    el.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
  }, []);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (pausedRef.current || document.hidden) return;
      const el = trackRef.current;
      if (!el) return;
      const current = Math.round(el.scrollLeft / el.clientWidth);
      goTo(current + 1);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [goTo]);

  const pause = () => {
    pausedRef.current = true;
  };
  const resume = () => {
    pausedRef.current = false;
  };

  return (
    <div
      className="group/carousel relative min-w-0 flex-1 overflow-hidden rounded-2xl shadow-2xl shadow-teal-600/20"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured on Oja Square"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="scrollbar-hide flex h-full snap-x snap-mandatory overflow-x-auto"
      >
        {slides.map((slide, i) => {
          const Icon = slide.icon;
          const Heading = i === 0 ? "h1" : "h2";
          const cta = (
            <>
              {slide.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </>
          );
          const ctaClass =
            "group/btn inline-flex w-fit min-h-[44px] items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-700 text-teal-700 shadow-lg transition-all hover:bg-teal-50";

          return (
            <div
              key={slide.badge}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}`}
              className={`relative h-full w-full shrink-0 snap-center overflow-hidden ${slide.bg}`}
            >
              <div className="oja-grid-bg absolute inset-0 opacity-40" />
              <Icon
                aria-hidden
                className="absolute -right-6 -top-6 h-40 w-40 text-white/10 sm:h-56 sm:w-56"
              />
              <div className="relative flex h-full flex-col justify-center px-8 pb-10 md:px-12">
                <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[11px] font-600 uppercase tracking-widest text-white">
                  <Icon className="h-3 w-3" />
                  {slide.badge}
                </span>
                <Heading className="oja-display mb-4 max-w-lg text-3xl font-800 leading-tight text-white md:text-4xl lg:text-5xl">
                  {slide.title}
                </Heading>
                <p className="mb-8 hidden max-w-sm text-sm text-white/90 sm:block">
                  {slide.body}
                </p>
                {slide.external ? (
                  <a href={slide.href} className={ctaClass}>
                    {cta}
                  </a>
                ) : (
                  <Link href={slide.href} className={ctaClass}>
                    {cta}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => goTo(index - 1)}
        className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur transition-opacity hover:bg-white/35 focus:opacity-100 group-hover/carousel:opacity-100 sm:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => goTo(index + 1)}
        className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur transition-opacity hover:bg-white/35 focus:opacity-100 group-hover/carousel:opacity-100 sm:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {slides.map((slide, i) => (
          <button
            key={slide.badge}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
