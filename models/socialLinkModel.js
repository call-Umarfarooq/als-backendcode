import mongoose from "mongoose";

const socialMediaSchema = new mongoose.Schema({
  facebook: {
    type: String
  },
  linkedin: {
    type: String
  },
  instagram: {
    type: String
  },
  twitter: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userAccounts',
    required: true
  }
}, { timestamps: true });

const SocialMedia = mongoose.model('socialMediaLinks', socialMediaSchema);

export default SocialMedia;
