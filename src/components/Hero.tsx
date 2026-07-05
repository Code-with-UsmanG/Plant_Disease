const STEPS = [
  { n: "01", label: "Capture", body: "Photograph a single leaf in even light, top-down, filling most of the frame." },
  { n: "02", label: "Analyze", body: "A ResNet-9 model scores the specimen against 38 trained pathology classes." },
  { n: "03", label: "Diagnose", body: "Read the confidence, likely condition, and recommended next step." },
];

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="eyebrow">Plant pathology, read in seconds</p>
          <h1 className="hero__title">
            A field diagnosis,<br />without the field kit.
          </h1>
          <p className="hero__lede">
            Upload a leaf photo and PlantGuard reads it the way a plant pathologist would —
            condition, confidence, and what to do next — backed by a model trained across
            38 disease classes spanning 14 crop species.
          </p>
          <div className="hero__cta">
            <a href="#specimen" className="btn btn-primary">Scan a specimen</a>
            <span className="hero__cta-note">No account needed · Results in under 2 seconds</span>
          </div>
        </div>

        <ol className="workflow" aria-label="How it works">
          {STEPS.map((step) => (
            <li className="workflow__step" key={step.n}>
              <span className="mono workflow__index">{step.n}</span>
              <div>
                <h3 className="workflow__label">{step.label}</h3>
                <p className="workflow__body">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
