const ImperaLogo = ({ className = "h-16" }: { className?: string }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 240 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        {/* Laurel Wreath - circular/oval curve like reference */}
        <g transform="translate(120, 48)">
          {/* Left branch stem - big circular arc from bottom-center up and over */}
          <path
            d="M-3 12 C-8 8, -20 -2, -30 -12 C-38 -22, -42 -32, -40 -42 C-38 -48, -34 -50, -28 -48"
            stroke="#D4AF37"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Right branch stem */}
          <path
            d="M3 12 C8 8, 20 -2, 30 -12 C38 -22, 42 -32, 40 -42 C38 -48, 34 -50, 28 -48"
            stroke="#D4AF37"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* === LEFT SIDE LEAVES === */}
          <g fill="#D4AF37">
            {/* Outer leaves - from bottom curving up and over the top */}
            <path d="M-5 10 C-10 14, -16 13, -16 9 C-16 5, -12 4, -9 6 C-6 7, -5 10, -5 10Z" />
            <path d="M-12 4 C-18 6, -23 4, -23 0 C-23 -4, -19 -5, -16 -3 C-13 -1, -12 3, -12 4Z" />
            <path d="M-19 -3 C-25 -2, -30 -5, -30 -9 C-30 -13, -26 -14, -23 -11 C-20 -9, -19 -4, -19 -3Z" />
            <path d="M-25 -10 C-31 -10, -36 -14, -35 -18 C-35 -22, -31 -23, -28 -20 C-25 -17, -25 -12, -25 -10Z" />
            <path d="M-30 -18 C-36 -19, -40 -24, -39 -28 C-38 -32, -34 -32, -32 -29 C-29 -26, -30 -20, -30 -18Z" />
            <path d="M-34 -27 C-39 -29, -42 -34, -41 -38 C-40 -42, -36 -42, -34 -39 C-32 -36, -34 -29, -34 -27Z" />
            <path d="M-36 -37 C-39 -40, -40 -45, -38 -48 C-36 -50, -33 -49, -32 -46 C-31 -43, -35 -39, -36 -37Z" />
            <path d="M-34 -46 C-35 -49, -33 -52, -30 -52 C-27 -52, -26 -49, -28 -47 C-30 -45, -33 -46, -34 -46Z" />

            {/* Inner leaves */}
            <path d="M-4 7 C-2 2, -5 -3, -9 -3 C-13 -3, -13 1, -10 3 C-8 5, -5 7, -4 7Z" />
            <path d="M-10 0 C-9 -5, -13 -10, -17 -9 C-21 -9, -20 -5, -17 -3 C-14 -1, -11 0, -10 0Z" />
            <path d="M-17 -7 C-17 -12, -21 -17, -25 -16 C-28 -15, -27 -11, -24 -9 C-21 -7, -18 -7, -17 -7Z" />
            <path d="M-23 -14 C-24 -19, -28 -23, -31 -22 C-34 -21, -33 -17, -30 -15 C-27 -14, -24 -14, -23 -14Z" />
            <path d="M-28 -21 C-29 -26, -33 -30, -36 -29 C-38 -28, -37 -24, -34 -23 C-32 -21, -29 -21, -28 -21Z" />
            <path d="M-33 -29 C-33 -33, -35 -38, -37 -38 C-39 -37, -38 -34, -36 -32 C-35 -30, -33 -29, -33 -29Z" />
            <path d="M-35 -38 C-34 -41, -32 -45, -30 -45 C-28 -44, -29 -41, -31 -39 C-32 -38, -34 -38, -35 -38Z" />
          </g>

          {/* === RIGHT SIDE LEAVES (mirrored) === */}
          <g fill="#D4AF37">
            {/* Outer leaves */}
            <path d="M5 10 C10 14, 16 13, 16 9 C16 5, 12 4, 9 6 C6 7, 5 10, 5 10Z" />
            <path d="M12 4 C18 6, 23 4, 23 0 C23 -4, 19 -5, 16 -3 C13 -1, 12 3, 12 4Z" />
            <path d="M19 -3 C25 -2, 30 -5, 30 -9 C30 -13, 26 -14, 23 -11 C20 -9, 19 -4, 19 -3Z" />
            <path d="M25 -10 C31 -10, 36 -14, 35 -18 C35 -22, 31 -23, 28 -20 C25 -17, 25 -12, 25 -10Z" />
            <path d="M30 -18 C36 -19, 40 -24, 39 -28 C38 -32, 34 -32, 32 -29 C29 -26, 30 -20, 30 -18Z" />
            <path d="M34 -27 C39 -29, 42 -34, 41 -38 C40 -42, 36 -42, 34 -39 C32 -36, 34 -29, 34 -27Z" />
            <path d="M36 -37 C39 -40, 40 -45, 38 -48 C36 -50, 33 -49, 32 -46 C31 -43, 35 -39, 36 -37Z" />
            <path d="M34 -46 C35 -49, 33 -52, 30 -52 C27 -52, 26 -49, 28 -47 C30 -45, 33 -46, 34 -46Z" />

            {/* Inner leaves */}
            <path d="M4 7 C2 2, 5 -3, 9 -3 C13 -3, 13 1, 10 3 C8 5, 5 7, 4 7Z" />
            <path d="M10 0 C9 -5, 13 -10, 17 -9 C21 -9, 20 -5, 17 -3 C14 -1, 11 0, 10 0Z" />
            <path d="M17 -7 C17 -12, 21 -17, 25 -16 C28 -15, 27 -11, 24 -9 C21 -7, 18 -7, 17 -7Z" />
            <path d="M23 -14 C24 -19, 28 -23, 31 -22 C34 -21, 33 -17, 30 -15 C27 -14, 24 -14, 23 -14Z" />
            <path d="M28 -21 C29 -26, 33 -30, 36 -29 C38 -28, 37 -24, 34 -23 C32 -21, 29 -21, 28 -21Z" />
            <path d="M33 -29 C33 -33, 35 -38, 37 -38 C39 -37, 38 -34, 36 -32 C35 -30, 33 -29, 33 -29Z" />
            <path d="M35 -38 C34 -41, 32 -45, 30 -45 C28 -44, 29 -41, 31 -39 C32 -38, 34 -38, 35 -38Z" />
          </g>

          {/* Bottom crossing */}
          <path
            d="M-4 12 C-2 16, 0 18, 2 14 M4 12 C2 16, 0 18, -2 14"
            stroke="#D4AF37"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* IMPERA text */}
        <text
          x="120"
          y="118"
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
