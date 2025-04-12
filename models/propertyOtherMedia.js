import mongoose from "mongoose";

const propertyOtherMediaSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    propertyOther: [
      {
        type: String, 
        required: true
      }
    ]
  },
  { timestamps: true }
);

const PropertyOtherMedia = mongoose.model('PropertyOtherMedia', propertyOtherMediaSchema);

export default PropertyOtherMedia;
