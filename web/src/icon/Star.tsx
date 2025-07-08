export function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 256 256" {...props}>
      <title>Star</title>
      <path fill="none" d="M0 0h256v256H0z" />
      <path
        fill={props.fill ?? 'none'}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={16}
        d="m128 189.09 54.72 33.65a8.4 8.4 0 0 0 12.52-9.17l-14.88-62.79 48.7-42A8.46 8.46 0 0 0 224.27 94l-63.91-5.2-24.62-59.6a8.36 8.36 0 0 0-15.48 0L95.64 88.8 31.73 94a8.46 8.46 0 0 0-4.79 14.83l48.7 42-14.88 62.74a8.4 8.4 0 0 0 12.52 9.17Z"
      />
    </svg>
  );
}
