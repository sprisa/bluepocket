export function ArchiveIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 256 256" {...props}>
      <title>Archive</title>
      <path fill="none" d="M0 0h256v256H0z" />
      <rect
        width={208}
        height={40}
        x={24}
        y={56}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={16}
        rx={8}
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={16}
        d="M216 96v96a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8V96M104 136h48"
      />
    </svg>
  );
}
