import mongoose from "mongoose";

const propertyFloorPlanSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property', 
      required: true,
      index: true,
    },
    floorPlans: [
      {
        _id: false, 
        url: {
          type: String,
          required: [true, 'Floor plan URL is required.'],
        },
        planName: { 
          type: String,
          
        },
      },
    ],
   
  },
  { timestamps: true }
);


const PropertyFloorPlan = mongoose.model(
  'PropertyFloorPlan',
  propertyFloorPlanSchema
);

export default PropertyFloorPlan;