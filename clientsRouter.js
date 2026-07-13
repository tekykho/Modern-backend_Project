const express = require('express');
const router = express.Router();
const { connection } = require('./db');

// display the clients shipping information page
router.get('/', async function (req, res) {

    const {first_name, last_name} = req.query;

    let sql = `SELECT 
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
                WHERE 1
    `

    const bindings = [];

    if (first_name) {
        sql += " AND Clients.first_name LIKE ?";
        bindings.push("%" + first_name + "%");
    }
      if (last_name) {
        sql += " AND Clients.last_name LIKE ?";
        bindings.push("%" + last_name + "%");
    }

    sql += " ORDER BY Clients.company_name;"
    
    console.log(`Executing sql: ${sql} with bindings ${JSON.stringify(bindings)}`)

    const response = await connection.query({
        "sql": sql,
        "nestedTables": false
    }, bindings);

    console.log(response[0]);
    res.render('clients/index', {
        clients: response[0],
        searchParams: req.query
    });
});

// add client shipping information - display the form to add client shipping information
router.get('/create', async function (req, res) {
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
router.post('/create', async function (req, res) {
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
router.get('/:client_id/delete', async function (req, res) {
    const [clients] = await connection.execute(
        "SELECT * FROM Clients WHERE client_id = ?", [req.params.client_id]);

    const client = clients[0];
    res.render('clients/delete', {
        client
    });
});

// delete client shipping information - handle the form submission to delete client shipping information
router.post('/:client_id/delete', async function (req, res) {
    const sql = "DELETE FROM Clients WHERE client_id = ?";
    await connection.execute(sql, [req.params.client_id]);
    res.redirect('/clients');
});

// update client shipping information - display the form to update client shipping information
router.get('/:client_id/update', async function (req, res) {
    const [clients] = await connection.execute(
        "SELECT * FROM Clients WHERE client_id = ?", [req.params.client_id]);

    const client = clients[0];
    const [categories] = await connection.execute("SELECT * FROM Industry_Categories");
    const [employees] = await connection.execute("SELECT * FROM Employees");
    res.render('clients/update', {
        client, categories, employees
    });
});

// update client shipping information - handle the form submission to update client shipping information
router.post('/:client_id/update', async function (req, res) {
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

module.exports = router;