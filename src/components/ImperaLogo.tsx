const ImperaLogo = ({ className = "h-16" }: { className?: string }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 200 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        {/* Flat laurel crown above text */}
        <g fill="hsl(var(--gold))" opacity="0.9">
          {/* Left branch */}
          <ellipse cx="68" cy="22" rx="5" ry="10" transform="rotate(-35 68 22)" />
          <ellipse cx="58" cy="18" rx="4.5" ry="9" transform="rotate(-50 58 18)" />
          <ellipse cx="50" cy="12" rx="4" ry="8" transform="rotate(-65 50 12)" />
          <ellipse cx="44" cy="5" rx="3.5" ry="7" transform="rotate(-80 44 5)" />
          <ellipse cx="76" cy="28" rx="5" ry="9" transform="rotate(-20 76 28)" />
          
          {/* Right branch */}
          <ellipse cx="132" cy="22" rx="5" ry="10" transform="rotate(35 132 22)" />
          <ellipse cx="142" cy="18" rx="4.5" ry="9" transform="rotate(50 142 18)" />
          <ellipse cx="150" cy="12" rx="4" ry="8" transform="rotate(65 150 12)" />
          <ellipse cx="156" cy="5" rx="3.5" ry="7" transform="rotate(80 156 5)" />
          <ellipse cx="124" cy="28" rx="5" ry="9" transform="rotate(20 124 28)" />
          
          {/* Center stem connection */}
          <circle cx="100" cy="6" r="3" />
        </g>

        {/* IMPERA text in Roman style */}
        <text
          x="100"
          y="68"
          textAnchor="middle"
          className="fill-cream"
          fontFamily="'Trajan Pro', 'Cinzel', 'Playfair Display', serif"
          fontSize="30"
          fontWeight="400"
          letterSpacing="8"
        >
          IMPERA
        </text>
      </svg>
    </div>
  );
};

export default ImperaLogo;
