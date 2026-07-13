const express = require('express');
const router = express.Router();
const { connection } = require('./db');

// shipment information
router.get('/', async function (req, res) {
    const sql = `SELECT 
            Clients.client_id AS "Client ID", 
            Clients.company_name AS "Company Name", 
            Clients.first_name AS "Client First Name",
            Clients.last_name AS "Client Last Name",
            Clients.contact_email AS "Contact Email", 
            Shipping_Routes.route_id AS "Route ID",
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
        "nestedTables": false
    });
    console.log(response[0]);
    res.render('shipments/s_index', {
        shipment: response[0]
    });
})

router.get('/s_create', async function (req, res) {
    const [clients] = await connection.query("SELECT * FROM Clients");
    const [categories] = await connection.query("SELECT * FROM Industry_Categories");
    const [employees] = await connection.query("SELECT * FROM Employees");
    const [departments] = await connection.query("SELECT * FROM Departments");
    const [shippingRoutes] = await connection.query("SELECT * FROM Shipping_Routes");
    res.render('shipments/s_create', {
        clients, categories, employees, departments, shippingRoutes
    });
});

router.post('/s_create', async function (req, res) {
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

        const newRouteId = result.insertId;
        const selectedClientId = req.body.client_id;

        // console.log("NewRoute ID: ", newRouteId);
        // console.log("Selected Client ID: ", selectedClientId);

        const sql = `INSERT INTO Client_Route (client_id, route_id) 
                    VALUES (?,?)`;
        await conn.execute(sql, [selectedClientId, newRouteId]);

        await conn.commit();
    } catch (e) {
        console.error("Caught an error: ", e);
        if (conn) await conn.rollback();
    } finally {
        if (conn) await conn.release();
    }
    res.redirect('/shipments');
});

router.get('/:client_id/s_update', async function (req, res) {

    const [clients] = await connection.execute(
        "SELECT * FROM Clients WHERE client_id = ?", [req.params.client_id]);

    const client = clients[0];
    const [categories] = await connection.execute("SELECT * FROM Industry_Categories");
    const [employees] = await connection.execute("SELECT * FROM Employees");
    const [shippingRoutes] = await connection.execute("SELECT * FROM Shipping_Routes");
    const [selectedRouteResults] = await connection.execute(
        `SELECT Clients.*, 
        Shipping_Routes.route_id,
        Shipping_Routes.origin_hub,
        Shipping_Routes.destination_hub,
        Shipping_Routes.shipping_date,
        Shipping_Routes.shipment_day 
            FROM Clients
            JOIN Client_Route ON Clients.client_id = Client_Route.client_id
            JOIN Shipping_Routes ON Client_Route.route_id = Shipping_Routes.route_id  
            where Clients.client_id = ?`, [req.params.client_id]);

    const currentShipment = selectedRouteResults[0] || {};

    const selectedRoute = selectedRouteResults.map(function (r) {
        return r.route_id;
    })

    console.log(selectedRoute);

    res.render('shipments/s_update', {
        client, categories, employees, shippingRoutes, currentShipment, selectedRoute
    });
});

router.post('/:client_id/s_update', async function (req, res) {
    const conn = await connection.getConnection();

    try {
        await conn.beginTransaction();

        const { old_route_id, origin_hub, destination_hub, shipping_date, shipment_day } = req.body;
        console.log("This is the current shipment routes: ", req.body);

        // clean up browser datetime so that mariadb can read clearly
        const formattedShippingDate = shipping_date ? shipping_date.replace('T', ' ') : null;

        const currentClientId = req.params.client_id;
        // insert the latest update on shipping routes details
        const insertRouteSql = `INSERT INTO Shipping_Routes (origin_hub, destination_hub, shipping_date, shipment_day)
                    VALUES (?, ?, ?, ?)`;

        const [insertResult] = await conn.execute(insertRouteSql, [
            origin_hub,
            destination_hub,
            shipping_date,
            shipment_day,
        ]);

        // grab the newly generated route_id auto-increment value
        const newRouteId = insertResult.insertId;

        // delete the targeted client and route ID (mapping pair) in client_route
        const deleteLinkSql = `DELETE FROM Client_Route WHERE client_id = ? AND route_id = ?`;
        await conn.execute(deleteLinkSql, [currentClientId, old_route_id]);

        // establish the new mapping pair into client_route
        const insertLinkSql = `INSERT INTO Client_Route (client_id, route_id) 
                    VALUES (?, ?)`;
        await conn.execute(insertLinkSql, [currentClientId, newRouteId]);

        await conn.commit();
    } catch (e) {
        console.error("Update Transaction error: ", e);

        if (conn) await conn.rollback();
    } finally {
        if (conn) await conn.release();
    }
    res.redirect('/shipments');
});

router.get('/:client_id/:route_id/s_delete', async function (req, res) {
    const [results] = await connection.execute(
        `SELECT Clients.client_id AS "Client ID",
        Clients.first_name,
        Clients.last_name, 
        Clients.company_name,
        Shipping_Routes.origin_hub, 
        Shipping_Routes.destination_hub, 
        Shipping_Routes.shipping_date,
        Shipping_Routes.route_id AS "Route ID"
            FROM Clients 
            JOIN Client_Route ON Clients.client_id = Client_Route.client_id 
            JOIN Shipping_Routes ON Client_Route.route_id = Shipping_Routes.route_id 
        WHERE Clients.client_id = ? AND Shipping_Routes.route_id = ?`, [req.params.client_id, req.params.route_id]);

    const client = results[0];
    res.render('shipments/s_delete', {
        client
    });
});

router.post('/:client_id/:route_id/s_delete', async function (req, res) {
    const conn = await connection.getConnection();

    try {
        await conn.beginTransaction();

        const { client_id, route_id } = req.params;

        await conn.execute(
            "Delete FROM Client_Route WHERE client_id = ? AND route_id = ?",
            [client_id, route_id]);

        const [sameRoute] = await conn.execute(
            "SELECT COUNT(*) as count FROM Client_Route WHERE route_id = ?",
            [route_id]);

        if (sameRoute[0].count === 0) {
            await conn.execute(
                "DELETE FROM Shipping_Routes WHERE route_id = ?",
                [route_id])
        };

        await conn.commit();

    } catch (e) {
        console.error("Update Transaction error: ", e);

        if (conn) await conn.rollback();
    } finally {
        if (conn) await conn.release();
    }
        res.redirect('/shipments');
});

module.exports = router;