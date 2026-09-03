import rclpy
import cv2
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge

class ImagePublisher(Node):
    def __init__(self):
        super().__init__('dummy_publisher')
        self.pub = self.create_publisher(Image, '/camera/image_raw', 10)
        self.bridge = CvBridge()
        self.img = cv2.imread('/home/fullord/radar_drone_ws/data/person_test.jpg')
        self.timer = self.create_timer(0.5, self.timer_callback)
        self.get_logger().info("Publishing person_test.jpg to /camera/image_raw...")

    def timer_callback(self):
        if self.img is not None:
            msg = self.bridge.cv2_to_imgmsg(self.img, encoding="bgr8")
            self.pub.publish(msg)
        else:
            self.get_logger().error("Image not found! Check the path.")

def main():
    rclpy.init()
    node = ImagePublisher()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
