-- recreate database from scratch
DROP DATABASE IF EXISTS `orderbook_db`;
CREATE DATABASE `orderbook_db`
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;
USE `orderbook_db`;

-- users
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `email`    VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_users_username` (`username`),
  UNIQUE INDEX `uq_users_email`    (`email`)
) ENGINE=InnoDB;

-- orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id`         INT    NOT NULL AUTO_INCREMENT,
  `symbol`     VARCHAR(10)         NOT NULL,
  `side`       ENUM('BUY','SELL')  NOT NULL,
  `price`      DECIMAL(10,2)       NOT NULL,
  `quantity`   DECIMAL(10,4)       NOT NULL,
  `filled_quantity` DECIMAL(10,4)  NOT NULL DEFAULT 0,
  `status`     ENUM('PENDING','PARTIAL','FILLED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `created_at` TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id`    INT                 NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_orders_symbol_side_price` (`symbol`,`side`,`price`),
  INDEX `idx_orders_user` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

-- transactions (completed trades)
CREATE TABLE IF NOT EXISTS `transactions` (
  `id`             INT NOT NULL AUTO_INCREMENT,
  `buy_order_id`   INT NOT NULL,
  `sell_order_id`  INT NOT NULL,
  `symbol`         VARCHAR(10)         NOT NULL,
  `price`          DECIMAL(10,2)       NOT NULL,
  `quantity`       DECIMAL(10,4)       NOT NULL,
  `executed_at`    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_txn_buy`  (`buy_order_id`),
  INDEX `idx_txn_sell` (`sell_order_id`),
  FOREIGN KEY (`buy_order_id`)  REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`sell_order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

-- balances
CREATE TABLE IF NOT EXISTS `balances` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `user_id`    INT NOT NULL,
  `asset`      VARCHAR(10)    NOT NULL,
  `available`  DECIMAL(18,8)  NOT NULL DEFAULT 0,
  `reserved`   DECIMAL(18,8)  NOT NULL DEFAULT 0,
  `updated_at` TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `ux_balances_user_asset` (`user_id`,`asset`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;
