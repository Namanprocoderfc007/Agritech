import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader
import os

# Hyperparameters
DATA_DIR = "./data" # Place your PlantVillage dataset here
BATCH_SIZE = 32
EPOCHS = 10
NUM_CLASSES = 10 # Update based on your dataset
DEVICE = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

def main():
    print("--- Training Teacher Model (ResNet50) ---")
    
    # 1. Data Augmentation and Loaders
    data_transforms = {
        'train': transforms.Compose([
            transforms.RandomResizedCrop(224),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'val': transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
    }

    # IMPORTANT: Ensure your data directory has 'train' and 'val' subfolders
    if not os.path.exists(DATA_DIR):
        print(f"ERROR: Dataset directory '{DATA_DIR}' not found. Please add the dataset.")
        return

    image_datasets = {x: datasets.ImageFolder(os.path.join(DATA_DIR, x), data_transforms[x])
                      for x in ['train', 'val']}
    dataloaders = {x: DataLoader(image_datasets[x], batch_size=BATCH_SIZE, shuffle=True, num_workers=4)
                   for x in ['train', 'val']}

    # 2. Initialize ResNet50 (Heavy Model)
    teacher_model = models.resnet50(pretrained=True)
    num_ftrs = teacher_model.fc.in_features
    teacher_model.fc = nn.Linear(num_ftrs, NUM_CLASSES)
    teacher_model = teacher_model.to(DEVICE)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(teacher_model.parameters(), lr=0.001)

    # 3. Training Loop (Simplified)
    for epoch in range(EPOCHS):
        print(f'Epoch {epoch+1}/{EPOCHS}')
        for phase in ['train', 'val']:
            if phase == 'train':
                teacher_model.train()
            else:
                teacher_model.eval()

            running_loss = 0.0
            running_corrects = 0

            for inputs, labels in dataloaders[phase]:
                inputs, labels = inputs.to(DEVICE), labels.to(DEVICE)
                optimizer.zero_grad()

                with torch.set_grad_enabled(phase == 'train'):
                    outputs = teacher_model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    if phase == 'train':
                        loss.backward()
                        optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            epoch_loss = running_loss / len(image_datasets[phase])
            epoch_acc = running_corrects.double() / len(image_datasets[phase])
            print(f'{phase} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

    # 4. Save Model
    os.makedirs("models", exist_ok=True)
    torch.save(teacher_model.state_dict(), "models/teacher_resnet50.pth")
    print("Saved Teacher Model: models/teacher_resnet50.pth")

if __name__ == '__main__':
    main()
