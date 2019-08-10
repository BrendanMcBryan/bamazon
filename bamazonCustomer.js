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
  const connect = await connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
  });
}

async function listProducts() {
  const result = await connection.query(
    "SELECT item_id, product_name, price, stock_quantity FROM products",
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

  const result = await connection.query(
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
      let productSales = res[0].product_sales;
      let requestedStock = parseInt(response.userQty);
      //   console.log(response.userQty + " user quantity" + typeof response.userQty);
      //   console.log(res[0].stock_quantity + " stock quantity");

      if (requestedStock > availableStock) {
        // console.log(table);
        console.log(
          `\nApologies, we do not have enough stock for that large a purchase\n`
        );
        listProducts();
        setTimeout(() => {
          askBuy();
        }, 1250);
      } else {
        let userCost = (requestedStock * itemPrice).toFixed(2);
        let newTotalSales = (productSales + requestedStock * itemPrice).toFixed(
          2
        );
        var profits = connection.query("UPDATE products SET ? WHERE ?", [
          {
            product_sales: newTotalSales
          },
          {
            item_id: res[0].item_id
          }
        ]);
        let newStock = availableStock - requestedStock;
        connection.query(
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
                  setTimeout(() => {
                    askBuy();
                  }, 500);
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

function start() {
  getConnected();
  listProducts();
  setTimeout(function() {
    askBuy();
  }, 2000);

  //   connection.end();
}

start();
