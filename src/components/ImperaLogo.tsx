const ImperaLogo = ({ className = "h-16" }: { className?: string }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 200 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        <g fill="hsl(var(--gold))">
          {/* LEFT BRANCH */}
          <path d="M100 62 C96 56, 88 48, 78 40 C68 34, 60 30, 56 20 C54 14, 56 8, 60 4"
                stroke="hsl(var(--gold))" strokeWidth="1.8" fill="none" />

          {/* Left outer leaves */}
          <path d="M96 56 C90 60, 84 59, 82 55 C80 51, 83 48, 87 49 C91 50, 95 54, 96 56Z" />
          <path d="M88 49 C82 52, 76 50, 74 46 C72 42, 75 39, 79 40 C83 41, 87 46, 88 49Z" />
          <path d="M80 42 C74 44, 68 42, 67 38 C66 34, 69 31, 73 32 C77 33, 80 38, 80 42Z" />
          <path d="M73 35 C68 36, 62 34, 61 30 C60 26, 63 23, 67 24 C71 25, 73 31, 73 35Z" />
          <path d="M66 27 C62 28, 57 26, 57 22 C57 18, 60 16, 63 17 C66 18, 67 24, 66 27Z" />
          <path d="M61 20 C58 20, 55 17, 56 13 C57 10, 60 8, 62 10 C64 12, 62 17, 61 20Z" />

          {/* Left inner leaves */}
          <path d="M97 53 C98 48, 97 42, 93 40 C89 38, 87 41, 88 44 C89 48, 94 51, 97 53Z" />
          <path d="M90 46 C90 41, 88 36, 84 34 C80 33, 79 36, 80 39 C82 43, 87 45, 90 46Z" />
          <path d="M82 39 C82 35, 79 30, 76 29 C73 28, 72 31, 73 34 C75 37, 80 38, 82 39Z" />
          <path d="M75 32 C74 28, 72 24, 69 23 C66 22, 65 25, 66 28 C68 31, 73 32, 75 32Z" />
          <path d="M67 25 C67 22, 65 18, 63 17 C61 16, 60 18, 61 21 C62 23, 66 25, 67 25Z" />

          {/* RIGHT BRANCH */}
          <path d="M100 62 C104 56, 112 48, 122 40 C132 34, 140 30, 144 20 C146 14, 144 8, 140 4"
                stroke="hsl(var(--gold))" strokeWidth="1.8" fill="none" />

          {/* Right outer leaves */}
          <path d="M104 56 C110 60, 116 59, 118 55 C120 51, 117 48, 113 49 C109 50, 105 54, 104 56Z" />
          <path d="M112 49 C118 52, 124 50, 126 46 C128 42, 125 39, 121 40 C117 41, 113 46, 112 49Z" />
          <path d="M120 42 C126 44, 132 42, 133 38 C134 34, 131 31, 127 32 C123 33, 120 38, 120 42Z" />
          <path d="M127 35 C132 36, 138 34, 139 30 C140 26, 137 23, 133 24 C129 25, 127 31, 127 35Z" />
          <path d="M134 27 C138 28, 143 26, 143 22 C143 18, 140 16, 137 17 C134 18, 133 24, 134 27Z" />
          <path d="M139 20 C142 20, 145 17, 144 13 C143 10, 140 8, 138 10 C136 12, 138 17, 139 20Z" />

          {/* Right inner leaves */}
          <path d="M103 53 C102 48, 103 42, 107 40 C111 38, 113 41, 112 44 C111 48, 106 51, 103 53Z" />
          <path d="M110 46 C110 41, 112 36, 116 34 C120 33, 121 36, 120 39 C118 43, 113 45, 110 46Z" />
          <path d="M118 39 C118 35, 121 30, 124 29 C127 28, 128 31, 127 34 C125 37, 120 38, 118 39Z" />
          <path d="M125 32 C126 28, 128 24, 131 23 C134 22, 135 25, 134 28 C132 31, 127 32, 125 32Z" />
          <path d="M133 25 C133 22, 135 18, 137 17 C139 16, 140 18, 139 21 C138 23, 134 25, 133 25Z" />

          {/* Bottom crossing */}
          <path d="M97 60 C99 63, 100 65, 100 62 C100 65, 101 63, 103 60 C101 61, 100 64, 100 64 C100 64, 99 61, 97 60Z" />
        </g>

        {/* IMPERA text */}
        <text
          x="100"
          y="95"
          textAnchor="middle"
          className="fill-cream"
          fontFamily="'Cinzel', 'Playfair Display', serif"
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
