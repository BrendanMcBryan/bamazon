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
  });
}

function listDepartmentSales() {
  // const result = connection.query(
  //   "SELECT * FROM departments",
  //   function(err, res) {
  //     if (err) throw err;
  //     const table = cTable.getTable(res);
  //     console.log(`\n${table}`);
  //     return;
  //   }
  // );
  const result = connection.query(
    "SELECT departments.department_id, departments.department_name, departments.over_head_costs FROM departments INNER JOIN products ON departments.department_name = products.department_name",
    function(err, res) {
      if (err) throw err;
      const table = cTable.getTable(res);
      console.log(`\n${table}`);
      return;
    }
  );
}

function welcome() {
  // getConnected();
  console.log(`\n`);
  inquirer
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
          }, 500);
      }
    });
  //   connection.end();
}

function addNewDepartment() {
  console.log(`
  Add New Product chosen
  `);
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
      console.log(`\n${answer}\n`);
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

      // logs the actual query being run
      // console.log(query.sql);
    });
  // connection.end();
}

function start() {
  getConnected();
  setTimeout(() => {
    listDepartmentSales();
  }, 200);
  setTimeout(() => {
    welcome();
  }, 1200);
}
start();
