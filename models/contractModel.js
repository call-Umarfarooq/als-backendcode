import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'userAccounts',
		},
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		date: {
			type: Date,
			required: true,
		},
		fileUrl: {
			type: String,
			required: true,
		},
		signfileUrl:{
        type :String
		},
		status: {
			type: String,
			enum: ['Pending', 'Viewed', 'Rejected', 'Accepted'],
			default: 'Pending',
		},
	},
	{ timestamps: true }
);

const Contract = mongoose.model('Contract', contractSchema);

export default Contract;
