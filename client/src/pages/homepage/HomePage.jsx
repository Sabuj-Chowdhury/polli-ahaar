// src/pages/HomePage.jsx
import { MotionConfig, motion } from "motion/react";

import Hero from "../../components/Home/Hero";
import { WeeklyPicks } from "../../components/Home/WeeklyPicks";
import { HowItWorks } from "../../components/Home/HowItWorks";
import WhyChooseUs from "../../components/Home/WhyChooseUs";
import { ReviewsMarquee } from "../../components/Home/ReviewsMarquee";
import FinalCta from "../../components/Home/FinalCta";

// Reusable scroll-reveal wrapper
const Reveal = ({ children, delay = 0 }) => (
  <motion.section
    initial={{ opacity: 0, y: 22 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 180, damping: 20, delay }}
    viewport={{ once: true, amount: 0.2, margin: "0px 0px -15% 0px" }}
  >
    {children}
  </motion.section>
);

const HomePage = () => {
  return (
    // Respect OS-level reduced motion
    <MotionConfig reducedMotion="user">
      <main className="max-w-7xl mx-auto mt-5 ">
        {/* Hero animates immediately (mount reveal) */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 20 }}
        >
          <Hero />
        </motion.section>

        {/* Staggered, scroll-based reveals */}
        <Reveal delay={0.05}>
          <WeeklyPicks />
        </Reveal>

        <Reveal delay={0.06}>
          <HowItWorks />
        </Reveal>

        <Reveal delay={0.07}>
          <WhyChooseUs />
        </Reveal>

        <Reveal delay={0.08}>
          <ReviewsMarquee />
        </Reveal>

        {/* CTA with a touch more lift */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          viewport={{ once: true, amount: 0.25, margin: "0px 0px -10% 0px" }}
        >
          <FinalCta />
        </motion.section>
      </main>
    </MotionConfig>
  );
};

export default HomePage;
