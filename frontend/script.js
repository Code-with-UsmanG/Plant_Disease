// ─── Configuration ───────────────────────────────────────────────────────────
// ⚠️ UPDATE THIS after deploying to Hugging Face Spaces
// It will be something like: https://your-username-plant-disease.hf.space
const API_URL = "https://usmang-plant-disease-detection.hf.space";

// ─── DOM Elements ────────────────────────────────────────────────────────────
const uploadSection = document.getElementById("upload-section");
const uploadArea = document.getElementById("upload-area");
const uploadPrompt = document.getElementById("upload-prompt");
const uploadPreview = document.getElementById("upload-preview");
const previewImage = document.getElementById("preview-image");
const fileInput = document.getElementById("file-input");
const browseBtn = document.getElementById("browse-btn");
const changeBtn = document.getElementById("change-btn");
const analyzeBtn = document.getElementById("analyze-btn");

const loadingSection = document.getElementById("loading-section");
const resultsSection = document.getElementById("results-section");
const errorSection = document.getElementById("error-section");

const resultStatusIcon = document.getElementById("result-status-icon");
const resultPlantName = document.getElementById("result-plant-name");
const resultCondition = document.getElementById("result-condition");
const confidenceValue = document.getElementById("confidence-value");
const confidenceBarFill = document.getElementById("confidence-bar-fill");
const top3List = document.getElementById("top3-list");
const errorMessage = document.getElementById("error-message");

const tryAgainBtn = document.getElementById("try-again-btn");
const errorRetryBtn = document.getElementById("error-retry-btn");

// ─── State ───────────────────────────────────────────────────────────────────
let selectedFile = null;

// ─── Upload Handling ─────────────────────────────────────────────────────────

// Click to browse
browseBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.click();
});

uploadArea.addEventListener("click", () => {
    if (!selectedFile) fileInput.click();
});

// File selected via input
fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// Change button
changeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    resetUpload();
    fileInput.click();
});

// Drag and drop
uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("drag-over");
});

uploadArea.addEventListener("dragleave", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("drag-over");
});

uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("drag-over");
    if (e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
    }
});

function handleFile(file) {
    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"];
    if (!validTypes.includes(file.type)) {
        showError("Please upload a valid image file (JPG, PNG, WebP, BMP, or TIFF).");
        return;
    }

    // Validate size (10 MB)
    if (file.size > 10 * 1024 * 1024) {
        showError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum size is 10 MB.`);
        return;
    }

    selectedFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        uploadPrompt.hidden = true;
        uploadPreview.hidden = false;
        analyzeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

function resetUpload() {
    selectedFile = null;
    fileInput.value = "";
    previewImage.src = "";
    uploadPrompt.hidden = false;
    uploadPreview.hidden = true;
    analyzeBtn.disabled = true;
}

// ─── Analyze ─────────────────────────────────────────────────────────────────

analyzeBtn.addEventListener("click", async () => {
    if (!selectedFile) return;

    // Show loading, hide others
    showView("loading");

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
        const response = await fetch(`${API_URL}/predict`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.detail || `Server error (${response.status})`);
        }

        const data = await response.json();
        displayResults(data);
    } catch (err) {
        console.error("Prediction failed:", err);

        let msg = err.message;
        if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
            msg = "Cannot connect to the API server. Make sure the backend is running.";
        }

        showError(msg);
    }
});

// ─── Display Results ─────────────────────────────────────────────────────────

function displayResults(data) {
    // Status icon & header
    const isHealthy = data.is_healthy;
    resultStatusIcon.textContent = isHealthy ? "✅" : "🔴";
    resultPlantName.textContent = data.plant;

    const conditionEl = resultCondition;
    conditionEl.textContent = isHealthy ? "Healthy" : data.condition;
    conditionEl.className = `result-condition ${isHealthy ? "healthy" : "diseased"}`;

    // Confidence
    const conf = data.confidence;
    confidenceValue.textContent = `${conf}%`;
    confidenceBarFill.style.width = "0%";

    // Top 3
    top3List.innerHTML = "";
    if (data.top_3 && data.top_3.length > 0) {
        data.top_3.forEach((item, i) => {
            const el = document.createElement("div");
            el.className = "top3-item";
            el.innerHTML = `
                <div class="top3-item-rank">${i + 1}</div>
                <div class="top3-item-info">
                    <div class="top3-item-name">${item.plant}</div>
                    <div class="top3-item-detail">${item.is_healthy ? "Healthy" : item.condition}</div>
                </div>
                <div class="top3-item-confidence">${item.confidence}%</div>
            `;
            top3List.appendChild(el);
        });
    }

    showView("results");

    // Animate confidence bar after section is visible
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            confidenceBarFill.style.width = `${conf}%`;
        });
    });
}

// ─── View Management ─────────────────────────────────────────────────────────

function showView(view) {
    uploadSection.hidden = view !== "upload";
    loadingSection.hidden = view !== "loading";
    resultsSection.hidden = view !== "results";
    errorSection.hidden = view !== "error";
}

function showError(msg) {
    errorMessage.textContent = msg || "Something went wrong. Please try again.";
    showView("error");
}

// ─── Reset / Try Again ───────────────────────────────────────────────────────

function goBackToUpload() {
    resetUpload();
    showView("upload");
}

tryAgainBtn.addEventListener("click", goBackToUpload);
errorRetryBtn.addEventListener("click", goBackToUpload);
