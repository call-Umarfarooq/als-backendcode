import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userAccounts',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userAccounts',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  seen: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Board = mongoose.model('Board', boardSchema);

export default Board;
