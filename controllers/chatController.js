const path = require('path')
const rootDir = path.dirname(require.main.filename);
const sequelize = require('../util/database');
const Chat = require('../models/chats')
const jwt = require('jsonwebtoken')
const User = require('../models/users')
const {Op} = require('sequelize');
const UserGroup=require('../models/usergroupModel')
const S3service=require('../services/S3services')
const env=require('dotenv');
const { log } = require('console');
env.config()
const SECRET_KEY=process.env.SECRET_KEY
exports.homePage = (req, res, next) => {
    res.sendFile(path.join(rootDir, 'public', 'html', 'chat.html'))
}

exports.sendChat=async(req,res,next)=>{
    const sequelizeTransaction = await sequelize.transaction(); 
    try {
        const { groupId } = req.params;
        const token = req.header('Authorization');
        const user = jwt.verify(token, SECRET_KEY);
        const id=user.id
        const name=user.name
        const isUserInGroup = await UserGroup.findOne({ where: { userId: req.user.id, groupId: groupId } });
        if (!isUserInGroup) {
            return res.status(400).json({ success: false, message: 'Not Found !' });
        }
        const data=await Chat.create({
            chat: req.body.chat,
            userId: id,
            userName:name,
            groupId: groupId
        },

        {transaction: sequelizeTransaction})
        await sequelizeTransaction.commit();
        res.status(201).json({message:'Done'})
        
    } catch (error) {
        console.log(error);
        await sequelizeTransaction.rollback();
        res.status(500).json({error:error})
    }
}


exports.allChats=async(req,res,next)=>{
    try {
      // console.log(lastMessageId);
        const lastMessageId = req.query.lastId || 0;
        let { groupId } = req.params;
        console.log(lastMessageId);
        const chats = await Chat.findAll({
          raw:true,
          where:{
            id:{
              [Op.gt]: lastMessageId
            },
            groupId: groupId
          },
        });
        // let a=[]
        // let ids=chats.map((elements)=>{
        //   return elements.userId
        // })
        // console.log(chats);
        // let name=names.map((ele)=>{
        //   return ele.name
        // })
        // console.log(name);
       
        return res.status(200).json({ chats });
      } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something wrong", Error: err });
      }
    };
// exports.sendtoChats=async(req,res,send)=>{
//     try {
        
//         const id=req.query.id
//         const data=await Chat.findAll({
//             limit: 10,
//             raw: true,
//             where: {
//               userId: id
//             },
//             attributes: ['userId','chat','createdAt'], 
//             order: [ [ 'createdAt', 'DESC' ]]
//           });
//         res.status(201).json(data)
//     } catch (error) {
//         console.log(error);
//     }
// }


exports.allUsers=async (req,res,next)=>{
  const { groupId } = req.params;

  try {
      const data = await UserGroup.findAll({ where: { groupId: groupId } });
      const users = data.map(element => {
          return { id: element.userId, isAdmin: element.isAdmin };
      });
      const userDetails = [];
      let adminEmail = [];

      for (let i = 0; i < users.length; i++) {
          const user = await User.findOne({ where: { id: users[i].id } });
          userDetails.push({ name: user.name, isAdmin: users[i].isAdmin, email: user.email });
          if (users[i].isAdmin) {
              adminEmail.push(user.email);
          }
      }

      res.status(200).json({ success: true, userDetails, adminEmail });
  } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: 'Something went wrong !' })
  }
}

exports.addUser = async (req, res, next) => {
  try {
      const { groupId } = req.params;
      const { email } = req.body;
      const token = req.header('Authorization');
      const user1 = jwt.verify(token, SECRET_KEY);
      const id=user1.id
      if (!email) {
          return res.status(500).json({ success: false, message: `Bad request !` });
      }
      const checkUserIsAdmin = await UserGroup.findOne({ where: { userId: id, groupId: groupId } });
      console.log(checkUserIsAdmin);
      if (!checkUserIsAdmin.isAdmin) {
          return res.status(500).json({ success: false, message: `Only admin can add users !` });
      }

      if (req.user.email == email) {
          return res.status(500).json({ success: false, message: `Admin is already in group !` });
      }

      const user = await User.findOne({ where: { email: email } });
      if (!user) {
          return res.status(500).json({ success: false, message: `User doesn't exist !` });
      }
      const alreadyInGroup = await UserGroup.findOne({ where: { userId: user.id, groupId: groupId } });
      if (alreadyInGroup) {
          return res.status(500).json({ success: false, message: `User is already in group !` });
      }

      const data = await UserGroup.create({
          userId: user.id,
          groupId: groupId,
          isAdmin: false
      })

      res.status(200).json({ success: true, message: 'User successfully added !', data });
  } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: `Something went wrong !` });
  }
}

