// Plain <img> so placeholder URLs work with no config. Swap for next/image once real photos are in Supabase Storage.
export default function Photo({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={`h-full w-full object-cover ${className}`} />;
}
