import logoImg from "@/assets/impera-logo-new.png";

const ImperaLogo = ({ className = "h-16" }: { className?: string }) => {
  return (
    <img
      src={logoImg}
      alt="Impera"
      className={`w-auto object-contain ${className}`}
      loading="eager"
    />
  );
};

export default ImperaLogo;
