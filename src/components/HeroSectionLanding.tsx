import { useRef, type CSSProperties } from "react";
import { useAmbientCanvas } from "./hero/ambientCanvas";
import { drawImperialNetwork, drawAqueductPulse } from "./hero/scenes";

export type AncientNetworkVariant = "network" | "aqueduct";

export interface AncientNetworkBackgroundProps {
  variant?: AncientNetworkVariant;
  transparentBg?: boolean;
  className?: string;
  style?: CSSProperties;
}

const VARIANT_TIMING: Record<AncientNetworkVariant, { lifeStart: number; lifeEnd: number }> = {
  network: { lifeStart: 3.0, lifeEnd: 3.9 },
  aqueduct: { lifeStart: 3.35, lifeEnd: 4.15 },
};

/**
 * Usage:
 *   <section style={{ position: "relative", overflow: "hidden" }}>
 *     <AncientNetworkBackground variant="aqueduct" />
 *     <div style={{ position: "relative", zIndex: 1 }}>
 *       ...your headline, crown mark, CTA...
 *     </div>
 *   </section>
 */
const HeroSectionLanding = ({
  variant = "network",
  transparentBg = false,
  className,
  style,
}: AncientNetworkBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = variant === "network" ? drawImperialNetwork : drawAqueductPulse;
  const timing = VARIANT_TIMING[variant];

  useAmbientCanvas(containerRef, canvasRef, draw, { ...timing, transparentBg });

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none", // never blocks clicks on real hero content
        ...style,
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
};

export default HeroSectionLanding;