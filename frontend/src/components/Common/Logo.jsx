export default function Logo({ size = 48, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            {/* Open book */}
            <path
                d="M6 12C6 12 10 8 24 8C38 8 42 12 42 12V38C42 38 38 35 24 35C10 35 6 38 6 38V12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            {/* Center spine */}
            <path
                d="M24 8V35"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            {/* Left page lines */}
            <path d="M11 16H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <path d="M11 21H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <path d="M11 26H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            {/* Right page lines */}
            <path d="M28 16H37" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <path d="M29 21H37" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <path d="M30 26H37" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            {/* Bookmark accent */}
            <path
                d="M19 8V15L21.5 13L24 15V8"
                fill="var(--primary, #d45a3a)"
                opacity="0.8"
            />
        </svg>
    );
}
