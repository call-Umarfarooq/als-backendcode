import Agents from '../models/agentsModel.js';
import User from '../models/userModel.js';
import nodemailer from 'nodemailer';
import { referalInvitation } from '../utils/mails.js';
import crypto from 'crypto';
import moment from 'moment';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: 'true',
  service: 'Gmail',
  auth: {
    user: 'umarfarooqtech55@gmail.com',
    pass: 'stwf hidv rlsd klte',
  },
});

export const createAgents = async (req, res) => {
  try {
    const { name, title, email, referBy } = req.body;

    if (!name || !referBy || !email) {
      return res.status(400).json({ message: 'Name, email, and referBy are required.' });
    }

    // Check if referrer (user) exists
    const userExists = await User.findById(referBy);
    if (!userExists) {
      return res.status(404).json({ message: 'Referring user not found.' });
    }

    // ❗ Check if email already exists in the User model
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'A user with this email is already registered.',
        user: existingUser
      });
    }

    // ✅ Check if an agent with this email already exists
    const existingAgent = await Agents.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({
        message: 'An agent with this email already exists.',
        agent: existingAgent
      });
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpires = moment().add(24, 'hours').toDate();

    const newAgent = new Agents({
      name,
      title,
      email,
      referBy,
      status: 'INVITED',
      invitationToken: token,
      tokenExpires
    });

    const savedAgent = await newAgent.save();

    // Send invitation email
    const mailOptions = referalInvitation(userExists, savedAgent, token);
    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: 'Agent invited successfully. Invitation email sent.',
      agent: savedAgent
    });

  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const agentCount = async (req, res) => {
  const { userId } = req.query; // or use req.params if passed in the route

  try {
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const totalAgents = await Agents.countDocuments({ userId });
    res.status(200).json({ total: totalAgents });
  } catch (error) {
    res.status(500).json({ message: 'Error counting agents', error: error.message });
  }
};




export const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.query;
    const { password } = req.body;

    // Validate input
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Invitation token is required in query parameters.'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required in request body to complete registration.'
      });
    }

    // Find and validate agent with token
    const agent = await Agents.findOne({
      invitationToken: token,
      status: 'INVITED' // Ensure we only accept invitations for INVITED status
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found. The token may be invalid or already used.'
      });
    }

    // Check token expiration
    if (new Date(agent.tokenExpires) < new Date()) {
      return res.status(410).json({ // 410 Gone status for expired resources
        success: false,
        message: 'Invitation token has expired. Please request a new invitation.',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Check if agent is already active (redundant check but good for security)
    if (agent.status === 'ACTIVE') {
      return res.status(409).json({ // 409 Conflict
        success: false,
        message: 'This agent is already active.',
        code: 'ALREADY_ACTIVE'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update agent
    agent.status = 'ACTIVE';
    agent.password = hashedPassword;
    delete agent.invitationToken; // Remove invitationToken field completely
    agent.tokenExpires = undefined;
    agent.joinedAt = new Date(); // Add timestamp for when they joined

    const savedAgent = await agent.save();

    // Generate a default userName if not provided
    const userName = savedAgent.userName || `user_${savedAgent.email.split('@')[0]}`;

    // Create new user from the agent invitation
    const newUser = new User({
      email: savedAgent.email,
      password: hashedPassword,
      agentId: savedAgent._id,
      referBy: savedAgent.referBy, // Link to the user who invited
      role: 'user',
      userName: userName, // Ensure userName is not null
    });

    const savedUser = await newUser.save();

    // update agent userId
    savedAgent.userId = savedUser._id;
    await savedAgent.save();

    return res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully. You are now an active user.',
      savedUser,
    });

  } catch (error) {
    console.error('Error accepting invitation:', error);

    // Handle duplicate email errors
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
        code: 'DUPLICATE_EMAIL'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while processing your invitation.',
      error: error.message
    });
  }
};



