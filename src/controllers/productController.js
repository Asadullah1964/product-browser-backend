const mongoose = require("mongoose");
const Product = require("../models/Product");


const getProducts = async (req, res) => {

    const startTime = Date.now();

    try {

        let {
            category,
            limit = 20,
            cursorCreatedAt,
            cursorId
        } = req.query;


        limit = Number(limit);


        if (limit > 100) {
            limit = 100;
        }


        if (limit < 1) {
            limit = 20;
        }



        let query = {};



        if (category) {

            query.category =
                category.toLowerCase();

        }



        // cursor pagination
        if (cursorCreatedAt && cursorId) {


            const cursorDate =
                new Date(cursorCreatedAt);



            if (isNaN(cursorDate)) {

                return res.status(400)
                    .json({
                        message: "Invalid cursor date"
                    });

            }



            query = {

                ...query,

                $or: [

                    {
                        created_at: {
                            $lt: cursorDate
                        }
                    },

                    {
                        created_at: cursorDate,

                        _id: {
                            $lt: cursorId
                        }
                    }

                ]

            };

        }



        const products =
            await Product.find(query)

                .sort({
                    created_at: -1,
                    _id: -1
                })

                .limit(limit);



        let nextCursor = null;



        if (products.length > 0) {

            const last =
                products[products.length - 1];


            nextCursor = {

                createdAt:
                    last.created_at,

                id:
                    last._id

            };

        }



        const responseTime =
            Date.now() - startTime;



        res.json({

            count: products.length,

            responseTime: `${responseTime}ms`,

            data: products,

            nextCursor

        });



    }
    catch (error) {

        console.log(error);


        res.status(500)
            .json({

                message: "Server error"

            });

    }

}


const createProduct = async (req, res) => {

    try {


        const product =
            await Product.create({

                name: req.body.name,

                category: req.body.category,

                price: req.body.price,

                image: req.body.image,

                created_at: new Date(),

                updated_at: new Date()

            });


        res.json(product);



    }
    catch (error) {

        res.status(500).json({
            message: "Failed to create"
        })

    }


}


const updateProduct = async (req, res) => {

    try {


        const product =
            await Product.findByIdAndUpdate(

                req.params.id,

                {
                    ...req.body,
                    updated_at: new Date()
                },

                {
                    new: true
                }

            );



        res.json(product);


    }
    catch (error) {

        res.status(500).json({
            message: "Update failed"
        })

    }


}


const deleteProduct = async (req, res) => {
    try {
        console.log("DELETE PARAM ID:", req.params.id);

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid product id format",
            });
        }

        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found in database",
            });
        }

        res.json({
            message: "Deleted successfully",
            product,
        });
    } catch (error) {
        console.error("DELETE ERROR:", error);
        res.status(500).json({
            message: "Delete failed",
            error: error.message,
        });
    }
};


const BULK_LIMIT = 500;
const INSERT_BATCH_SIZE = 1000;

const bulkCreateProducts = async (req, res) => {
    try {
        const products = req.body.products;

        if (!Array.isArray(products)) {
            return res.status(400).json({
                message: "Products array required",
            });
        }

        if (products.length === 0) {
            return res.status(400).json({
                message: "Products array cannot be empty",
            });
        }

        if (products.length > BULK_LIMIT) {
            return res.status(413).json({
                message: `Maximum ${BULK_LIMIT} products allowed per request`,
            });
        }

        const cleanedProducts = products.map((item, index) => ({
            name: typeof item.name === "string" ? item.name.trim() : "",
            category: typeof item.category === "string" ? item.category.trim().toLowerCase() : "",
            price: Number(item.price),
            image: typeof item.image === "string" ? item.image.trim() : "",
            _requestIndex: index,
        }));

        const validProducts = [];
        const rejected = [];

        for (const item of cleanedProducts) {
            if (!item.name) {
                rejected.push({
                    index: item._requestIndex,
                    message: "Name is required",
                });
                continue;
            }

            if (!item.category) {
                rejected.push({
                    index: item._requestIndex,
                    message: "Category is required",
                });
                continue;
            }

            if (!Number.isFinite(item.price) || item.price < 0) {
                rejected.push({
                    index: item._requestIndex,
                    message: "Valid price is required",
                });
                continue;
            }

            validProducts.push({
                name: item.name,
                category: item.category,
                price: item.price,
                image: item.image,
            });
        }

        if (validProducts.length === 0) {
            return res.status(400).json({
                message: "No valid products to insert",
                inserted: 0,
                rejected,
            });
        }

        let inserted = 0;
        const writeErrors = [];

        for (let i = 0; i < validProducts.length; i += INSERT_BATCH_SIZE) {
            const batch = validProducts.slice(i, i + INSERT_BATCH_SIZE);

            try {
                const result = await Product.insertMany(batch, {
                    ordered: false,
                });

                inserted += result.length;
            } catch (error) {
                if (error.insertedDocs) {
                    inserted += error.insertedDocs.length;
                }

                if (error.writeErrors?.length) {
                    error.writeErrors.forEach((err) => {
                        writeErrors.push({
                            index: i + err.index,
                            message: err.errmsg || err.message || "Insert failed",
                        });
                    });
                } else {
                    writeErrors.push({
                        index: i,
                        message: error.message,
                    });
                }
            }
        }

        return res.status(201).json({
            message: "Bulk insert processed",
            inserted,
            rejectedCount: rejected.length + writeErrors.length,
            rejected: [...rejected, ...writeErrors],
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal server error",
        });
    }
};



module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkCreateProducts,
}