import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight, FiShield, FiTruck, FiRefreshCw,
  FiAward, FiStar, FiClock, FiLock,
} from 'react-icons/fi';
import { productsAPI, categoriesAPI } from '../services/api';
import ProductCard    from '../components/ProductCard';
import ReviewCard     from '../components/ReviewCard';
import LoadingSpinner from '../components/LoadingSpinner';

/* ── Static Data ─────────────────────────────── */
const trustBadges = [
  {
    icon: FiTruck,
    title: 'Free Delivery',
    sub: 'Premium watch delivery in Nepal',
    accent: '#D4AF37',
    glow: 'radial-gradient(circle, rgba(212,175,55,0.18), transparent 48%)',
  },
  {
    icon: FiShield,
    title: 'Premium Authenticity',
    sub: 'Signed and certified timepieces',
    accent: '#2ec1a5',
    glow: 'radial-gradient(circle, rgba(46,193,165,0.16), transparent 48%)',
  },
  {
    icon: FiRefreshCw,
    title: 'Hassle-Free Returns',
    sub: 'Easy returns with priority support',
    accent: '#4f6dfd',
    glow: 'radial-gradient(circle, rgba(79,109,253,0.16), transparent 48%)',
  },
  {
    icon: FiAward,
    title: 'Luxury Warranty',
    sub: 'Extended coverage for every purchase',
    accent: '#ffb238',
    glow: 'radial-gradient(circle, rgba(255,178,56,0.16), transparent 48%)',
  },
];

