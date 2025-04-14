import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  
  mainUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userAccounts', 
    required: true,
    index: true,
  },

  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agents', 
    required: true,
    index: true,
  },

  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },

}, { timestamps: true }); 

conversationSchema.index({ mainUserId: 1, agentId: 1 }, { unique: true });



const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;