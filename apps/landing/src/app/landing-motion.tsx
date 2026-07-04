"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import type { MotionStyle } from "framer-motion";
import { useRef } from "react";
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

type ReferencePair = {
  before: string;
  after: string;
  featured?: boolean;
};

export function StickyReferenceGallery({ items }: { items: ReferencePair[] }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const beforeOneY = useTransform(scrollYProgress, [0, 1], [42, -62]);
  const beforeOneX = useTransform(scrollYProgress, [0, 1], [-18, 10]);
  const beforeOneRotate = useTransform(scrollYProgress, [0, 1], [-1.2, 1.6]);
  const beforeOneScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1.02, 1]);
  const afterOneY = useTransform(scrollYProgress, [0, 1], [-18, 56]);
  const afterOneX = useTransform(scrollYProgress, [0, 1], [18, -10]);
  const afterOneRotate = useTransform(scrollYProgress, [0, 1], [1.3, -1.4]);
  const afterOneScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.99, 1.025, 1]);
  const beforeTwoY = useTransform(scrollYProgress, [0, 1], [96, -34]);
  const beforeTwoX = useTransform(scrollYProgress, [0, 1], [26, -16]);
  const beforeTwoRotate = useTransform(scrollYProgress, [0, 1], [1.1, -0.8]);
  const afterTwoY = useTransform(scrollYProgress, [0, 1], [128, -12]);
  const afterTwoX = useTransform(scrollYProgress, [0, 1], [-28, 14]);
  const afterTwoRotate = useTransform(scrollYProgress, [0, 1], [-0.9, 1.2]);

  const [first, second] = items;

  return (
    <>
      <section
        className="relative hidden min-h-[180vh] overflow-visible bg-[linear-gradient(180deg,#fff8f2_0%,#f6eee8_48%,#fff8f2_100%)] px-10 py-20 md:block"
        ref={sectionRef}
      >
        <div className="sticky top-20 mx-auto grid h-[calc(100vh-120px)] max-w-6xl grid-cols-[0.82fr_1.18fr] items-center gap-10">
          <motion.div
            className="max-w-md"
            initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-10% 0px" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          >
            <h2 className="font-editorial text-6xl font-black leading-[0.92] tracking-[-0.04em] text-[#140b10] lg:text-7xl">
              O resultado que inspirou esse cronograma.
            </h2>
            <p className="mt-6 text-base font-bold leading-7 text-[#5b4d52]">
              Antes de montar o seu, veja o que mudou quando o cuidado passou a ter direção.
            </p>
          </motion.div>

          <div className="relative h-full min-h-[620px]">
            {first ? (
              <>
                <ReferenceImageCard
                  className="absolute left-[4%] top-[12%] z-20 h-[64%] w-[38%]"
                  label="Antes"
                  src={first.before}
                  style={{ rotate: beforeOneRotate, scale: beforeOneScale, x: beforeOneX, y: beforeOneY }}
                />
                <ReferenceImageCard
                  className="absolute right-[5%] top-[4%] z-30 h-[76%] w-[46%]"
                  label="Depois"
                  src={first.after}
                  style={{ rotate: afterOneRotate, scale: afterOneScale, x: afterOneX, y: afterOneY }}
                />
              </>
            ) : null}

            {second ? (
              <>
                <ReferenceImageCard
                  className="absolute bottom-[4%] left-[22%] z-10 h-[43%] w-[30%]"
                  label="Antes"
                  src={second.before}
                  style={{ rotate: beforeTwoRotate, x: beforeTwoX, y: beforeTwoY }}
                  subtle
                />
                <ReferenceImageCard
                  className="absolute bottom-[8%] right-[24%] z-20 h-[45%] w-[32%]"
                  label="Depois"
                  src={second.after}
                  style={{ rotate: afterTwoRotate, x: afterTwoX, y: afterTwoY }}
                  subtle
                />
              </>
            ) : null}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 pt-8 md:hidden">
        <RevealBlock className="mx-auto max-w-4xl">
          <h2 className="font-editorial text-5xl font-black leading-[0.92] tracking-[-0.035em]">
            O resultado que inspirou esse cronograma.
          </h2>
          <p className="mt-6 max-w-xl text-base font-bold leading-7 text-[#5b4d52]">
            Antes de montar o seu, veja o que mudou quando o cuidado passou a ter direção.
          </p>
        </RevealBlock>

        <div className="mx-auto mt-10 max-w-xl space-y-5">
          {items.map((item, index) => (
            <div className="grid gap-4" key={item.before}>
              <ReferenceReveal delay={index * 0.08}>
                <ReferenceMobileImage label="Antes" src={item.before} />
              </ReferenceReveal>
              <ReferenceReveal delay={0.12 + index * 0.08} lift>
                <ReferenceMobileImage label="Depois" src={item.after} />
              </ReferenceReveal>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function ReferenceImageCard({
  className,
  label,
  src,
  style,
  subtle,
}: {
  className: string;
  label: string;
  src: string;
  style: MotionStyle;
  subtle?: boolean;
}) {
  return (
    <motion.figure
      className={`${className} overflow-hidden rounded-[30px] border border-[#140b10]/10 bg-[#f3e7de] shadow-[0_30px_90px_rgba(62,18,36,0.18)] ${subtle ? "shadow-[0_22px_70px_rgba(62,18,36,0.13)]" : ""}`}
      style={style}
    >
      <img alt={`${label} do cronograma`} className="h-full w-full object-contain object-center" src={src} />
      <figcaption className="absolute left-4 top-4 rounded-full bg-[#140b10]/68 px-4 py-2 text-[0.66rem] font-black uppercase tracking-[0.16em] text-white backdrop-blur">
        {label}
      </figcaption>
    </motion.figure>
  );
}

function ReferenceMobileImage({ label, src }: { label: string; src: string }) {
  return (
    <figure className="relative h-[430px] overflow-hidden rounded-[30px] border border-[#140b10]/10 bg-[#f3e7de] shadow-[0_24px_74px_rgba(62,18,36,0.15)]">
      <img alt={`${label} do cronograma`} className="h-full w-full object-contain object-center" src={src} />
      <figcaption className="absolute left-4 top-4 rounded-full bg-[#140b10]/68 px-4 py-2 text-[0.66rem] font-black uppercase tracking-[0.16em] text-white backdrop-blur">
        {label}
      </figcaption>
    </figure>
  );
}
