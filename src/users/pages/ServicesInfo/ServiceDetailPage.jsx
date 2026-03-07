import React, { useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  ChevronRight,
  Clock,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  FileText,
  Sparkles,
  ChevronDown,
  MapPin,
  Phone,
  CalendarClock,
  ShieldCheck,
  ClipboardList,
  Footprints,
  BadgeCheck,
  ExternalLink,
} from "lucide-react";
import servicesData, { servicesList } from "./servicesData";

/* ────────────────────────────────────────
   Animation Variants
   ──────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: i * 0.08,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const slideFromLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

/* Reusable section wrapper that animates on scroll */
const AnimatedSection = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeUp}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ────────────────────────────────────────
   Floating particles background
   ──────────────────────────────────────── */
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-white/10"
        style={{
          width: 8 + Math.random() * 20,
          height: 8 + Math.random() * 20,
          left: `${10 + Math.random() * 80}%`,
          top: `${10 + Math.random() * 80}%`,
        }}
        animate={{
          y: [0, -30 - Math.random() * 40, 0],
          x: [0, 15 * (Math.random() > 0.5 ? 1 : -1), 0],
          opacity: [0.2, 0.6, 0.2],
        }}
        transition={{
          duration: 4 + Math.random() * 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: Math.random() * 3,
        }}
      />
    ))}
  </div>
);

/* ────────────────────────────────────────
   Step Number Badge
   ──────────────────────────────────────── */
