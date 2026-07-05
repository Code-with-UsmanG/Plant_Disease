import { useCallback, useRef, useState } from "react";
import ScanningOverlay from "./ScanningOverlay";
import { validateFile } from "../api";

interface Props {
  previewUrl: string | null;
  isLoading: boolean;
  onFileSelected: (file: File) => void;
  onClear: () => void;
  onAnalyze: () => void;
  onError: (message: string) => void;
}

export default function SpecimenUpload({ previewUrl, isLoading, onFileSelected, onClear, onAnalyze, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const error = validateFile(file);
      if (error) {
        onError(error);
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected, onError]
  );

  return (
    <section className="specimen" id="specimen">
      <div className="container specimen__grid">
        <div className="panel-heading">
          <p className="eyebrow">Step 01 · Specimen</p>
          <h2>Load a leaf photo</h2>
          <span className="tag tag-forest">Private · processed in memory only</span>
        </div>

        <div
          className={`dropzone ${dragOver ? "is-dragover" : ""} ${previewUrl ? "has-image" : ""}`}
          onClick={() => !previewUrl && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />

          {!previewUrl && (
            <div className="dropzone__prompt">
              <svg width="40" height="40" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                <rect x="8" y="8" width="48" height="48" rx="8" stroke="currentColor" strokeWidth="2" strokeDasharray="5 4" />
                <path d="M32 22V42M22 32H42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <h3>Drop a leaf photo here</h3>
              <p>or <span className="dropzone__browse">browse your files</span></p>
              <span className="dropzone__hint mono">JPG · PNG · WebP · TIFF — up to 10 MB</span>
            </div>
          )}

          {previewUrl && (
            <div className="dropzone__preview">
              <img src={previewUrl} alt="Uploaded leaf specimen" />
              {isLoading && <ScanningOverlay />}
              {!isLoading && (
                <button
                  type="button"
                  className="dropzone__replace"
                  onClick={(e) => { e.stopPropagation(); onClear(); inputRef.current?.click(); }}
                >
                  Replace photo
                </button>
              )}
            </div>
          )}
        </div>

        <div className="specimen__footer">
          <button
            className="btn btn-primary btn-wide"
            disabled={!previewUrl || isLoading}
            onClick={onAnalyze}
            type="button"
          >
            {isLoading ? "Analyzing…" : "Run diagnosis"}
          </button>
          <p className="specimen__helper">The photo stays on screen next to your results for easy comparison.</p>
        </div>
      </div>
    </section>
  );
}
