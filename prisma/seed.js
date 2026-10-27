const getPrisma = require('../src/db');
const { users, posts, likes } = require('./seed-data');

async function seed() {
  const prisma = await getPrisma();

  try {
    await prisma.like.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    const createdUsers = await prisma.user.createManyAndReturn({
      data: users,
    });

    const userLookup = new Map(createdUsers.map((u) => [u.username, u.id]));

    const postsToInsert = posts.map((p) => {
      const authorId = userLookup.get(p.author);
      return {
        imageUrl: p.imageUrl,
        caption: p.caption,
        location: p.location,
        createdAt: new Date(p.createdAt),
        authorId,
      };
    });

    const createdPosts = await prisma.post.createManyAndReturn({
      data: postsToInsert,
    });

    const postLookup = new Map();
    for (const post of createdPosts) {
      const parts = post.imageUrl.split('/');
      const key = parts[5];
      postLookup.set(key, post.id);
    }

    const likesToInsert = likes.map((l) => ({
      userId: userLookup.get(l.user),
      postId: postLookup.get(l.post),
    }));

    const createdLikes = await prisma.like.createMany({
      data: likesToInsert,
    });

    console.log(
      `🌱 Seeded ${createdUsers.length} users, ${createdPosts.length} posts and ${createdLikes.count} likes`
    );
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});