-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: restaurant_booking
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `booking`
--

DROP TABLE IF EXISTS `booking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(100) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `booking_time` datetime DEFAULT NULL,
  `people` int DEFAULT NULL,
  `table_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `table_id` (`table_id`),
  CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`table_id`) REFERENCES `table` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking`
--

LOCK TABLES `booking` WRITE;
/*!40000 ALTER TABLE `booking` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `CategoryID` int NOT NULL AUTO_INCREMENT,
  `CategoryName` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`CategoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Combo'),(2,'Nước uống'),(3,'Món nóng'),(4,'Món lạnh'),(5,'Thịt'),(6,'Hải Sản'),(7,'Tráng miệng'),(8,'Khai Vị');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cuisine`
--

DROP TABLE IF EXISTS `cuisine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuisine` (
  `CuisineID` int NOT NULL AUTO_INCREMENT,
  `CuisineName` varchar(100) NOT NULL,
  `Status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`CuisineID`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuisine`
--

LOCK TABLES `cuisine` WRITE;
/*!40000 ALTER TABLE `cuisine` DISABLE KEYS */;
INSERT INTO `cuisine` VALUES (1,'Lẩu','Hoạt động'),(2,'Nướng','Hoạt động'),(3,'Hải sản','Hoạt động');
/*!40000 ALTER TABLE `cuisine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customerorder`
--

DROP TABLE IF EXISTS `customerorder`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customerorder` (
  `OrderID` int NOT NULL AUTO_INCREMENT,
  `TableID` int NOT NULL,
  `RestaurantID` int DEFAULT NULL,
  `TotalAmount` decimal(10,2) DEFAULT NULL,
  `Status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`OrderID`),
  KEY `TableID` (`TableID`),
  CONSTRAINT `customerorder_ibfk_1` FOREIGN KEY (`TableID`) REFERENCES `restauranttables` (`TableID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customerorder`
--

LOCK TABLES `customerorder` WRITE;
/*!40000 ALTER TABLE `customerorder` DISABLE KEYS */;
/*!40000 ALTER TABLE `customerorder` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `food`
--

DROP TABLE IF EXISTS `food`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `food` (
  `FoodID` varchar(8) NOT NULL,
  `FoodName` varchar(100) NOT NULL,
  `RestaurantID` int DEFAULT NULL,
  `Price` decimal(10,2) NOT NULL,
  `CategoryID` int DEFAULT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `Status` varchar(50) DEFAULT 'Còn Món',
  `Image_URL` varchar(255) DEFAULT NULL,
  `Category` varchar(255) DEFAULT NULL,
  `Visible` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`FoodID`),
  KEY `CategoryID` (`CategoryID`),
  KEY `RestaurantID` (`RestaurantID`),
  CONSTRAINT `food_ibfk_1` FOREIGN KEY (`CategoryID`) REFERENCES `category` (`CategoryID`),
  CONSTRAINT `food_ibfk_2` FOREIGN KEY (`RestaurantID`) REFERENCES `restaurant` (`RestaurantID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `food`
--

LOCK TABLES `food` WRITE;
/*!40000 ALTER TABLE `food` DISABLE KEYS */;
INSERT INTO `food` VALUES ('1XQ01','Kimchi ',2,25000.00,NULL,NULL,'Còn Món','/static/images/Food/Nuong/kimchi.jpg','Khai vị',1),('BCBM','Ba Chỉ Bò Mỹ',2,90000.00,5,'Thịt ba chỉ bò Mỹ mềm, thích hợp nướng hoặc nhúng lẩu','Còn Món',NULL,NULL,1),('BFTM','Buffet Tráng Miệng',1,45000.00,7,'Buffet trái cây và nước tráng miệng','Còn Món',NULL,NULL,1),('BTM','Bạch Tuộc Mini',2,85000.00,6,'Bạch tuộc mini tươi giòn thích hợp nướng','Còn Món',NULL,NULL,1),('CBN','Combo Nấm',2,100000.00,1,'Combo nhiều loại nấm tươi ăn kèm lẩu','Còn Món',NULL,NULL,1),('LCD','Lẩu Cua Đồng',1,100000.00,3,'Lẩu cua đồng đậm vị truyền thống ăn kèm rau tươi','Còn Món',NULL,NULL,1),('LKC','Lẩu Kimchi ',1,160000.00,3,'Lẩu kimchi Hàn Quốc cay nhẹ với thịt và đậu hũ','Còn Món','/static/images/laukimchi.jpg',NULL,1),('LM','Lẩu Mala',1,50000.00,3,'Lẩu cay tê đặc trưng Tứ Xuyên với nhiều loại topping','Còn Món',NULL,NULL,1),('LT','Lẩu Thái',1,50000.00,3,'Lẩu chua cay kiểu Thái với hải sản tươi và rau','Còn Món',NULL,NULL,1),('LTX','Lẩu Tứ Xuyên',1,50000.00,3,'Lẩu cay nồng đậm vị tiêu hoa Tứ Xuyên','Còn Món',NULL,NULL,1),('LVB','Lõi Vai Bò',2,90000.00,5,'Phần lõi vai bò mềm, ít mỡ, nướng rất đậm vị','Còn Món',NULL,NULL,1),('MJBWH','ComBo Rau',1,100000.00,NULL,NULL,'Còn Món','/static/images/Food/Lau/comboraunam.jpg',NULL,1),('NVH','Nạc Vai Heo',2,100000.00,5,'Thịt nạc vai heo mềm, thích hợp nướng BBQ','Còn Món',NULL,NULL,1),('QPVM9','Hải Sản Tổng Hợp',1,290000.00,NULL,NULL,'Còn Món','/static/images/Food/Lau/haisantonghop.jpg',NULL,1),('RSAK','Rau Sống Ăn Kèm',2,90000.00,1,'Rau sống tươi ăn kèm các món nướng','Còn Món',NULL,NULL,1),('SDMH','Sò Điệp Mỡ Hành',2,85000.00,6,'Sò điệp tươi nướng mỡ hành thơm béo','Còn Món',NULL,NULL,1),('SGO80','Lẩu Bò ',1,150000.00,NULL,NULL,'Còn Món','/static/images/Food/Lau/laubonhunggiam.jpg',NULL,1),('SNMO','Sườn Non Ướp Mật Ong',2,120000.00,5,'Sườn non tẩm mật ong nướng thơm ngọt','Còn Món',NULL,NULL,1),('STL','Set Thịt Lớn',1,240000.00,1,'Set thịt lớn tẩm ướp đậm vị dùng với lẩu','Còn Món',NULL,NULL,1),('STN','Set Thịt Nhỏ',1,120000.00,1,'Set thịt nhỏ gồm bò, heo và rau ăn kèm','Còn Món',NULL,NULL,1),('TCTH','Trái Cây Tổng Hợp',2,100000.00,7,'Đĩa trái cây tươi theo mùa tráng miệng','Còn Món',NULL,NULL,1),('THI','Thịt Heo Iberico',2,70000.00,5,'Thịt heo Iberico cao cấp, mềm ngọt tự nhiên','Còn Món',NULL,NULL,1),('TNST','Tôm Nướng Sa Tế',2,240000.00,6,'Tôm tươi nướng sa tế cay thơm','Còn Món',NULL,NULL,1);
/*!40000 ALTER TABLE `food` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu`
--

DROP TABLE IF EXISTS `menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `price` float DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `description` text,
  `visible` tinyint(1) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `RestaurantID` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3723 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu`
--

LOCK TABLES `menu` WRITE;
/*!40000 ALTER TABLE `menu` DISABLE KEYS */;
INSERT INTO `menu` VALUES (3699,'Lẩu Thái',50000,'/static/images/Food/Lau/lauthai.jpg','lau',NULL,1,'active',NULL),(3700,'Lẩu Mala',50000,'/static/images/Food/Lau/laumala.jpg','lau',NULL,1,'active',NULL),(3701,'Lẩu Cua Đồng',50000,'/static/images/Food/Lau/laucuadong.jpg','lau',NULL,1,'active',NULL),(3702,'Lẩu Kimchi',60000,'/static/images/Food/Lau/laukimchi.jpg','lau',NULL,1,'active',NULL),(3703,'Lẩu Tứ Xuyên',50000,'/static/images/Food/Lau/lautuxuyen.jpg','lau',NULL,1,'active',NULL),(3704,'Lẩu Bò Nhúng Giấm',50000,'/static/images/Food/Lau/laubonhunggiam.jpg','lau',NULL,1,'active',NULL),(3705,'Set Thịt Nhỏ',120000,'/static/images/Food/Lau/setthitnho.jpg','lau',NULL,1,'active',NULL),(3706,'Hải Sản Tổng Hợp',150000,'/static/images/Food/Lau/haisantonghop.jpg','lau',NULL,1,'active',NULL),(3707,'Combo Rau Nấm',100000,'/static/images/Food/Lau/comboraunam.jpg','lau',NULL,1,'active',NULL),(3708,'Set Thịt Lớn',240000,'/static/images/Food/Lau/setthitlon.jpg','lau',NULL,1,'active',NULL),(3709,'Set Viên Thả Lẩu',100000,'/static/images/Food/Lau/setvienthalau.jpg','lau',NULL,1,'active',NULL),(3710,'Buffet Tráng Miệng',50000,'/static/images/Food/Lau/buffettrangmieng.jpg','lau',NULL,1,'active',NULL),(3711,'Ba Chỉ Bò Mỹ',90000,'/static/images/Food/Nuong/bachibomy.png','nuong',NULL,1,'active',NULL),(3712,'Lõi Vai Bò',90000,'/static/images/Food/Nuong/loivaibo.jpg','nuong',NULL,1,'active',NULL),(3713,'Thịt Heo Iberico',70000,'/static/images/Food/Nuong/thitheoiberico.jpg','nuong',NULL,1,'active',NULL),(3714,'Kimchi',25000,'/static/images/Food/Nuong/kimchi.jpg','nuong',NULL,1,'active',NULL),(3715,'Bạch Tuộc Mini',85000,'/static/images/Food/Nuong/bachtuocmini.jpg','nuong',NULL,1,'active',NULL),(3716,'Sò Điệp Mỡ Hành',85000,'/static/images/Food/Nuong/sodiepnuongmohanh.jpg','nuong',NULL,1,'active',NULL),(3717,'Sườn Non Ướp Mật Ong',120000,'/static/images/Food/Nuong/suonnonuopmatong.jpg','nuong',NULL,1,'active',NULL),(3718,'Rau Sống Ăn Kèm',90000,'/static/images/Food/Nuong/rausongankem.jpg','nuong',NULL,1,'active',NULL),(3719,'Combo Nấm',100000,'/static/images/Food/Nuong/combonam.png','nuong',NULL,1,'active',NULL),(3720,'Tôm Nướng Sa Tế',240000,'/static/images/Food/Nuong/tomnuongsate.jpg','nuong',NULL,1,'active',NULL),(3721,'Nạc Vai Heo',100000,'/static/images/Food/Nuong/nacvaiheo.jpg','nuong',NULL,1,'active',NULL),(3722,'Trái Cây Tổng Hợp',100000,'/static/images/Food/Nuong/traicaytonghop.jpg','nuong',NULL,1,'active',NULL);
/*!40000 ALTER TABLE `menu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_item`
--

DROP TABLE IF EXISTS `order_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `price` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `food_id` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_item_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_item`
--

LOCK TABLES `order_item` WRITE;
/*!40000 ALTER TABLE `order_item` DISABLE KEYS */;
INSERT INTO `order_item` VALUES (1,7,'Kimchi',25000,1,'1XQ01'),(2,7,'Ba Chỉ Bò Mỹ',90000,1,'BCBM'),(3,8,'Buffet Tráng Miệng',45000,1,'BFTM'),(4,8,'Combo Rau Nấm',100000,1,'CBRN'),(5,9,'Buffet Tráng Miệng',45000,1,'BFTM'),(6,9,'Combo Rau Nấm',100000,1,'CBRN'),(7,10,'Lẩu Bò Nhúng Giấm',50000,1,'LBNG'),(8,10,'Combo Rau Nấm',100000,1,'CBRN'),(9,10,'Buffet Tráng Miệng',45000,1,'BFTM'),(10,11,'Lẩu Bò Nhúng Giấm',50000,2,'LBNG'),(11,11,'Combo Rau Nấm',100000,2,'CBRN'),(12,11,'Buffet Tráng Miệng',45000,1,'BFTM'),(13,12,'Kimchi',25000,1,'1XQ01'),(14,12,'Ba Chỉ Bò Mỹ',90000,1,'BCBM'),(15,12,'Combo Nấm',100000,1,'CBN'),(16,12,'Nạc Vai Heo',100000,1,'NVH'),(17,13,'Combo Rau Nấm',100000,1,'CBRN'),(18,13,'Lẩu Cua Đồng',50000,2,'LCD'),(19,14,'Ba Chỉ Bò Mỹ',90000,2,'BCBM'),(20,14,'Combo Nấm',100000,2,'CBN'),(21,14,'Nạc Vai Heo',100000,2,'NVH'),(22,14,'Sò Điệp Mỡ Hành',85000,3,'SDMH'),(23,14,'Rau Sống Ăn Kèm',90000,1,'RSAK'),(24,14,'Sườn Non Ướp Mật Ong',120000,1,'SNMO'),(25,14,'Trái Cây Tổng Hợp',100000,1,'TCTH'),(26,15,'Combo Rau Nấm',100000,1,'CBRN'),(27,15,'Buffet Tráng Miệng',45000,1,'BFTM'),(28,16,'Buffet Tráng Miệng',45000,2,'BFTM'),(29,16,'Combo Rau Nấm',100000,2,'CBRN'),(30,16,'Lẩu Cua Đồng',50000,2,'LCD'),(31,16,'Set Thịt Nhỏ',120000,2,'STN'),(32,16,'Hải Sản Tổng Hợp',150000,1,'QPVM9'),(33,17,'Lẩu Cua Đồng',100000,1,'LCD'),(34,17,'Buffet Tráng Miệng',45000,2,'BFTM'),(35,17,'Lẩu Tứ Xuyên',50000,1,'LTX'),(36,17,'Set Thịt Lớn',240000,1,'STL'),(37,18,'Lẩu Cua Đồng',100000,1,'LCD'),(38,18,'Lẩu Bò Nhúng Giấm',50000,1,'SGO80'),(39,19,'Lẩu Kimchi Hàn',160000,2,'LKC'),(40,19,'Hải Sản Tổng Hợp',290000,2,'QPVM9'),(41,19,'ComBo Rau',100000,2,'MJBWH'),(42,19,'Buffet Tráng Miệng',45000,2,'BFTM'),(43,20,'Lẩu Kimchi ',160000,1,'LKC'),(44,20,'ComBo Rau',100000,3,'MJBWH'),(45,20,'Lẩu Bò Nhúng Giấm',50000,1,'SGO80'),(46,20,'Set Thịt Nhỏ',120000,1,'STN'),(47,20,'Set Thịt Lớn',240000,1,'STL'),(48,20,'Hải Sản Tổng Hợp',290000,1,'QPVM9'),(49,21,'Lẩu Cua Đồng',100000,1,'LCD'),(50,22,'Buffet Tráng Miệng',45000,3,'BFTM'),(51,22,'Lẩu Cua Đồng',100000,2,'LCD'),(52,22,'Lẩu Bò Nhúng Giấm',50000,2,'SGO80');
/*!40000 ALTER TABLE `order_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderdetail`
--

DROP TABLE IF EXISTS `orderdetail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderdetail` (
  `OrderDetailID` int NOT NULL AUTO_INCREMENT,
  `OrderID` int DEFAULT NULL,
  `FoodID` varchar(8) DEFAULT NULL,
  `Quantity` int DEFAULT NULL,
  `Price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`OrderDetailID`),
  KEY `OrderID` (`OrderID`),
  KEY `FoodID` (`FoodID`),
  CONSTRAINT `orderdetail_ibfk_1` FOREIGN KEY (`OrderID`) REFERENCES `customerorder` (`OrderID`),
  CONSTRAINT `orderdetail_ibfk_2` FOREIGN KEY (`FoodID`) REFERENCES `food` (`FoodID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderdetail`
--

LOCK TABLES `orderdetail` WRITE;
/*!40000 ALTER TABLE `orderdetail` DISABLE KEYS */;
/*!40000 ALTER TABLE `orderdetail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `table_id` int DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `table_id` (`table_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`table_id`) REFERENCES `table` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,'paid'),(2,2,'paid'),(3,34,'paid'),(4,18,'paid'),(5,3,'paid'),(6,5,'paid'),(7,19,'paid'),(8,1,'paid'),(9,1,'paid'),(10,13,'paid'),(11,14,'paid'),(12,20,'paid'),(13,2,'paid'),(14,19,'paid'),(15,5,'paid'),(16,1,'paid'),(17,3,'active'),(18,8,'paid'),(19,4,'paid'),(20,4,'paid'),(21,13,'paid'),(22,6,'paid');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `PaymentID` int NOT NULL AUTO_INCREMENT,
  `ReservationID` int NOT NULL,
  `Amount` decimal(10,2) DEFAULT NULL,
  `Status` varchar(50) DEFAULT NULL,
  `PaymentMethod` varchar(50) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`PaymentID`),
  KEY `ReservationID` (`ReservationID`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`ReservationID`) REFERENCES `reservations` (`ReservationID`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,8,200000.00,'Paid','QR','2026-04-11 17:34:10'),(2,9,0.00,'Paid','QR','2026-04-11 18:31:32'),(3,10,300000.00,'Paid','QR','2026-04-11 22:04:04'),(4,11,50000.00,'Paid','QR','2026-04-11 23:08:05'),(5,12,250000.00,'Paid','QR','2026-04-11 23:29:31'),(6,13,100000.00,'Paid','QR','2026-04-11 23:45:05'),(7,16,200000.00,'Paid','QR','2026-04-13 15:19:46'),(8,17,100000.00,'Paid','QR','2026-04-13 15:58:29'),(9,18,100000.00,'Paid','QR','2026-04-13 16:41:43'),(10,19,100000.00,'Paid','QR','2026-04-13 17:00:53'),(11,20,250000.00,'Paid','QR','2026-04-13 17:45:11'),(12,21,150000.00,'Paid','QR','2026-04-13 20:47:43'),(13,22,150000.00,'Paid','QR','2026-04-13 21:36:01'),(14,23,100000.00,'Paid','QR','2026-04-13 21:44:20'),(15,24,100000.00,'Paid','QR','2026-04-15 11:08:48'),(16,25,150000.00,'Paid','QR','2026-04-15 11:22:34'),(17,26,50000.00,'Paid','QR','2026-04-15 11:30:31'),(18,27,150000.00,'Paid','QR','2026-04-16 21:47:50'),(19,29,100000.00,'Paid','QR','2026-04-17 12:35:56'),(20,30,150000.00,'Paid','QR','2026-04-17 17:31:51'),(21,31,300000.00,'Paid','QR','2026-04-19 20:15:08'),(22,32,100000.00,'Paid','QR','2026-04-19 20:20:03'),(23,33,200000.00,'Paid','QR','2026-04-19 20:28:13'),(24,34,350000.00,'Paid','QR','2026-04-19 20:30:22'),(25,35,200000.00,'Paid','QR','2026-04-19 21:47:18'),(26,37,200000.00,'Paid','QR','2026-05-05 02:50:11'),(27,38,250000.00,'Paid','QR','2026-05-06 02:21:29'),(28,40,100000.00,'Paid','QR','2026-05-06 02:33:30'),(29,41,200000.00,'Paid','QR','2026-05-09 22:53:00'),(30,42,200000.00,'Paid','QR','2026-05-10 00:26:54'),(31,43,100000.00,'Paid','QR','2026-05-10 01:07:18'),(32,44,50000.00,'Paid','QR','2026-05-10 13:37:59'),(33,45,100000.00,'Paid','QR','2026-05-10 16:09:02'),(34,46,200000.00,'Paid','QR','2026-05-10 16:16:47'),(35,47,200000.00,'Paid','QR','2026-05-10 21:53:15'),(36,48,150000.00,'Paid','QR','2026-05-11 11:55:56'),(37,49,300000.00,'Paid','QR','2026-05-11 12:47:28'),(38,50,200000.00,'Paid','QR','2026-05-13 13:49:44'),(39,51,250000.00,'Paid','QR','2026-05-13 14:11:11'),(40,52,350000.00,'Paid','QR','2026-05-13 14:11:49'),(41,53,250000.00,'Paid','QR','2026-05-13 14:13:09'),(42,54,250000.00,'Paid','QR','2026-05-13 14:16:50'),(43,55,350000.00,'Paid','QR','2026-05-13 14:24:18'),(44,56,300000.00,'Paid','QR','2026-05-14 14:43:16'),(45,57,300000.00,'Paid','QR','2026-05-18 00:13:05'),(46,58,350000.00,'Paid','QR','2026-05-18 00:14:57'),(47,59,300000.00,'Paid','QR','2026-05-18 03:14:36');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservations` (
  `ReservationID` int NOT NULL AUTO_INCREMENT,
  `UserID` varchar(100) DEFAULT NULL,
  `CustomerName` varchar(100) NOT NULL,
  `phone` varchar(11) NOT NULL,
  `RestaurantID` int DEFAULT NULL,
  `TableID` int DEFAULT NULL,
  `BookingDate` date NOT NULL,
  `BookingTime` time NOT NULL,
  `GuestCount` int NOT NULL,
  `Deposit` decimal(10,2) NOT NULL,
  `Note` varchar(300) DEFAULT NULL,
  `Status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ReservationID`),
  KEY `TableID` (`TableID`),
  CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`TableID`) REFERENCES `restauranttables` (`TableID`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservations`
--

LOCK TABLES `reservations` WRITE;
/*!40000 ALTER TABLE `reservations` DISABLE KEYS */;
INSERT INTO `reservations` VALUES (1,NULL,'Thanh Ngân','0901234567',1,10,'2026-04-12','19:30:00',4,200000.00,NULL,'Cancelled'),(2,NULL,'Thanh','0985676767',1,5,'2026-04-02','16:30:00',2,100000.00,NULL,'Cancelled'),(3,NULL,'hi','0989898899',1,3,'2026-04-11','17:02:00',4,200000.00,NULL,'Cancelled'),(4,NULL,'bdjhgeyw','0908989899',1,2,'2026-04-11','17:13:00',4,200000.00,NULL,'Cancelled'),(5,NULL,'hguyug','9809978978',1,2,'2026-04-11','17:16:00',4,200000.00,NULL,'Cancelled'),(6,NULL,'hi','0987878789',1,2,'2026-04-11','17:20:00',4,200000.00,NULL,'Cancelled'),(7,NULL,'hi','0987878789',1,2,'2026-04-11','17:23:00',4,200000.00,NULL,'Cancelled'),(8,NULL,'hi','0989898988',1,2,'2026-04-11','17:33:00',4,200000.00,NULL,'Confirmed'),(9,NULL,'Ngan','0998989899',1,3,'2026-04-11','18:31:00',0,0.00,NULL,'Confirmed'),(10,NULL,'Ngan','0989789789',1,6,'2026-04-11','12:37:00',6,300000.00,NULL,'Confirmed'),(11,NULL,'Ngan','0989789789',1,3,'2026-04-11','12:07:00',1,50000.00,NULL,'Confirmed'),(12,NULL,'Zit','0988998899',1,6,'2026-04-11','12:30:00',5,250000.00,NULL,'Confirmed'),(13,NULL,'Zit','0988998899',2,18,'2026-04-11','12:45:00',2,100000.00,NULL,'Confirmed'),(14,NULL,'Ngan','0989789789',1,3,'2026-04-13','15:08:00',4,200000.00,NULL,'Cancelled'),(15,NULL,'Ngan','0989789789',1,4,'2026-04-13','15:20:00',4,200000.00,NULL,'Cancelled'),(16,NULL,'Ngan','0989789789',1,2,'2026-04-13','15:20:00',4,200000.00,NULL,'Confirmed'),(17,NULL,'Ngan','0989789789',1,2,'2026-04-13','15:00:00',2,100000.00,NULL,'Confirmed'),(18,NULL,'Ngan','0989789789',1,1,'2026-04-13','16:41:00',2,100000.00,NULL,'Confirmed'),(19,NULL,'Ngan','0777777788',1,1,'2026-04-13','17:00:00',2,100000.00,NULL,'Confirmed'),(20,NULL,'Ngan','0777777788',2,23,'2026-04-14','18:00:00',5,250000.00,NULL,'Confirmed'),(21,'9','Zit','0988998899',2,19,'2026-04-13','20:50:00',3,150000.00,NULL,'Confirmed'),(22,'9','Zit','0988998899',1,2,'2026-04-13','21:35:00',3,150000.00,NULL,'Confirmed'),(23,'9','Zit','0988998899',2,18,'2026-04-13','21:45:00',2,100000.00,NULL,'Confirmed'),(24,'7','Ngan','0777777788',1,1,'2026-04-15','11:00:00',2,100000.00,NULL,'Confirmed'),(25,'7','Ngan','0777777788',1,1,'2026-04-15','16:00:00',3,150000.00,NULL,'Confirmed'),(26,'7','Ngan','0777777788',1,1,'2026-04-15','11:30:00',1,50000.00,NULL,'Confirmed'),(27,'7','Ngan','0777777788',1,2,'2026-04-16','10:30:00',3,150000.00,NULL,'Confirmed'),(28,'7','Ngan','0777777788',1,1,'2026-04-17','12:00:00',2,100000.00,NULL,'Cancelled'),(29,'7','Ngan','0777777788',1,3,'2026-04-17','12:00:00',2,100000.00,NULL,'Confirmed'),(30,'7','Ngan','0777777788',2,18,'2026-04-17','17:31:00',3,150000.00,NULL,'Confirmed'),(31,'7','Ngan','0777777788',2,30,'2026-04-19','20:00:00',6,300000.00,NULL,'Cancelled'),(32,'7','Ngan','0777777788',2,18,'2026-04-19','16:00:00',2,100000.00,NULL,'Cancelled'),(33,'7','Ngan','0777777788',1,5,'2026-04-19','20:30:00',4,200000.00,NULL,'Confirmed'),(34,'7','Zit','0988998899',2,34,'2026-04-19','16:30:00',7,350000.00,NULL,'Confirmed'),(35,'9','Zit','0988998899',2,19,'2026-04-19','21:30:00',4,200000.00,NULL,'Confirmed'),(36,'7','Ngan','0777777788',1,1,'2026-04-21','10:22:00',2,100000.00,NULL,'Confirmed'),(37,'9','Zit','0988998899',1,3,'2026-05-05','20:49:00',4,200000.00,'','Confirmed'),(38,'7','Ngan','0777777788',1,13,'2026-05-06','10:21:00',5,250000.00,'','Confirmed'),(39,'7','Ngan','0777777788',1,1,'2026-05-06','10:24:00',2,100000.00,'','Confirmed'),(40,'7','Ngan','0777777788',1,14,'2026-05-06','10:24:00',2,100000.00,'','Confirmed'),(41,'7','Zit','0988998899',2,20,'2026-05-10','16:52:00',4,200000.00,'','Confirmed'),(42,'9','Zit','0988998899',2,19,'2026-05-17','18:26:00',4,200000.00,'','Confirmed'),(43,'9','Ngan','0777777788',1,2,'2026-05-24','17:06:00',2,100000.00,'bàn trẻ em','Confirmed'),(44,'7','Ngan','0777777788',1,5,'2026-05-12','16:37:00',1,50000.00,'','Confirmed'),(45,NULL,'Hiền','0777777888',2,18,'2026-05-13','16:08:00',2,100000.00,'','Confirmed'),(46,NULL,'Thanh','0345678889',1,1,'2026-05-10','18:16:00',4,200000.00,'','Confirmed'),(47,'7','Ngan','0777777788',1,1,'2026-05-12','13:00:00',4,200000.00,'','Confirmed'),(48,'7','Ngan','0777777788',1,3,'2026-05-12','11:55:00',3,150000.00,'','Confirmed'),(49,NULL,'Hiền','0778899668',1,4,'2026-05-13','13:00:00',6,300000.00,'','Cancelled'),(50,'7','Ngan','0777777788',1,4,'2026-05-14','13:44:00',4,200000.00,'','Rejected'),(51,'7','Ngan','0777777788',1,4,'2026-05-14','11:00:00',5,250000.00,'','Confirmed'),(52,'7','Ngan','0777777788',1,8,'2026-05-14','11:00:00',7,350000.00,'','Confirmed'),(53,'7','Ngan','0777777788',2,21,'2026-05-14','16:00:00',5,250000.00,'','Cancelled'),(54,'7','Ngan','0777777788',2,23,'2026-05-14','16:00:00',5,250000.00,'','Cancelled'),(55,NULL,'Hiền','0123456789',2,25,'2026-05-15','18:24:00',7,350000.00,'','Cancelled'),(56,NULL,'Ngan','0777777788',1,4,'2026-05-15','14:30:00',6,300000.00,'','Confirmed'),(57,'7','Ngan','0777777788',1,13,'2026-05-21','12:00:00',6,300000.00,'','Confirmed'),(58,'7','Ngan','0777777788',1,8,'2026-05-21','13:15:00',7,350000.00,'','Pending'),(59,'7','Ngan','0777777788',1,6,'2026-05-20','13:15:00',6,300000.00,'','Confirmed');
/*!40000 ALTER TABLE `reservations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant`
--

DROP TABLE IF EXISTS `restaurant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant` (
  `RestaurantID` int NOT NULL AUTO_INCREMENT,
  `RestaurantName` varchar(100) NOT NULL,
  `Address` varchar(200) DEFAULT NULL,
  `Phone` varchar(11) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Opentime` time DEFAULT NULL,
  `Closetime` time DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `status` varchar(50) NOT NULL,
  `UserID` int DEFAULT NULL,
  `CuisineID` int DEFAULT NULL,
  PRIMARY KEY (`RestaurantID`),
  KEY `CuisineID` (`CuisineID`),
  CONSTRAINT `restaurant_ibfk_1` FOREIGN KEY (`CuisineID`) REFERENCES `cuisine` (`CuisineID`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant`
--

LOCK TABLES `restaurant` WRITE;
/*!40000 ALTER TABLE `restaurant` DISABLE KEYS */;
INSERT INTO `restaurant` VALUES (1,'Hotpot','123 Đường Nguyễn Đình Chiểu, Quận 3, TP.HCM','0901234567','contact@hotpot.vn','10:00:00','22:30:00','Nhà hàng lẩu Tứ Xuyên siêu cay khổng lồ, không gian ấm cúng phù hợp cho gia đình và nhóm bạn.','Đang hoạt động',12,1),(2,'Grill House','456 Đường Sư Vạn Hạnh, Quận 10, TP.HCM','0987654321','booking@grillhouse.vn','16:00:00','23:59:00','Đồ nướng BBQ Hàn Quốc xèo xèo, thịt bò nhập khẩu tươi ngon, view check-in cực xịn.','Đang hoạt động',13,2),(3,'Nhà hàng nướng','HCM','0987654321','booking@grillhouse.vn','09:29:00','23:34:00','nhà hàng nướng','Ngưng hoạt động',1,2),(4,'Kichi','HN','0123456789','kichi@gmail.com','09:33:00','23:33:00','nhà hàng lẩu','Đang hoạt động',13,1),(5,'Hải Sản 36','HN','0987654321','haisan36@gmail.com','07:45:00','00:45:00','Hải sản tươi sống\r\n','Đang hoạt động',12,3),(6,'Hải Sản ','HN','0987654321','haisan@gmail.com','08:07:00','23:07:00','Hải sản','Đang hoạt động',12,3),(7,'Quán Nướng','HCM','0123456777','nuong@gmail.com','10:00:00','22:00:00','Quán nướng','Đang chờ duyệt',13,2),(8,'Buffet Hải Sản','HN','0987654333','bf@gmail.com','08:00:00','23:00:00','Hải sản','Ngưng hoạt động',15,3),(9,'Buffet Hải Sản','HCM','0987654321','haisan@gmail.com','09:29:00','23:29:00','hải sản','Đang chờ duyệt',13,3),(10,'Lẩu băng chuyền','HN','0987654321','kichi@gmail.com','10:00:00','22:00:00','lẩu','Ngưng hoạt động',12,1),(11,'bf lẩu','HN','0123456789','bf@gmail.com','08:31:00','22:31:00','lẩu','Đang chờ duyệt',12,1),(12,'Buffet Nướng','HCM','0987654336','bfnuong@gmail.com','08:00:00','22:00:00','bf nướng','Ngưng hoạt động',12,2),(13,'Buffet Nướng','HCM','0987654333','bf@gmail.com','08:01:00','22:01:00','bf nướng','Ngưng hoạt động',1,2),(14,'Buffet Nướng','HCM','0987654321','bf@gmail.com','10:00:00','23:00:00','bf nướng','Đang hoạt động',1,2),(15,'Hải Sản Thủy','HCM','0987654776','haisan@gmail.com','10:00:00','23:00:00','lẩu','Từ chối',12,3),(16,'Buffet','HCM','0123456889','bf@gmail.com','10:00:00','22:18:00','buffet','Đang hoạt động',12,3),(17,'Nhà','HCM','0987654321','nha@gmail.com','08:30:00','23:00:00','Nhà','Ngưng hoạt động',1,2),(18,'Hải Sản','HN','0987654234','haisan@gmail.com','10:00:00','00:00:00','Hải Sản Tươi Ngon','Ngưng hoạt động',1,2),(19,'ỐC NGA','HN','0987654321','oc@gmail.com','12:00:00','00:00:00','Ốc Mới Mỗi Ngày','Đang chờ duyệt',12,2),(20,'Buffet Hải Sản','HCM','0987654321','bf@gmail.com','09:00:00','22:00:00','Hải sản tươi ngon','Ngưng hoạt động',12,3),(21,'Buffet Hải Sản','HCM','0987654311','bf@gmail.com','09:00:00','22:00:00','bf hải sản','Đang hoạt động',12,3),(22,'Buffet Nướng','HN','0987654888','bf@gmail.com','08:00:00','23:59:00','bf nướng','Đang hoạt động',1,2);
/*!40000 ALTER TABLE `restaurant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restauranttables`
--

DROP TABLE IF EXISTS `restauranttables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restauranttables` (
  `TableID` int NOT NULL AUTO_INCREMENT,
  `RestaurantID` int NOT NULL,
  `TableNumber` varchar(10) NOT NULL,
  `Capacity` int NOT NULL,
  `Status` varchar(50) NOT NULL DEFAULT 'Trống',
  PRIMARY KEY (`TableID`),
  KEY `RestaurantID` (`RestaurantID`),
  CONSTRAINT `restauranttables_ibfk_1` FOREIGN KEY (`RestaurantID`) REFERENCES `restaurant` (`RestaurantID`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restauranttables`
--

LOCK TABLES `restauranttables` WRITE;
/*!40000 ALTER TABLE `restauranttables` DISABLE KEYS */;
INSERT INTO `restauranttables` VALUES (1,1,'Ban 1',4,'Available'),(2,1,'Ban 2',4,'Available'),(3,1,'Ban 3',4,'Available'),(4,1,'Ban 4',6,'Available'),(5,1,'Ban 5',4,'Available'),(6,1,'Ban 6',6,'Available'),(7,1,'Ban 7',4,'Trống'),(8,1,'Ban 8',8,'Available'),(9,1,'Ban 9',4,'Trống'),(10,1,'Ban 10',4,'Trống'),(11,1,'Ban 11',4,'Trống'),(12,1,'Ban 12',4,'Trống'),(13,1,'Ban 13',6,'Available'),(14,1,'Ban 14',4,'Available'),(15,1,'Ban 15',4,'Trống'),(16,1,'Ban 16',4,'Trống'),(17,1,'Ban 17',8,'Trống'),(18,2,'Ban 1',4,'Reserved'),(19,2,'Ban 2',4,'Available'),(20,2,'Ban 3',4,'Available'),(21,2,'Ban 4',6,'Trống'),(22,2,'Ban 5',4,'Trống'),(23,2,'Ban 6',6,'Trống'),(24,2,'Ban 7',4,'Trống'),(25,2,'Ban 8',8,'Trống'),(26,2,'Ban 9',4,'Trống'),(27,2,'Ban 10',4,'Trống'),(28,2,'Ban 11',4,'Trống'),(29,2,'Ban 12',4,'Trống'),(30,2,'Ban 13',6,'Trống'),(31,2,'Ban 14',4,'Trống'),(32,2,'Ban 15',4,'Trống'),(33,2,'Ban 16',4,'Trống'),(34,2,'Ban 17',8,'Trống'),(35,1,'B18',4,'Available'),(36,1,'B19',6,'Available'),(37,1,'B20',4,'Available'),(39,1,'B21',4,'Available');
/*!40000 ALTER TABLE `restauranttables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `ReviewID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `RestaurantID` int NOT NULL,
  `Rating` decimal(2,1) DEFAULT NULL,
  `Comment` varchar(255) DEFAULT NULL,
  `CreateAt` datetime DEFAULT NULL,
  `ReservationID` int DEFAULT NULL,
  PRIMARY KEY (`ReviewID`),
  KEY `UserID` (`UserID`),
  KEY `RestaurantID` (`RestaurantID`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`),
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`RestaurantID`) REFERENCES `restaurant` (`RestaurantID`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,7,1,3.0,'ok','2026-04-13 10:42:09',NULL),(2,7,2,5.0,'ổn','2026-04-13 10:45:30',NULL),(3,7,2,4.0,'ổn','2026-04-13 10:55:14',NULL),(4,9,2,4.0,'ok','2026-04-13 15:05:23',NULL),(5,9,2,4.0,'ok','2026-04-13 15:07:06',NULL),(6,9,2,4.0,'ổn','2026-04-13 15:18:21',NULL),(7,9,2,4.0,'ổn','2026-04-13 15:35:25',23),(8,7,2,4.0,'','2026-04-22 13:59:33',34),(9,7,1,NULL,'tuyệt','2026-04-22 14:07:21',33),(10,7,1,3.0,'','2026-05-10 14:53:37',44),(11,7,1,5.0,'ổn','2026-05-10 14:53:51',40),(12,7,1,4.0,'ổn, dịch vụ tốt','2026-05-13 10:32:39',48),(13,7,1,5.0,'tuyệt','2026-05-17 20:14:56',57);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `table`
--

DROP TABLE IF EXISTS `table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `table` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `seats` int DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `restaurant_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `restaurant_id` (`restaurant_id`),
  CONSTRAINT `table_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant` (`RestaurantID`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `table`
--

LOCK TABLES `table` WRITE;
/*!40000 ALTER TABLE `table` DISABLE KEYS */;
INSERT INTO `table` VALUES (1,'Bàn 1',4,'available',4,1),(2,'Bàn 2',4,'available',4,1),(3,'Bàn 3',4,'available',4,1),(4,'Bàn 4',6,'available',6,1),(5,'Bàn 5',4,'available',4,1),(6,'Bàn 6',6,'available',6,1),(7,'Bàn 7',4,'available',4,1),(8,'Bàn 8',4,'available',4,1),(9,'Bàn 9',4,'available',4,1),(10,'Bàn 10',4,'available',4,1),(11,'Bàn 11',4,'available',4,1),(12,'Bàn 12',4,'available',4,1),(13,'Bàn 13',6,'available',6,1),(14,'Bàn 14',4,'available',4,1),(15,'Bàn 15',4,'available',4,1),(16,'Bàn 16',4,'available',4,1),(17,'Bàn 17',8,'available',8,1),(18,'Bàn 1',4,'available',4,2),(19,'Bàn 2',4,'available',4,2),(20,'Bàn 3',4,'available',4,2),(21,'Bàn 4',6,'available',6,2),(22,'Bàn 5',4,'available',4,2),(23,'Bàn 6',6,'available',6,2),(24,'Bàn 7',4,'available',4,2),(25,'Bàn 8',4,'available',4,2),(26,'Bàn 9',4,'available',4,2),(27,'Bàn 10',4,'available',4,2),(28,'Bàn 11',4,'available',4,2),(29,'Bàn 12',4,'available',4,2),(30,'Bàn 13',6,'available',6,2),(31,'Bàn 14',4,'available',4,2),(32,'Bàn 15',4,'available',4,2),(33,'Bàn 16',4,'available',4,2),(34,'Bàn 17',8,'available',8,2);
/*!40000 ALTER TABLE `table` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tokens`
--

DROP TABLE IF EXISTS `tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokens` (
  `token_id` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`token_id`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `tokens_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tokens`
--

LOCK TABLES `tokens` WRITE;
/*!40000 ALTER TABLE `tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(50) NOT NULL,
  `Phone` varchar(11) DEFAULT NULL,
  `Email` varchar(90) DEFAULT NULL,
  `Password` varchar(50) NOT NULL,
  `Role` varchar(50) NOT NULL,
  `RestaurantID` int DEFAULT NULL,
  PRIMARY KEY (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','0123456789','admin@gmail.com','123456','ADMIN',NULL),(7,'Ngan','0777777788','ngan@gmail.com','1','CUSTOMER',NULL),(9,'Zit','0988998899','zit@gmail.com','1','CUSTOMER',NULL),(12,'restaurant1','0988998899','res1@gmail.com','1','STAFF',1),(13,'restaurant2','0123456677','res2@gmail.com','1','STAFF',2),(14,'testuser8','0123456789','test8@example.com','testpassword','CUSTOMER',NULL),(15,'zit1','03636363636','zit1@gmail.com','zit36@','STAFF',1),(18,'test2','03636363633','t2@gmail.com','1','STAFF',2),(20,'Staff1','0761278890','staff1@gmail.com','1','STAFF',4);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-18  4:06:36
