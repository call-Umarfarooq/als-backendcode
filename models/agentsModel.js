import mongoose from "mongoose";

const agentsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    required: function() { return this.status === 'ACTIVE'; }
  },
  title: {
    type: String
  },
  status: {
    type: String,
    enum: ['INVITED', 'ACTIVE','REMOVED'],
    default: 'INVITED'
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'agent', 'buyer'],
    default: 'agent'
  },
  bio: {
    type: String
  },
  license: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userAccounts',
  },
  referBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userAccounts',
    required: true
  },
  invitationToken: {
    type: String,
    sparse: true,
  },
  tokenExpires: {
    type: Date
  }
}, { timestamps: true });

const Agents = mongoose.model('Agents', agentsSchema);

export default Agents;