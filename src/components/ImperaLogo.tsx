import laurelImg from "@/assets/laurel-crown.png";

const ImperaLogo = ({ className = "h-16" }: { className?: string }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img
        src={laurelImg}
        alt=""
        className="h-[60%] w-auto object-contain"
        loading="eager"
      />
      <span
        className="font-display text-cream tracking-[0.25em] font-bold leading-none"
        style={{ fontSize: '35%' }}
      >
        IMPERA
      </span>
    </div>
  );
};

export default ImperaLogo;
