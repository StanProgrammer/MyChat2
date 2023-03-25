const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(bodyParser.json());

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

app.use(cors({
    origin:'*'
    
}))
const server=require('http').createServer(app)
const io=require('socket.io')(server,{
    cors:{
        origin:'*'
    }
})


sequelize
.sync()
.then(() => {
    app.listen(process.env.port);
})





