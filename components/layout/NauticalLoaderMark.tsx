type NauticalLoaderMarkProps = {
  className?: string;
  compact?: boolean;
};

export function NauticalLoaderMark({ className = "", compact = false }: NauticalLoaderMarkProps) {
  const classes = ["nautical-loader", compact ? "nautical-loader--compact" : "", className].filter(Boolean).join(" ");

  return (
    <span className={classes} aria-hidden="true">
      <span className="nautical-loader__wake" />
      <svg className="nautical-loader__yacht" viewBox="0 0 96 42" focusable="false" aria-hidden="true">
        <path className="nautical-loader__deck" d="M28 13h26c8 0 16 5 21 13H17c2-6 6-10 11-13Z" />
        <path className="nautical-loader__glass" d="M34 17h11v6H30l4-6Zm15 0h9l7 6H49v-6Z" />
        <path className="nautical-loader__hull" d="M8 25h80c-4 9-13 14-28 14H30C18 39 10 34 8 25Z" />
        <path className="nautical-loader__rail" d="M19 25h55" />
      </svg>
      <svg className="nautical-loader__jet" viewBox="0 0 58 28" focusable="false" aria-hidden="true">
        <path className="nautical-loader__jet-body" d="M6 19c6-8 18-12 32-9 6 1 11 5 14 10-8 2-18 3-30 2-6 0-11-1-16-3Z" />
        <path className="nautical-loader__jet-seat" d="M27 9c7 0 12 3 15 8H24c-3 0-5-1-6-3 2-3 5-5 9-5Z" />
      </svg>
    </span>
  );
}