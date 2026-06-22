const Product = require("../models/Product");


const getProducts = async (req,res)=>{

    const startTime = Date.now();

    try{

        let {
            category,
            limit = 20,
            cursorCreatedAt,
            cursorId
        } = req.query;


        limit = Number(limit);


        if(limit > 100){
            limit = 100;
        }


        if(limit < 1){
            limit = 20;
        }



        let query={};



        if(category){

            query.category =
                category.toLowerCase();

        }



        // cursor pagination
        if(cursorCreatedAt && cursorId){


            const cursorDate =
                new Date(cursorCreatedAt);



            if(isNaN(cursorDate)){

                return res.status(400)
                .json({
                    message:"Invalid cursor date"
                });

            }



            query = {

                ...query,

                $or:[

                    {
                        created_at:{
                            $lt:cursorDate
                        }
                    },

                    {
                        created_at:cursorDate,

                        _id:{
                            $lt:cursorId
                        }
                    }

                ]

            };

        }



        const products =
            await Product.find(query)
            
            .sort({
                created_at:-1,
                _id:-1
            })

            .limit(limit);



        let nextCursor=null;



        if(products.length > 0){

            const last =
                products[products.length-1];


            nextCursor={

                createdAt:
                last.created_at,

                id:
                last._id

            };

        }



        const responseTime =
            Date.now() - startTime;



        res.json({

            count:products.length,

            responseTime:`${responseTime}ms`,

            data:products,

            nextCursor

        });



    }
    catch(error){

        console.log(error);


        res.status(500)
        .json({

            message:"Server error"

        });

    }

}



module.exports={
    getProducts
};