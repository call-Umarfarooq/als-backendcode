import mongoose from "mongoose";

const contactDetailsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'userAccounts' 
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
      
    },
    additionalEmail: {
        type: String,
        lowercase: true,
    },
    otherPhone: {
        type: String,
       
    },
    faxnumber: {
        type: String,
        
    },
    officePhone: {
        type: String,
    },
    mobile: {
        type: String,
        required: true,
    },
    showDetails: {
        type: String,
        enum: ['show', 'hide'],
        default: 'hide'
    },
    textNewLeads: {
        type: String,
        enum: ['yes', 'No'],
        default: 'yes'
    }
}, {
    timestamps: true 
});

const ContactDetails = mongoose.model('ContactDetails', contactDetailsSchema);

export default ContactDetails;
