import Agents from '../models/agentsModel.js';
import Message from '../models/message.js';
import Conversation from '../models/conversation.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';

async function findOrCreateConversation(mainUserId, agentId) {
	if (
		!mongoose.Types.ObjectId.isValid(mainUserId) ||
		!mongoose.Types.ObjectId.isValid(agentId)
	) {
		const error = new Error('Invalid user or agent ID format provided.');
		error.statusCode = 400;
		throw error;
	}

	let conversation = await Conversation.findOne({ mainUserId, agentId });

	if (!conversation) {
		const mainUserExists = await User.findById(mainUserId).select('_id').lean();
		const agentExists = await Agents.findById(agentId)
			.select('_id referBy')
			.lean();

		if (!mainUserExists) {
			const error = new Error(
				'Main user specified for conversation not found.'
			);
			error.statusCode = 404;
			throw error;
		}
		if (!agentExists) {
			const error = new Error('Agent specified for conversation not found.');
			error.statusCode = 404;
			throw error;
		}
		if (agentExists.referBy?.toString() !== mainUserId.toString()) {
			const error = new Error('Agent is not referred by this main user.');
			error.statusCode = 403;
			throw error;
		}

		console.log(
			`Creating new conversation between mainUser ${mainUserId} and agent ${agentId}`
		);
		conversation = new Conversation({ mainUserId, agentId });
		await conversation.save();
	}
	return conversation;
}

export const createChat = async (req, res, next) => {
	const {
		senderId, // ID of the user/agent sending
		senderModel, // 'userAccounts' or 'Agents'
		content, // Message text
		recipientId, // REQUIRED if senderModel is 'userAccounts'
	} = req.body;

	if (!senderId || !senderModel || !content || !content.trim()) {
		return res
			.status(400)
			.json({
				message:
					'Missing required fields: senderId, senderModel, and content are required.',
			});
	}
	if (!['userAccounts', 'Agents'].includes(senderModel)) {
		return res
			.status(400)
			.json({
				message: 'Invalid senderModel. Must be "userAccounts" or "Agents".',
			});
	}
	if (senderModel === 'userAccounts' && !recipientId) {
		return res
			.status(400)
			.json({
				message: 'recipientId is required when sending a message as a user.',
			});
	}

	try {
		let conversation;
		let messageRecipientId;

		if (senderModel === 'Agents') {
			const agent = await Agents.findById(senderId);
			if (!agent) {
				return res.status(404).json({ message: 'Sender agent not found.' });
			}
			if (!agent.referBy) {
				return res
					.status(400)
					.json({
						message:
							'Agent is not associated with a main user (referBy is missing).',
					});
			}

			const mainUserId = agent.referBy;
			messageRecipientId = mainUserId;
			conversation = await findOrCreateConversation(mainUserId, senderId);
		} else if (senderModel === 'userAccounts') {
			if (!mongoose.Types.ObjectId.isValid(recipientId)) {
				return res
					.status(400)
					.json({ message: 'Invalid recipient agent ID format.' });
			}

			const recipientAgent = await Agents.findOne({
				_id: recipientId,
				referBy: senderId,
			})
				.select('_id')
				.lean();
			if (!recipientAgent) {
				return res
					.status(403)
					.json({
						message:
							'Cannot send message: Agent not found or not referred by you.',
					});
			}

			messageRecipientId = recipientId;
			conversation = await findOrCreateConversation(senderId, recipientId);
		} else {
			return res
				.status(400)
				.json({ message: 'Invalid sender model specified.' });
		}

		const message = new Message({
			conversationId: conversation._id,
			sender: senderId,
			senderModel: senderModel,
			content: content.trim(),
		});
		await message.save();

		conversation.lastMessage = message._id;
		await conversation.save();

		return res.status(201).json(message);
	} catch (error) {
		console.error('Error in createChat controller:', error);
		if (!res.headersSent) {
			if (error.statusCode) {
				res.status(error.statusCode).json({ message: error.message });
			} else {
				res
					.status(500)
					.json({
						message:
							'An internal server error occurred while sending the message.',
					});
			}
		}
	}
};

