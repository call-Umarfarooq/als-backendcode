import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  userName: {
    type: String,
  },
  referBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userAccounts'
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agents'
  },
  profileImage: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  designation: {
    type: String
  },
  publicName: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'agent', 'buyer'],
    default: 'user'
  },
  officeName: {
    type: String,
  },
  companyName: {
    type: String
  },
  street: {
    type: String,
  },
  apartment: {
    type: String,
  },

  city: {
    type: String,
  },
  state: {
    type: String,
  },
  zipCode: {
    type: String,
  },
  country: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  licenseType: {
    type: String,
  },
  licenseNumber: {
    type: String,
  },
  association: {
    type: String,
  },
  address1: {
    type: String
  },
  address2: {
    type: String
  },
  logitude: {
    type: String
  },
  latitude: {
    type: String
  },
  aboutMe: {
    type: String
  },
  whatsappNumber: {
    type: String
  },
  telegram: {
    type: String
  },
  taxNumber: {
    type: Number
  },
  lineId: {
    type: Number
  },
  faxNumber: {
    type: Number
  },
  agency: {
    type: String,
  },
  source: {
    type: String
  },
  specialities: {
    type: String
  },
  serviceAreas: {
    type: String
  },
  expiryDate: {
    type: Date,
  },
  businessCardLink: {
    type: String
  },
  accountType: {
    type: String,
  }
}, { timestamps: true });

const User = mongoose.model('userAccounts', userSchema);

export default User;
