require("dotenv").config();


const connectDB=require("../src/config/db");

const Product=require("../src/models/Product");

const generateProducts=
require("../src/utils/generateProducts");



const seed=async()=>{


    try{


        await connectDB();


        console.log(
            "Generating products..."
        );


        const products =
            generateProducts(200000);



        console.log(
            "Inserting products..."
        );


        await Product.insertMany(
            products
        );


        console.log(
            "200k products inserted"
        );


        process.exit();


    }
    catch(error){

        console.log(error);
        process.exit(1);

    }

}



seed();