exports.deleteUser = async (req, res, next) => {

    console.log(req.body, req.params);
    const { groupId } = req.params;
    const { email } = req.body;
    try {

        const checkUser = await UserGroup.findOne({ where: { groupId: groupId, userId: req.user.id } });
        if (!checkUser) {
            return res.status(400).json({ success: false, message: `You are no longer in group !` });
        }

        const allAdmins = await UserGroup.findAll({ where: { groupId: groupId, isAdmin: true } });

        //if user try to delete himself.
        if (req.user.email == email && !checkUser.isAdmin) {
            await checkUser.destroy();
            return res.status(200).json({ success: true, message: `User has been deleted from group !` });
        }
        if (req.user.email == email) {
            if (allAdmins.length > 1) {
                await checkUser.destroy();
                return res.status(200).json({ success: true, message: `User has been deleted from group !` });
            } else {
                return res.status(400).json({ success: false, message: `Make another user as an Admin !` });
            }
        }

        //check whether user is not an admin.
        if (checkUser.isAdmin == false) {
            return res.status(400).json({ success: false, message: `Only admin can delete members from groups !` });
        }

        const user = await User.findOne({ where: { email: email } });
        const usergroup = await UserGroup.findOne({ where: { userId: user.id, groupId: groupId } });

        if (usergroup) {
            usergroup.destroy();
            return res.status(200).json({ success: true, message: `User ${user.name} is deleted successfully !` });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: `Something went wrong !` });
    }
}
exports.removeAdmin = async (req, res, next) => {
    console.log(req.body, req.params);
    const { email } = req.body;
    const { groupId } = req.params;
    try {

        const checkUserIsAdmin = await UserGroup.findOne({ where: { groupId: groupId, userId: req.user.id } });
        if (checkUserIsAdmin.isAdmin == false) {
            return res.status(500).json({ success: false, message: `Only Admin have this permission !` });
        }

        const user = await User.findOne({ where: { email: email } });
        const allAdmins = await UserGroup.findAll({ where: { groupId: groupId, isAdmin: true } });

        if (allAdmins.length == 1) {
            return res.status(500).json({ success: false, message: `make another user as an Admin !` })
        }

        const data = await UserGroup.update({
            isAdmin: false
        }, { where: { userId: user.id, groupId: groupId } });

        res.status(200).json({ success: true, message: `User ${user.name} is no longer admin now !` });
    } catch (err) {
        console.log(err);
        res.status(400).json({ success: false, message: `Something went wrong !` });
    }

}

exports.makeAdmin = async (req, res, next) => {
    console.log(req.body);
    const { email } = req.body;
    const { groupId } = req.params;

    if (!email) {
        return res.status(400).json({ success: false, message: 'bad request !' });
    }

    try {
        const checkUserIsAdmin = await UserGroup.findOne({ where: { groupId: groupId, userId: req.user.id } });
        if (checkUserIsAdmin.isAdmin == false) {
            return res.status(400).json({ success: false, message: `Only Admin have this permission !` });
        }

        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(400).json({ success: false, message: `this user doesn't exist in database !` });
        }


        const data = await UserGroup.update({
            isAdmin: true
        }, { where: { groupId: groupId, userId: user.id } });


        res.status(200).json({ success: true, message: `Now ${user.name} is also Admin !` });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Something went wrong !' });
    }
}


exports.sendFile = async (req, res, next) => {
    try {
        console.log(req.file);
        const { groupId } = req.params;
        const token = req.header('Authorization');
        const user = jwt.verify(token, SECRET_KEY);
        const id=user.id
        const name=user.name
        if (!req.file) {
            return res.status(400).json({ success: false, message: `Please choose file !` });
        }

        let type = (req.file.mimetype.split('/'))[1];
        console.log('type', type)
        const file = req.file.buffer;
        const filename = `GroupChat/${new Date()}.${type}`;
        console.log(`file ===>`, file);
        console.log('filename ====>', filename);
        const fileUrl = await S3service.uploadToS3(file, filename);
        console.log('fileUrl =============>', fileUrl);
        
        const result=await Chat.create({
            chat: fileUrl,
            userId: id,
            userName:name,
            groupId: groupId
        })
        // let result = await req.user.createChat({
        //     message: fileUrl,
        //     groupId: groupId
        // })
        console.log('done');
        const data = { message: result.chat, createdAt: result.createdAt };

        res.status(200).json({ success: true, data });
    } catch (err) {
        console.log(err);
        res.status(400).json({ success: false, message: `Something went wrong !` });
    }
}

