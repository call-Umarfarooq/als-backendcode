import mongoose from "mongoose";

const featuresSchema = new mongoose.Schema(
	{
		propertyId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Property', 
			required: true,   
		},
		for: { type: String, enum: ['Sale', 'Lease', 'Rent', ''] }, 
		state: { type: String }, 
		price: { type: Number },
		currency: { type: String, enum: ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'MXN', 'INR', ''] }, 
		displayPrice: { type: String }, 
		bedrooms: { type: Number },
		bathrooms: { type: String }, 
		buildingSize: { type: String },
		propertySizeUnit: { type: String }, 
		lotSizePropertySize: { type: String }, 
		customText: { type: String }, 
		yearBuilt: { type: Number },
		propertyType: { type: String },
		architecturalStyle: { type: String }, 
		annualPropertyTaxes: { type: Number },
		condoHoaAssociationFee: { type: String }, 
		feeAmount: { type: Number }, 
		terms: { type: String }, 
		mlsNumber: { type: String },
		parcelNumber: { type: String },
		parking: { type: String }, 
		storage: { type: String }, 
		amenities: { type: String }, 
	},
	{ timestamps: true } 
);

const Features = mongoose.model('Features', featuresSchema);

export default Features;