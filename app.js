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
const postRoute = require('./routes/postRoutes');
const profileRoute = require('./routes/profileRoutes');
const uploadRoute = require('./routes/uploadRoutes');
const searchRoute = require('./routes/searchRoutes');
const messagesRoute = require('./routes/messagesRoutes');
const notificationsRoute = require('./routes/notificationRoutes');
const postApiRoutes = require('./routes/api/posts');
const chatApiRoutes = require('./routes/api/chats');
const userApiRoutes = require('./routes/api/users');
const messageApiRoutes = require('./routes/api/messages');

dotenv.config();

connectDB();

const app = express();
const port = process.env.PORT || 3000;

const server = app.listen(port,()=>{
    console.log(`Server listening on port ${port}`.blue.bold);
})

const io = require('socket.io')(server,{pingTimeout: 60000});

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
app.use('/uploads', middleware.requireLogin , uploadRoute);
app.use('/search', middleware.requireLogin , searchRoute);
app.use('/posts', middleware.requireLogin ,postRoute);
app.use('/profile', middleware.requireLogin ,profileRoute);
app.use('/messages', middleware.requireLogin ,messagesRoute);
app.use('/notifications', middleware.requireLogin ,notificationsRoute);

//Api routes
app.use('/api/posts',postApiRoutes);
app.use('/api/chats',chatApiRoutes);
app.use('/api/users',userApiRoutes);
app.use('/api/messages',messageApiRoutes);

app.get('/', middleware.requireLogin ,(req,res,next)=>{
    const payload = {
        pageTitle : 'Homes',
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }

    res.status(200).render('home',payload);
})

io.on("connection",(socket)=>{
    // console.log("Connected to the socket io".rainbow.bold);
    socket.on("setup", userData => {
        socket.join(userData._id);
        socket.emit("connected");
    })

    socket.on("join room", room => {
        socket.join(room);
    })

    socket.on("typing", room => {
        socket.in(room).emit("typing");
    })

    socket.on("stop typing", room => {
        socket.in(room).emit("stop typing");
    })

    socket.on("new message", newMessage => {
        const chat = newMessage.chat;

        if(!chat.users){
            return console.log("Chat users is not defined");
        }

        chat.users.forEach(user=>{
            if(user._id === newMessage.sender._id) return;
            socket.in(user._id).emit("message received", newMessage);
        })
    })
})