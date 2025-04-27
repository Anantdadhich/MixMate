import prisma from '../config/db.js';

class Message {
	static async create(data) {
		try {
			return await prisma.message.create({
				data: {
					sender: {
						connect: { id: data.sender }
					},
					receiver: {
						connect: { id: data.receiver }
					},
					content: data.content
				},
				include: {
					sender: {
						select: {
							id: true,
							name: true,
							image: true
						}
					},
					receiver: {
						select: {
							id: true,
							name: true,
							image: true
						}
					}
				}
			});
		} catch (error) {
			console.error('Error creating message:', error);
			throw error;
		}
	}

	static async findById(id) {
		try {
			return await prisma.message.findUnique({
				where: { id },
				include: {
					sender: {
						select: {
							id: true,
							name: true,
							image: true
						}
					},
					receiver: {
						select: {
							id: true,
							name: true,
							image: true
						}
					}
				}
			});
		} catch (error) {
			console.error('Error finding message by ID:', error);
			throw error;
		}
	}

	static async findByUsers(senderId, receiverId) {
		try {
			return await prisma.message.findMany({
				where: {
					OR: [
						{
							senderId: senderId,
							receiverId: receiverId
						},
						{
							senderId: receiverId,
							receiverId: senderId
						}
					]
				},
				include: {
					sender: {
						select: {
							id: true,
							name: true,
							image: true
						}
					},
					receiver: {
						select: {
							id: true,
							name: true,
							image: true
						}
					}
				},
				orderBy: {
					createdAt: 'asc'
				}
			});
		} catch (error) {
			console.error('Error finding messages between users:', error);
			throw error;
		}
	}

	static async update(id, data) {
		try {
			return await prisma.message.update({
				where: { id },
				data: {
					content: data.content
				},
				include: {
					sender: {
						select: {
							id: true,
							name: true,
							image: true
						}
					},
					receiver: {
						select: {
							id: true,
							name: true,
							image: true
						}
					}
				}
			});
		} catch (error) {
			console.error('Error updating message:', error);
			throw error;
		}
	}

	static async delete(id) {
		try {
			return await prisma.message.delete({
				where: { id }
			});
		} catch (error) {
			console.error('Error deleting message:', error);
			throw error;
		}
	}
}

export default Message;
