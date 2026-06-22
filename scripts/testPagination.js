require("dotenv").config();


const Product =
require("../src/models/Product");


const connectDB =
require("../src/config/db");



const test=async()=>{


    await connectDB();



    console.log(
        "Fetching first page..."
    );


    const first =
    await Product.find()
    .sort({
        created_at:-1,
        _id:-1
    })
    .limit(5);



    console.log(
        first.map(
            p=>p.name
        )
    );



    const last =
        first[first.length-1];



    console.log(
        "\nAdding new product..."
    );



    await Product.create({

        name:"New Product Added",

        category:"electronics",

        price:9999,

        created_at:new Date(),

        updated_at:new Date()

    });



    console.log(
        "\nFetching next page..."
    );



    const next =
    await Product.find({

        $or:[

            {
                created_at:{
                    $lt:last.created_at
                }
            },

            {
                created_at:last.created_at,

                _id:{
                    $lt:last._id
                }
            }

        ]

    })

    .sort({

        created_at:-1,

        _id:-1

    })

    .limit(5);



    console.log(
        next.map(
            p=>p.name
        )
    );



    process.exit();

}



test();