import ExternalLinks from "../models/externalLinkModel.js"
import User from '../models/userModel.js';



export const createExternalLink = async (req, res) => {
  console.log("Creating or updating external link with body:", req.body);

  try {
    const { userId, trustPilot, googleReviews, propertyLinks } = req.body;

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedLinks = await ExternalLinks.findOneAndUpdate(
      { userId },
      {
        $set: {
          trustPilot,
          googleReviews,
          propertyLinks,
        },
      },
      { new: true, upsert: true } // Create if not exist, update if exists
    );

    return res.status(200).json({
      message: "External links saved successfully",
      data: updatedLinks,
    });
  } catch (error) {
    console.error("Error creating/updating external links:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getExternalLink = async (req, res) => {
  try {
    const { userId } = req.params;
    const externalLinks = await ExternalLinks.findOne({ userId });
    if (!externalLinks) {
      return res.status(404).json({ message: "External links not found for this user" });
    }
    return res.status(200).json({ message: "External links fetched successfully", data: externalLinks });
  } catch (error) {
    console.error("Error fetching external links:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}