export const resendInvitation = async (req, res) => {
  try {
    const { agentId } = req.params;

    const agent = await Agents.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found.' });
    }

    if (agent.status === 'ACTIVE') {
      return res.status(400).json({ message: 'Agent is already active.' });
    }

    const referrer = await User.findById(agent.referBy);
    if (!referrer) {
      return res.status(404).json({ message: 'Referrer not found.' });
    }

    // Generate new token and expiration
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpires = moment().add(24, 'hours').toDate();

    agent.invitationToken = token;
    agent.tokenExpires = tokenExpires;
    await agent.save();

    // Send new invitation email
    const mailOptions = referalInvitation(referrer, agent, token);
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: 'Invitation resent successfully.',
      agent
    });
  } catch (error) {
    console.error('Error resending invitation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



export const createAgentsContacts = async (req, res) => {
  try {
    const { userId, email, additionalEmail, otherPhone, faxnumber, officePhone, mobile, showDetails, textNewLeads } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'UserId, email, and mobile are required.' });
    }

    // Check if the agent exists by userId
    const agentExists = await User.findOne({ _id: userId });
    if (!agentExists) {
      return res.status(404).json({ message: 'Agent not found.' });
    }

    // Create a new contact details entry for the agent
    const newContact = new ContactDetails({
      userId,
      email,
      additionalEmail,
      otherPhone,
      faxnumber,
      officePhone,
      mobile,
      showDetails,
      textNewLeads
    });

    // Save the contact details
    const savedContact = await newContact.save();

    res.status(201).json({ message: 'Contact details created successfully', contact: savedContact });
  } catch (error) {
    console.error('Error creating agent contact details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getAgents = async (req, res) => {
  const { userId } = req.query;

  try {
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const agents = await Agents.find({ userId }, 'name role title email') // Filter + select fields
      .limit(5)
      .lean();

    res.status(200).json({ agents });
  } catch (error) {
    console.error('Failed to fetch agents:', error);
    res.status(500).json({ message: 'Server error while fetching agents', error: error.message });
  }
};

export const getAllAgents = async (req, res) => {
  try {
    const { referBy } = req.params;

    // Validate referBy parameter exists and is a valid ObjectId
    if (!referBy || referBy === 'undefined' || !mongoose.Types.ObjectId.isValid(referBy)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid referBy ID provided'
      });
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter by referBy ID and exclude removed agents
    const filter = {
      referBy: new mongoose.Types.ObjectId(referBy), // Explicitly cast to ObjectId
      status: { $ne: 'REMOVED' }
    };

    // Get paginated results (newest first) and total count
    const [agents, totalCount] = await Promise.all([
      Agents.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-referBy'), // Exclude referBy field from results
      Agents.countDocuments(filter)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: agents,
      meta: {
        totalItems: totalCount,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
      }
    });

  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const getAllActiveAgent = async (req, res) => {
  try {
    const { referBy } = req.params;

    // Validate referBy
    if (!referBy || !mongoose.Types.ObjectId.isValid(referBy)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid referBy ID provided',
      });
    }

    // Fetch only ACTIVE agents referred by the given user
    const agents = await Agents.find({
      referBy: new mongoose.Types.ObjectId(referBy),
      status: 'ACTIVE',
    }).select('-referBy'); // Optional: exclude referBy

    res.status(200).json({
      success: true,
      data: agents,
    });
  } catch (error) {
    console.error('Error fetching active agents:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};



export const getAgentById = async (req, res) => {
  try {
    const agent = await Agents.findById(req.params.id)
      .populate('referBy', 'name email')
      .populate('userId', 'name email');

    if (!agent || agent.status === 'DELETED') {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



export const getAgentByReferId = async (req, res) => {
  try {
    const { referBy } = req.params;

    if (!referBy) {
      return res.status(400).json({ message: 'referBy ID is required.' });
    }

    const agents = await Agents.find({ referBy }).select('name email');

    if (!agents || agents.length === 0) {
      return res.status(404).json({ message: 'No agents found for this referBy ID.' });
    }

    res.status(200).json(agents);
  } catch (error) {
    console.error('Error fetching agents by referBy:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};



export const removeAgent = async (req, res) => {
  try {
    const agent = await Agents.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    if (agent.status === 'REMOVED') {
      return res.status(400).json({
        success: false,
        message: 'Agent is already removed'
      });
    }

    // Soft delete by unsetting referBy and marking as DELETED
    const updatedAgent = await Agents.findByIdAndUpdate(
      req.params.id,
      {
        $unset: { referBy: 1 },
        status: 'REMOVED',
        deletedAt: new Date()
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Agent removed successfully',
      data: {
        id: updatedAgent._id,
        name: updatedAgent.name,
        email: updatedAgent.email,
        status: updatedAgent.status,
        deletedAt: updatedAgent.deletedAt
      }
    });
  } catch (error) {
    console.error('Error removing agent:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};