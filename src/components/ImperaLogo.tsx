import wreathImg from "@/assets/laurel-wreath.png";

const ImperaLogo = ({ className = "h-16" }: { className?: string }) => {
  return (
    <div className={`flex flex-col items-center gap-0 ${className}`}>
      <img
        src={wreathImg}
        alt=""
        className="h-[65%] w-auto object-contain"
        loading="eager"
        draggable={false}
      />
      <span
        className="font-display text-cream tracking-[0.3em] font-bold leading-none uppercase"
        style={{ fontSize: '28%' }}
      >
        IMPERA
      </span>
    </div>
  );
};

export default ImperaLogo;
