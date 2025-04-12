
import User from '../models/userModel.js';
import GalleryImage from '../models/galleryImag.js';
import ExternalLinks from "../models/externalLinkModel.js"
import SocialMedia from '../models/socialLinkModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import nodemailer from 'nodemailer';
const frontEndUrl = process.env.FRONT_END;

export const registerUser = async (req, res) => {
	try {
		const {
			firstName,
			lastName,
			userName,
			email,
			password,
			role,
			officeName,
			street,
			apartment,
			city,
			state,
			zipCode,
			country,
			phoneNumber,
			licenseType,
			licenseNumber,
			association,
			agency,
			expiryDate,
			accountType,
		} = req.body;
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: 'User already exists' });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = new User({
			firstName,
			lastName,
			userName,
			email,
			password: hashedPassword,
			role: role || 'user',
			officeName,
			street,
			apartment,
			city,
			state,
			zipCode,
			country,
			phoneNumber,
			licenseType,
			licenseNumber,
			association,
			agency,
			expiryDate,
			accountType,
		});

		await newUser.save();

		res
			.status(201)
			.json({ message: 'User registered successfully', user: newUser });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

export const getAllUsers = async (req, res) => {
	try {
		const users = await User.find({}, 'email userName');
		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};


export const getUsersByReferId = async (req, res) => {
	try {
		const { referId } = req.params;

		if (!referId) {
			return res.status(400).json({ message: 'Missing referId parameter.' });
		}

		const referredUsers = await User.find({ referBy: referId }, 'email userName firstName lastName');

		res.status(200).json(referredUsers);
	} catch (error) {
		console.error('Error fetching referred users:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}

		const token = jwt.sign(
			{ id: user._id, role: user.role },
			process.env.JWT_SECRET
		);

		res.status(200).json({ message: 'Login successful', token, userId: user._id });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};


export const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: '1h',
		});

		const resetUrl = `${process.env.FRONT_END}?token=${resetToken}`;

		const transporter = nodemailer.createTransport({
			service: 'Gmail',
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});

		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: email,
			subject: 'Password Reset Request',
			html: `<p>You requested to reset your password. Click the link below to proceed:</p>
                   <a href="${resetUrl}">${resetUrl}</a>
                   <p>This link will expire in 1 hour.</p>`,
		};

		await transporter.sendMail(mailOptions);

		res.status(200).json({
			message: 'Password reset email sent. Check your inbox.',
		});
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};


export const resetPassword = async (req, res) => {

	try {
		const { token, newPassword } = req.body;
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded) {
			return res.status(400).json({ message: 'Invalid or expired token' });
		}

		const user = await User.findById(decoded.id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(newPassword, salt);

		user.password = hashedPassword;
		await user.save();

		res.status(200).json({ message: 'Password reset successful. You can now log in.' });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};


export const updateUser = async (req, res) => {
	try {
		const { userId } = req.params;
		const updateData = req.body;
		let user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		Object.keys(updateData).forEach(key => {
			user[key] = updateData[key];
		});

		await user.save();

		res.status(200).json({ message: 'User updated successfully', userId: user._id });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

export const getUserById = async (req, res) => {
	try {
		const { userId } = req.params;
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.status(200).json({ user });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};


export const getUserByAgentId = async (req, res) => {
	try {
		const { agentId } = req.params;

		const user = await User.findOne({ agentId });

		if (!user) {
			return res.status(404).json({ message: 'User not found for this agentId' });
		}

		res.status(200).json({ user });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};


export const updateUserRoleandPassword = async (req, res) => {
	try {
		const { userId, newRole, newPassword } = req.body;

		// Validate input
		if (!userId) {
			return res.status(400).json({ message: 'User ID is required' });
		}

		// Find the user by ID
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		let updatedFields = {};

		// Update role if provided and valid
		if (newRole) {
			const validRoles = ['user', 'admin', 'agent', 'buyer'];
			if (!validRoles.includes(newRole)) {
				return res.status(400).json({ message: 'Invalid role' });
			}
			updatedFields.role = newRole;
		}

		// Update password if provided
		if (newPassword) {
			const salt = await bcrypt.genSalt(10);
			updatedFields.password = await bcrypt.hash(newPassword, salt);
		}

		// Update user
		await User.findByIdAndUpdate(userId, updatedFields, { new: true });

		res.status(200).json({ message: 'User updated successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};


export const deleteUserById = async (req, res) => {
	try {
		const userId = req.params.userId;
		console.log("User ID to delete:", userId);

		await GalleryImage.deleteOne({ userId: userId });
		await ExternalLinks.deleteOne({ userId: userId });
		await SocialMedia.deleteOne({ userId: userId });

		const deletedUser = await User.findByIdAndDelete(userId);

		if (!deletedUser) {
			return res.status(404).json({ message: 'User not found' });
		}


		res.status(200).json({ message: 'User and associated data deleted successfully' });

	} catch (error) {
		console.error("Delete User Error:", error);

		if (error.name === 'CastError' && error.kind === 'ObjectId') {
			return res.status(400).json({ message: 'Invalid user ID format' });
		}

		res.status(500).json({ message: 'Server error during user deletion process', error: error.message });
	}
};