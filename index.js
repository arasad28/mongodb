const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = 3002;
app.use(express.json());
app.use(express.urlencoded({extended:true}));
//create product schema
const productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,"product title is required"],
        minlength:[3,"Minimum length required 3"],
        maxlength:[20,"Maximum length required 20"],
        trim:true,
        // validate:{
        //     validator:function(v){
        //         return v.length == 10
        //     },
        //     message:(props)=> `${props.value} is not valid title`
        // }
        // enum:["iphone","samsung"]
    },
    price:{
        type:Number,
        min:20,
        max:[2000,"maximum price of the product should be 2000"],
        required:true
    },
    // email{
    //     type:String,
    //     unique:True
    // },
    rating:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    phone:{
        type:String,
        required:[true,"phone number is required"],
        validate:{
            validator:function(v){
                return  /\d{3}-\d{3}-\d{4}/.test(v);
            },
            message:(props) => `${props.value} is not a valid phone number`
        }
    }

})

//create product model
const Product = mongoose.model("Prodcuts",productSchema)

const connectDB = async() => {
    try{
        await mongoose.connect("mongodb://localhost:27017/testdb");
        console.log('db is connected');

    }
    catch(error){
        console.log("db is not connected");
        console.log(error);
        process.exit(1);
    }

}

app.get("/",(req,res)=>{
    res.send("Welcome to home page");
});
app.listen(port,async()=>{
    console.log('server is running');
    await connectDB()
})

app.post("/products",async(req,res)=>{
    try{

        const newProduct = new Product({
            title:req.body.title,
            price:req.body.price,
            description:req.body.description,
            rating:req.body.rating,
            phone:req.body.phone
        });
        const productData = await newProduct.save()


        res.status(201).send(productData)

    }catch{
        res.status(500).send({message:error.message});
    }
});

// {$and:[{price:{$gt:price}},{rating:{$gt:4}}]}

app.get("/products",async(req,res)=>{
    try {
        // const price = req.query.price;
        price = req.query.price;
        let products;
        if(price){
            //  products = await Product.find({price:{$gt:price}});
            products = await Product.find({$or:[{price:{$gt:price}},{rating:{$gte:4}}]}).sort({price:1});
        }
        else{
            products = await Product.find();
            // products = await Product.find().sort({price:1}).select({title:1,_id:0});
        }

        if(products){
            res.status(200).send(products);
        }else{
            res.status(404).send({message:"products not found"});
        }
    } catch (error) {
        res.status(500).send({message:error.message});
    }
});


app.get("/products/:id",async(req,res)=>{
    try {
        const id = req.params.id;
        const product = await Product.findOne({_id:id})
        res.send(product)
        if(product){
            res.status(200).send({
                success:true,
                mesage:"return single product",
                data:product
            });
        }else{
            res.status(404).send({message:"product not found"});
        }
    } catch (error) {
        res.status(500).send({message:error.message});
    }
});

app.delete("/products/:id",async (req,res) => {
    try {
        const id = req.params.id;
        const product = await Product.findByIdAndDelete({_id:id});
        if(product){
            res.status(200).send({
                success:true,
                mesage:"delete single product",
                data:product,
            });
        }else{
            res.status(404).send({
                success:false,
                message:"product not found"
            });
        }
    } catch (error) {
        res.status(500).send({message:error.message});
    }
    
    
})

app.put("/products/:id",async(req,res) => {
    try {
            const id = req.params.id;
            const updatedProduct = await Product.findByIdAndUpdate({_id:id},{
                $set:{
                    titile:req.body.titile,
                    price:req.body.price,
                    description:req.body.description,
                    rating:req.body.rating
                },
                
            },
            {new:true},
            );
            if(updatedProduct){
                res.status(200).send({
                    success:true,
                    mesage:"updated single product",
                    data:updatedProduct,
                });
            }else{
                res.status(404).send({
                    success:false,
                    message:"product not found"
                });
            }
        
    } catch (error) {
        res.status(500).send({message:error.message});

}
});