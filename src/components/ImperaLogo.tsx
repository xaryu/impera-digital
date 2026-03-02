const ImperaLogo = ({ className = "h-16" }: { className?: string }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 240 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        {/* Laurel wreath - left branch */}
        <g fill="hsl(var(--gold))">
          {/* Left branch leaves - bottom to top */}
          <path d="M108 58 C104 54, 98 52, 94 48 C92 44, 94 40, 98 38 C101 37, 104 39, 104 43 C104 46, 102 50, 108 56Z" />
          <path d="M104 52 C99 47, 92 44, 88 39 C85 34, 88 29, 92 27 C96 26, 99 28, 99 33 C99 37, 96 42, 104 50Z" />
          <path d="M100 46 C94 40, 86 36, 83 30 C80 24, 84 19, 88 17 C92 16, 95 19, 94 24 C93 28, 90 34, 100 44Z" />
          <path d="M96 40 C90 33, 84 28, 82 22 C80 16, 84 11, 89 10 C93 9, 96 13, 95 17 C94 22, 90 27, 96 37Z" />
          <path d="M93 34 C88 27, 84 21, 83 15 C82 9, 86 5, 91 4 C95 4, 97 7, 96 12 C95 16, 92 22, 93 31Z" />
          <path d="M91 28 C88 21, 86 15, 87 9 C88 4, 92 1, 96 1 C100 2, 101 5, 99 9 C97 14, 94 19, 91 25Z" />
          {/* Left branch stem */}
          <path d="M118 68 C115 62, 110 55, 105 48 C100 41, 96 34, 93 27 C91 22, 90 16, 92 10" stroke="hsl(var(--gold))" strokeWidth="2" fill="none" />
          
          {/* Left inner leaves */}
          <path d="M110 60 C108 56, 104 55, 101 52 C99 49, 100 46, 103 44 C105 44, 107 45, 107 48 C107 50, 106 53, 110 58Z" />
          <path d="M106 54 C103 49, 98 47, 96 43 C94 39, 96 36, 99 34 C102 33, 104 35, 103 38 C103 41, 100 45, 106 52Z" />
          <path d="M102 48 C98 42, 93 39, 91 34 C89 30, 92 26, 95 25 C98 24, 100 27, 99 30 C99 34, 96 38, 102 46Z" />
          <path d="M98 42 C94 36, 90 32, 89 27 C88 22, 91 19, 94 18 C97 17, 99 20, 98 24 C97 28, 95 32, 98 40Z" />
        </g>
        
        {/* Laurel wreath - right branch (mirrored) */}
        <g fill="hsl(var(--gold))">
          <path d="M132 58 C136 54, 142 52, 146 48 C148 44, 146 40, 142 38 C139 37, 136 39, 136 43 C136 46, 138 50, 132 56Z" />
          <path d="M136 52 C141 47, 148 44, 152 39 C155 34, 152 29, 148 27 C144 26, 141 28, 141 33 C141 37, 144 42, 136 50Z" />
          <path d="M140 46 C146 40, 154 36, 157 30 C160 24, 156 19, 152 17 C148 16, 145 19, 146 24 C147 28, 150 34, 140 44Z" />
          <path d="M144 40 C150 33, 156 28, 158 22 C160 16, 156 11, 151 10 C147 9, 144 13, 145 17 C146 22, 150 27, 144 37Z" />
          <path d="M147 34 C152 27, 156 21, 157 15 C158 9, 154 5, 149 4 C145 4, 143 7, 144 12 C145 16, 148 22, 147 31Z" />
          <path d="M149 28 C152 21, 154 15, 153 9 C152 4, 148 1, 144 1 C140 2, 139 5, 141 9 C143 14, 146 19, 149 25Z" />
          {/* Right branch stem */}
          <path d="M122 68 C125 62, 130 55, 135 48 C140 41, 144 34, 147 27 C149 22, 150 16, 148 10" stroke="hsl(var(--gold))" strokeWidth="2" fill="none" />
          
          {/* Right inner leaves */}
          <path d="M130 60 C132 56, 136 55, 139 52 C141 49, 140 46, 137 44 C135 44, 133 45, 133 48 C133 50, 134 53, 130 58Z" />
          <path d="M134 54 C137 49, 142 47, 144 43 C146 39, 144 36, 141 34 C138 33, 136 35, 137 38 C137 41, 140 45, 134 52Z" />
          <path d="M138 48 C142 42, 147 39, 149 34 C151 30, 148 26, 145 25 C142 24, 140 27, 141 30 C141 34, 144 38, 138 46Z" />
          <path d="M142 42 C146 36, 150 32, 151 27 C152 22, 149 19, 146 18 C143 17, 141 20, 142 24 C143 28, 145 32, 142 40Z" />
        </g>
        
        {/* Bottom crossing detail */}
        <g fill="hsl(var(--gold))">
          <path d="M116 66 C118 64, 120 63, 120 68 C120 70, 118 69, 116 66Z" />
          <path d="M124 66 C122 64, 120 63, 120 68 C120 70, 122 69, 124 66Z" />
        </g>

        {/* IMPERA text */}
        <text
          x="120"
          y="102"
          textAnchor="middle"
          className="fill-cream"
          fontFamily="'Cinzel', 'Playfair Display', serif"
          fontSize="32"
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
