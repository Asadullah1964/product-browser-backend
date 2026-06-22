const categories = [
    "electronics",
    "fashion",
    "books",
    "sports",
    "home",
    "gaming"
];


const products = [];


function randomItem(arr){
    return arr[
        Math.floor(Math.random()*arr.length)
    ];
}


function generateProducts(count){

    const products=[];


    for(let i=0;i<count;i++){

        const createdDate =
            new Date(
                Date.now() -
                Math.floor(
                    Math.random()*10000000000
                )
            );


        products.push({

            name:
              `Product ${i+1}`,

            category:
              randomItem(categories),

             image:
    `https://source.unsplash.com/300x300/?${randomItem(categories)}&${i}`,

            price:
              Math.floor(
                Math.random()*100000
              )+100,


            created_at:
              createdDate,

            updated_at:
              createdDate

        });

    }


    return products;
}



module.exports=generateProducts;