# Lightweight AI for Edge Deployment: Crop Disease Detection
## Research Implementation Plan

This directory contains the scaffolding for your final-year research project focusing on **Lightweight AI / Edge Deployment**.

### Research Objective
To investigate the trade-off between model size, inference speed, and accuracy in agricultural computer vision by applying **Knowledge Distillation (KD)** and **INT8 Post-Training Quantization (PTQ)**. The goal is to produce an ultra-lightweight model that runs efficiently on budget mobile devices without relying on cloud APIs, while maintaining high diagnostic accuracy.

---

### Step-by-Step Implementation Protocol

#### Phase 1: Data Preparation (Week 1)
1. **Dataset**: Download the [PlantVillage dataset](https://github.com/spMohanty/PlantVillage-Dataset) or a subset containing your target crops (e.g., Tomato, Potato).
2. **Preprocessing**: Structure the dataset into `data/train` and `data/val` folders. All images should be resized to `224x224`.

#### Phase 2: Teacher Model Training (Week 2)
1. Run `1_train_teacher.py`.
2. This script trains a large, highly accurate **ResNet50** model. 
3. **Output**: `models/teacher_resnet50.pth`. This is your heavy baseline (e.g., 90MB+ file size).

#### Phase 3: Knowledge Distillation (Weeks 3-4)
1. Run `2_knowledge_distillation.py`.
2. This script trains a tiny **MobileNetV3-Small** (the "student"). Instead of just learning from the dataset, the student learns to mimic the precise probability distributions (soft labels) output by the Teacher.
3. **Output**: `models/student_mobilenetv3.pth`. (e.g., ~10MB file size).

#### Phase 4: Quantization & Edge Conversion (Week 5)
1. Run `3_quantize_tflite.py`.
2. This script converts the student PyTorch model into ONNX, and then converts it into a TensorFlow Lite (`.tflite`) format using **INT8 Quantization**. 
3. **Output**: `models/edge_model_int8.tflite`. (e.g., ~2.5MB file size).

#### Phase 5: Hardware Benchmarking (Week 6)
1. Write a script to measure **Inference Time (ms)** and **Memory Usage (MB)** of all 3 models on a CPU (simulating a mobile device).
2. Record the Accuracy vs. Speed trade-offs.

#### Phase 6: Paper Writing (Weeks 7-8)
*   **Methodology Section**: Detail the Alpha (KD loss weight) and Temperature (Softmax scaling) hyperparameters used in Phase 3.
*   **Results Section**: Create a graph showing: `ResNet50 (Baseline)` vs `MobileNetV3 (Standard)` vs `MobileNetV3 (Distilled)` vs `MobileNetV3 (Distilled + INT8)`. Show how KD recovered the accuracy lost by downsizing the model.

---

### The Scripts Provided
- `1_train_teacher.py`: Baseline high-accuracy training.
- `2_knowledge_distillation.py`: The core research script (transferring knowledge from heavy to light model).
- `3_quantize_tflite.py`: The deployment pipeline script.
