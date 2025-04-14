import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
 
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true,
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['userAccounts', 'Agents'] 
  },
 
  content: {
    type: String,
    required: true,
    trim: true,
  },

}, { timestamps: true }); 

const Message = mongoose.model('Message', messageSchema);

export default Message;