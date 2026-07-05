export interface Top3Item {
  class_name: string;
  plant: string;
  condition: string;
  is_healthy: boolean;
  confidence: number;
}

export interface PredictionResult {
  prediction: string;
  plant: string;
  condition: string;
  is_healthy: boolean;
  confidence: number;
  top_3: Top3Item[];
}

export type ViewState = "upload" | "loading" | "results" | "error";
