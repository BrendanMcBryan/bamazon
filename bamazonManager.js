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
    // console.log("connected as id " + connection.threadId + "\n");
  });
}

function listProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    const table = cTable.getTable(res);
    console.log(`\n${table}`);
    return;
  });
}

async function welcome() {
  const result = await inquirer
    .prompt([
      {
        name: "managerChoice",
        type: "list",
        message: "What would youlike to do today, manager?",
        choices: [
          "See Inventory",
          "View Low Inventory",
          "Add to Inventory",
          "Add New Product",
          "Exit"
        ]
      }
    ])
    .then(function(answer) {
      var chosenItem = answer.managerChoice;

      switch (chosenItem) {
        case "Exit":
          console.log(`\nHave a great day!\n`);
          connection.end();
          break;
        case "View Low Inventory":
          viewLowInventory();
          // welcome();
          break;
        case "Add to Inventory":
          addInventory();
          break;
        case "Add New Product":
          addNewProduct();
          break;
        case "See Inventory":
          listProducts();
          setTimeout(() => {
            welcome();
          }, 200);

          break;
        default:
          listProducts();
          setTimeout(() => {
            welcome();
          }, 200);
      }
    });
  //   connection.end();
}

async function viewLowInventory() {
  const lowInv = 150;
  const query = await connection.query(
    // "SELECT * FROM products",
    "SELECT * FROM products WHERE stock_quantity <" + lowInv,

    function(err, res) {
      if (err) throw err;
      let table = cTable.getTable(res);
      console.log(`\n${table}`);

      setTimeout(() => {
        welcome();
      }, 200);

      return;
    }
  );
}

async function addInventory() {
  await listProducts();
  setTimeout(() => {
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
            console.log(
              "\nOk, " +
                res.affectedRows +
                " products have been update updated!\n"
            );
            inquirer
              .prompt([
                {
                  type: "confirm",
                  name: "addAnother",
                  message: "Would you like to update another Product?"
                }
              ])
              .then(function(answer) {
                if (answer.addAnother) {
                  addInventory();
                  return;
                }
                welcome();
              });
          }
        );
      });
  }, 200);
}

async function addNewProduct() {
  const questions = await inquirer
    .prompt([
      { name: "addName", type: "input", message: "What is the Product Name?" },
      { name: "addDept", type: "input", message: "What Department?" },
      { name: "addPrice", type: "number", message: "The Price?" },
      { name: "addQty", type: "number", message: "And how many are we adding?" }
    ])
    .then(function(answer) {
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
          console.log("\n" + res.affectedRows + " product inserted!\n");

          inquirer
            .prompt([
              {
                type: "confirm",
                name: "addAnother",
                message: "Would you like to update another Product?",
                default: "true"
              }
            ])
            .then(function(answer) {
              if (answer.addAnother) {
                addNewProduct();
                return;
              }
              welcome();
            });
        }
      );
      // console.log(query.sql);
    });
}

function start() {
  getConnected();
  setTimeout(() => {
    listProducts();
  }, 100);
  setTimeout(() => {
    welcome();
  }, 200);
}
start();
