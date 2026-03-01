const ImperaLogo = ({ className = "h-16" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Laurel wreath + IMPERA text */}
      <svg
        viewBox="0 0 260 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        {/* Left laurel branch */}
        <g stroke="hsl(var(--gold))" strokeWidth="1.5" fill="none" opacity="0.85">
          <path d="M50 65 C45 55, 35 50, 30 40 C28 35, 30 28, 35 25 C38 23, 42 25, 43 30 C44 35, 40 42, 50 55" />
          <path d="M48 60 C42 52, 30 48, 25 38 C22 32, 24 24, 30 20 C34 18, 38 20, 38 26 C39 32, 36 40, 48 52" />
          <path d="M46 55 C38 48, 28 42, 22 32 C19 26, 22 18, 28 15 C32 13, 36 16, 36 22 C36 28, 32 36, 46 48" />
          <path d="M44 50 C36 42, 28 35, 24 26 C21 20, 24 14, 30 12 C34 10, 37 14, 36 18 C35 24, 32 30, 44 42" />
          <path d="M42 45 C36 38, 30 30, 28 22 C26 16, 30 10, 35 9 C38 8, 41 12, 40 16 C39 22, 36 28, 42 38" />
        </g>
        {/* Right laurel branch (mirrored) */}
        <g stroke="hsl(var(--gold))" strokeWidth="1.5" fill="none" opacity="0.85">
          <path d="M210 65 C215 55, 225 50, 230 40 C232 35, 230 28, 225 25 C222 23, 218 25, 217 30 C216 35, 220 42, 210 55" />
          <path d="M212 60 C218 52, 230 48, 235 38 C238 32, 236 24, 230 20 C226 18, 222 20, 222 26 C221 32, 224 40, 212 52" />
          <path d="M214 55 C222 48, 232 42, 238 32 C241 26, 238 18, 232 15 C228 13, 224 16, 224 22 C224 28, 228 36, 214 48" />
          <path d="M216 50 C224 42, 232 35, 236 26 C239 20, 236 14, 230 12 C226 10, 223 14, 224 18 C225 24, 228 30, 216 42" />
          <path d="M218 45 C224 38, 230 30, 232 22 C234 16, 230 10, 225 9 C222 8, 219 12, 220 16 C221 22, 224 28, 218 38" />
        </g>
        {/* IMPERA text */}
        <text
          x="130"
          y="48"
          textAnchor="middle"
          className="fill-cream font-display"
          fontSize="28"
          fontWeight="700"
          letterSpacing="6"
        >
          IMPERA
        </text>
      </svg>
    </div>
  );
};

export default ImperaLogo;
