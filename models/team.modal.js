import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({

    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userAccounts',
        required: true
    },
    
    basicInfo: {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        address: {
            type: String,
        },
        unit: {
            type: String,
        },
        zipCode: {
            type: String,
        },
        website: {
            type: String
        },
    },

    agents: {
        type: [
            {
                agentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Agents',
                    required: true
                },
                name: {
                    type: String,
                },
                email: {
                    type: String,
                    required: true
                },
                joinDate: {
                    type: Date,
                    default: Date.now
                },
                status: {
                    type: String,
                },
                level: {
                    type: String,
                    enum: ['JUNIOR', 'MIDDLE', 'SENIOR'],
                    default: 'JUNIOR'
                },
            }],
        default: [],
        required: false
    },

    logos: {
        type: [{
            url: {
                type: String,
            },
            display: {
                type: Boolean,
                default: false
            },
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }],
        default: [],
    },
    
}, { timestamps: true });

const Teams = mongoose.model('Teams', teamSchema);

export default Teams;