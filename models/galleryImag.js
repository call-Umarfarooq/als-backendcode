import mongoose from "mongoose";

const galleryImageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userAccounts', 
    required: true
  },
  galleryImages: [
    {
      type: String, 
      required: true
    }
  ]
}, { timestamps: true });

const GalleryImage = mongoose.model('GalleryImage', galleryImageSchema);

export default GalleryImage;
