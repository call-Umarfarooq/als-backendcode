import User from '../models/userModel.js';
import GalleryImage from '../models/galleryImag.js';

export const createGallery = async (req, res) => {
  try {
    const { userId, galleryImages } = req.body;

    if (!userId || !galleryImages || !galleryImages.length) {
      return res.status(400).json({ message: "User ID and at least one image URL are required." });
    }

    // Check if a gallery already exists for the user
    let existingGallery = await GalleryImage.findOne({ userId });

    if (existingGallery) {
      // Update existing gallery by adding new images
      existingGallery.galleryImages.push(...galleryImages);
      await existingGallery.save();
      return res.status(200).json({ message: "Gallery updated successfully.", gallery: existingGallery });
    } else {
      // Create a new gallery
      const newGallery = new GalleryImage({
        userId,
        galleryImages
      });

      await newGallery.save();

      return res.status(201).json({ message: "Gallery created successfully.", gallery: newGallery });
    }

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getGallery = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const gallery = await GalleryImage.findOne({ userId });

    if (!gallery) {
      return res.status(404).json({ message: "Gallery not found." });
    }

    res.status(200).json({ message: "Gallery fetched successfully.", gallery });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};  


export const deleteGalleryImageByIndex = async (req, res) => {
  try {
    const { userId, index } = req.body;

    if (typeof userId !== 'string' || typeof index !== 'number') {
      return res.status(400).json({ message: "Valid userId and index are required." });
    }

    const gallery = await GalleryImage.findOne({ userId });

    if (!gallery) {
      return res.status(404).json({ message: "Gallery not found." });
    }

    if (index < 0 || index >= gallery.galleryImages.length) {
      return res.status(400).json({ message: "Invalid image index." });
    }

    // Remove the image at the specified index
    gallery.galleryImages.splice(index, 1);
    await gallery.save();

    res.status(200).json({ message: "Image deleted successfully.", gallery });
    
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
