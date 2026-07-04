"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const reveal = {
  hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function AnimatedOpening() {
  return (
    <section className="relative grid min-h-[82svh] place-items-center overflow-hidden px-5 pt-24 md:px-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_25%,rgba(225,74,134,0.13),transparent_28rem),linear-gradient(180deg,#fff8f2_0%,#f6eee8_100%)]" />
      <motion.div
        animate="show"
        className="mx-auto max-w-3xl text-center"
        initial="hidden"
        transition={{ staggerChildren: 0.28 }}
      >
        <motion.p
          className="font-editorial text-[4.4rem] font-black leading-[0.84] tracking-[-0.055em] text-[#140b10] md:text-[8rem]"
          transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
          variants={reveal}
        >
          Couto Hair
        </motion.p>
        <motion.div
          className="mx-auto mt-8 max-w-xl text-3xl font-extrabold leading-[1.12] tracking-[-0.035em] text-[#3e1224] md:text-5xl"
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
          variants={reveal}
        >
          <p>Seu cabelo.</p>
          <p>Sua imagem.</p>
          <p>Sua melhor fase.</p>
        </motion.div>
      </motion.div>
    </section>
  );
}

export function RevealBlock({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      transition={{ delay, duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
      variants={reveal}
      viewport={{ once: true, margin: "-12% 0px" }}
      whileInView="show"
    >
      {children}
    </motion.div>
  );
}

export function ReferenceReveal({
  children,
  className,
  delay = 0,
  lift = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  lift?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: lift ? 42 : 28, scale: 0.985, filter: "blur(10px)" }}
      transition={{ delay, duration: 1.35, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: "-10% 0px" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
    >
      {children}
    </motion.div>
  );
}