const StepBadge = ({ number }) => (
  <div className="relative flex-shrink-0">
    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200/50">
      <span className="text-white font-extrabold text-xl sm:text-2xl">
        {String(number).padStart(2, "0")}
      </span>
    </div>
    {/* glow ring */}
    <motion.div
      className="absolute inset-0 rounded-2xl bg-emerald-400/20"
      animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

/* ────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────── */
export default function ServiceDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const service = servicesData[slug];

  // Parallax for hero
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  /* ── 404: service not found ── */
  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <FileText className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Service Not Found
          </h1>
          <p className="text-gray-500 mb-8">
            The service you're looking for doesn't exist or may have been moved.
          </p>
          <Link
            to="/services-info"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
        </motion.div>
      </div>
    );
  }

  const Icon = service.icon || FileText;

  // Find prev / next service for navigation
  const currentIdx = servicesList.findIndex((s) => s.slug === slug);
  const prevService = currentIdx > 0 ? servicesList[currentIdx - 1] : null;
  const nextService =
    currentIdx < servicesList.length - 1
      ? servicesList[currentIdx + 1]
      : null;

  return (
    <>
      <Helmet>
        <title>{service.title} — Barangay Culiat</title>
        <meta name="description" content={service.tagline} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        {/* ═══════════════════════════════════════
            HERO SECTION
            ═══════════════════════════════════════ */}
        <section
          ref={heroRef}
          className="relative bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden"
        >
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-[0.07]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
          </div>

          <FloatingParticles />

          {/* Gradient orbs */}
          <motion.div
            className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[100px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-teal-500/15 blur-[80px]"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative max-w-6xl mx-auto px-4 sm:px-6"
          >
            {/* Breadcrumb */}
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 text-sm text-white/60 mb-8"
            >
              <Link
                to="/"
                className="hover:text-white transition-colors"
              >
                HOME
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link
                to="/services-info"
                className="hover:text-white transition-colors"
              >
                SERVICES
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-emerald-400 font-medium uppercase tracking-wide">
                {service.title}
              </span>
            </motion.nav>

            {/* Title area */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="max-w-2xl">
                {/* Category pill */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-sm rounded-full px-4 py-1.5 mb-5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-300 tracking-wider uppercase">
                    {service.category}
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.6 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight"
                >
                  {service.title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-5 text-lg sm:text-xl text-white/70 leading-relaxed max-w-xl"
                >
                  {service.tagline}
                </motion.p>
              </div>

              {/* Icon + quick stats card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.55, type: "spring", damping: 20 }}
                className="flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8"
              >
                <div className="flex items-center gap-5 mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-white/50 text-xs font-medium uppercase tracking-wider">
                      Barangay Service
                    </p>
                    <p className="text-white font-bold text-lg">
                      Culiat, Quezon City
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2.5">
                    <DollarSign className="w-4.5 h-4.5 text-emerald-400" />
                    <div>
                      <p className="text-white/40 text-[11px] uppercase tracking-wider">
                        Fee
                      </p>
                      <p className="text-white font-bold text-sm">
                        {service.fee}
                      </p>
                    </div>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4.5 h-4.5 text-emerald-400" />
                    <div>
                      <p className="text-white/40 text-[11px] uppercase tracking-wider">
                        Processing
                      </p>
                      <p className="text-white font-bold text-sm">
                        {service.processingTime}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="hidden sm:flex justify-center mt-12"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex flex-col items-center gap-2 text-white/30"
              >
                <span className="text-[10px] uppercase tracking-[0.2em]">
                  Scroll down
                </span>
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════
            DESCRIPTION + IMAGE
            ═══════════════════════════════════════ */}
        <section className="relative py-16 sm:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Text */}
              <AnimatedSection>
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 text-emerald-600">
                    <BadgeCheck className="w-5 h-5" />
                    <span className="text-sm font-semibold uppercase tracking-wider">
                      About This Service
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                    {service.title === "Business Permit"
                      ? "Are you planning to start or grow your business?"
                      : `Everything you need to know about ${service.title}`}
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {service.description}
                  </p>

                  {/* Quick stat pills */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-800">
                        Fee: {service.fee}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-800">
                        {service.processingTime}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-full px-4 py-2">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-800">
                        Barangay Hall
                      </span>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Decorative card / illustration */}
              <AnimatedSection delay={0.2}>
                <div className="relative">
                  <div className="relative bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-3xl p-8 sm:p-10 border border-emerald-100/50 shadow-xl shadow-emerald-100/20">
                    {/* Decorative corner elements */}
                    <div className="absolute top-4 right-4 w-20 h-20 bg-emerald-100/30 rounded-full blur-[30px]" />
                    <div className="absolute bottom-4 left-4 w-16 h-16 bg-teal-100/40 rounded-full blur-[25px]" />

                    <div className="relative space-y-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200/50">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Quick Overview
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                          <DollarSign className="w-5 h-5 text-emerald-500 mb-2" />
                          <p className="text-xs text-gray-400 uppercase tracking-wider">
                            Amount
                          </p>
                          <p className="text-lg font-bold text-gray-800">
                            {service.fee}
                          </p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                          <Clock className="w-5 h-5 text-blue-500 mb-2" />
                          <p className="text-xs text-gray-400 uppercase tracking-wider">
                            Turnaround
                          </p>
                          <p className="text-lg font-bold text-gray-800">
                            {service.processingTime}
                          </p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                          <ClipboardList className="w-5 h-5 text-amber-500 mb-2" />
                          <p className="text-xs text-gray-400 uppercase tracking-wider">
                            Requirements
                          </p>
                          <p className="text-lg font-bold text-gray-800">
                            {service.requirements.length}
                          </p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                          <Footprints className="w-5 h-5 text-purple-500 mb-2" />
                          <p className="text-xs text-gray-400 uppercase tracking-wider">
                            Steps
                          </p>
                          <p className="text-lg font-bold text-gray-800">
                            {service.procedure.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating tiny badge */}
                  <motion.div
                    className="absolute -top-4 -right-4 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg shadow-emerald-600/30"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3" />
                      Official
                    </div>
                  </motion.div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            REQUIREMENTS SECTION
            ═══════════════════════════════════════ */}
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <AnimatedSection>
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 text-emerald-600 mb-3">
                  <ClipboardList className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase tracking-wider">
                    What You Need
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                  Requirements
                </h2>
                <p className="mt-3 text-gray-500 max-w-lg mx-auto">
                  Make sure you have all the following documents ready before visiting the Barangay Hall.
                </p>
              </div>
            </AnimatedSection>

            <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {service.requirements.map((req, idx) => (
                <motion.div
                  key={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={scaleIn}
                  custom={idx}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="group relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300 cursor-default"
                >
                  {/* Number */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    {idx + 1}
                  </div>

                  <div className="flex items-start gap-3 pr-10">
                    <div className="flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-gray-700 font-medium leading-relaxed">
                      {req}
                    </p>
                  </div>

                  {/* Bottom accent bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            PROCEDURE SECTION
            ═══════════════════════════════════════ */}
        <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #10b981 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
            <AnimatedSection>
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 text-emerald-600 mb-3">
                  <Footprints className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase tracking-wider">
                    Step by Step
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                  Procedure
                </h2>
                <p className="mt-3 text-gray-500 max-w-lg mx-auto">
                  Follow these simple steps to complete your{" "}
                  {service.title.toLowerCase()} application.
                </p>
              </div>
            </AnimatedSection>

            <div className="relative">
              {/* Vertical connector line */}
              <div className="absolute left-7 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-200 via-emerald-300 to-teal-200 hidden sm:block" />

              <div className="space-y-6 sm:space-y-8">
                {service.procedure.map((step, idx) => (
                  <motion.div
                    key={step.step}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={idx % 2 === 0 ? slideFromLeft : slideFromRight}
                    className="relative"
                  >
                    <div className="flex gap-5 sm:gap-7 items-start">
                      {/* Step number */}
                      <StepBadge number={step.step} />

                      {/* Content card */}
                      <motion.div
                        whileHover={{ y: -3 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="flex-1 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 sm:p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {step.description}
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            TIPS SECTION
            ═══════════════════════════════════════ */}
        <section className="py-16 sm:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
          {/* Glow orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px]" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
            <AnimatedSection>
              <div className="text-center mb-14">
                <motion.div
                  className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4"
                  whileHover={{ scale: 1.05 }}
                >
                  <Lightbulb className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Pro Tips
                  </span>
                </motion.div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  Tips for Faster Processing
                </h2>
                <p className="mt-3 text-slate-400 max-w-lg mx-auto">
                  Save time and avoid hassle with these helpful reminders.
                </p>
              </div>
            </AnimatedSection>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.tips.map((tip, idx) => (
                <motion.div
                  key={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={fadeUp}
                  custom={idx * 0.15}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-7 hover:bg-white/10 transition-all duration-300"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center mb-5 group-hover:from-emerald-500/30 group-hover:to-teal-500/30 transition-all">
                    <Lightbulb className="w-5 h-5 text-emerald-400" />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {tip.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    {tip.description}
                  </p>

                  {/* Hover accent */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-2xl scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-500" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            OFFICE INFO + CTA
            ═══════════════════════════════════════ */}
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <AnimatedSection>
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-8 py-8 sm:px-10 sm:py-10 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, white 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                      }}
                    />
                  </div>
                  <div className="relative">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                      Ready to Get Started?
                    </h2>
                    <p className="text-emerald-100 max-w-lg">
                      Visit the Barangay Culiat Hall with your complete
                      requirements and we'll assist you every step of the way.
                    </p>
                  </div>
                </div>

                {/* Office details */}
                <div className="px-8 py-8 sm:px-10 sm:py-10">
                  <div className="grid sm:grid-cols-3 gap-6 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                          Address
                        </p>
                        <p className="text-gray-800 font-medium text-sm mt-0.5">
                          Barangay Hall, Culiat, Quezon City
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <CalendarClock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                          Office Hours
                        </p>
                        <p className="text-gray-800 font-medium text-sm mt-0.5">
                          Mon – Fri, 8:00 AM – 5:00 PM
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                          Contact
                        </p>
                        <p className="text-gray-800 font-medium text-sm mt-0.5">
                          Visit the barangay hall for inquiries
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CTA buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      to="/services-info"
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                    >
                      View All Services
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/login"
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Request Online
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            PREV / NEXT NAVIGATION
            ═══════════════════════════════════════ */}
        <section className="py-10 bg-white border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              {prevService ? (
                <Link
                  to={`/services/${prevService.slug}`}
                  className="group flex items-center gap-3 text-left hover:bg-gray-50 rounded-xl p-3 -m-3 transition-colors flex-1 min-w-0"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      Previous
                    </p>
                    <p className="text-sm font-semibold text-gray-700 group-hover:text-emerald-600 transition-colors truncate">
                      {prevService.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              <Link
                to="/services-info"
                className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 hover:bg-emerald-100 hover:text-emerald-600 flex items-center justify-center text-gray-500 transition-colors"
                title="All Services"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </Link>

              {nextService ? (
                <Link
                  to={`/services/${nextService.slug}`}
                  className="group flex items-center gap-3 text-right hover:bg-gray-50 rounded-xl p-3 -m-3 transition-colors flex-1 min-w-0 justify-end"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      Next
                    </p>
                    <p className="text-sm font-semibold text-gray-700 group-hover:text-emerald-600 transition-colors truncate">
                      {nextService.title}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            OTHER SERVICES GRID
            ═══════════════════════════════════════ */}
        <section className="py-14 bg-gray-50 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <AnimatedSection>
              <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">
                Explore Other Services
              </h3>
            </AnimatedSection>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {servicesList
                .filter((s) => s.slug !== slug)
                .map((s, idx) => {
                  const SIcon = s.icon || FileText;
                  return (
                    <motion.div
                      key={s.slug}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={scaleIn}
                      custom={idx * 0.05}
                    >
                      <Link
                        to={`/services/${s.slug}`}
                        className="group flex flex-col items-center text-center bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <SIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 group-hover:text-emerald-700 transition-colors leading-tight">
                          {s.title}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
