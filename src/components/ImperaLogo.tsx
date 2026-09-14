import wreathImg from "@/assets/laurel-wreath.png";

const ImperaLogo = ({ className = "h-16" }: { className?: string }) => {
  // className sizes the wreath image itself — the wrapper is left to size to
  // its content (image + the "IMPERA" text below) so a flex-centered parent
  // (e.g. the navbar) centers the whole logo, not just the image on its own.
  return (
    <div className="flex flex-col items-center gap-0">
      <img
        src={wreathImg}
        alt="Impera logo wreath"
        className={`w-auto object-contain ${className}`}
        loading="eager"
        draggable={false}
      />
      <span
        className="text-cream tracking-[0.18em] font-bold leading-none uppercase"
        style={{ fontSize: '112%', fontFamily: "'Cinzel', serif" }}
      >
        IMPERA
      </span>
    </div>
  );
};

export default ImperaLogo;
