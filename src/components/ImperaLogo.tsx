import logoImg from "@/assets/impera-logo-new.svg";

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
