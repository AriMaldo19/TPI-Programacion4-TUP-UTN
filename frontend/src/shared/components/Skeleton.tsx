/** Se muestra una espera mientras carga la carta. */
export function Skeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="h-72 animate-pulse rounded-3xl bg-line/70" />
      ))}
    </div>
  )
}
