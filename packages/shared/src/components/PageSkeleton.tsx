/**
 * Lightweight loading skeleton for lazy-loaded pages.
 * Shows a pulsing placeholder while the page JS chunk loads.
 *
 * Usage:
 *   const KautionsRechner = lazy(() => import('./pages/KautionsRechner'))
 *   <Suspense fallback={<PageSkeleton />}>
 *     <KautionsRechner />
 *   </Suspense>
 */
export function PageSkeleton() {
  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '72rem', margin: '0 auto' }}>
      {/* Hero skeleton */}
      <div
        style={{
          height: '10rem',
          borderRadius: '0.75rem',
          background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          marginBottom: '2rem',
        }}
      />

      {/* Content skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: '8rem',
              borderRadius: '0.5rem',
              background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
