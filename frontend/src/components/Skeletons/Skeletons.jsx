import './Skeletons.css';

// ── Shimmer base ────────────────────────────────────────────────
const Shimmer = ({ style = {} }) => (
  <div className="skeleton-shimmer" style={style} />
);

// ── Post Card Skeleton ─────────────────────────────────────────
export const PostSkeleton = () => (
  <div className="skel-post">
    <div className="skel-post__header">
      <Shimmer style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Shimmer style={{ width: '40%', height: 14, borderRadius: 4 }} />
        <Shimmer style={{ width: '25%', height: 12, borderRadius: 4 }} />
      </div>
    </div>
    <div className="skel-post__body">
      <Shimmer style={{ width: '100%', height: 14, borderRadius: 4, marginBottom: 8 }} />
      <Shimmer style={{ width: '85%', height: 14, borderRadius: 4, marginBottom: 8 }} />
      <Shimmer style={{ width: '60%', height: 14, borderRadius: 4, marginBottom: 16 }} />
      <Shimmer style={{ width: '100%', height: 220, borderRadius: 12 }} />
    </div>
    <div className="skel-post__footer">
      <Shimmer style={{ width: 60, height: 32, borderRadius: 8 }} />
      <Shimmer style={{ width: 80, height: 32, borderRadius: 8 }} />
    </div>
  </div>
);

// ── Card Skeleton (generic) ────────────────────────────────────
export const CardSkeleton = ({ lines = 3 }) => (
  <div className="skel-card">
    <Shimmer style={{ width: '60%', height: 20, borderRadius: 4, marginBottom: 12 }} />
    <Shimmer style={{ width: '35%', height: 14, borderRadius: 4, marginBottom: 16 }} />
    {Array.from({ length: lines }).map((_, i) => (
      <Shimmer key={i} style={{ width: i % 2 === 0 ? '100%' : '75%', height: 13, borderRadius: 4, marginBottom: 8 }} />
    ))}
    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
      <Shimmer style={{ flex: 1, height: 38, borderRadius: 8 }} />
      <Shimmer style={{ flex: 1, height: 38, borderRadius: 8 }} />
    </div>
  </div>
);

// ── Profile Skeleton ───────────────────────────────────────────
export const ProfileSkeleton = () => (
  <div className="skel-profile">
    <div className="skel-profile__header">
      <Shimmer style={{ width: 96, height: 96, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Shimmer style={{ width: '40%', height: 24, borderRadius: 4 }} />
        <Shimmer style={{ width: '25%', height: 14, borderRadius: 4 }} />
        <Shimmer style={{ width: '30%', height: 14, borderRadius: 4 }} />
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
      <CardSkeleton lines={4} />
      <CardSkeleton lines={4} />
    </div>
  </div>
);

// ── Match Card Skeleton ────────────────────────────────────────
export const MatchCardSkeleton = () => (
  <div className="skel-card">
    <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
      <Shimmer style={{ width: 56, height: 56, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Shimmer style={{ width: '50%', height: 16, borderRadius: 4 }} />
        <Shimmer style={{ width: '35%', height: 12, borderRadius: 4 }} />
      </div>
    </div>
    <Shimmer style={{ width: '100%', height: 8, borderRadius: 99, marginBottom: 16 }} />
    <Shimmer style={{ width: '100%', height: 13, borderRadius: 4, marginBottom: 8 }} />
    <Shimmer style={{ width: '80%', height: 13, borderRadius: 4, marginBottom: 16 }} />
    <div style={{ display: 'flex', gap: 8 }}>
      <Shimmer style={{ width: 64, height: 28, borderRadius: 99 }} />
      <Shimmer style={{ width: 80, height: 28, borderRadius: 99 }} />
    </div>
    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
      <Shimmer style={{ flex: 1, height: 40, borderRadius: 8 }} />
      <Shimmer style={{ flex: 1, height: 40, borderRadius: 8 }} />
    </div>
  </div>
);
