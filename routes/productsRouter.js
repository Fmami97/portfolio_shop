const express = require("express");

const router = express.Router();

const db = require("../db/db");

const { formatError } = require("../utils");


// const { validate } = require("./routerUtils");
// const { body } = require('express-validator');
// const sanitizeNewProduct = validate([
//     body('name').optional().trim(),
//     body('description').optional().trim(),
//     body('price').optional().isFloat().toFloat(),
// ]);

router.param('product_id', async (req, res, next, product_id) => {
    const product = await db.getProductById(product_id);
    if (!product) {
        return res.status(404).send({ error: 'Product not found' });
    }
    req.product_id = product_id;
    req.product = product; // Attach to request
    next();
});

router.get('/:product_id', (req, res) => {
    res.status(200).json(req.product); // Use the loaded item
});

router.get("/", async (req, res) => {
    try {
        const result = await db.getProducts(req, res);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(formatError(error));
    }
});


// router.delete('/:product_id', async (req, res) => {
//     try {
//         const success = await db.deleteProduct(req.id)
//         if (!success) {
//             throw new Error("Product to delete not found");
//         } else {
//             res.status(204);
//         }
//     } catch (error) {
//         res.status(404).send(formatError(error));
//     }
// });


// router.put('/:product_id', sanitizeNewProduct, async (req, res) => {

//     try {
//         const updatedProduct = await db.updateProduct(req.id, req.body, req.product);
//         if (!updatedProduct) {
//             throw new Error("Wrong input, query failed");
//         }
//         else {
//             res.status(200).json(updatedProduct);
//         }
//     } catch (error) {
//         console.log(error);
//         res.status(400).send(error.message || || String(error));

//     }
// });

// router.post('/', sanitizeNewProduct, async (req, res) => {

//     try {
//         const newProduct = await db.createProduct(req.id, req.body);
//         if (!newProduct) {
//             throw new Error("Wrong input, query failed");
//         }
//         else {
//             res.status(201).json(newProduct)
//         }
//     } catch (error) {
//         console.log(error);
//         res.status(400).send(error.message || || String(error));

//     }
// });
module.exports = router;