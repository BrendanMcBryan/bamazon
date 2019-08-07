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
  });
}

async function listProducts() {
  const result = await connection.query(
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

async function askBuy() {
  // const result = await listProducts();
  const response = await inquirer.prompt([
    {
      type: "input",
      message:
        "Please enter the item_id of the Product you'd like to purchse: ",
      name: "userItem"
    },
    {
      type: "number",
      message: "And how many would you like to purchase?",
      name: "userQty"
    }
  ]);

  // console.table(response);
  const result = await connection.query(
    // "SELECT * FROM products",
    "SELECT * FROM products WHERE ?",
    {
      item_id: response.userItem
    },
    function(err, res) {
      if (err) throw err;
      const table = cTable.getTable(res);
      let availableStock = parseInt(res[0].stock_quantity);
      let itemPrice = res[0].price;
      let itemName = res[0].product_name;
      let requestedStock = parseInt(response.userQty);
      //   console.log(response.userQty + " user quantity" + typeof response.userQty);
      //   console.log(res[0].stock_quantity + " stock quantity");

      if (requestedStock > availableStock) {
        // console.log(table);
        console.log(`Not Enough Stock`);
        listProducts();
        askBuy();
      } else {
        // console.log(res[0].price);
        let userCost = requestedStock * itemPrice;
        let newStock = availableStock - requestedStock;
        var query = connection.query(
          "UPDATE products SET ? WHERE ?",
          [
            {
              stock_quantity: newStock
            },
            {
              item_id: res[0].item_id
            }
          ],
          function(err, res) {
            if (err) throw err;
            console.log(`That's great! Your cost for ${requestedStock} ${itemName} is…
            $ ${userCost}`);

            const buyagain = inquirer
              .prompt([
                {
                  type: "confirm",
                  message: "Would you like to make another Purchase?",
                  name: "buyMore"
                }
              ])
              .then(function(inquirerResponse) {
                if (inquirerResponse.buyMore) {
                  askBuy();
                } else {
                  console.log("\nThanks. Come again soon.\n");
                  connection.end();
                }
              });
          }
        );
      }

    }
  );
}

function addProduct() {
  connection.query(
    "INSERT INTO products SET ?",
    {
      product_name: "Rocky Road",
      department_name: "Grocery",
      price: 5.99,
      stock_quantity: 600
    },
    function(err, res) {
      if (err) throw err;
      console.log(res.affectedRows + " product inserted!\n");
    }
  );
}

function start() {
  getConnected();
  listProducts();
  askBuy();
  //   connection.end();
}

start();
