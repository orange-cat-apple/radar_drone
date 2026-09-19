from ultralytics import YOLOWorld
import torch

print("Loading YOLO-World for Zero-Shot Detection...")
yolo_model = YOLOWorld('yolov8s-world.pt')
yolo_model.set_classes(["person", "fire", "smoke", "chemical spill"])
print(f"YOLO-World Active. Target Classes: {yolo_model.names}")

print("\nLoading MiDaS Small for CPU Depth Estimation...")
midas_model = torch.hub.load("intel-isl/MiDaS", "MiDaS_small")
midas_model.eval()
print("MiDaS Engine Active.")
