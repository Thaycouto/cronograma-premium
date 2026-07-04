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

  const titleY = useTransform(scrollYProgress, [0.08, 0.52, 0.95], [34, -10, -36]);
  const titleOpacity = useTransform(scrollYProgress, [0.04, 0.18, 0.86, 0.98], [0, 1, 1, 0.78]);
  const beforeOneY = useTransform(scrollYProgress, [0.05, 0.45, 0.9], [72, -12, -58]);
  const beforeOneX = useTransform(scrollYProgress, [0.05, 0.45, 0.9], [-24, 10, -12]);
  const beforeOneScale = useTransform(scrollYProgress, [0.05, 0.5, 0.9], [0.96, 1.02, 0.98]);
  const afterOneY = useTransform(scrollYProgress, [0.1, 0.52, 0.92], [112, 0, -40]);
  const afterOneX = useTransform(scrollYProgress, [0.1, 0.52, 0.92], [30, -6, 18]);
  const afterOneScale = useTransform(scrollYProgress, [0.1, 0.52, 0.92], [0.95, 1.03, 0.99]);
  const beforeTwoY = useTransform(scrollYProgress, [0.18, 0.62, 0.95], [170, 36, -8]);
  const beforeTwoX = useTransform(scrollYProgress, [0.18, 0.62, 0.95], [42, -18, 8]);
  const beforeTwoOpacity = useTransform(scrollYProgress, [0.15, 0.38], [0.45, 1]);
  const afterTwoY = useTransform(scrollYProgress, [0.22, 0.68, 0.96], [210, 64, 4]);
  const afterTwoX = useTransform(scrollYProgress, [0.22, 0.68, 0.96], [-36, 18, -10]);
  const afterTwoOpacity = useTransform(scrollYProgress, [0.18, 0.43], [0.35, 1]);

  const [first, second] = items;

  return (
    <>
      <section
        className="relative hidden min-h-[170vh] overflow-clip bg-[linear-gradient(180deg,#fff8f2_0%,#f6eee8_48%,#fff8f2_100%)] px-10 py-20 md:block"
        ref={sectionRef}
      >
        <div className="sticky top-20 mx-auto grid h-[calc(100vh-120px)] max-w-6xl grid-cols-[0.82fr_1.18fr] items-center gap-10">
          <motion.div className="max-w-md" style={{ opacity: titleOpacity, y: titleY }}>
            <h2 className="font-editorial text-6xl font-black leading-[0.92] tracking-[-0.04em] text-[#140b10] lg:text-7xl">
              O resultado que inspirou esse cronograma.
            </h2>
            <p className="mt-6 text-base font-bold leading-7 text-[#5b4d52]">
              Antes de montar o seu, veja o que mudou quando o cuidado passou a ter direÃ§Ã£o.
            </p>
          </motion.div>

          <div className="relative h-full min-h-[620px]">
            {first ? (
              <>
                <ReferenceImageCard
                  className="absolute left-0 top-[8%] z-20 h-[66%] w-[44%]"
                  label="Antes"
                  src={first.before}
                  style={{ x: beforeOneX, y: beforeOneY, scale: beforeOneScale }}
                />
                <ReferenceImageCard
                  className="absolute right-[2%] top-[2%] z-30 h-[76%] w-[52%]"
                  label="Depois"
                  src={first.after}
                  style={{ x: afterOneX, y: afterOneY, scale: afterOneScale }}
                />
              </>
            ) : null}

            {second ? (
              <>
                <ReferenceImageCard
                  className="absolute bottom-[2%] left-[8%] z-10 h-[47%] w-[38%]"
                  label="Antes"
                  src={second.before}
                  style={{ opacity: beforeTwoOpacity, x: beforeTwoX, y: beforeTwoY }}
                  subtle
                />
                <ReferenceImageCard
                  className="absolute bottom-[7%] right-[10%] z-20 h-[49%] w-[40%]"
                  label="Depois"
                  src={second.after}
                  style={{ opacity: afterTwoOpacity, x: afterTwoX, y: afterTwoY }}
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
            Antes de montar o seu, veja o que mudou quando o cuidado passou a ter direÃ§Ã£o.
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
