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

async function getConnected() {
  const result = await connection.connect(function(err) {
    if (err) throw err;
    // console.log("connected as id " + connection.threadId + "\n");
    // return;
    // connection.end();
  });
}

async function listProducts() {
  //   getConnected();
  const result = connection.query(
    "SELECT * FROM products",
    // "SELECT * FROM products WHERE ?",
    // {
    //   department_name: "Produce"
    // },
    function(err, res) {
      if (err) throw err;
      //   console.log(res);
      const table = cTable.getTable(res);
      console.log(`\n${table}`);
      //   connection.end();
      return;
    }
  );
}

async function welcome() {
  // getConnected();
console.log(`\n`);
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
      console.log(chosenItem);

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
          }, 500);

          break;
        default:
          listProducts();
          setTimeout(() => {
            welcome();
          }, 500);
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
      //   console.log(res);
      let table = cTable.getTable(res);
      console.log(table);

      setTimeout(() => {
        welcome();
      }, 500);

      return;
    }
  );
}

async function addInventory() {
 await  listProducts();
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
              "Ok, " +
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
  }, 500);
}

async function addNewProduct() {
  console.log(`
  Add New Product chosen
  `);

  // listProducts();

  const questions = await inquirer
    .prompt([
      { name: "addName", type: "input", message: "What is the Product Name?" },
      { name: "addDept", type: "input", message: "What Department?" },
      { name: "addPrice", type: "number", message: "The Price?" },
      { name: "addQty", type: "number", message: "And how many are we adding?" }
    ])
    .then(function(answer) {
      console.log(`\n${answer}\n`);
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

      // logs the actual query being run
      // console.log(query.sql);
    });
  // connection.end();
}

function start() {
  getConnected();
  setTimeout(() => {
    listProducts();
  }, 500);
  setTimeout(() => {
    welcome();
  }, 1200);
}
start();
