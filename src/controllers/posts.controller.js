const postsService = require('../services/posts.services');
const { parsePositiveInteger, parsePagination, buildMeta } = require('../utils/pagination');

const allowedSortBy = ['createdAt', 'updatedAt', 'likes'];

function parsePostId(value) {
  return parsePositiveInteger(value);
}

function parseDate(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

async function createPost(req, res, next) {
  const body = req.body;
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'imageUrl and authorId are required' });
  }

  const { imageUrl, authorId, caption, location } = body;
  if (!imageUrl || typeof imageUrl !== 'string' || authorId === undefined || typeof authorId !== 'number') {
    return res.status(400).json({ error: 'imageUrl and authorId are required' });
  }

  const data = {
    imageUrl: imageUrl.trim(),
    authorId,
  };

  if (typeof caption === 'string') {
    data.caption = caption.trim();
  } else if (caption === null) {
    data.caption = null;
  }

  if (typeof location === 'string') {
    data.location = location.trim();
  } else if (location === null) {
    data.location = null;
  }

  try {
    const post = await postsService.createPost(data);
    return res.status(201).json(post);
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(404).json({ error: 'User not found' });
    }
    return next(error);
  }
}

async function getPosts(req, res, next) {
  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  const { page, limit } = pagination;

  let sortBy = 'createdAt';
  if (req.query.sortBy !== undefined) {
    if (!allowedSortBy.includes(req.query.sortBy)) {
      return res.status(400).json({ error: 'sortBy must be one of: createdAt, updatedAt, likes' });
    }
    sortBy = req.query.sortBy;
  }

  let order = 'desc';
  if (req.query.order !== undefined) {
    if (req.query.order !== 'asc' && req.query.order !== 'desc') {
      return res.status(400).json({ error: 'order must be asc or desc' });
    }
    order = req.query.order;
  }

  let from;
  if (req.query.from !== undefined) {
    const parsed = parseDate(req.query.from);
    if (!parsed) {
      return res.status(400).json({ error: 'from and to must be valid dates' });
    }
    from = parsed;
  }

  let to;
  if (req.query.to !== undefined) {
    const parsed = parseDate(req.query.to);
    if (!parsed) {
      return res.status(400).json({ error: 'from and to must be valid dates' });
    }
    to = parsed;
  }

  const location = typeof req.query.location === 'string' ? req.query.location : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;

  try {
    const { data, total } = await postsService.listPosts({
      page,
      limit,
      sortBy,
      order,
      location,
      search,
      from,
      to,
    });

    return res.json({
      data,
      meta: buildMeta(page, limit, total),
    });
  } catch (error) {
    return next(error);
  }
}

async function getPostById(req, res, next) {
  const id = parsePostId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }

  try {
    const post = await postsService.getPostById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    return res.json(post);
  } catch (error) {
    return next(error);
  }
}

async function updatePost(req, res, next) {
  const id = parsePostId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }

  const body = req.body;
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const data = {};
  if (body.caption !== undefined) {
    data.caption = typeof body.caption === 'string' ? body.caption.trim() : null;
  }
  if (body.location !== undefined) {
    data.location = typeof body.location === 'string' ? body.location.trim() : null;
  }

  try {
    const post = await postsService.updatePost(id, data);
    return res.json(post);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Post not found' });
    }
    return next(error);
  }
}

async function deletePost(req, res, next) {
  const id = parsePostId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }

  try {
    await postsService.deletePost(id);
    return res.status(204).end();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Post not found' });
    }
    return next(error);
  }
}

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
};