import mongoose from "mongoose";

const externalLinksSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userAccounts',
    required: true,
    unique: true
  },
  trustPilot: {
    type: String,
    default: ''
  },
  googleReviews: {
    type: String,
    default: ''
  },
  propertyLinks: {
    type: [String],
    default: []
  }
}, { timestamps: true });

const ExternalLinks = mongoose.model('ExternalLinks', externalLinksSchema);

export default ExternalLinks;
