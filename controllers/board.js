import User from '../models/userModel.js';
import Board from '../models/boardModel.js'



export const sendMessage = async (req, res) => {
  console.log("req",req)
  try {
    const { senderId, receiverId, content } = req.body;
    const io = req.app.get('io');

    const message = new Board({
      sender: senderId,
      receiver: receiverId,
      content,
    });

    await message.save();
    
    res.status(201).json({ success: true, message: 'Message sent!', data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending message', error });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { user1, user2 } = req.query;

    const messages = await Board.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving messages', error });
  }
};


export const getAllBoardMessages = async (req, res) => {
  try {
    const messages = await Board.find()
      .sort({ createdAt: 1 }) // most recent first
      .populate('sender', 'firstName profileImage role') // populate sender details
      

    const formatted = messages.map(msg => ({
      _id: msg._id,
      content: msg.content,
      createdAt: msg.createdAt,
      sender: {
        _id: msg.sender._id,
        name: msg.sender.firstName,
        profileImage: msg.sender.profileImage,
        role: msg.sender.role,
      },
      
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error getting board messages', error });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '_id firstName email role'); // only select these fields
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users', error });
  }
};