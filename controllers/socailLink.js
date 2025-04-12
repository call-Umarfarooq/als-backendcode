import User from '../models/userModel.js';
import SocialMedia from '../models/socialLinkModel.js';

export const createSocialLink = async (req, res) => {
	try {
		const { userId, facebook, linkedin, instagram, twitter } = req.body;

		const userExists = await User.findById(userId);
		if (!userExists) {
			return res.status(404).json({ message: 'User not found' });
		}

		const updatedLinks = await SocialMedia.findOneAndUpdate(
			{ userId },
			{
				$set: {
					facebook,
					linkedin,
					instagram,
					twitter,
				},
			},
			{ new: true, upsert: true } // Create if not exist
		);

		res.status(200).json({
			message: 'Social media links saved successfully',
			data: updatedLinks,
		});
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};


export const getSocialLink = async (req, res) => {
	try {
		const { userId } = req.params;

		const userExists = await User.findById(userId);
		if (!userExists) {
			return res.status(404).json({ message: 'User not found' });
		}

		const socialMedia = await SocialMedia.findOne({ userId });
		if (!socialMedia) {
			return res.status(404).json({ message: 'Social media links not found' });
		}

		res.status(200).json({ data: socialMedia });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
}