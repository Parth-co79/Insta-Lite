const express = require('express');
const usersController = require('../controllers/users.controllers');

const router = express.Router();

router.post('/', usersController.createUser);
router.get('/', usersController.getUsers);
router.get('/:id', usersController.getUserById);
router.patch('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);
router.get('/:id/posts', usersController.getUserPosts);
router.get('/:id/liked-posts', usersController.getUserLikedPosts);

module.exports = router;