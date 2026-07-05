# 🌱 Plant Disease Detection — Deployment Guide

## What's Inside

```
deployment/          ← Backend (deploy this to HF Spaces)
├── app.py           ← FastAPI inference API
├── Dockerfile       ← Container config for HF Spaces
├── requirements.txt ← Python deps (CPU-only PyTorch)
└── plant_disease_model.pth  ← ⚠️ YOU MUST COPY THIS HERE (see below)

frontend/            ← Frontend (open locally or deploy to GitHub Pages)
├── index.html
├── style.css
└── script.js
```

---

## 🚀 Step-by-Step Deployment

### Step 1: Copy the model weights into `deployment/`

```bash
cp PredictionModel/plant_disease_model.pth deployment/
```

### Step 2: Create a Hugging Face Space

1. Go to [huggingface.co](https://huggingface.co) and sign up (free)
2. Click your avatar → **New Space**
3. Fill in:
   - **Space name**: `plant-disease-detection` (or anything you like)
   - **SDK**: Select **Docker**
   - **Visibility**: Public
4. Click **Create Space**

### Step 3: Push the backend code

```bash
# Install git-lfs (needed for the model weights file)
brew install git-lfs   # macOS
git lfs install

# Clone your new empty Space
git clone https://huggingface.co/spaces/YOUR_USERNAME/plant-disease-detection
cd plant-disease-detection

# Copy deployment files into it
cp ../deployment/* .

# Track the model with git-lfs (it's >25 MB)
git lfs track "*.pth"

# Push
git add .
git commit -m "Initial deployment"
git push
```

### Step 4: Wait for the build

- Go to your Space page: `https://huggingface.co/spaces/YOUR_USERNAME/plant-disease-detection`
- You'll see a build log — it takes ~3-5 minutes the first time
- Once it says **Running**, your API is live at:
  ```
  https://YOUR_USERNAME-plant-disease-detection.hf.space
  ```

### Step 5: Test the API

Visit `https://YOUR_USERNAME-plant-disease-detection.hf.space/docs` for the interactive Swagger UI.

Or use curl:
```bash
curl -X POST \
  https://YOUR_USERNAME-plant-disease-detection.hf.space/predict \
  -F "image=@path/to/leaf_photo.jpg"
```

### Step 6: Connect the frontend

1. Open `frontend/script.js`
2. Change line 4:
   ```js
   const API_URL = "https://YOUR_USERNAME-plant-disease-detection.hf.space";
   ```
3. Open `frontend/index.html` in your browser — done!

---

## 🧪 Test Locally First (Optional but Recommended)

```bash
cd deployment

# Install deps
pip install -r requirements.txt

# Make sure model weights are here
ls plant_disease_model.pth

# Run
uvicorn app:app --host 0.0.0.0 --port 7860 --reload
```

Then open `frontend/index.html` in your browser. It's already configured to hit `localhost:7860`.

---

## ❓ FAQ

**Q: The Space is sleeping / cold start is slow**
A: Free Spaces sleep after ~48h of inactivity. First request after sleep takes ~30-60s. Subsequent requests are fast (<1s).

**Q: Can I keep it always on?**
A: Yes, HF offers a $0/month "persistent" option for some Spaces, or you can upgrade to a paid tier.

**Q: How do I deploy the frontend publicly?**
A: Easiest options:
- **GitHub Pages**: Push `frontend/` to a GitHub repo, enable Pages in settings
- **Vercel**: Drop the `frontend/` folder on [vercel.com](https://vercel.com)
- **Netlify**: Same, drag-and-drop on [netlify.com](https://netlify.com)

All three are free for static sites.
