const express = require('express');
const path = require('path');

const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
// app.use(cors({
//     origin: '*'
// }));

const dotenv = require('dotenv');
dotenv.config();

const sequelize = require('./util/database');

app.use(express.static(path.join(__dirname, 'public')));

const User = require('./models/userModel');
const Chat = require('./models/chatModel');
const Group = require('./models/groupModel');
const UserGroup = require('./models/usergroupModel');

const userRouter = require('./routes/userRoutes');
const chatRouter = require('./routes/chatRoutes');
const groupRouter = require('./routes/groupRoutes');

app.use('/user', userRouter);
app.use('/chat', chatRouter);
app.use('/group', groupRouter);


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

const io=require('socket.io')(5000,{
    cors:{
        // origin:['http://127.0.0.1:3000']
        // origin:['http://127.0.0.1:3000']
        origin:'*'
    }
})

io.on("connection",socket=>{
    console.log(socket.id)
    socket.on("send-message",message=>{
        socket.broadcast.emit("receive-message",message)
    })
})


sequelize
.sync()
.then(() => {
    console.log(`Hi`);
    app.listen(process.env.port);
})


