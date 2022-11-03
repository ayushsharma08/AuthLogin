const express=require('express');
const app= express();

const Route= app.route();


Route.get('/',(req,res)=>{
    res.render("index")
})