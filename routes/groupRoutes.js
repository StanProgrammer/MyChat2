
const express = require('express');

const router = express.Router();

const groupController = require('../controllers/groupController');
const auth = require('../middleware/authorization');

router.post('/createGroup', auth.authorization,  groupController.createGroup);

router.get('/getGroup' , auth.authorization , groupController.getGroups)

router.get('/delete/:id' ,  auth.authorization, groupController.deleteGroup);

router.post('/getAllGroups' , groupController.getAllGroups);

router.get('/join/:id' , auth.authorization , groupController.joinGroup);

module.exports = router;