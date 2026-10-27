const getPrisma = require('../db');

const userSummarySelect = {
  id: true,
  username: true,
  fullname: true,
};

async function createUser(data) {
  const prisma = await getPrisma();
  return prisma.user.create({ data });
}

async function listUsers({ page, limit, sortBy, order, isPrivate, search, hasPosts }) {
  const prisma = await getPrisma();

  const where = {};

  if (isPrivate !== undefined) {
    where.isPrivate = isPrivate;
  }

  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { fullname: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (hasPosts !== undefined) {
    where.posts = hasPosts ? { some: {} } : { none: {} };
  }

  const orderBy = { [sortBy]: order };
  const skip = (page - 1) * limit;

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { data, total };
}

async function getUserById(id) {
  const prisma = await getPrisma();
  return prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          posts: true,
          likes: true,
        },
      },
    },
  });
}

async function updateUser(id, data) {
  const prisma = await getPrisma();
  return prisma.user.update({ where: { id }, data });
}

async function deleteUser(id) {
  const prisma = await getPrisma();
  return prisma.user.delete({ where: { id } });
}

async function getUserPosts(id, { page, limit }) {
  const prisma = await getPrisma();

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!user) {
    return null;
  }

  const where = { authorId: id };
  const skip = (page - 1) * limit;

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        _count: {
          select: { likes: true },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return { data, total };
}

async function getUserLikedPosts(id, { page, limit }) {
  const prisma = await getPrisma();

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!user) {
    return null;
  }

  const where = {
    likes: {
      some: {
        userId: id,
      },
    },
  };

  const skip = (page - 1) * limit;

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        author: {
          select: userSummarySelect,
        },
        _count: {
          select: { likes: true },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return { data, total };
}

module.exports = {
  userSummarySelect,
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserPosts,
  getUserLikedPosts,
};