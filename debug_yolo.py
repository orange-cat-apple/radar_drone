from ultralytics import YOLOWorld

model = YOLOWorld('yolov8s-world.pt')
model.set_classes(["bus", "person"])
results = model('real_bus.jpg')

for c, conf in zip(results[0].boxes.cls, results[0].boxes.conf):
    print(f"{model.names[int(c)]}: {float(conf):.4f}")
