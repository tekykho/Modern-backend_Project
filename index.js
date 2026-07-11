const express = require('express');
// ejs is a template library
// it allows us to store html in a file a file and then send back as response
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const app = express();

require("dotenv").config();
const { createPool } = require('mysql2/promise');

app.set("view engine", "ejs");

app.use(expressLayouts);
app.set('layout', 'layouts/base');

app.use(express.urlencoded({
    extended: true
}));

// create a connection pool to the database
const connection = createPool(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    }
);

// display the home page
app.get("/", async function (req, res) {
    const todayDate = new Date().toLocaleDateString("en-GB");
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayOfWeek = days[new Date().getDay()];
    // res.send("<h1>Welcome to Logistic Company</h1>");
    res.render("home", {
        todayDate, dayOfWeek
    });
});

// display the clients shipping information page
app.get('/clients', async function (req, res) {
    const sql = `SELECT 
            Clients.client_id AS "Client ID",
            Clients.company_name AS "Client Company Name",
            Clients.first_name AS "Client First Name",
            Clients.last_name AS "Client Last Name",
            Clients.contact_email AS "Client Contact Email", 
            Clients.joint_date AS "Client Joint Date", 
            Industry_Categories.name AS "Industry Categories", 
            Employees.first_name AS "Employee First Name", 
            Employees.last_name AS "Employee Last Name" 
                FROM Clients 
                JOIN Industry_Categories ON Clients.category_id = Industry_Categories.category_id 
                LEFT JOIN Employees ON Clients.employee_id = Employees.employee_id
                ORDER BY Clients.company_name;
    `
    const response = await connection.query({
        "sql": sql,
        "nestedTables": true
    });
    console.log(response[0]);
    res.render('clients/index', {
        clients: response[0]
    });
});

// add client shipping information - display the form to add client shipping information
app.get('/clients/create', async function (req, res) {
    const [clients] = await connection.query("SELECT * FROM Clients");
    const [categories] = await connection.query("SELECT * FROM Industry_Categories");
    const [employees] = await connection.query("SELECT * FROM Employees");
    const [departments] = await connection.query("SELECT * FROM Departments");
    const [shippingRoutes] = await connection.query("SELECT * FROM Shipping_Routes");
    res.render('clients/create', {
        clients, categories, employees, departments, shippingRoutes
    });
});

// add client shipping information - handle the form submission to add client shipping information
app.post('/clients/create', async function (req, res) {
    console.log(req.body);

    const sql = `INSERT INTO Clients (category_id, company_name, contact_email, first_name, last_name, joint_date, employee_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await connection.query(sql, [
        req.body.category_id,
        req.body.company_name,
        req.body.contact_email,
        req.body.first_name,
        req.body.last_name,
        req.body.joint_date,
        req.body.employee_id
    ]);

    res.redirect('/clients');

});

// delete client shipping information - display the form to delete client shipping information
app.get('/clients/:client_id/delete', async function (req, res) {
    const [clients] = await connection.execute(
        "SELECT * FROM Clients WHERE client_id = ?", [req.params.client_id]);

    const client = clients[0];
    res.render('clients/delete', {
        client
    });
});

// delete client shipping information - handle the form submission to delete client shipping information
app.post('/clients/:client_id/delete', async function (req, res) {
    const sql = "DELETE FROM Clients WHERE client_id = ?";
    await connection.execute(sql, [req.params.client_id]);
    res.redirect('/clients');
});

// update client shipping information - display the form to update client shipping information
app.get('/clients/:client_id/update', async function (req, res) {
    const [clients] = await connection.execute(
        "SELECT * FROM Clients WHERE client_id = ?", [req.params.client_id]);

    const client = clients[0];
    const [categories] = await connection.query("SELECT * FROM Industry_Categories");
    const [employees] = await connection.query("SELECT * FROM Employees");
    res.render('clients/update', {
        client, categories, employees
    });
});

// update client shipping information - handle the form submission to update client shipping information
app.post('/clients/:client_id/update', async function (req, res) {
    const { category_id, company_name, contact_email, first_name, last_name, joint_date, employee_id } = req.body;
    const sql = `Update Clients SET
        category_id = ?,
        company_name = ?,
        contact_email = ?,
        first_name = ?,
        last_name = ?,
        joint_date = ?,
        employee_id = ?
        WHERE client_id = ?`;

    await connection.execute(sql, [
        category_id,
        company_name,
        contact_email,
        first_name,
        last_name,
        joint_date,
        employee_id,
        req.params.client_id
    ]);
    res.redirect('/clients');
});

// shipment information
app.get('/shipments', async function (req, res) {
    const sql = `SELECT 
            Clients.client_id AS "Client ID", 
            Clients.company_name AS "Company Name", 
            Clients.first_name AS "Client First Name",
            Clients.last_name AS "Client Last Name",
            Clients.contact_email AS "Contact Email", 
            Shipping_Routes.origin_hub AS "Origin Hub", 
            Shipping_Routes.destination_hub AS "Destination Hub", 
            Shipping_Routes.shipping_date AS "Shipping Date", 
            Shipping_Routes.shipment_day AS "Shipment Day", 
            Employees.first_name AS "Employee First Name", 
            Employees.last_name AS "Employee Last Name" 
                FROM Clients  
                JOIN Industry_Categories ON Clients.category_id = Industry_Categories.category_id 
                JOIN Client_Route ON Clients.client_id = Client_Route.client_id 
                JOIN Shipping_Routes ON Client_Route.route_id = Shipping_Routes.route_id 
                LEFT JOIN Employees ON Clients.employee_id = Employees.employee_id 
                ORDER BY Clients.company_name, Shipping_Routes.shipping_date;
    `
    const response = await connection.query({
        "sql": sql,
        "nestedTables": true
    });
    console.log(response[0]);
    res.render('shipments/s_index', {
        clients: response[0]
    });
})

app.get('/shipments/s_create', async function (req, res) {
    const [clients] = await connection.query("SELECT * FROM Clients");
    const [categories] = await connection.query("SELECT * FROM Industry_Categories");
    const [employees] = await connection.query("SELECT * FROM Employees");
    const [departments] = await connection.query("SELECT * FROM Departments");
    const [shippingRoutes] = await connection.query("SELECT * FROM Shipping_Routes");
    res.render('shipments/s_create', {
        clients, categories, employees, departments, shippingRoutes
    });
});

app.post('/shipments/s_create', async function (req, res) {
     console.log(req.body);

    const conn = await connection.getConnection();

    try {
        await conn.beginTransaction();

        const sqlRoute = `INSERT INTO Shipping_Routes (origin_hub, destination_hub, shipping_date, shipment_day)
                    VALUES (?, ?, ?, ?)`;

        const [result] = await connection.execute(sqlRoute, [
            req.body.origin_hub,
            req.body.destination_hub,
            req.body.shipping_date,
            req.body.shipment_day
        ]);

        // console("Origin hub: ",req.body.origin_hub);

        const newRouteId = result.insertId;
        const selectedClientId = req.body.client_id;

        // console.log("NewRoute ID: ", newRouteId);
        // console.log("Selected Client ID: ", selectedClientId);

        const sql = `INSERT INTO Client_Route (client_id, route_id) 
                    VALUES (?,?)`;
        await conn.execute(sql, [selectedClientId, newRouteId]);

        await conn.commit();
    } catch (e) {
        console.log("Caught an error: ", e.message);
        await conn.rollback();
    } finally {
        await conn.release();
    }
    res.redirect('/shipments');
    res.send("test");
});

app.listen(3000, function () {
    console.log("Server Started");
})