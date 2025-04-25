import prisma from '../config/db.js';

class Recipe {
  static async create(data) {
    return prisma.recipe.create({
      data: {
        ...data,
        users: {
          create: data.users.map(userId => ({
            user: {
              connect: { id: userId }
            }
          }))
        }
      },
      include: {
        users: {
          include: {
            user: true
          }
        }
      }
    });
  }

  static async findById(id) {
    return prisma.recipe.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: true
          }
        }
      }
    });
  }

  static async findByUsers(userIds) {
    return prisma.recipe.findFirst({
      where: {
        users: {
          every: {
            userId: {
              in: userIds
            }
          }
        }
      },
      include: {
        users: {
          include: {
            user: true
          }
        }
      }
    });
  }

  static async update(id, data) {
    return prisma.recipe.update({
      where: { id },
      data: {
        ...data,
        users: data.users ? {
          deleteMany: {},
          create: data.users.map(userId => ({
            user: {
              connect: { id: userId }
            }
          }))
        } : undefined
      },
      include: {
        users: {
          include: {
            user: true
          }
        }
      }
    });
  }

  static async delete(id) {
    return prisma.recipe.delete({
      where: { id }
    });
  }

  static async addFavorite(userId, recipeId, recipeData) {
    return prisma.favorite.create({
      data: {
        user: {
          connect: { id: userId }
        },
        recipeId,
        title: recipeData.title,
        cuisine: recipeData.cuisine,
        description: recipeData.description
      }
    });
  }

  static async removeFavorite(userId, recipeId) {
    return prisma.favorite.deleteMany({
      where: {
        userId,
        recipeId
      }
    });
  }

  static async getFavorites(userId) {
    return prisma.favorite.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}

export default Recipe;
