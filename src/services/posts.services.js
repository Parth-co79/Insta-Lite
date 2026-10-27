const getPrisma = require('../db');
const { userSummarySelect } = require('./users.services');

async function createPost(data) {
  const prisma = await getPrisma();
  return prisma.post.create({ data });
}

async function listPosts({ page, limit, sortBy, order, location, search, from, to }) {
  const prisma = await getPrisma();

  const where = {};

  if (location) {
    where.location = { equals: location, mode: 'insensitive' };
  }

  if (search) {
    where.caption = { contains: search, mode: 'insensitive' };
  }

  if (from || to) {
    where.createdAt = {};
    if (from) {
      where.createdAt.gte = from;
    }
    if (to) {
      where.createdAt.lt = to;
    }
  }

  let orderBy;
  if (sortBy === 'likes') {
    orderBy = [
      { likes: { _count: order } },
      { createdAt: 'desc' },
    ];
  } else {
    orderBy = { [sortBy]: order };
  }

  const skip = (page - 1) * limit;

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy,
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

async function getPostById(id) {
  const prisma = await getPrisma();
  return prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: userSummarySelect,
      },
      _count: {
        select: { likes: true },
      },
    },
  });
}

async function updatePost(id, data) {
  const prisma = await getPrisma();
  return prisma.post.update({ where: { id }, data });
}

async function deletePost(id) {
  const prisma = await getPrisma();
  return prisma.post.delete({ where: { id } });
}

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
};