import mongoose from "mongoose";

const propertyImageSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    propertyImages: [
      {
        type: String, 
        required: true
      }
    ]
  },
  { timestamps: true }
);

const PropertyImage = mongoose.model('PropertyImage', propertyImageSchema);

export default PropertyImage;
