const express = require('express');
const postsController = require('../controllers/posts.controllers');
const likesController = require('../controllers/likes.controllers');

const router = express.Router();

router.post('/', postsController.createPost);
router.get('/', postsController.getPosts);
router.get('/:id', postsController.getPostById);
router.patch('/:id', postsController.updatePost);
router.delete('/:id', postsController.deletePost);

router.get('/:id/likes', likesController.getPostLikes);
router.post('/:id/likes', likesController.addLike);
router.delete('/:id/likes/:userId', likesController.removeLike);

module.exports = router;