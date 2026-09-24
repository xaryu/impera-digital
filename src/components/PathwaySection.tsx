import { CSSProperties, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Search, Cog, Crown } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import FadeInSection from "./FadeInSection";

// Column layout is a fixed 3-up grid with a 6rem column-gap (see sm:gap-x-24
// below) and a 4rem (w-16) dot — these two derived insets are where a
// connecting-line segment must start/end so it touches the circle's edge
// instead of running under it, for a 3-equal-column grid at any width.
const GAP_REM = 6;
const DOT_RADIUS_REM = 2;
const OUTER_INSET = `calc((100% - ${2 * GAP_REM}rem) / 6 + ${DOT_RADIUS_REM}rem)`;
const CENTER_INSET = `calc(50% + ${DOT_RADIUS_REM}rem)`;

// Card/step reveal — slow and clearly staggered, so item 2 and 3 read as
// distinct beats rather than chasing item 1 in almost the same instant.
const REVEAL_DURATION_MS = 850;
const REVEAL_STEP_MS = 550;

// Line-drawing — each segment gets the same fixed duration and is delayed by
// a full duration per index, so segment 2 can only ever start once segment 1
// has finished, even if both steps happen to already be in view at once
// (e.g. a refresh that lands with the whole section on screen).
const LINE_DURATION_MS = 900;

// The arrowhead is a plain CSS border-triangle, not an icon component — an
// icon's SVG has internal padding around its glyph, which left a visible gap
// between the line and the "arrow" it was pointing to. A border-triangle has
// no such padding, so its flat back can sit flush against the line with zero
// seam, reading as one continuous arrow. It only fades/scales in once that
// segment has fully drawn.
const ARROW_DURATION_MS = 350;
const ARROW_WIDTH_PX = 9;
const ARROW_HALF_HEIGHT_PX = 5;

const PathwaySection = () => {
  const { t } = useTranslation();

  const steps = [
    { icon: Search, title: t("pathway.step1Title"), description: t("pathway.step1Desc") },
    { icon: Cog, title: t("pathway.step2Title"), description: t("pathway.step2Desc") },
    { icon: Crown, title: t("pathway.step3Title"), description: t("pathway.step3Desc") },
  ];

  // Same progressive-offset trick as ServicesSection's ServiceCard: each step
  // needs a bigger scroll offset than the last before it counts as "in view",
  // so — even though all three sit in the same row — they still read one at
  // a time as you scroll through the section instead of popping in together.
  const step0 = useInView<HTMLDivElement>({ threshold: 0.8, rootMargin: "0px 0px -30px 0px" });
  const step1 = useInView<HTMLDivElement>({ threshold: 0.8, rootMargin: "0px 0px -75px 0px" });
  const step2 = useInView<HTMLDivElement>({ threshold: 0.8, rootMargin: "0px 0px -120px 0px" });
  const stepStates = [step0, step1, step2];

  // segment i connects dot i to dot i+1 and is gated on dot i (the one it
  // grows out from) so its start time is always driven by that step's own
  // scroll trigger, with the cumulative delay below layered on top of that.
  const lineSegments = [
    { left: OUTER_INSET, right: CENTER_INSET },
    { left: CENTER_INSET, right: OUTER_INSET },
  ];

  return (
    <section className="py-16 md:py-36 bg-navy-dark relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gold/[0.04] rounded-full blur-3xl pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">
        <FadeInSection className="text-center max-w-2xl mx-auto mb-20">
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">{t("pathway.eyebrow")}</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-cream leading-tight mb-6">{t("pathway.title")}</h2>
          <p className="font-body text-cream/70 leading-relaxed">{t("pathway.subtitle")}</p>
        </FadeInSection>

        <div className="relative max-w-4xl mx-auto">
          {/* connecting line, split into segments between circle edges — each segment draws in
              only once the previous one has fully drawn, never both at once */}
          <div className="hidden sm:block absolute left-0 right-0 pointer-events-none" style={{ top: "56px" }} aria-hidden="true">
            {lineSegments.map((seg, i) => {
              const { isInView, reduced } = stepStates[i];
              return (
                <Fragment key={i}>
                  <div
                    className="absolute h-px bg-gold/30 origin-left"
                    style={{
                      left: seg.left,
                      right: `calc(${seg.right} + ${ARROW_WIDTH_PX}px)`,
                      transform: reduced || isInView ? "scaleX(1)" : "scaleX(0)",
                      transition: reduced ? undefined : `transform ${LINE_DURATION_MS}ms cubic-bezier(0,0,0.2,1)`,
                      transitionDelay: reduced ? undefined : `${i * LINE_DURATION_MS}ms`,
                    }}
                  />
                  <span
                    className="absolute w-0 h-0 border-y-transparent border-l-gold/30"
                    style={{
                      right: seg.right,
                      top: "50%",
                      borderTopWidth: ARROW_HALF_HEIGHT_PX,
                      borderBottomWidth: ARROW_HALF_HEIGHT_PX,
                      borderLeftWidth: ARROW_WIDTH_PX,
                      transformOrigin: "right center",
                      transform: `translateY(-50%) scale(${reduced || isInView ? 1 : 0.5})`,
                      opacity: reduced || isInView ? 1 : 0,
                      transition: reduced ? undefined : `opacity ${ARROW_DURATION_MS}ms cubic-bezier(0,0,0.2,1), transform ${ARROW_DURATION_MS}ms cubic-bezier(0,0,0.2,1)`,
                      transitionDelay: reduced ? undefined : `${(i + 1) * LINE_DURATION_MS}ms`,
                    }}
                    aria-hidden="true"
                  />
                </Fragment>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-12 sm:gap-x-24">
            {steps.map((step, i) => {
              const { ref, isInView, reduced } = stepStates[i];
              // outer div owns only the reveal transform, kept off the inner
              // zone so it never fights the inner zone's own hover:-translate-y-1
              const revealStyle: CSSProperties = reduced
                ? {}
                : {
                    opacity: isInView ? 1 : 0,
                    transform: isInView ? "translateY(0) scale(1)" : "translateY(20px) scale(0.98)",
                    transition: `opacity ${REVEAL_DURATION_MS}ms cubic-bezier(0,0,0.2,1), transform ${REVEAL_DURATION_MS}ms cubic-bezier(0,0,0.2,1)`,
                    transitionDelay: `${i * REVEAL_STEP_MS}ms`,
                  };

              return (
                <div key={step.title} ref={ref} style={revealStyle}>
                  <div className="group flex flex-col items-center text-center rounded-2xl p-6 border border-transparent transition-all duration-500 hover:border-gold/15 hover:bg-navy/30 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(213,173,74,0.15)]">
                    <div className="shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-display text-lg font-bold text-navy-dark bg-gold/70 transition-all duration-300 group-hover:bg-gold group-hover:scale-110">
                      {String(i + 1).padStart(2, "0")}
                    </div>

                    <div className="mt-6">
                      <div className="flex flex-row items-center justify-center gap-2 mb-3">
                        <step.icon className="w-4 h-4 md:w-5 md:h-5 text-gold shrink-0 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                        <h3 className="font-display text-base sm:text-lg md:text-xl text-cream font-semibold">{step.title}</h3>
                      </div>
                      <p className="font-body text-xs sm:text-sm text-cream/70 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PathwaySection;
