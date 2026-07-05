import type { PredictionResult } from "./types";

// Point this at your FastAPI backend (see backend/app.py in the original repo,
// or your own deployment on Hugging Face Spaces / Render / Fly.io).
export const API_URL =
  import.meta.env.VITE_API_URL || "https://usmang-plant-disease-detection.hf.space";

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export class ApiError extends Error {}

export async function analyzeSpecimen(file: File): Promise<PredictionResult> {
  const formData = new FormData();
  formData.append("image", file);

  let response: Response;
  try {
    response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new ApiError("Can't reach the diagnostic server. Check your connection and try again.");
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new ApiError(errData.detail || `The server returned an error (${response.status}).`);
  }

  return response.json();
}

export function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Please choose a JPG, PNG, WebP, BMP, or TIFF image.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is 10 MB.`;
  }
  return null;
}