export const getConversations = async (req, res, next) => {
	// 🔄 Get userId and model from body for testing
	const userId = req.body.userId;
	const userModel = req.body.model;

	if (!userId || !userModel) {
		return res
			.status(400)
			.json({ message: 'userId and model are required in the body.' });
	}

	try {
		let query = {};
		let populatePath = '';
		let populateFields = '';

		if (userModel === 'userAccounts') {
			query = { mainUserId: userId };
			populatePath = 'agentId';
			populateFields = 'name email profileImage';
		} else if (userModel === 'Agents') {
			query = { agentId: userId };
			populatePath = 'mainUserId';
			populateFields = 'firstName lastName email profileImage';
		} else {
			return res.status(400).json({ message: 'Invalid user role detected.' });
		}

		const conversations = await Conversation.find(query)
			.sort({ updatedAt: -1 })
			.populate({
				path: 'lastMessage',
				select: 'content createdAt sender senderModel',
			})
			.populate({
				path: populatePath,
				select: populateFields,
			})
			.lean();

		const formattedConversations = conversations.map((convo) => {
			const otherParticipantData = convo[populatePath] || {};
			const lastMessageData = convo.lastMessage || {};

			let otherParticipantName = 'Unknown User';
			if (userModel === 'userAccounts') {
				otherParticipantName = otherParticipantData.name || 'Agent';
			} else {
				otherParticipantName =
					`${otherParticipantData.firstName || ''} ${
						otherParticipantData.lastName || ''
					}`.trim() || 'User';
			}

			return {
				_id: convo._id,
				lastMessage: {
					content: lastMessageData.content,
					createdAt: lastMessageData.createdAt,
					isSender: lastMessageData.sender?.toString() === userId,
				},
				otherParticipant: {
					_id: otherParticipantData._id,
					name: otherParticipantName,
					profileImage: otherParticipantData.profileImage,
				},
				updatedAt: convo.updatedAt,
			};
		});

		res.status(200).json(formattedConversations);
	} catch (error) {
		console.error('Error fetching conversations:', error);
		next(error);
	}
};

export const getMessagesForConversation = async (req, res, next) => {
	// --- Get test data from the body ---
	const authenticatedUserId = req.body.userId;
	const conversationId = req.body.conversationId;

	// --- Validate Input ---
	if (!authenticatedUserId || !conversationId) {
		return res
			.status(400)
			.json({
				message: 'Both userId and conversationId are required in the body.',
			});
	}

	if (!mongoose.Types.ObjectId.isValid(conversationId)) {
		return res.status(400).json({ message: 'Invalid conversation ID format.' });
	}

	try {
		// --- Authorization Check: Verify user is part of this conversation ---
		const conversation = await Conversation.findById(conversationId)
			.select('mainUserId agentId')
			.lean();

		if (!conversation) {
			return res.status(404).json({ message: 'Conversation not found.' });
		}

		const isParticipant =
			conversation.mainUserId?.toString() === authenticatedUserId ||
			conversation.agentId?.toString() === authenticatedUserId;

		if (!isParticipant) {
			console.warn(
				`Authorization Denied: User ${authenticatedUserId} attempting to access conversation ${conversationId}.`
			);
			return res.statu;
			s(403).json({
				message: 'Forbidden: You are not a participant in this conversation.',
			});
		}

		// --- Fetch Messages ---
		const messages = await Message.find({ conversationId: conversationId })
			.sort({ createdAt: 1 })
			.populate({
				path: 'sender',
				select: 'name firstName lastName profileImage',
			})
			.lean();

		// --- Format Messages ---
		const formattedMessages = messages.map((msg) => {
			const senderData = msg.sender || {};
			let senderName = 'Unknown';

			if (msg.senderModel === 'userAccounts') {
				senderName =
					`${senderData.firstName || ''} ${senderData.lastName || ''}`.trim() ||
					'User';
			} else if (msg.senderModel === 'Agents') {
				senderName = senderData.name || 'Agent';
			}

			return {
				_id: msg._id,
				content: msg.content,
				createdAt: msg.createdAt,
				sender: {
					_id: senderData._id,
					name: senderName,
					profileImage: senderData.profileImage,
					model: msg.senderModel,
				},
				isMe: senderData._id?.toString() === authenticatedUserId,
			};
		});

		res.status(200).json(formattedMessages);
	} catch (error) {
		console.error(
			`Error fetching messages for conversation ${conversationId}:`,
			error
		);
		next(error);
	}
};

export const getConversationByAgentId = async (req, res) => {
	try {
		const agentId = req.params.agentId;

		if (!agentId) {
			return res.status(400).json({ message: 'agentId is required.' });
		}

		const conversation = await Conversation.findOne({ agentId }).populate({
			path: 'lastMessage',
			select: 'content createdAt', // Only fetch these fields from Message
		});

		if (!conversation) {
			return res
				.status(404)
				.json({ message: 'Conversation not found for the given agentId.' });
		}

		res.status(200).json({
			conversationId: conversation._id,
			mainUserId: conversation.mainUserId,
			lastMessageContent: conversation.lastMessage?.content || null,
			lastMessageCreatedAt: conversation.lastMessage?.createdAt || null,
			updatedAt: conversation.updatedAt,
		});
	} catch (error) {
		console.error('Error fetching conversation by agentId:', error);
		res.status(500).json({ message: 'Internal server error.' });
	}
};
