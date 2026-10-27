const usersService = require('../services/users.services');
const { parsePositiveInteger, parsePagination, buildMeta } = require('../utils/pagination');

const allowedSortBy = ['createdAt', 'username', 'fullname'];

function parseUserId(value) {
  return parsePositiveInteger(value);
}

async function createUser(req, res, next) {
  const body = req.body;
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'username, email and fullname are required' });
  }

  const { username, email, fullname, bio } = body;
  if (!username || !email || !fullname || typeof username !== 'string' || typeof email !== 'string' || typeof fullname !== 'string') {
    return res.status(400).json({ error: 'username, email and fullname are required' });
  }

  const data = {
    username: username.trim(),
    email: email.trim(),
    fullname: fullname.trim(),
  };

  if (typeof bio === 'string') {
    data.bio = bio;
  } else if (bio === null) {
    data.bio = null;
  }

  try {
    const user = await usersService.createUser(data);
    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
}

async function getUsers(req, res, next) {
  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  const { page, limit } = pagination;

  let sortBy = 'createdAt';
  if (req.query.sortBy !== undefined) {
    if (!allowedSortBy.includes(req.query.sortBy)) {
      return res.status(400).json({ error: 'sortBy must be one of: createdAt, username, fullname' });
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

  let isPrivate;
  if (req.query.isPrivate !== undefined) {
    if (req.query.isPrivate === 'true') {
      isPrivate = true;
    } else if (req.query.isPrivate === 'false') {
      isPrivate = false;
    } else {
      return res.status(400).json({ error: 'isPrivate must be true or false' });
    }
  }

  let hasPosts;
  if (req.query.hasPosts !== undefined) {
    if (req.query.hasPosts === 'true') {
      hasPosts = true;
    } else if (req.query.hasPosts === 'false') {
      hasPosts = false;
    } else {
      return res.status(400).json({ error: 'hasPosts must be true or false' });
    }
  }

  const search = typeof req.query.search === 'string' ? req.query.search : undefined;

  try {
    const { data, total } = await usersService.listUsers({
      page,
      limit,
      sortBy,
      order,
      isPrivate,
      search,
      hasPosts,
    });

    return res.json({
      data,
      meta: buildMeta(page, limit, total),
    });
  } catch (error) {
    return next(error);
  }
}

async function getUserById(req, res, next) {
  const id = parseUserId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }

  try {
    const user = await usersService.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    return next(error);
  }
}

async function updateUser(req, res, next) {
  const id = parseUserId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }

  const body = req.body;
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const data = {};
  if (body.fullname !== undefined && typeof body.fullname === 'string') {
    data.fullname = body.fullname.trim();
  }
  if (body.bio !== undefined) {
    data.bio = typeof body.bio === 'string' ? body.bio : null;
  }
  if (body.isPrivate !== undefined && typeof body.isPrivate === 'boolean') {
    data.isPrivate = body.isPrivate;
  }

  try {
    const user = await usersService.updateUser(id, data);
    return res.json(user);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    return next(error);
  }
}

async function deleteUser(req, res, next) {
  const id = parseUserId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }

  try {
    await usersService.deleteUser(id);
    return res.status(204).end();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    return next(error);
  }
}

async function getUserPosts(req, res, next) {
  const id = parseUserId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }

  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  try {
    const result = await usersService.getUserPosts(id, pagination);
    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      data: result.data,
      meta: buildMeta(pagination.page, pagination.limit, result.total),
    });
  } catch (error) {
    return next(error);
  }
}

async function getUserLikedPosts(req, res, next) {
  const id = parseUserId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }

  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  try {
    const result = await usersService.getUserLikedPosts(id, pagination);
    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      data: result.data,
      meta: buildMeta(pagination.page, pagination.limit, result.total),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserPosts,
  getUserLikedPosts,
};