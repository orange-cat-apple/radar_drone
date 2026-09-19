import torch
import cv2
import numpy as np
from ultralytics import YOLOWorld

midas_model = torch.hub.load("intel-isl/MiDaS", "MiDaS_small", trust_repo=True)
midas_model.eval()
midas_transforms = torch.hub.load("intel-isl/MiDaS", "transforms", trust_repo=True)
transform = midas_transforms.small_transform

yolo_model = YOLOWorld('yolov8s-world.pt')
yolo_model.set_classes(["person", "fire", "smoke", "chemical spill"])

img = cv2.imread('/home/fullord/radar_drone_ws/bus.jpg')
img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

results = yolo_model(img, verbose=False)

input_batch = transform(img_rgb)

with torch.no_grad():
    prediction = midas_model(input_batch)
    prediction = torch.nn.functional.interpolate(
        prediction.unsqueeze(1),
        size=img_rgb.shape[:2],
        mode="bicubic",
        align_corners=False,
    ).squeeze()
    depth_map = prediction.cpu().numpy()

for result in results:
    for box in result.boxes:
        x_min, y_min, x_max, y_max = map(int, box.xyxy[0])
        class_name = yolo_model.names[int(box.cls[0])]
        confidence = float(box.conf[0])
        
        roi_depth = depth_map[y_min:y_max, x_min:x_max]
        if roi_depth.size > 0:
            median_depth = float(np.median(roi_depth))
            print(f"Detected: {class_name} | Confidence: {confidence:.2f} | Relative Depth: {median_depth:.2f}")
