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

function listDepartmentSales() {
  //This freakin' query took a lot of research
  const result = connection.query(
    "SELECT departments.department_name,departments.over_head_costs,SUM(products.product_sales) FROM departments,products WHERE departments.department_name=products.department_name GROUP BY departments.department_name,departments.over_head_costs ORDER BY departments.department_name",
    function(err, res) {
      if (err) throw err;
      // console.log(res);
      res.forEach(element => {
        let deptGain = element["SUM(products.product_sales)"];
        if (deptGain === null) {
          deptGainB = 0;
          element.department_sales = deptGainB.toFixed(2);
        } else {
          element.department_sales = deptGain.toFixed(2);
        }
        let gain =
          element["SUM(products.product_sales)"] - element.over_head_costs;
        element.profits = gain.toFixed(2);
        delete element["SUM(products.product_sales)"];
        // console.log(element);
      });

      const table = cTable.getTable(res);
      console.log(`\n${table}`);
      return;
    }
  );
}

async function welcome() {
  await inquirer
    .prompt([
      {
        name: "superChoice",
        type: "list",
        message: "What would youlike to do today, Supervisor?",
        choices: ["See Department Sales", "Add New Department", "Exit"]
      }
    ])
    .then(function(answer) {
      var chosenItem = answer.superChoice;
      console.log(chosenItem);

      switch (chosenItem) {
        case "Exit":
          console.log(`\nHave a great day!\n`);
          connection.end();
          break;

        case "Add New Department":
          addNewDepartment();
          break;

        case "See Department Sales":
          listDepartmentSales();
          setTimeout(() => {
            welcome();
          }, 500);
          break;

        default:
          listDepartmentSales();
          setTimeout(() => {
            welcome();
          }, 200);
      }
    });
}

function addNewDepartment() {
  inquirer
    .prompt([
      {
        name: "addName",
        type: "input",
        message: "What is the Department Name?"
      },

      {
        name: "addCost",
        type: "number",
        message: "What are the Overhead Costs?"
      }
    ])
    .then(function(answer) {
      var query = connection.query(
        "INSERT INTO departments SET ?",
        {
          department_name: answer.addName,
          over_head_costs: answer.addCost
        },
        function(err, res) {
          if (err) throw err;
          console.log(res.affectedRows + " product inserted!\n");

          inquirer
            .prompt([
              {
                type: "confirm",
                name: "addAnother",
                message: "Would you like to add another Department?",
                default: "true"
              }
            ])
            .then(function(answer) {
              if (answer.addAnother) {
                addNewDepartment();
                return;
              }
              welcome();
            });
        }
      );
    });
}

function start() {
  getConnected();
  setTimeout(() => {
    listDepartmentSales();
  }, 100);
  setTimeout(() => {
    welcome();
  }, 500);
}
start();
