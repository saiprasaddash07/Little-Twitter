import express from "express";
import colors from "colors";

const app = express();

const port = 3000;

const server = app.listen(port,()=>{
    console.log(`Server listening on port ${port}`.blue.bold);
})

app.set('view engine','pug');
app.set('views','views');

app.get('/',(req,res,next)=>{
    const payload = {
        pageTitle : 'Homes'
    }

    res.status(200).render('home',payload);
})

