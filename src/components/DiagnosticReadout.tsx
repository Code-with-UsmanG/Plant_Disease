import { useEffect, useState } from "react";
import type { PredictionResult } from "../types";
import { buildReading } from "../diagnosis";

interface Props {
  result: PredictionResult;
  previewUrl: string;
  onReset: () => void;
}

function ConfidenceGauge({ value, tone }: { value: number; tone: "forest" | "wine" }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setWidth(value)));
    return () => cancelAnimationFrame(id);
  }, [value]);

  return (
    <div className="gauge">
      <div className="gauge__head">
        <span>Model confidence</span>
        <strong className={`mono gauge__value gauge__value--${tone}`}>{value.toFixed(1)}%</strong>
      </div>
      <div className="gauge__track">
        <div className={`gauge__fill gauge__fill--${tone}`} style={{ width: `${width}%` }} />
        {[0, 25, 50, 75, 100].map((t) => (
          <span key={t} className="gauge__tick" style={{ left: `${t}%` }} />
        ))}
      </div>
      <div className="gauge__scale mono">
        <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
      </div>
    </div>
  );
}

export default function DiagnosticReadout({ result, previewUrl, onReset }: Props) {
  const tone = result.is_healthy ? "forest" : "wine";
  const reading = buildReading(result);

  return (
    <section className="readout" id="readout">
      <div className="container">
        <div className="panel-heading">
          <p className="eyebrow">Step 02 · Reading</p>
          <h2>Diagnostic result</h2>
        </div>

        <div className="readout__card">
          <div className="readout__image">
            <img src={previewUrl} alt="Analyzed leaf specimen" />
            <span className={`status-chip status-chip--${tone}`}>
              {result.is_healthy ? "Healthy" : "Attention needed"}
            </span>
          </div>

          <div className="readout__body">
            <div className="readout__title-row">
              <div>
                <h3 className="readout__plant">{result.plant}</h3>
                <p className={`readout__condition readout__condition--${tone}`}>
                  {result.is_healthy ? "No visible pathology" : result.condition}
                </p>
              </div>
              <span className={`tag tag-${tone === "forest" ? "forest" : "wine"}`}>{reading.riskLabel}</span>
            </div>

            <ConfidenceGauge value={result.confidence} tone={tone} />

            <div className="insight">
              <h4 className="mono insight__label">Reading</h4>
              <p>{reading.summary}</p>
            </div>

            <div className="insight">
              <h4 className="mono insight__label">Recommended action</h4>
              <p>{reading.advice}</p>
            </div>

            <div className="ranked">
              <div className="ranked__head">
                <h4 className="mono">Full readout</h4>
                <span className="mono ranked__sub">Top {result.top_3.length} by confidence</span>
              </div>
              <ol className="ranked__list">
                {result.top_3.map((item, i) => (
                  <li className="ranked__row" key={item.class_name}>
                    <span className="mono ranked__rank">{String(i + 1).padStart(2, "0")}</span>
                    <div className="ranked__info">
                      <span className="ranked__name">{item.plant}</span>
                      <span className="ranked__detail">{item.is_healthy ? "Healthy" : item.condition}</span>
                    </div>
                    <div className="ranked__bar-track">
                      <div
                        className={`ranked__bar-fill ${item.is_healthy ? "ranked__bar-fill--forest" : "ranked__bar-fill--wine"}`}
                        style={{ width: `${item.confidence}%` }}
                      />
                    </div>
                    <span className="mono ranked__pct">{item.confidence.toFixed(1)}%</span>
                  </li>
                ))}
              </ol>
            </div>

            <button className="btn btn-ghost" type="button" onClick={onReset}>
              Scan another specimen
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
