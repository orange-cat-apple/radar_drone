import cv2
import sys
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from nav_msgs.msg import Odometry
from cv_bridge import CvBridge

class TestSpatialPublisher(Node):
    def __init__(self):
        super().__init__('test_spatial_publisher')
        self.img_pub = self.create_publisher(Image, '/camera/image_raw', 1)
        self.odom_pub = self.create_publisher(Odometry, '/odom', 10)
        self.bridge = CvBridge()
        
        self.img = cv2.imread('/home/fullord/radar_drone_ws/real_bus.jpg')
        if self.img is None:
            self.get_logger().error("Failed to load bus.jpg.")
            sys.exit(1)
            
        self.timer = self.create_timer(1.0, self.publish_payload)
        self.count = 0

    def publish_payload(self):
        if self.count >= 5:
            raise SystemExit
        
        odom_msg = Odometry()
        odom_msg.pose.pose.position.x = -25.0
        odom_msg.pose.pose.position.y = 15.5
        odom_msg.pose.pose.position.z = 4.0
        self.odom_pub.publish(odom_msg)
        
        img_msg = self.bridge.cv2_to_imgmsg(self.img, "bgr8")
        self.img_pub.publish(img_msg)
        self.get_logger().info(f"Published bus frame {self.count + 1}/5")
        
        self.count += 1

def main():
    rclpy.init()
    node = TestSpatialPublisher()
    try:
        rclpy.spin(node)
    except SystemExit:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
