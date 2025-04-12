import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
	{
		propertyName: { type: String, required: true },
		address1: { type: String, },
		address2: { type: String },
		displayAddress: { type: String },
		city: { type: String },
		state: { type: String },
		country: { type: String},
		zipCode: { type: String },
		headline: { type: String },
		longDescription: { type: String },
		shortDescription: { type: String },
		countValue: { type: Number, default: 0 },
			userId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'userAccounts',
				required: true
			}
	},
	{ timestamps: true }
);

const Property = mongoose.model('Property', propertySchema);

export default Property;
