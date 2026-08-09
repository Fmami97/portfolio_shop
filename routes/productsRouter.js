const express = require("express");

const { validate } = require("./routerUtils");
const router = express.Router();

const db = require("../db/db");
const { body, query } = require('express-validator');


const sanitizeNewProduct = validate([
    body('name').optional().trim(),
    body('description').optional().trim(),
    body('price').optional().isFloat().toFloat(),
]);

router.param('id', async (req, res, next, id) => {
    // Validate or fetch resource
    const product = await db.getProductById(id);
    if (!product) {
        return res.status(404).send({ error: 'Product not found' });
    }
    req.id = id;
    req.product = product; // Attach to request
    next();
});

router.get('/:id', (req, res) => {
    res.status(200).json(req.product); // Use the loaded item
});

router.delete('/:id', async (req, res) => {
    try {
        const success = await db.deleteProduct(req.id)
        if (!success) {
            throw new Error("Product to delete not found");
        } else {
            res.status(204);
        }
    } catch (error) {
        res.status(404).send(error.message || String(error));
    }
});


router.put('/:id', sanitizeNewProduct, async (req, res) => {

    try {
        const updatedProduct = await db.updateProduct(req.id, req.body, req.product);
        if (!updatedProduct) {
            throw new Error("Wrong input, query failed");
        }
        else {
            res.status(200).json(updatedProduct);
        }
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message || error.msg);

    }
});

router.post('/', sanitizeNewProduct, async (req, res) => {

    try {
        const newProduct = await db.createProduct(req.id, req.body);
        if (!newProduct) {
            throw new Error("Wrong input, query failed");
        }
        else {
            res.status(201).json(newProduct)
        }
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message || error.msg);

    }
});

router.get("/", async (req, res) => {
    try {
        const result = await db.getProducts(req, res);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send("Something went wrong, please try again later.");
    }
});

module.exports = router;