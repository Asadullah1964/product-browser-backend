const mongoose = require("mongoose");


const productSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true
    },

    category:{
        type:String,
        required:true,
        index:true
    },

    price:{
        type:Number,
        required:true
    },

    created_at:{
        type:Date,
        default:Date.now,
        index:true
    },

    updated_at:{
        type:Date,
        default:Date.now
    }

},
{
    timestamps:false
});


// important for pagination
productSchema.index({
    category:1,
    created_at:-1,
    _id:-1
});


module.exports = mongoose.model(
    "Product",
    productSchema
);