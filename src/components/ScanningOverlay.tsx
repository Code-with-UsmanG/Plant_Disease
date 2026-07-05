export default function ScanningOverlay() {
  return (
    <div className="scan-overlay" role="status" aria-live="polite">
      <svg className="scan-overlay__veins" viewBox="0 0 300 300" preserveAspectRatio="none" aria-hidden="true">
        <path
          className="scan-overlay__vein-path"
          d="M150 20 L150 280 M150 70 C 110 90, 80 110, 40 140 M150 70 C 190 90, 220 110, 260 140 M150 130 C 115 150, 90 165, 55 190 M150 130 C 185 150, 210 165, 245 190 M150 190 C 120 205, 100 215, 70 235 M150 190 C 180 205, 200 215, 230 235"
          fill="none"
        />
      </svg>
      <div className="scan-overlay__sweep" />
      <span className="scan-overlay__label mono">Reading leaf pattern…</span>
    </div>
  );
}
