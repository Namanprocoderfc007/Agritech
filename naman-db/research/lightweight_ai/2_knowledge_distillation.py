import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader
import os

# Hyperparameters
DATA_DIR = "./data"
BATCH_SIZE = 32
EPOCHS = 10
NUM_CLASSES = 10
DEVICE = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

# Knowledge Distillation Parameters
ALPHA = 0.5  # Balance between true labels (Hard Loss) and teacher predictions (Soft Loss)
TEMPERATURE = 3.0  # Softens the probability distribution of the teacher

def distillation_loss(student_logits, teacher_logits, labels, T, alpha):
    """
    Computes the KD loss. 
    1. Soft loss: KL Divergence between softened teacher and student logits.
    2. Hard loss: Standard Cross Entropy between student logits and actual labels.
    """
    soft_loss = nn.KLDivLoss(reduction='batchmean')(
        F.log_softmax(student_logits / T, dim=1),
        F.softmax(teacher_logits / T, dim=1)
    ) * (T * T) # Multiply by T^2 to scale gradients properly
    
    hard_loss = F.cross_entropy(student_logits, labels)
    
    return (alpha * soft_loss) + ((1 - alpha) * hard_loss)

def main():
    print("--- Training Student Model (MobileNetV3) with Knowledge Distillation ---")
    
    # [Data loading code same as teacher...]
    # Assuming datasets and dataloaders are defined here.
    
    # 1. Load Pre-trained Teacher
    teacher_model = models.resnet50(pretrained=False)
    teacher_model.fc = nn.Linear(teacher_model.fc.in_features, NUM_CLASSES)
    # Load your saved weights here
    # teacher_model.load_state_dict(torch.load("models/teacher_resnet50.pth"))
    teacher_model = teacher_model.to(DEVICE)
    teacher_model.eval() # Teacher is frozen

    # 2. Initialize Tiny Student Model
    student_model = models.mobilenet_v3_small(pretrained=True)
    student_model.classifier[3] = nn.Linear(student_model.classifier[3].in_features, NUM_CLASSES)
    student_model = student_model.to(DEVICE)

    optimizer = optim.Adam(student_model.parameters(), lr=0.001)

    # 3. KD Training Loop (Conceptual)
    # for epoch in range(EPOCHS):
    #     student_model.train()
    #     for inputs, labels in dataloaders['train']:
    #         inputs, labels = inputs.to(DEVICE), labels.to(DEVICE)
    #         optimizer.zero_grad()
    #
    #         # Forward pass through both
    #         with torch.no_grad():
    #             teacher_logits = teacher_model(inputs)
    #         student_logits = student_model(inputs)
    #
    #         # Compute custom KD loss
    #         loss = distillation_loss(student_logits, teacher_logits, labels, TEMPERATURE, ALPHA)
    #         loss.backward()
    #         optimizer.step()

    # 4. Save Student
    os.makedirs("models", exist_ok=True)
    torch.save(student_model.state_dict(), "models/student_mobilenetv3.pth")
    print("Saved Student Model: models/student_mobilenetv3.pth")

if __name__ == '__main__':
    main()
