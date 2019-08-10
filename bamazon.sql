-- DROP DATABASE IF EXISTS bamazonDB;
CREATE DATABASE bamazonDB;


-- CREATE TABLE products
-- (
--     item_id INT(6) NOT NULL
--     AUTO_INCREMENT,
--     product_name VARCHAR
--     (100) NOT NULL,
--     department_name VARCHAR
--     (100) NOT NULL,
--     price FLOAT
--     (2) NOT NULL,
--     stock_quantity INT,

--     PRIMARY KEY
--     (item_id)
-- );
USE bamazonDB;


CREATE TABLE products
(
    department_id INT(6) NOT NULL
    AUTO_INCREMENT,
    department_name VARCHAR
    (100) NOT NULL,
    over_head_costs FLOAT
    (2) NOT NULL,

    PRIMARY KEY
    (department_id)
);


-- Create a new MySQL table called departments. Your table should include the following columns:



-- department_id
-- department_name
-- over_head_costs (A dummy number you set for each department)



-- Modify the products table so that there's a product_sales column, and modify your bamazonCustomer.js app so that when a customer purchases anything from the store, the price of the product multiplied by the quantity purchased is added to the product's product_sales column.



-- Make sure your app still updates the inventory listed in the products column.