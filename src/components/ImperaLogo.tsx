const ImperaLogo = ({ className = "h-16" }: { className?: string }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 240 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        {/* Laurel Wreath */}
        <g transform="translate(120, 52)">
          {/* Left branch stem */}
          <path
            d="M0 8 C-2 4, -8 -4, -16 -12 C-22 -18, -28 -26, -30 -34 C-31 -38, -30 -42, -27 -44"
            stroke="#D4AF37"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Right branch stem */}
          <path
            d="M0 8 C2 4, 8 -4, 16 -12 C22 -18, 28 -26, 30 -34 C31 -38, 30 -42, 27 -44"
            stroke="#D4AF37"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Left outer leaves */}
          <g fill="#D4AF37">
            <ellipse cx="-6" cy="2" rx="5" ry="2.2" transform="rotate(-55 -6 2)" opacity="0.95" />
            <ellipse cx="-11" cy="-4" rx="5.2" ry="2.3" transform="rotate(-50 -11 -4)" opacity="0.95" />
            <ellipse cx="-15" cy="-10" rx="5.4" ry="2.4" transform="rotate(-45 -15 -10)" opacity="0.95" />
            <ellipse cx="-19" cy="-16" rx="5.4" ry="2.4" transform="rotate(-40 -19 -16)" opacity="0.95" />
            <ellipse cx="-22" cy="-22" rx="5.2" ry="2.3" transform="rotate(-30 -22 -22)" opacity="0.95" />
            <ellipse cx="-25" cy="-28" rx="5" ry="2.2" transform="rotate(-20 -25 -28)" opacity="0.95" />
            <ellipse cx="-27" cy="-34" rx="4.8" ry="2.1" transform="rotate(-10 -27 -34)" opacity="0.95" />
            <ellipse cx="-28" cy="-40" rx="4.5" ry="2" transform="rotate(0 -28 -40)" opacity="0.9" />
          </g>

          {/* Left inner leaves */}
          <g fill="#D4AF37" opacity="0.8">
            <ellipse cx="-3" cy="0" rx="4.2" ry="1.8" transform="rotate(125 -3 0)" />
            <ellipse cx="-7" cy="-6" rx="4.4" ry="1.9" transform="rotate(130 -7 -6)" />
            <ellipse cx="-11" cy="-12" rx="4.6" ry="2" transform="rotate(135 -11 -12)" />
            <ellipse cx="-14" cy="-18" rx="4.6" ry="2" transform="rotate(140 -14 -18)" />
            <ellipse cx="-17" cy="-24" rx="4.4" ry="1.9" transform="rotate(150 -17 -24)" />
            <ellipse cx="-20" cy="-30" rx="4.2" ry="1.8" transform="rotate(160 -20 -30)" />
            <ellipse cx="-22" cy="-36" rx="4" ry="1.7" transform="rotate(170 -22 -36)" />
          </g>

          {/* Right outer leaves */}
          <g fill="#D4AF37">
            <ellipse cx="6" cy="2" rx="5" ry="2.2" transform="rotate(55 6 2)" opacity="0.95" />
            <ellipse cx="11" cy="-4" rx="5.2" ry="2.3" transform="rotate(50 11 -4)" opacity="0.95" />
            <ellipse cx="15" cy="-10" rx="5.4" ry="2.4" transform="rotate(45 15 -10)" opacity="0.95" />
            <ellipse cx="19" cy="-16" rx="5.4" ry="2.4" transform="rotate(40 19 -16)" opacity="0.95" />
            <ellipse cx="22" cy="-22" rx="5.2" ry="2.3" transform="rotate(30 22 -22)" opacity="0.95" />
            <ellipse cx="25" cy="-28" rx="5" ry="2.2" transform="rotate(20 25 -28)" opacity="0.95" />
            <ellipse cx="27" cy="-34" rx="4.8" ry="2.1" transform="rotate(10 27 -34)" opacity="0.95" />
            <ellipse cx="28" cy="-40" rx="4.5" ry="2" transform="rotate(0 28 -40)" opacity="0.9" />
          </g>

          {/* Right inner leaves */}
          <g fill="#D4AF37" opacity="0.8">
            <ellipse cx="3" cy="0" rx="4.2" ry="1.8" transform="rotate(-125 3 0)" />
            <ellipse cx="7" cy="-6" rx="4.4" ry="1.9" transform="rotate(-130 7 -6)" />
            <ellipse cx="11" cy="-12" rx="4.6" ry="2" transform="rotate(-135 11 -12)" />
            <ellipse cx="14" cy="-18" rx="4.6" ry="2" transform="rotate(-140 14 -18)" />
            <ellipse cx="17" cy="-24" rx="4.4" ry="1.9" transform="rotate(-150 17 -24)" />
            <ellipse cx="20" cy="-30" rx="4.2" ry="1.8" transform="rotate(-160 20 -30)" />
            <ellipse cx="22" cy="-36" rx="4" ry="1.7" transform="rotate(-170 22 -36)" />
          </g>

          {/* Bottom crossing ribbons */}
          <path
            d="M-2 8 C-1 10, 0 12, 1 10 C2 8, 1 10, 0 12 C-1 10, -2 8, -2 8Z"
            fill="#D4AF37"
            opacity="0.7"
          />
        </g>

        {/* IMPERA text */}
        <text
          x="120"
          y="108"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="'Cinzel', 'Playfair Display', serif"
          fontSize="26"
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