const trustedBrands = [
  {
    name: 'Rolex',
    tagline: 'Crown of precision',
    image: 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  },
  {
    name: 'Omega',
    tagline: 'Born for the stars',
    image: 'https://images.pexels.com/photos/3809175/pexels-photo-3809175.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  },
  {
    name: 'Casio',
    tagline: 'Enduring reliability',
    image: 'https://images.pexels.com/photos/3651587/pexels-photo-3651587.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  },
  {
    name: 'Titan',
    tagline: 'Refined by design',
    image: 'https://images.pexels.com/photos/16739804/pexels-photo-16739804.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  },
  {
    name: 'Fossil',
    tagline: 'Modern heritage',
    image: 'https://images.pexels.com/photos/3419331/pexels-photo-3419331.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  },
  {
    name: 'Seiko',
    tagline: 'Built to inspire',
    image: 'https://images.pexels.com/photos/13190042/pexels-photo-13190042.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  },
];

const customerAvatars = {
  'Rahul Sharma': 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=200&w=200',
  'Aman Kumar': 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=200&w=200',
  'Priya Singh': 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=200&w=200',
};

const featuredCategories = [
  {
    name: 'Men Watches',
    match: 'men',
    count: '40+ Products',
    image: 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?cs=srgb&dl=pexels-ferarcosn-190819.jpg&fm=jpg',
  },
  {
    name: 'Women Watches',
    match: 'women',
    count: '32+ Products',
    image: 'https://images.pexels.com/photos/3419331/pexels-photo-3419331.jpeg?cs=srgb&dl=pexels-sairam-rasa-587546-3419331.jpg&fm=jpg',
  },
  {
    name: 'Sports Watches',
    match: 'sports',
    count: '28+ Products',
    image: 'https://images.pexels.com/photos/3651587/pexels-photo-3651587.jpeg?cs=srgb&dl=pexels-lucanardone-3651587.jpg&fm=jpg',
  },
];

const statsCounter = [
  { value: 500, suffix: '+', label: 'Premium Watches'      },
  { value: 15000, suffix: '+', label: 'Happy Customers'      },
  { value: 10, suffix: '+', label: 'Years Trusted'       },
  { value: 98, suffix: '%', label: 'Satisfaction Rate'    },
];

const reviews = [
  { name: 'Rahul Sharma', location: 'Birgunj, Nepal',   rating: 5,
    review: 'Excellent quality watches and fast delivery. The packaging felt truly premium.' },
  { name: 'Aman Kumar',   location: 'Kathmandu, Nepal', rating: 5,
    review: 'Premium packaging and authentic products. Exactly what a luxury watch store should feel like.' },
  { name: 'Priya Singh',  location: 'Pokhara, Nepal',   rating: 5,
    review: 'Best watch store experience in Nepal. The curation is impeccable.' },
];

const featuresList = [
  {
    icon: FiShield,
    title: 'Original Products',
    desc: 'Every timepiece is authenticated and certified for genuine luxury.',
    accent: 'from-gold-300 via-gold-400 to-amber-300',
    label: 'Authenticity badge',
  },
  {
    icon: FiLock,
    title: 'Secure Payments',
    desc: 'Encrypted checkout protected by trusted payment partners.',
    accent: 'from-blue-500 via-sky-400 to-indigo-500',
    label: 'Payment security',
  },
  {
    icon: FiTruck,
    title: 'Fast Delivery',
    desc: 'Luxury delivery across Nepal with careful concierge handling.',
    accent: 'from-gold-400 via-orange-300 to-amber-400',
    label: 'Premium shipping',
  },
  {
    icon: FiAward,
    title: 'Warranty Support',
    desc: 'Dedicated warranty coverage with white-glove support.',
    accent: 'from-gold-300 via-yellow-300 to-amber-400',
    label: 'Warranty seal',
  },
];

/* ── Section Heading ─────────────────────────── */
function SectionHeading({ eyebrow, title, subtitle, centered = true }) {
  return (
    <div className={`mb-14 ${centered ? 'text-center' : ''}`}>
      {eyebrow && (
        <div className={`flex items-center gap-3 mb-4 ${centered ? 'justify-center' : ''}`}>
          <div className="h-px w-8 bg-gold-400/60" />
          <p className="text-gold-400 text-xs font-semibold tracking-[0.35em] uppercase">
            {eyebrow}
          </p>
          <div className="h-px w-8 bg-gold-400/60" />
        </div>
      )}
      <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-lg mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ── Component ───────────────────────────────── */
export default function Home() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingP,   setLoadingP]   = useState(true);
  const [loadingC,   setLoadingC]   = useState(true);
  const [email,      setEmail]      = useState('');
  const [statDisplay, setStatDisplay] = useState([0, 0, 0, 0]);
  const [activeReview, setActiveReview] = useState(0);
  const reviewCardsRef = useRef([]);
  const reviewTrackRef = useRef(null);

  useEffect(() => {
    productsAPI.getAll({ limit: 8, page: 1 })
      .then(({ data }) => setProducts(data.data.products || []))
      .catch(() => {})
      .finally(() => setLoadingP(false));

    categoriesAPI.getAll()
      .then(({ data }) => setCategories(data.data.categories || []))
      .catch(() => {})
      .finally(() => setLoadingC(false));
  }, []);

  useEffect(() => {
    const targets = statsCounter.map((stat) => stat.value);
    const steps = 45;
    const duration = 1200;
    const increment = targets.map((value) => value / steps);
    let step = 0;

    const timer = setInterval(() => {
      step += 1;
      setStatDisplay((current) => current.map((value, index) => {
        const next = Math.min(Math.round(value + increment[index]), targets[index]);
        return next;
      }));

      if (step >= steps) {
        clearInterval(timer);
        setStatDisplay(targets);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const carouselTimer = setInterval(() => {
      setActiveReview((current) => (current + 1) % reviews.length);
    }, 5200);

    return () => clearInterval(carouselTimer);
  }, []);

  useEffect(() => {
    const card = reviewCardsRef.current[activeReview];
    const container = reviewTrackRef.current;
    if (card && container) {
      const cardLeft = card.offsetLeft;
      const containerWidth = container.clientWidth;
      const cardWidth = card.clientWidth;
      const scrollTarget = cardLeft - (containerWidth / 2) + (cardWidth / 2);
      container.scrollTo({ left: scrollTarget, behavior: 'smooth' });
    }
  }, [activeReview]);

  const formatStat = (value, suffix) => {
    if (suffix === '+' && value >= 1000) {
      return `${Math.round(value / 1000)}K${suffix}`;
    }
    return `${value}${suffix}`;
  };

  return (
    <div className="bg-dark-500 overflow-hidden">

      {/* ═══════════════════════════════════════
          HERO — Mobile-first luxury showcase
      ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-dark-500">

        {/* Layered backgrounds */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 90% 80% at 50% 40%, rgba(26,20,0,0.95) 0%, #080808 100%)' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(212,175,55,0.05) 0%, transparent 60%), radial-gradient(circle at 30% 80%, rgba(212,175,55,0.03) 0%, transparent 50%)' }} />

        {/* Decorative vertical rule — desktop only */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold-400/15 to-transparent hidden lg:block" style={{ left: '8%' }} />

        {/* Main Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12 w-full">
          
          {/* Mobile: Stacked layout | Desktop: Grid layout */}
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-16 items-center">

            {/* Left Column — Text Content */}
            <div className="animate-fade-in-up order-2 lg:order-1">

              {/* Eyebrow with decorative line */}
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="h-px w-10 sm:w-12 bg-gold-400/80" />
                <p className="text-gold-400 text-xs font-semibold tracking-[0.4em] uppercase leading-none">
                  New Collection 2025
                </p>
              </div>

              {/* Main headline — Responsive sizing */}
              <h1 className="font-serif font-bold text-white leading-[1.1] sm:leading-[1.05] mb-3 sm:mb-4 md:mb-5" style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)' }}>
                Time Is<br />
                <span className="text-gradient-gold italic">Your Legacy</span>
              </h1>

              {/* Subheadline */}
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-5 sm:mb-6 md:mb-7 max-w-md" style={{ fontWeight: 300, letterSpacing: '0.005em' }}>
                Curated timepieces from the world's finest watchmakers — delivered with care to every corner of Nepal.
              </p>

              {/* CTA Buttons — Mobile stacked, desktop inline */}
              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <Link
                  to="/products"
                  className="group flex items-center justify-center sm:justify-start gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-gold-400 to-gold-300 text-black text-sm font-bold rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-[0_12px_40px_rgba(212,175,55,0.35)] hover:-translate-y-0.5 active:translate-y-0"
                  style={{ minHeight: '44px' }}
                >
                  <span>Shop Collection</span>
                  <FiArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/products"
                  className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 text-white text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-300 hover:bg-white/8 active:bg-white/12"
                  style={{ border: '1.5px solid rgba(212,175,55,0.4)', minHeight: '44px' }}
                >
                  <span>Explore All</span>
                </Link>
              </div>

              {/* Quick Stats — Compact mobile, expanded desktop */}
              <div className="flex gap-3 sm:gap-6 pt-5 sm:pt-6 md:pt-8 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                {[['500+', 'Watches'], ['15K+', 'Customers'], ['10+', 'Years']].map(([num, label], i) => (
                  <div key={label} className="flex flex-col gap-1">
                    <p className="font-serif text-lg sm:text-2xl md:text-3xl font-bold text-gradient-gold leading-none">{num}</p>
                    <p className="text-gray-500 text-xs tracking-wider uppercase leading-none">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column — Watch Showcase */}
            <div className="flex items-center justify-center order-1 lg:order-2 -mx-4 sm:-mx-6 md:mx-0 px-4 sm:px-6 md:px-0">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96">

                {/* Outer glow ring */}
                <div
                  className="absolute inset-0 rounded-full animate-pulse-slow"
                  style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 75%)', transform: 'scale(1.25)' }}
                />

                {/* Rotating decorative ring */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: '1px dashed rgba(212,175,55,0.15)',
                    animation: 'spin 45s linear infinite',
                  }}
                />

                {/* Main ring container */}
                <div
                  className="absolute inset-4 rounded-full flex items-center justify-center"
                  style={{ border: '1px solid rgba(212,175,55,0.2)', background: 'rgba(13,10,0,0.5)' }}
                >
                  {/* Watch showcase — Premium video fallback to image */}
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full overflow-hidden group" style={{ border: '2px solid rgba(212,175,55,0.3)' }}>
                    
                    <img
                      src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80"
                      alt="Premium Luxury Watch"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    
                    />
                    {/* Subtle shine overlay */}
                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br from-white via-transparent to-transparent" />
                  </div>
                </div>

                {/* Floating badge — top right */}
                <div
                  className="absolute -top-1 -right-1 sm:top-2 sm:right-2 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5"
                  style={{ background: '#111', border: '1px solid rgba(212,175,55,0.4)', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
                >
                  <p className="text-gold-400 font-bold text-xs sm:text-sm leading-none">★ 4.9</p>
                  <p className="text-gray-500 text-xs mt-0.5 leading-none">Top Rated</p>
                </div>

                {/* Floating badge — bottom left */}
                <div
                  className="absolute -bottom-1 -left-1 sm:bottom-2 sm:left-2 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5"
                  style={{ background: '#111', border: '1px solid rgba(212,175,55,0.4)', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
                >
                  <p className="text-white font-semibold text-xs sm:text-sm leading-none">New Arrivals</p>
                  <p className="text-gold-400 text-xs mt-0.5 leading-none">Weekly drops</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16" style={{ background: 'linear-gradient(to bottom, transparent, #080808)' }} />
      </section>

      {/* ═══════════════════════════════════════
          DELIVERY & TRUST — Premium spotlight
      ═══════════════════════════════════════ */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#060606]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-8 shadow-[0_35px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.16),_transparent_32%)] pointer-events-none" />
            <div className="absolute right-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-gradient-to-r from-gold-400/15 to-transparent blur-3xl pointer-events-none" />
            <div className="absolute left-0 bottom-10 h-52 w-52 rounded-full bg-gradient-to-br from-white/10 via-gold-200/10 to-transparent blur-3xl pointer-events-none" />
            <div className="relative grid gap-8 lg:grid-cols-[1.5fr_1fr] items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3">
                  <span className="h-px w-16 bg-gold-400/50" />
                  <p className="text-gold-400 text-xs font-semibold tracking-[0.45em] uppercase">Premium shipping</p>
                </div>
                <h2 className="font-serif text-4xl lg:text-5xl text-white font-bold leading-tight max-w-2xl">
                  Premium shipping services crafted for every luxury timepiece.
                </h2>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-xl">
                  Every order is packed in premium protection and delivered with the precision expected from a world-class watch boutique.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="inline-flex items-center gap-3 rounded-full bg-white/5 border border-gold-400/15 px-5 py-3 shadow-[0_10px_40px_rgba(212,175,55,0.08)]">
                    <FiTruck className="text-gold-400" size={18} />
                    <span className="text-gray-200 text-sm">Fast & Secure Delivery Across Nepal</span>
                  </div>
                  <div className="inline-flex items-center gap-3 rounded-full bg-black/40 border border-white/10 px-5 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
                    <FiShield className="text-gold-400" size={18} />
                    <span className="text-gray-200 text-sm">Luxury packaging with certified authenticity</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -top-8 -right-8 h-5 w-5 rounded-full bg-gold-400/90 shadow-[0_0_40px_rgba(212,175,55,0.5)] animate-pulse-slow" />
                <div className="absolute top-10 right-14 h-4 w-4 rounded-full bg-white/70 blur-xl" />
                <div className="absolute bottom-8 left-10 h-3 w-3 rounded-full bg-gold-300/80 blur-xl" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111] shadow-[0_22px_90px_rgba(0,0,0,0.4)] group">
                  <img
                    src="https://images.pexels.com/photos/32339442/pexels-photo-32339442.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                    alt="Premium watch packaging"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    style={{ transformOrigin: 'center center' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.16),_transparent_45%)] opacity-80 pointer-events-none" />
                  <div className="absolute inset-0 pointer-events-none">
                    <div
                      className="absolute left-[-20%] top-1/3 h-24 w-2/3 rounded-full bg-white/20 opacity-30 blur-2xl animate-shimmer"
                      style={{ animationDuration: '3.5s', animationDelay: '0.4s' }}
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <div className="rounded-3xl bg-black/70 border border-white/10 p-4 backdrop-blur-xl">
                      <p className="text-gold-300 uppercase text-[0.65rem] tracking-[0.35em] mb-2">Premium packaging</p>
                      <p className="text-white text-sm leading-snug">Every watch arrives in a handcrafted luxury box with concierge-grade handling.</p>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-gold-400/70 to-transparent opacity-80" />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:gap-5 mt-8 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
            {trustBadges.map(({ icon: Icon, title, sub, accent, glow }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-2 hover:border-gold-300/40 hover:shadow-[0_24px_90px_rgba(212,175,55,0.22)]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_60%)] opacity-60 pointer-events-none" />
                <div
                  className="absolute inset-x-6 top-6 h-24 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: glow }}
                />
                <div className="relative flex items-start gap-4 mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-black/50 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: accent }}>
                      <Icon className="text-black" size={20} />
                    </div>
                  </div>
                  <div>
                    <p className="text-gold-300 text-xs uppercase tracking-[0.35em] font-semibold mb-2">{title}</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{sub}</p>
                  </div>
                </div>
                <div className="relative mt-auto inline-flex items-center gap-2 text-gold-200 font-semibold text-sm">
                  <span className="inline-block h-1.5 w-10 rounded-full bg-gradient-to-r from-transparent via-gold-300 to-transparent" />
                  <span className="opacity-90">Learn More</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          STATISTICS — Monumental numbers
      ═══════════════════════════════════════ */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[#060606]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {statsCounter.map((stat, i) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-10 text-center shadow-[0_18px_70px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-2 hover:border-gold-300/40 hover:shadow-[0_24px_100px_rgba(212,175,55,0.18)]"
              >
                <div className="absolute inset-x-10 top-10 h-28 rounded-full bg-gradient-to-b from-gold-300/25 to-transparent opacity-70 blur-2xl pointer-events-none" />
                <div className="relative z-10">
                  <p className="text-gold-300 uppercase tracking-[0.35em] text-xs mb-5">{stat.label}</p>
                  <p className="font-serif text-5xl md:text-6xl font-bold text-white mb-5">{formatStat(statDisplay[i], stat.suffix)}</p>
                  <div className="h-px bg-gold-400/30 mx-auto mb-5 w-16 rounded-full" />
                  <p className="text-gray-400 text-sm leading-relaxed max-w-[12rem] mx-auto">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CATEGORIES — Editorial showcase cards
      ═══════════════════════════════════════ */}
      {(categories.length > 0 || loadingC) && (
        <section className="py-16 sm:py-20 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Collections"
            title="Shop by Category"
            subtitle="From classic dress watches to rugged sports models — every collection tells a story."
          />

          {loadingC ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {featuredCategories.map((card) => {
                const matchedCategory = categories.find((cat) =>
                  cat.name.toLowerCase().includes(card.match) ||
                  card.name.toLowerCase().includes(cat.name.toLowerCase())
                );
                return (
                  <Link
                    key={card.name}
                    to={matchedCategory ? `/products?category=${matchedCategory._id}` : '/products'}
                    className="group relative overflow-hidden rounded-[1.75rem] transition-all duration-300 hover:-translate-y-1.5"
                    style={{
                      minHeight: 340,
                      boxShadow: '0 4px 40px rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${card.image})` }}
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.78) 100%)' }} />
                    <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:opacity-0" />
                    <div className="absolute inset-0 rounded-[1.75rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ border: '1px solid rgba(212,175,55,0.28)' }} />
                    <div className="absolute inset-0 p-8 flex flex-col justify-between">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.35em] text-gold-200 font-semibold mb-4 border border-white/10">
                          <FiClock size={12} />
                          {card.count}
                        </div>
                      </div>
                      <div>
                        <p className="text-gold-400/80 text-xs tracking-[0.3em] uppercase mb-2 font-medium">Category</p>
                        <h3 className="font-serif text-white font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
                          {card.name}
                        </h3>
                        <div className="flex items-center gap-2 text-gold-300 text-sm font-semibold group-hover:gap-3 transition-all duration-300">
                          <span>Explore</span>
                          <FiArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="text-center mt-8 sm:mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gold-300 transition-colors duration-200 group"
            >
              View all collections
              <FiArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          TRUSTED BRANDS — Sophisticated grid
      ═══════════════════════════════════════ */}
      <section className="py-16 sm:py-20 lg:py-24" style={{ background: '#0a0a0a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Heritage Partners"
            title="Brands We Carry"
            subtitle="We partner exclusively with watchmakers celebrated for precision, heritage, and lasting craft."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5">
            {trustedBrands.map(({ name, tagline, image }) => (
              <div
                key={name}
                className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-2 hover:border-gold-300/40 hover:shadow-[0_24px_120px_rgba(212,175,55,0.18)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 pointer-events-none" />
                <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 mb-5 h-44 transition-transform duration-500 group-hover:scale-[1.03]">
                  <img
                    src={image}
                    alt={`${name} watch`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-xs uppercase tracking-[0.35em] text-gold-300 font-semibold">
                    {name}
                  </div>
                </div>
                <div className="relative z-10">
                  <p className="text-gold-300 text-xs uppercase tracking-[0.35em] mb-2">Premium Heritage</p>
                  <h3 className="font-serif text-white text-xl font-bold mb-3 leading-tight">{name}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-5">{tagline}</p>
                  <div className="inline-flex items-center gap-2 text-gold-300 text-sm font-semibold">
                    <FiStar size={16} />
                    Premium Craftsmanship
                  </div>
                </div>
                <div className="absolute inset-x-6 bottom-5 h-px rounded-full bg-gradient-to-r from-transparent via-gold-300 to-transparent opacity-80" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PRODUCTS — Premium grid
      ═══════════════════════════════════════ */}
      <section className="py-16 sm:py-20 lg:py-24 bg-dark-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Trending Now"
            title="Bestselling Timepieces"
            subtitle="Our most loved watches, hand-picked by watch enthusiasts across Nepal."
          />
          {loadingP ? (
            <LoadingSpinner />
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              <div className="text-center mt-10 sm:mt-12 lg:mt-14">
                <Link
                  to="/products"
                  className="group inline-flex items-center gap-3 px-10 py-4 text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-gold-400 hover:text-black hover:border-gold-400"
                  style={{ color: '#d4af37', border: '1px solid rgba(212,175,55,0.35)' }}
                >
                  View All Products
                  <FiArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-600 text-sm">No products yet. Add some from the admin panel.</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          REVIEWS — Editorial testimonials
      ═══════════════════════════════════════ */}
      <section className="py-16 sm:py-20 lg:py-24" style={{ background: '#080808' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-gold-400/10 bg-[rgba(255,255,255,0.03)] p-10 mb-12">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.14),_transparent_40%)]" />
            <div className="relative text-center">
              <p className="text-gold-400 text-xs font-semibold tracking-[0.35em] uppercase mb-4">Trusted By Customers</p>
              <h2 className="font-serif text-4xl md:text-5xl text-white font-bold mb-4 leading-tight">
                Luxury Timepieces Loved Across Nepal
              </h2>
              <p className="mx-auto max-w-2xl text-gray-400 text-sm md:text-base leading-relaxed">
                Premium watches chosen by customers who value craftsmanship, elegance and reliability.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { label: '15K+ Happy Customers', detail: 'Trusted by watch lovers nationwide' },
              { label: '98% Satisfaction', detail: 'Confidence in every purchase' },
              { label: '4.9/5 Average Rating', detail: 'Luxury service that exceeds expectations' },
              { label: 'Fast Delivery Across Nepal', detail: 'Premium shipping with care' },
            ].map((metric) => (
              <div
                key={metric.label}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/30 hover:shadow-[0_20px_80px_rgba(212,175,55,0.12)]"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent rounded-full opacity-70" />
                <p className="text-gold-300 text-xs font-semibold uppercase tracking-[0.25em] mb-3">{metric.label}</p>
                <p className="text-gray-300 text-sm leading-relaxed">{metric.detail}</p>
              </div>
            ))}
          </div>

          <div
            ref={reviewTrackRef}
            className="relative flex gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {reviews.map((review, index) => (
              <div
                key={review.name}
                ref={(el) => { reviewCardsRef.current[index] = el; }}
                className={`snap-center min-w-[320px] sm:min-w-[360px] lg:min-w-[420px] relative overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-8 shadow-[0_18px_90px_rgba(0,0,0,0.25)] transition-all duration-500 ${activeReview === index ? 'border-gold-300/40 shadow-[0_28px_140px_rgba(212,175,55,0.28)]' : 'hover:-translate-y-2 hover:border-gold-300/30 hover:shadow-[0_24px_120px_rgba(212,175,55,0.18)]'}`}
                style={{ minHeight: 460 }}
              >
                <div className={`absolute inset-0 rounded-[2rem] ${activeReview === index ? 'bg-gold-400/10 blur-xl opacity-60' : 'opacity-0'} transition-all duration-500`} />
                <div className="absolute top-6 right-6 text-gold-400 text-[6rem] leading-none font-serif opacity-10 select-none">“</div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FiStar key={i} className="text-gold-400" size={18} />
                      ))}
                    </div>
                    <div className="rounded-full bg-black/60 px-3 py-1 text-[0.75rem] uppercase tracking-[0.3em] text-gold-300 font-semibold border border-white/10">
                      4.9/5
                    </div>
                  </div>

                  <p className="text-gray-200 text-base leading-relaxed mb-10" style={{ fontStyle: 'italic', lineHeight: 1.95 }}>
                    {review.review}
                  </p>

                  <div className="mt-auto pt-5 border-t border-white/10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <img
                          src={customerAvatars[review.name]}
                          alt={review.name}
                          className="w-20 h-20 rounded-full object-cover border-2 border-gold-400 shadow-[0_16px_50px_rgba(0,0,0,0.28)]"
                        />
                        <span className="absolute bottom-0 right-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black border border-gold-400 text-[0.75rem] text-gold-400 font-semibold shadow-[0_0_0_4px_rgba(0,0,0,0.18)]">
                          ✓
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{review.name}</p>
                        <div className="flex flex-wrap items-center gap-2 text-gray-400 text-xs">
                          <span>Verified Customer</span>
                          <span className="h-1 w-1 rounded-full bg-gray-500 inline-block" />
                          <span>{review.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 text-gold-200 text-xs font-semibold uppercase tracking-[0.28em]">
                      <span className="h-1 w-10 rounded-full bg-gradient-to-r from-gold-300 to-transparent" />
                      Customer story
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          WHY US — Feature cards
      ═══════════════════════════════════════ */}
      <section className="py-16 sm:py-20 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The Sharma Promise"
          title="Why Discerning Buyers Choose Us"
          subtitle="More than a watch store — a commitment to authenticity, quality, and your satisfaction."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuresList.map(({ icon: Icon, title, desc, accent, label }, index) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-8 shadow-[0_18px_90px_rgba(0,0,0,0.20)] transition-all duration-300 hover:-translate-y-2 hover:border-gold-300/40 hover:shadow-[0_24px_120px_rgba(212,175,55,0.24)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_55%)] opacity-80 pointer-events-none" />
              <div className="absolute -top-5 -right-5 h-20 w-20 rounded-full bg-white/10 blur-2xl opacity-60" />
              <div className="absolute -bottom-6 left-8 h-12 w-12 rounded-full bg-gold-300/15 blur-2xl" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br ${accent} text-black shadow-[0_10px_30px_rgba(0,0,0,0.25)]`}>
                    <Icon size={24} className="text-black" />
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-gold-300 border border-white/10">
                    {label}
                  </div>
                </div>

                <h3 className="font-serif text-white text-xl font-semibold mb-3 leading-tight">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-8">{desc}</p>

                <div className="mt-auto">
                  <div className="h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-50 mb-5" />
                  <p className="text-gray-500 text-sm leading-relaxed">Luxury service crafted with detail, security, and aftercare for every buyer.</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-5 mt-10 sm:grid-cols-2 lg:grid-cols-4">
          {statsCounter.map((stat, i) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-8 text-center shadow-[0_18px_90px_rgba(0,0,0,0.20)] transition-all duration-300 hover:-translate-y-2 hover:border-gold-300/40 hover:shadow-[0_24px_100px_rgba(212,175,55,0.22)]"
            >
              <div className="absolute inset-x-10 top-10 h-24 rounded-full bg-gradient-to-b from-gold-300/20 to-transparent opacity-70 blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <p className="text-gold-300 uppercase tracking-[0.35em] text-xs mb-5">{stat.label}</p>
                <p className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">{formatStat(statDisplay[i], stat.suffix)}</p>
                <div className="h-px bg-gold-400/30 mx-auto mb-4 w-16 rounded-full" />
                <p className="text-gray-400 text-sm leading-relaxed">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          BRAND STORY — Editorial two-column
      ═══════════════════════════════════════ */}
      <section className="py-16 sm:py-20 lg:py-24 bg-dark-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Image side */}
            <div className="relative">
              <div
                className="aspect-square max-w-md mx-auto lg:mx-0 rounded-3xl overflow-hidden"
                style={{ border: '1px solid rgba(212,175,55,0.2)' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=700&h=700&fit=crop&q=85"
                  alt="Our Story"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>

              {/* Floating stat card */}
              <div
                className="absolute -bottom-5 -right-0 lg:-right-6 rounded-2xl p-5"
                style={{ background: '#0d0d0d', border: '1px solid rgba(212,175,55,0.3)', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}
              >
                <p className="font-serif text-4xl font-bold text-gradient-gold leading-none">15+</p>
                <p className="text-gray-500 text-xs mt-1.5 tracking-wider uppercase">Years of Excellence</p>
              </div>
            </div>

            {/* Text side */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px w-10 bg-gold-400" />
                <p className="text-gold-400 text-xs font-semibold tracking-[0.35em] uppercase">Our Story</p>
              </div>

              <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                A Legacy Built<br />On Precision
              </h2>

              <p className="text-gray-400 leading-relaxed mb-5 text-sm" style={{ fontWeight: 300 }}>
                Founded with a single vision: to bring world-class timepieces to watch enthusiasts across Nepal at fair, transparent prices. Every watch we stock carries a certificate of authenticity.
              </p>
              <p className="text-gray-400 leading-relaxed mb-10 text-sm" style={{ fontWeight: 300 }}>
                From a small showroom in Birgunj to a trusted destination across Nepal — over 500 watches, 15,000+ satisfied customers, and a promise that hasn't changed since day one.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-gold-400 text-black text-sm font-bold rounded-xl hover:bg-gold-300 transition-all duration-200"
                >
                  Explore Collection <FiArrowRight size={14} />
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center justify-center gap-2 px-8 py-4 text-gray-300 text-sm font-medium rounded-xl hover:text-white transition-all duration-200"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          NEWSLETTER — Minimal & elegant
      ═══════════════════════════════════════ */}
      <section className="py-16 sm:py-20 lg:py-24" style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">

          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-8 bg-gold-400/60" />
            <p className="text-gold-400 text-xs font-semibold tracking-[0.35em] uppercase">Stay Updated</p>
            <div className="h-px w-8 bg-gold-400/60" />
          </div>

          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            First to Know.<br />First to Own.
          </h2>
          <p className="text-gray-500 text-sm mb-10 leading-relaxed">
            Get early access to new arrivals, limited editions, and exclusive members-only offers.
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); setEmail(''); }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-5 py-3.5 text-white text-sm rounded-xl placeholder-gray-600 focus:outline-none transition-all"
              style={{
                background: '#161616',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(212,175,55,0.45)'; }}
              onBlur={(e)  => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
            <button
              type="submit"
              className="px-7 py-3.5 bg-gold-400 text-black text-sm font-bold rounded-xl hover:bg-gold-300 transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>

          <p className="text-gray-700 text-xs mt-5">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CONTACT CTA — Clean closer
      ═══════════════════════════════════════ */}
      <section
        className="py-10 sm:py-12 lg:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-white mb-1.5">
              Have a Question?
            </h3>
            <p className="text-gray-500 text-sm">Our team is here to help you find the perfect watch.</p>
          </div>
          <Link
            to="/contact"
            className="group flex items-center gap-3 px-8 py-4 text-gold-400 text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-300 hover:bg-gold-400 hover:text-black"
            style={{ border: '1px solid rgba(212,175,55,0.35)' }}
          >
            Get in Touch
            <FiArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </section>

    </div>
  );
}