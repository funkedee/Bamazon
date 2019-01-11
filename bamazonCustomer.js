// require npm packages
var mysql = require("mysql");
var inquirer = require("inquirer");

// connect to mysql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Iamdaniel92",
    database: "bamazon"
});
connection.connect(function(err) {
    if (err) throw err;
    start();
});

function start() {
    // log items for sale
    console.log("\nItems Available for sale:\n")
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        for (i=0; i<res.length; i++) {
            var item = res[i]
            console.log("ID: " + item.id + ", Product: " + item.product_name  + 
            ", Department: " + item.department_name + ", Price: $" + item.price +
            "\n------------------------------");
        };
        purchase();
    });
};

function purchase() {
    // promp user for purchase info
    inquirer.prompt([{
        message: "What is the ID of the product you would like to purchase?",
        name: "id",
        type: "input",
        validate: function(id) {
            return Number.isInteger(parseFloat(id)) || "Error, Please enter an Integer";
        }
    },{
        message: "How many units would you like to purchase?",
        name: "quantity",
        type: "input",
        validate: function(quantity) {
            return Number.isInteger(parseFloat(quantity)) || "Error, Please enter an Integer";
        }
    }]).then(function(answer){

        // check database for stock availabilty of product
        connection.query("SELECT * FROM products WHERE ?", {id: answer.id}, function(err,res) {
            if (err) throw err;

            // if stock is greater than purchase quanity allow purchase
            if (res[0].stock_quantity >= answer.quantity) {

                // log succeful order and invoice total
                console.log("\nYour product(s) have been ordered: Invoice total = $" + answer.quantity * res[0].price);

                // update database
                connection.query("UPDATE products SET stock_quantity = ? WHERE id = ?", [res[0].stock_quantity-answer.quantity, answer.id], function(err, res) {
                    if(err) throw err;
                });

                // ask if they want to make another order
                inquirer.prompt({
                    message:"Would you like to make another order?",
                    type: "confirm",
                    name:"startOver"
                }).then(function(answer) {
                    if (answer.startOver) {
                        console.log("------------------------------\n");
                        return start();
                    };
                    connection.end();
                });
                
            // if insufficient stock prevent order and ask to start over
            }else{
                console.log("\nInsufficient quantity! Your order did not go through.")
                inquirer.prompt({
                    message:"Would you like to start over?",
                    type: "confirm",
                    name:"startOver"
                }).then(function(answer) {
                    if (answer.startOver) {
                        console.log("------------------------------\n");
                        return start();
                    };
                    connection.end();
                });
            };
        });
    });
};


