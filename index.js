// Node server which will handle socket io connections
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

const bodyParser = require('body-parser');
// const io = require('socket.io')(8000)
const io = require("socket.io")(8000, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });


const sequelize = require('./util/database');

const User = require('./models/users')
const Chat = require('./models/chats')
const Group = require('./models/groupModel');
const UserGroup = require('./models/usergroupModel');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json())

const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const groupRoutes = require('./routes/groupRoutes');

app.use(userRoutes)
app.use(chatRoutes)
app.use(groupRoutes);


app.use(express.static('public'))


User.hasMany(Chat);
Chat.belongsTo(User);

User.belongsToMany(Group , {
    through : UserGroup
});
Group.belongsToMany(User , {
    through : UserGroup
});

Group.hasMany(Chat);
Chat.belongsTo(Group);

const users = {};
sequelize.sync()
.then(async (result) => {
    try {
        await io.on('connection', socket =>{
            // If any new user joins, let other users connected to the server know!
            socket.on('new-user-joined', name =>{ 
                users[socket.id] = name;
                socket.broadcast.emit('user-joined', name);
            });
        
            // If someone sends a message, broadcast it to other people
            socket.on('send', message =>{
                socket.broadcast.emit('receive', {message: message, name: users[socket.id]})
            });
        
            // If someone leaves the chat, let others know 
            socket.on('disconnect', message =>{
                socket.broadcast.emit('left', users[socket.id]);
                delete users[socket.id];
            });
        })
        app.listen(3000)
    } catch (error) {
        console.log(error);
    }    
}).catch((err) => {
    console.log(err);
});
