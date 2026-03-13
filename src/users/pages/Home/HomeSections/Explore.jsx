import React from "react";
import {
  Landmark,
  Leaf,
  Stethoscope,
  GraduationCap,
  Store,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const highlights = [
  {
    icon: Landmark,
    title: "Cultural Heritage",
    desc: "Mula sa mga ugat nito hanggang sa pag-unlad nito, ipinagmamalaki ng Culiat ang aming mga tradisyon at kasaysayan.",
  },
  {
    icon: Leaf,
    title: "Green & Sustainable",
    desc: "Ang mga hardin ng komunidad at mga puno-puno na kalsada ay sumasalamin sa aming pangako sa isang malinis at malusog na kinabukasan.",
  },
  {
    icon: Stethoscope,
    title: "Health for All",
    desc: "Ang aming health center ay nagsisiguro ng madaling makuhang pangangalaga at wellness programs para sa aming mga residente.",
  },
  {
    icon: GraduationCap,
    title: "Education & Youth",
    desc: "Ang pangangalaga sa bata at mga programang pang-kabataan ay nag-aalaga ng pag-aaral at liderago mula pa lamang sa maagang edad.",
  },
  {
    icon: Store,
    title: "Local Livelihood",
    desc: "Ang maliliit na negosyo at merkado ay nagpapalakas sa aming umuungorgng lokal na ekonomiya.",
  },
];

// Animation Variants
const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const Explore = () => {
  return (
    <section
      className="relative pt-12 px-6 pb-[5.5em] bg-linear-to-bl from-primary-dark to-primary"
      id="home-explore"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="flex flex-col md:flex-row justify-between items-center mb-12 md:mb-16 gap-6"
        >
          <h2 className="text-3xl md:text-4xl text-center sm:text-left font-bold text-text-color-light leading-snug">
            Tuklasin ang aming lokal na komunidad, <br className="hidden sm:block" />
            tradisyon at pag-unlad
          </h2>

          <Link
            to="/about"
            className="inline-flex items-center text-nowrap gap-2 bg-accent text-secondary hover:bg-accent-light px-6 py-2 rounded-md font-medium transition-all shadow-md"
          >
            Matuto Pa Tungkol Sa Amin <ArrowRight size={18} />
          </Link>
        </motion.div>

        {/* Highlights Section */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
        >
          {highlights.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{
                  y: -6,
                  scale: 1.03,
                  transition: {
                    duration: 0.25,
                    ease: "easeOut",
                  },
                }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center text-center dark:bg-gray-800 rounded-xl cursor-pointer transition-all duration-200 p-2 sm:p-3"
              >
                <div className="p-2 sm:p-3 mt-2 sm:mt-4 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Icon
                    className="text-white"
                    size={24}
                  />
                </div>
                <h4 className="mt-2 sm:mt-3 font-semibold text-text-color-light dark:text-gray-100 text-xs sm:text-sm md:text-base">
                  {item.title}
                </h4>
                <p className="mb-2 sm:mb-4 text-[10px] sm:text-xs md:text-sm w-full text-neutral/70 dark:text-gray-400 leading-tight">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Bottom Curve */}
      <svg
        className="absolute -bottom-1 sm:-bottom-3 left-0 w-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 100"
      >
        <path
          fill="#f5f5f5"
          d="M0,64 C480,120 960,0 1440,64 L1440,100 L0,100 Z"
        ></path>
      </svg>
    </section>
  );
};

export default Explore;
