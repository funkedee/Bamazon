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
connection.connect(function (err) {
    if (err) throw err;
    start();
});

function start() {
    // prompt for desired action
    inquirer.prompt({
        message: "\nWhat would you like to do?",
        type: "list",
        name: "action",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
    }).then(function (answer) {
        // switch statement for different actions
        switch (answer.action) {
            case "View Products for Sale":
                return viewProducts();
            case "View Low Inventory":
                return lowInv();
            case "Add to Inventory":
                return addInv();
            case "Add New Product":
                return addProduct();
            case "Exit":
                return connection.end();
        };
    });
};

function viewProducts() {
    // log items for sale
    console.log("\nItems Available for sale:\n")
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            var item = res[i]
            console.log("ID: " + item.id + ", Product: " + item.product_name +
                ", Department: " + item.department_name + ", Price: $" + item.price +
                ", Quantity: " + item.stock_quantity + "\n------------------------------");
        };
        // start over
        start();
    });
};

function lowInv() {
    // query database for low inventory
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, res) {
        if (err) throw err;
        // if no low inventory items
        if (res.length < 1) {
            return console.log("There are no low inventory items at this time");
            start();
        };
        // log items with low inventory
        for (i = 0; i < res.length; i++) {
            var item = res[i]
            console.log("ID: " + item.id + ", Product: " + item.product_name +
                ", Department: " + item.department_name + ", Price: $" + item.price +
                ", Quantity: " + item.stock_quantity + "\n------------------------------");
        };
        // start over
        start();
    });
};

function addInv() {
    // call to database for product options
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        // prompt for which product and how many units to add
        inquirer.prompt([{
                message: "What product would you like to add inventory to?",
                name: "product",
                type: "list",
                choices: function () { 
                    var choices= [];
                    for (i = 0; i < res.length; i++) {
                        var item = res[i]
                        choices.push("ID: " + item.id + ", Product: " + item.product_name +
                            ", Department: " + item.department_name + ", Price: $" + item.price +
                            ", Quantity: " + item.stock_quantity);
                    };
                    return choices;
                },
            },
            {
                message: "How many units would you like to add?",
                type: "input",
                name: "units"
            }
        ]).then(function(answer) {
            // get productID from answer
            var productID = answer.product.split(/[ ,]/)[1];
            // update stock_quantity in database
            connection.query("UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?", [answer.units, productID], function(err, result) {
                if(err) throw err;
                console.log("You have successfully added " + answer.units + " units to product ID: " + productID + "'s stock");
                // start over
                start();
            })
        });
    });
};

function addProduct() {
    // prompt for product info
    inquirer.prompt([{
        message: "What is the product name?",
        type: "input",
        name: "product_name"
    },{
        message: "What department is it in?",
        type: "input",
        name: "department_name"
    },{
        message: "What is the price of the product?",
        type: "input",
        name: "price"
    },{
        message: "How many units would you like to add to the inventory?",
        type: "input",
        name: "stock_quantity"
    }]).then(function(answer) {
        // call to database to add product
        connection.query("INSERT INTO products (product_name,department_name,price,stock_quantity) VALUES (?,?,?,?)",
        [answer.product_name, answer.department_name, answer.price, answer.stock_quantity],
        function(err, res) {
            if(err) throw err;
            console.log("\nYou have successfully added " + answer.product_name + " to the inventory")
            // start over
            start();
        });
    });
};