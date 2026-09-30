export default function Logo({ className, width, height }) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="#7fdbe8" />
      <path d="M17 10h6v7h7v6h-7v7h-6v-7h-7v-6h7z" fill="#063b46" />
    </svg>
  );
}
