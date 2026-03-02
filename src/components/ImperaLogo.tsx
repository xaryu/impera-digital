import laurelCrown from "@/assets/laurel-crown.png";

const ImperaLogo = ({ className = "h-16" }: { className?: string }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <img
        src={laurelCrown}
        alt=""
        className="h-[60%] w-auto object-contain"
        draggable={false}
      />
      <span
        className="text-cream tracking-[0.25em] leading-none"
        style={{ fontFamily: "'Cinzel', serif", fontWeight: 700 }}
      >
        IMPERA
      </span>
    </div>
  );
};

export default ImperaLogo;
