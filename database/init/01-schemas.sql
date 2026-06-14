-- UrbanFlow database bootstrap
CREATE DATABASE IF NOT EXISTS passenger_db;
CREATE DATABASE IF NOT EXISTS ticketing_db;
CREATE DATABASE IF NOT EXISTS gps_db;
CREATE DATABASE IF NOT EXISTS notification_db;
CREATE DATABASE IF NOT EXISTS analytics_db;

CREATE USER IF NOT EXISTS 'urbanflow'@'%' IDENTIFIED BY 'urbanflow_pass';
GRANT ALL PRIVILEGES ON passenger_db.* TO 'urbanflow'@'%';
GRANT ALL PRIVILEGES ON ticketing_db.* TO 'urbanflow'@'%';
GRANT ALL PRIVILEGES ON gps_db.* TO 'urbanflow'@'%';
GRANT ALL PRIVILEGES ON notification_db.* TO 'urbanflow'@'%';
GRANT ALL PRIVILEGES ON analytics_db.* TO 'urbanflow'@'%';
FLUSH PRIVILEGES;
