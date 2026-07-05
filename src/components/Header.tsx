export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__row">
        <a href="#top" className="brand">
          <svg width="28" height="28" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <path d="M32 6C18 14 8 26 8 40c0 10 8 18 18 18 4 0 7-1 9-3 2 2 5 3 9 3 10 0 18-8 18-18C62 26 46 14 32 6Z" stroke="#2F5233" strokeWidth="2.5" />
            <path d="M32 12v40M32 22c-6 2-11 6-13 12M32 30c-5 2-9 5-11 10M32 38c-4 2-7 4-9 8" stroke="#2F5233" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="brand__type">
            <strong>PlantGuard</strong>
            <span>Diagnostic Instrument</span>
          </span>
        </a>
        <div className="site-header__meta">
          <span className="mono site-header__stat">38 pathology classes</span>
          <span className="mono site-header__stat">ResNet-9 vision model</span>
        </div>
      </div>
    </header>
  );
}
