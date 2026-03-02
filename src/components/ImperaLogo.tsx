const ImperaLogo = ({ className = "h-16" }: { className?: string }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 200 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        {/* Laurel wreath - matching reference design */}
        <g fill="hsl(var(--gold))">
          {/* LEFT BRANCH */}
          {/* Main stem - left */}
          <path d="M100 62 C97 58, 90 50, 82 42 C74 34, 66 26, 62 18 C60 14, 58 10, 58 6" 
                stroke="hsl(var(--gold))" strokeWidth="1.8" fill="none" />
          
          {/* Left leaves - outer side (pointing outward-left) */}
          <path d="M96 56 C92 58, 86 58, 83 55 C80 52, 82 48, 86 48 C90 48, 94 52, 96 56Z" />
          <path d="M90 48 C85 49, 79 48, 77 44 C75 40, 77 37, 81 37 C85 37, 89 43, 90 48Z" />
          <path d="M84 40 C79 40, 73 38, 72 34 C71 30, 73 27, 77 28 C81 29, 84 35, 84 40Z" />
          <path d="M78 32 C73 32, 68 29, 67 25 C66 21, 69 18, 72 19 C76 20, 78 27, 78 32Z" />
          <path d="M72 24 C68 23, 63 20, 63 16 C63 12, 66 10, 69 11 C72 13, 73 20, 72 24Z" />
          <path d="M66 16 C63 15, 59 12, 59 8 C60 5, 62 3, 65 5 C67 7, 67 13, 66 16Z" />
          
          {/* Left leaves - inner side (pointing inward-right) */}
          <path d="M98 54 C100 50, 100 44, 97 41 C94 38, 90 39, 90 43 C90 47, 95 51, 98 54Z" />
          <path d="M92 46 C93 42, 93 36, 90 33 C87 30, 84 32, 84 35 C84 39, 89 43, 92 46Z" />
          <path d="M86 38 C87 34, 86 28, 83 26 C80 24, 77 26, 78 29 C79 33, 83 36, 86 38Z" />
          <path d="M80 30 C80 26, 79 21, 76 19 C73 17, 71 19, 72 22 C73 26, 78 28, 80 30Z" />
          <path d="M74 22 C74 19, 72 14, 70 12 C68 10, 66 12, 67 15 C68 18, 72 21, 74 22Z" />

          {/* RIGHT BRANCH */}
          {/* Main stem - right */}
          <path d="M100 62 C103 58, 110 50, 118 42 C126 34, 134 26, 138 18 C140 14, 142 10, 142 6" 
                stroke="hsl(var(--gold))" strokeWidth="1.8" fill="none" />
          
          {/* Right leaves - outer side (pointing outward-right) */}
          <path d="M104 56 C108 58, 114 58, 117 55 C120 52, 118 48, 114 48 C110 48, 106 52, 104 56Z" />
          <path d="M110 48 C115 49, 121 48, 123 44 C125 40, 123 37, 119 37 C115 37, 111 43, 110 48Z" />
          <path d="M116 40 C121 40, 127 38, 128 34 C129 30, 127 27, 123 28 C119 29, 116 35, 116 40Z" />
          <path d="M122 32 C127 32, 132 29, 133 25 C134 21, 131 18, 128 19 C124 20, 122 27, 122 32Z" />
          <path d="M128 24 C132 23, 137 20, 137 16 C137 12, 134 10, 131 11 C128 13, 127 20, 128 24Z" />
          <path d="M134 16 C137 15, 141 12, 141 8 C140 5, 138 3, 135 5 C133 7, 133 13, 134 16Z" />
          
          {/* Right leaves - inner side (pointing inward-left) */}
          <path d="M102 54 C100 50, 100 44, 103 41 C106 38, 110 39, 110 43 C110 47, 105 51, 102 54Z" />
          <path d="M108 46 C107 42, 107 36, 110 33 C113 30, 116 32, 116 35 C116 39, 111 43, 108 46Z" />
          <path d="M114 38 C113 34, 114 28, 117 26 C120 24, 123 26, 122 29 C121 33, 117 36, 114 38Z" />
          <path d="M120 30 C120 26, 121 21, 124 19 C127 17, 129 19, 128 22 C127 26, 122 28, 120 30Z" />
          <path d="M126 22 C126 19, 128 14, 130 12 C132 10, 134 12, 133 15 C132 18, 128 21, 126 22Z" />
          
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
