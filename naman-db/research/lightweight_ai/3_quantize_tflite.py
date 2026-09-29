"""
Pipeline to export the tiny student model to edge format.
Requires installing onnx and tensorflow.
"""

import torch
import torch.nn as nn
from torchvision import models
import os

NUM_CLASSES = 10
DEVICE = torch.device("cpu") # Export usually happens on CPU

def export_to_onnx():
    print("--- Phase 1: Converting PyTorch Student to ONNX ---")
    
    # 1. Load Student Model
    student_model = models.mobilenet_v3_small(pretrained=False)
    student_model.classifier[3] = nn.Linear(student_model.classifier[3].in_features, NUM_CLASSES)
    # student_model.load_state_dict(torch.load("models/student_mobilenetv3.pth"))
    student_model.eval()

    # 2. Dummy Input for Tracing
    dummy_input = torch.randn(1, 3, 224, 224, requires_grad=True)

    # 3. Export
    onnx_path = "models/student.onnx"
    torch.onnx.export(
        student_model, 
        dummy_input, 
        onnx_path, 
        export_params=True,
        opset_version=11, 
        do_constant_folding=True,
        input_names=['input'], 
        output_names=['output'],
        dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
    )
    print(f"Exported to ONNX: {onnx_path}")

def export_to_tflite_int8():
    """
    Converts ONNX to TensorFlow, then to TFLite with Post-Training Quantization (INT8).
    This shrinks the model size by 4x and speeds up inference on mobile CPUs.
    """
    print("--- Phase 2: INT8 Quantization (TFLite) ---")
    print("NOTE: You will need the `onnx2tf` and `tensorflow` libraries installed.")
    print("Command to run in terminal after generating ONNX:")
    print("  onnx2tf -i models/student.onnx -o models/tf_model")
    print("Then use tf.lite.TFLiteConverter with optimization set to OPTIMIZE_FOR_SIZE.")
    
    # Python equivalent for TF conversion (assuming tf_model exists):
    # import tensorflow as tf
    # converter = tf.lite.TFLiteConverter.from_saved_model("models/tf_model")
    # converter.optimizations = [tf.lite.Optimize.DEFAULT] # Enables INT8 quantization
    # tflite_quant_model = converter.convert()
    # with open('models/student_quantized.tflite', 'wb') as f:
    #     f.write(tflite_quant_model)

if __name__ == '__main__':
    os.makedirs("models", exist_ok=True)
    export_to_onnx()
    export_to_tflite_int8()
