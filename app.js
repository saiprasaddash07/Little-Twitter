const express =  require("express");
const middleware = require('./middleware');
const colors = require("colors");
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const session = require('express-session');
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const logoutRoute = require('./routes/logout');

dotenv.config();

connectDB();

const app = express();
const port = process.env.PORT || 3000;

const server = app.listen(port,()=>{
    console.log(`Server listening on port ${port}`.blue.bold);
})

app.set('view engine','pug');
app.set('views','views');

app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname,'public')));

app.use(session({
    secret: "thisisatwitterclone",
    resave: true,
    saveUninitialized: false
}));

//Routes
app.use('/login',loginRoute);
app.use('/register',registerRoute);

app.use('/logout',logoutRoute);

app.get('/', middleware.requireLogin ,(req,res,next)=>{
    const payload = {
        pageTitle : 'Homes',
        userLoggedIn: req.session.user
    }

    res.status(200).render('home',payload);
})