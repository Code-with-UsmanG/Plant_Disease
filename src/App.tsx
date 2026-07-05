import { useCallback, useRef, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import SpecimenUpload from "./components/SpecimenUpload";
import DiagnosticReadout from "./components/DiagnosticReadout";
import ErrorPanel from "./components/ErrorPanel";
import Footer from "./components/Footer";
import { analyzeSpecimen, ApiError } from "./api";
import type { PredictionResult } from "./types";

export default function App() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);

  const handleFileSelected = useCallback((file: File) => {
    fileRef.current = file;
    setErrorMessage(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleClear = useCallback(() => {
    fileRef.current = null;
    setPreviewUrl(null);
    setResult(null);
    setErrorMessage(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!fileRef.current) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await analyzeSpecimen(fileRef.current);
      setResult(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something unexpected happened.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    handleClear();
  }, [handleClear]);

  return (
    <>
      <Header />
      <main>
        <Hero />
        {!result && (
          <SpecimenUpload
            previewUrl={previewUrl}
            isLoading={isLoading}
            onFileSelected={handleFileSelected}
            onClear={handleClear}
            onAnalyze={handleAnalyze}
            onError={setErrorMessage}
          />
        )}
        {errorMessage && !isLoading && <ErrorPanel message={errorMessage} onRetry={() => setErrorMessage(null)} />}
        {result && previewUrl && (
          <DiagnosticReadout result={result} previewUrl={previewUrl} onReset={handleReset} />
        )}
      </main>
      <Footer />
    </>
  );
}
