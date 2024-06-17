import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";

const app=express();
const port=4000;

const db=new pg.Client({
    user:"postgres",
    host:"localhost",
    database:"billsplit",
    password:"1234",
    port:5432,
});
db.connect();

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.get("/friendList",async(req,res)=>{
    try{
        const friendList=await db.query("SELECT * FROM billsplit");
        // console.log(friendList.rows);
        console.log(friendList.rows);
        res.send(friendList.rows);
    }catch(err){
        console.log(err);
    }
});

app.patch("/updateborrow",async(req,res)=>{
    const friend=req.body;
    const friendId=friend.id;
    const amountBorrow=friend.borrow;
    try{
        await db.query(
            "UPDATE billsplit SET borrow=($1) WHERE id=($2)",[amountBorrow,friendId]
        );
        res.send("Success");
        console.log("added!");
    }catch(err){
        console.log(err);
    }
});


app.listen(port,()=>{
    console.log(`Server running on http://localhost:${port}`);
});