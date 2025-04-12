import mongoose from "mongoose";

const propertyVideoSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    propertyVideoUrl: [
      {
        type: String, 
        required: true
      }
    ]
  },
  { timestamps: true }
);

const PropertyVideo = mongoose.model('PropertyVideo', propertyVideoSchema);

export default PropertyVideo;
