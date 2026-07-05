import io
import os
import torch
import torch.nn as nn
from torchvision import transforms
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image

# ─── Model Architecture (ResNet9) ────────────────────────────────────────────

def ConvBlock(in_channels, out_channels, pool=False):
    layers = [
        nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
        nn.BatchNorm2d(out_channels),
        nn.ReLU(inplace=True)
    ]
    if pool:
        layers.append(nn.MaxPool2d(4))
    return nn.Sequential(*layers)


class ImageClassificationBase(nn.Module):
    pass


class ResNet9(ImageClassificationBase):
    def __init__(self, in_channels, num_classes):
        super().__init__()
        self.conv1 = ConvBlock(in_channels, 64)
        self.conv2 = ConvBlock(64, 128, pool=True)
        self.res1 = nn.Sequential(ConvBlock(128, 128), ConvBlock(128, 128))

        self.conv3 = ConvBlock(128, 256, pool=True)
        self.conv4 = ConvBlock(256, 512, pool=True)
        self.res2 = nn.Sequential(ConvBlock(512, 512), ConvBlock(512, 512))

        self.classifier = nn.Sequential(
            nn.MaxPool2d(4),
            nn.Flatten(),
            nn.Linear(512, num_classes)
        )

    def forward(self, xb):
        out = self.conv1(xb)
        out = self.conv2(out)
        out = self.res1(out) + out
        out = self.conv3(out)
        out = self.conv4(out)
        out = self.res2(out) + out
        out = self.classifier(out)
        return out


# ─── Class Names (38 plant disease classes) ──────────────────────────────────

CLASS_NAMES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]

# Human-readable labels and plant info for the frontend
PLANT_INFO = {}
for name in CLASS_NAMES:
    parts = name.split("___")
    plant = parts[0].replace("_", " ").replace(",", ", ")
    condition = parts[1].replace("_", " ") if len(parts) > 1 else "Unknown"
    is_healthy = "healthy" in condition.lower()
    PLANT_INFO[name] = {
        "plant": plant,
        "condition": condition,
        "is_healthy": is_healthy,
    }

# ─── Preprocessing (must match training) ─────────────────────────────────────

preprocess = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
])

# ─── Load Model ──────────────────────────────────────────────────────────────

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
NUM_CLASSES = 38
MODEL_PATH = os.path.join(os.path.dirname(__file__), "plant_disease_model.pth")

print(f"🌱 Loading model from {MODEL_PATH} on {DEVICE}...")
model = ResNet9(in_channels=3, num_classes=NUM_CLASSES)
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE, weights_only=True))
model.to(DEVICE)
model.eval()
print("✅ Model loaded successfully!")

# ─── FastAPI App ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="Plant Disease Detection API",
    description="Upload a plant leaf image to detect diseases using a ResNet9 model.",
    version="1.0.0",
)

# Allow all origins for the frontend (tighten in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "model": "ResNet9 Plant Disease Classifier",
        "classes": NUM_CLASSES,
        "device": str(DEVICE),
    }


@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    """
    Upload a plant leaf image and get a disease prediction.

    Returns the predicted class, confidence score, plant name,
    condition, and whether the plant is healthy.
    """
    # Validate file type
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{image.content_type}'. Accepted: JPEG, PNG, WebP, BMP, TIFF.",
        )

    # Read and validate file size
    contents = await image.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({len(contents) / 1024 / 1024:.1f} MB). Maximum: 10 MB.",
        )

    # Open and preprocess
    try:
        img = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read image. File may be corrupted.")

    input_tensor = preprocess(img).unsqueeze(0).to(DEVICE)

    # Inference
    with torch.no_grad():
        outputs = model(input_tensor)
        probs = torch.softmax(outputs, dim=1)
        pred_index = torch.argmax(probs, dim=1).item()
        confidence = probs[0, pred_index].item()

    pred_class = CLASS_NAMES[pred_index]
    info = PLANT_INFO[pred_class]

    # Also return top-3 predictions for richer UI
    top3_probs, top3_indices = torch.topk(probs, 3, dim=1)
    top3 = []
    for i in range(3):
        idx = top3_indices[0, i].item()
        cls = CLASS_NAMES[idx]
        top3.append({
            "class_name": cls,
            "plant": PLANT_INFO[cls]["plant"],
            "condition": PLANT_INFO[cls]["condition"],
            "is_healthy": PLANT_INFO[cls]["is_healthy"],
            "confidence": round(top3_probs[0, i].item() * 100, 2),
        })

    return JSONResponse({
        "prediction": pred_class,
        "plant": info["plant"],
        "condition": info["condition"],
        "is_healthy": info["is_healthy"],
        "confidence": round(confidence * 100, 2),
        "top_3": top3,
    })
