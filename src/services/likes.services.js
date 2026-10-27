const getPrisma = require('../db');
const { userSummarySelect } = require('./users.services');

async function getPostLikes(postId) {
  const prisma = await getPrisma();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    return null;
  }

  const likes = await prisma.like.findMany({
    where: { postId },
    include: {
      user: {
        select: userSummarySelect,
      },
    },
    orderBy: {
      user: {
        username: 'asc',
      },
    },
  });

  return likes.map((l) => l.user);
}

async function addLike(postId, userId) {
  const prisma = await getPrisma();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!post) {
    const error = new Error('Post not found');
    error.status = 404;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  return prisma.like.create({
    data: {
      postId,
      userId,
    },
  });
}

async function removeLike(postId, userId) {
  const prisma = await getPrisma();

  return prisma.like.delete({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });
}

module.exports = {
  getPostLikes,
  addLike,
  removeLike,
};