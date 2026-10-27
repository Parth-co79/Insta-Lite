const likesService = require('../services/likes.services');
const { parsePositiveInteger } = require('../utils/pagination');

async function getPostLikes(req, res, next) {
  const id = parsePositiveInteger(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }

  try {
    const users = await likesService.getPostLikes(id);
    if (!users) {
      return res.status(404).json({ error: 'Post not found' });
    }
    return res.json(users);
  } catch (error) {
    return next(error);
  }
}

async function addLike(req, res, next) {
  const postId = parsePositiveInteger(req.params.id);
  if (postId === null) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }

  const body = req.body;
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const { userId } = body;
  if (userId === undefined || typeof userId !== 'number') {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const like = await likesService.addLike(postId, userId);
    return res.status(201).json(like);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Already liked' });
    }
    if (error.status === 404) {
      return res.status(404).json({ error: error.message });
    }
    return next(error);
  }
}

async function removeLike(req, res, next) {
  const postId = parsePositiveInteger(req.params.id);
  const userId = parsePositiveInteger(req.params.userId);

  if (postId === null || userId === null) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }

  try {
    await likesService.removeLike(postId, userId);
    return res.status(204).end();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Like not found' });
    }
    return next(error);
  }
}

module.exports = {
  getPostLikes,
  addLike,
  removeLike,
};