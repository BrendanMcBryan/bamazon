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
    // console.log("\nconnected as id " + connection.threadId + "\n");
    listProducts();
  });
}

function listProducts() {
  connection.query(
    "SELECT item_id, product_name, price, stock_quantity FROM products",
    function(err, res) {
      if (err) throw err;
      const table = cTable.getTable(res);
      console.log(`\n${table}`);
      askBuy();
    }
  );
}

async function askBuy() {
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

  connection.query(
    "SELECT * FROM products WHERE ?",
    {
      item_id: response.userItem
    },
    function(err, res) {
      if (err) throw err;
      const table = cTable.getTable(res);
      //load some variables
      let availableStock = parseInt(res[0].stock_quantity);
      let itemPrice = res[0].price;
      let itemName = res[0].product_name;
      let productSales = res[0].product_sales;
      let requestedStock = parseInt(response.userQty);

      // make sure there is enough stock
      if (requestedStock > availableStock) {
        console.log(
          `\nApologies, we do not have enough stock for that large a purchase\n`
        );
        listProducts();
      } else {
        let userCost = (requestedStock * itemPrice).toFixed(2);
        let newTotalSales = (productSales + requestedStock * itemPrice).toFixed(
          2
        );
        connection.query("UPDATE products SET ? WHERE ?", [
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

            inquirer
              .prompt([
                {
                  type: "confirm",
                  message: "Would you like to make another Purchase?",
                  name: "buyMore"
                }
              ])
              .then(function(inquirerResponse) {
                if (inquirerResponse.buyMore) {
                  listProducts();
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

getConnected();
