const express = require('express')
const router = express.Router()
const chatController = require('../controllers/chatController')
const auth = require('../middleware/authorization')
// router.get('/home',chatController.homePage)

router.post('/send/:groupId',auth.authorization,chatController.sendChat)
router.get('/allChats/:groupId',auth.authorization,chatController.allChats)
router.get('/allUsers/:groupId' ,  chatController.allUsers);
router.post('/addUser/:groupId' , auth.authorization ,  chatController.addUser);
router.post('/deleteUser/:groupId' , auth.authorization ,  chatController.deleteUser);
router.post('/removeAdmin/:groupId' , auth.authorization ,  chatController.removeAdmin);
router.post('/makeAdmin/:groupId' , auth.authorization ,  chatController.makeAdmin);

const multer = require('multer');
const upload = multer();

router.post('/sendFile/:groupId' , auth.authorization, upload.single('file'), chatController.sendFile);
module.exports = router;

// router.get('/allUsers',auth.authorization,chatController.allUsers)

// router.get('/sendTo',chatController.sendtoChats)

module.exports=router