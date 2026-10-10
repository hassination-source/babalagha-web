export function SocialIcon({ name, size = 20 }: { name: "instagram" | "facebook" | "whatsapp" | "phone"; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true } as const;
  switch (name) {
    case "instagram":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.7">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common} fill="currentColor">
          <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...common} fill="currentColor">
          <path d="M12 2.5a9.4 9.4 0 0 0-8.1 14.2L2.6 21.4l4.8-1.3A9.4 9.4 0 1 0 12 2.5zm0 17.1c-1.4 0-2.8-.4-4-1.1l-.3-.2-2.8.8.8-2.8-.2-.3A7.7 7.7 0 1 1 12 19.6zm4.3-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.3 6.3 0 0 1-3.1-2.7c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.7-1.7c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.5 1.5.6 2 .7 2.7.6.4-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.4-.2z" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M5 4h3.5l1.5 4-2 1.3a11 11 0 0 0 6.7 6.7L16 14l4 1.5V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z" />
        </svg>
      );
  }
}
