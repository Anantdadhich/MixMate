import prisma from '../config/db.js';

class Message {
	static async create(data) {
		return prisma.message.create({
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
				sender: true,
				receiver: true
			}
		});
	}

	static async findById(id) {
		return prisma.message.findUnique({
			where: { id },
			include: {
				sender: true,
				receiver: true
			}
		});
	}

	static async findByUsers(senderId, receiverId) {
		return prisma.message.findMany({
			where: {
				OR: [
					{
						senderId,
						receiverId
					},
					{
						senderId: receiverId,
						receiverId: senderId
					}
				]
			},
			include: {
				sender: true,
				receiver: true
			},
			orderBy: {
				createdAt: 'asc'
			}
		});
	}

	static async update(id, data) {
		return prisma.message.update({
			where: { id },
			data: {
				content: data.content
			},
			include: {
				sender: true,
				receiver: true
			}
		});
	}

	static async delete(id) {
		return prisma.message.delete({
			where: { id }
		});
	}
}

export default Message;
