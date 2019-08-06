-- DROP DATABASE IF EXISTS bamazonDB;
CREATE DATABASE bamazonDB;

USE bamazonDB;

CREATE TABLE products
(
    item_id INT(6) NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    price FLOAT(2) NOT NULL,
    stock_quantity INT,

    PRIMARY KEY (item_id)
);
