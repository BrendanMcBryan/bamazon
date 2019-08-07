// If a manager selects View Products for Sale, the app should list every available item: the item IDs, names, prices, and quantities.
// If a manager selects View Low Inventory, then it should list all items with an inventory count lower than five.
// If a manager selects Add to Inventory, your app should display a prompt that will let the manager "add more" of any item currently in the store.
// If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.

const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require("console.table");

const connection = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "rootpass",
  database: "bamazonDB"
});

function getConnected() {
  connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    // connection.end();
  });
}

function listProducts() {
  //   getConnected();
  connection.query(
    "SELECT * FROM products",
    // "SELECT * FROM products WHERE ?",
    // {
    //   department_name: "Produce"
    // },
    function(err, res) {
      if (err) throw err;
      //   console.log(res);
      const table = cTable.getTable(res);

      console.log(table);
      //   connection.end();
    }
  );
}

function welcome() {
  // getConnected();

  inquirer
    .prompt([
      {
        name: "managerChoice",
        type: "list",
        message: "What would youlike to do today, manager?",
        choices: [
          "View Products for Sale",
          "View Low Inventory",
          "Add to Inventory",
          "Add New Product"
        ]
      }
    ])
    .then(function(answer) {
      var chosenItem = answer.managerChoice;
      console.log(chosenItem);

      switch (answer.managerChoice) {
        case "View Products For Sale":
          viewProducts();
          break;
        case "View Low Inventory":
          viewLowInventory();
          break;
        case "Add to Inventory":
          addInventory();
          break;
        case "Add New Product":
          addNewProduct();
          break;
      }
    });
  //   connection.end();
}

function viewProducts() {
  console.log("view products was chosen");
  // listProducts();
  const query = connection.query(
    "SELECT * FROM products",
    // "SELECT * FROM products WHERE ?",
    // {
    //   department_name: "Produce"
    // },
    function(err, res) {
      if (err) throw err;
      //   console.log(res);
      let table = cTable.getTable(res);

      console.log(table);
      //   connection.end();
    }
  );
  // connection.end();
}

function viewLowInventory() {
  console.log("low invientory");
  const query = connection.query(
    "SELECT * FROM products",
    // "SELECT * FROM products WHERE ?",
    // {
    //   department_name: "Produce"
    // },
    function(err, res) {
      if (err) throw err;
      //   console.log(res);
      let table = cTable.getTable(res);

      console.log(table);
      //   connection.end();
    }
  );
  // connection.end();
}

function addInventory() {
  console.log("Add to Inventory chosen");
  inquirer
    .prompt([
      {
        name: "updateID",
        type: "numer",
        message: "Which product ID would you like to update?"
      },
      { name: "updateQty", type: "number", message: "New Quantity?" }
    ])
    .then(function(answer) {
      var query = connection.query(
        "UPDATE products SET ? WHERE ?",
        [
          {
            stock_quantity: answer.updateQty
          },
          {
            item_id: answer.updateID
          }
        ],
        function(err, res) {
          if (err) throw err;
          console.log(res.affectedRows + " products updated!\n");
        }
      );
    });
}

function addNewProduct() {
  console.log("Add New Product chosen");

  // listProducts();

  inquirer
    .prompt([
      { name: "addName", type: "input", message: "What is the Product Name?" },
      { name: "addDept", type: "input", message: "What Department?" },
      { name: "addPrice", type: "number", message: "The Price?" },
      { name: "addQty", type: "number", message: "And how many are we adding?" }
    ])
    .then(function(answer) {
      console.log(answer);
      var query = connection.query(
        "INSERT INTO products SET ?",
        {
          product_name: answer.addName,
          department_name: answer.addDept,
          price: answer.addPrice,
          stock_quantity: answer.addQty
        },
        function(err, res) {
          if (err) throw err;
          console.log(res.affectedRows + " product inserted!\n");
        }
      );

      // logs the actual query being run
      // console.log(query.sql);
    });
  // connection.end();
}

function start() {
  getConnected();
  listProducts();
  welcome();
}

start();
