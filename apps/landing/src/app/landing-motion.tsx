"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const motionEase = [0.16, 1, 0.3, 1] as const;

const reveal = {
  hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

type ReferencePair = {
  before: string;
  after: string;
  featured?: boolean;
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
          transition={{ duration: 2.2, ease: motionEase }}
          variants={reveal}
        >
          Couto Hair
        </motion.p>
        <motion.div
          className="mx-auto mt-8 max-w-xl text-3xl font-extrabold leading-[1.12] tracking-[-0.035em] text-[#3e1224] md:text-5xl"
          transition={{ duration: 2.4, ease: motionEase }}
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
      transition={{ delay, duration: 1.15, ease: motionEase }}
      variants={reveal}
      viewport={{ once: true, margin: "-12% 0px" }}
      whileInView="show"
    >
      {children}
    </motion.div>
  );
}

export function ReferenceGallery({ items }: { items: ReferencePair[] }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-visible bg-[linear-gradient(180deg,#fff8f2_0%,#f6eee8_48%,#fff8f2_100%)] px-5 py-20 md:px-10 md:py-24">
      <div className="mx-auto max-w-6xl">
        <RevealBlock className="max-w-4xl">
          <h2 className="font-editorial text-5xl font-black leading-[0.92] tracking-[-0.035em] text-[#140b10] md:text-7xl">
            O resultado que inspirou esse cronograma.
          </h2>
          <p className="mt-6 max-w-xl text-base font-bold leading-7 text-[#5b4d52]">
            Antes de montar o seu, veja o que mudou quando o cuidado passou a ter direção.
          </p>
        </RevealBlock>

        <div className="mt-12 grid gap-8 md:gap-10">
          {items.map((item, index) => (
            <ReferencePairRow item={item} key={item.before} pairIndex={index} shouldReduceMotion={shouldReduceMotion} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReferencePairRow({
  item,
  pairIndex,
  shouldReduceMotion,
}: {
  item: ReferencePair;
  pairIndex: number;
  shouldReduceMotion: boolean | null;
}) {
  return (
    <motion.article
      className="rounded-[34px] border border-[#140b10]/10 bg-[#fffaf6]/72 p-3 shadow-[0_24px_90px_rgba(62,18,36,0.10)] backdrop-blur md:p-5"
      initial={{ opacity: 0, y: 34, filter: "blur(10px)" }}
      transition={{ delay: pairIndex * 0.12, duration: 0.85, ease: motionEase }}
      viewport={{ once: true, margin: "-10% 0px" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    >
      <div className="grid gap-3 md:grid-cols-2 md:gap-5">
        <ReferenceCard
          delay={pairIndex * 0.12}
          label="Antes"
          motionOffset={pairIndex % 2 === 0 ? 4 : 6}
          shouldReduceMotion={shouldReduceMotion}
          src={item.before}
        />
        <ReferenceCard
          delay={0.08 + pairIndex * 0.12}
          label="Depois"
          motionOffset={pairIndex % 2 === 0 ? 6 : 4}
          shouldReduceMotion={shouldReduceMotion}
          src={item.after}
        />
      </div>
    </motion.article>
  );
}

function ReferenceCard({
  delay,
  label,
  motionOffset,
  shouldReduceMotion,
  src,
}: {
  delay: number;
  label: "Antes" | "Depois";
  motionOffset: number;
  shouldReduceMotion: boolean | null;
  src: string;
}) {
  const floatAnimation = shouldReduceMotion ? undefined : { y: [0, -motionOffset, 0] };
  const floatTransition = shouldReduceMotion
    ? undefined
    : {
        delay,
        duration: 6.2 + motionOffset * 0.16,
        ease: "easeInOut" as const,
        repeat: Infinity,
        repeatType: "mirror" as const,
      };

  return (
    <motion.figure
      animate={floatAnimation}
      className="group relative aspect-[3/4] overflow-hidden rounded-[28px] border border-[#140b10]/10 bg-[#f3e7de] shadow-[0_22px_70px_rgba(62,18,36,0.13)] transition-shadow duration-500 hover:shadow-[0_28px_90px_rgba(62,18,36,0.18)]"
      transition={floatTransition}
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
    >
      <img
        alt={`${label} do cronograma`}
        className="h-full w-full object-contain object-center transition-transform duration-700 group-hover:scale-[1.015]"
        src={src}
      />
      <figcaption className="absolute left-4 top-4 rounded-full bg-[#140b10]/72 px-4 py-2 text-[0.66rem] font-black uppercase tracking-[0.16em] text-white backdrop-blur">
        {label}
      </figcaption>
    </motion.figure>
  );
}
