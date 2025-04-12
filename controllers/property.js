import Property from '../models/propertyModel.js';
import PropertyImage from '../models/propertyImag.js';
import PropertyFloorPlan from '../models/propertyFloorPlain.js';
import PropertyVideo from '../models/propertyVideoUrl.js';
import PropertyOtherMedia from '../models/propertyOtherMedia.js';
import User from '../models/userModel.js';
import Features from '../models/Features.js';
import mongoose from 'mongoose';

export const createPropertyAddress = async (req, res) => {
	try {
		const {
			userId,
			propertyName,
			address1,
			address2,
			displayAddress,
			city,
			state,
			country,
			zipCode,
			headline,
			longDescription,
			shortDescription,
		} = req.body;

		const userExists = await User.findById({ _id: userId });
		if (!userExists) {
			return res.status(404).json({ message: 'User not found.' });
		}

		if (
			!propertyName
		
		) {
			return res.status(400).json({ message: 'Missing required fields' });
		}

		// Count existing properties for the user
		const propertyCount = await Property.countDocuments({ userId });

		const newProperty = new Property({
			userId,
			propertyName,
			address1,
			address2,
			displayAddress,
			city,
			state,
			country,
			zipCode,
			headline,
			longDescription,
			shortDescription,
			countValue: propertyCount + 1, 
		});

		const savedProperty = await newProperty.save();

		res.status(201).json({
			message: 'Property created successfully',
			property: savedProperty,
		});
	} catch (error) {
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
};


export const getSixPropertiesWithImages = async (req, res) => {
  try {
    const properties = await Property.find()
      .sort({ createdAt: -1 }) // latest first
      .limit(6)
      .lean(); // optional: returns plain JS objects

    // Get all property IDs
    const propertyIds = properties.map((property) => property._id);

    // Get corresponding images
    const images = await PropertyImage.find({
      propertyId: { $in: propertyIds },
    }).lean();

    // Map images to their respective properties
    const propertiesWithImages = properties.map((property) => {
      const matchedImages = images.find(
        (img) => img.propertyId.toString() === property._id.toString()
      );
      return {
        ...property,
        propertyImages: matchedImages?.propertyImages || [],
      };
    });

    res.status(200).json({ success: true, data: propertiesWithImages });
  } catch (error) {
    console.error('Error fetching properties with images:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


export const countProperty = async (req, res) =>{
  try {
    const totalProperties = await Property.countDocuments();
    res.status(200).json({ total: totalProperties });
  } catch (error) {
    res.status(500).json({ message: "Error counting properties", error: error.message });
  }
}

export const updatePropertyAddress = async (req, res) => {
	try {
		const {
			propertyId,
			propertyName,
			address1,
			address2,
			displayAddress,
			city,
			state,
			country,
			zipCode,
			headline,
			longDescription,
			shortDescription,
		} = req.body;

		// Check if the property exists
		const existingProperty = await Property.findById(propertyId);
		if (!existingProperty) {
			return res.status(404).json({ message: 'Property not found.' });
		}

		// Optional check: Make sure required fields are provided
		if (!propertyName) {
			return res.status(400).json({ message: 'Missing required fields' });
		}

		// Update property fields
		existingProperty.propertyName = propertyName;
		existingProperty.address1 = address1;
		existingProperty.address2 = address2;
		existingProperty.displayAddress = displayAddress;
		existingProperty.city = city;
		existingProperty.state = state;
		existingProperty.country = country;
		existingProperty.zipCode = zipCode;
		existingProperty.headline = headline;
		existingProperty.longDescription = longDescription;
		existingProperty.shortDescription = shortDescription;

		const updatedProperty = await existingProperty.save();

		res.status(200).json({
			message: 'Property updated successfully',
			property: updatedProperty,
		});
	} catch (error) {
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
};

export const getProperties = async (req, res) => {
  try {
    const { userId } = req.params;
console.log(userId, 'userId from params')
    // Validate if the userId is a valid ObjectId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId provided' });
    }

    // Check if the user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Fetch all properties for the user
    const properties = await Property.find({ userId })

    if (properties.length === 0) {
      return res.status(404).json({ message: 'No properties found for this user.' });
    }

    res.status(200).json({
      message: 'Properties retrieved successfully',
      properties,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


export const deleteProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Validate the propertyId
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ message: 'Invalid property ID' });
    }

    // Check if the property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Delete all linked data
    await Promise.all([
      PropertyImage.deleteMany({ propertyId }),
      PropertyFloorPlan.deleteMany({ propertyId }),
      PropertyVideo.deleteMany({ propertyId }),
      PropertyOtherMedia.deleteMany({ propertyId }),
      Features.deleteMany({ propertyId }),
    ]);

    // Delete the property
    await Property.findByIdAndDelete(propertyId);

    res.status(200).json({ message: 'Property and all linked data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


export const createImages = async (req, res) => {
	try {
		const { propertyId, propertyImages } = req.body;

		if (
			!propertyId ||
			!propertyImages ||
			!Array.isArray(propertyImages) ||
			propertyImages.length === 0
		) {
			return res
				.status(400)
				.json({
					message:
						'Invalid request. propertyId and propertyImages are required.',
				});
		}

		const existingPropertyImages = await PropertyImage.findOne({ propertyId });

		if (existingPropertyImages) {
			const updatedPropertyImages = await PropertyImage.findOneAndUpdate(
				{ propertyId },
				{ $push: { propertyImages: { $each: propertyImages } } },
				{ new: true }
			);

			return res.status(200).json({
				message: 'Images added successfully',
				propertyImages: updatedPropertyImages,
			});
		} else {
			const newPropertyImages = new PropertyImage({
				propertyId,
				propertyImages,
			});

			const savedImages = await newPropertyImages.save();

			return res.status(201).json({
				message: 'New image collection created successfully',
				propertyImages: savedImages,
			});
		}
	} catch (error) {
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
};
export const getPropertyImagesByPropertyId = async (req, res) => {
	try {
		const { propertyId } = req.params;

		if (!propertyId) {
			return res.status(400).json({ message: 'Property ID is required' });
		}

		const propertyImages = await PropertyImage.findOne({ propertyId });

		if (!propertyImages) {
			return res.status(404).json({ message: 'No images found for this property' });
		}

		res.status(200).json({
			message: 'Property images fetched successfully',
			propertyImages,
		});
	} catch (error) {
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
};

export const deletePropertyImageByIndex = async (req, res) => {
	try {
		const { propertyId, index } = req.body;

		if (typeof index !== 'number' || !propertyId) {
			return res.status(400).json({ message: 'Property ID and index are required' });
		}

		// Find the document
		const propertyImages = await PropertyImage.findOne({ propertyId });

		if (!propertyImages) {
			return res.status(404).json({ message: 'Property not found' });
		}

		// Check if index is valid
		if (index < 0 || index >= propertyImages.propertyImages.length) {
			return res.status(400).json({ message: 'Invalid index' });
		}

		// Remove image by index
		propertyImages.propertyImages.splice(index, 1);

		// Save updated document
		await propertyImages.save();

		res.status(200).json({
			message: 'Image deleted successfully',
			propertyImages,
		});
	} catch (error) {
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
};



export const createFloorPlan = async (req, res) => {
	try {
		const { propertyId, url, planName } = req.body;

		if (!propertyId || !url) {
			return res.status(400).json({
				message: 'Missing required fields: propertyId and url are required.',
			});
		}

		if (!mongoose.Types.ObjectId.isValid(propertyId)) {
			return res.status(400).json({ message: 'Invalid propertyId format.' });
		}

		const newFloorPlanEntry = {
			url: url,
			...(planName && planName.trim() !== '' && { planName: planName.trim() }),
		};

		const existingFloorPlanDoc = await PropertyFloorPlan.findOne({
			propertyId,
		});

		if (existingFloorPlanDoc) {
			existingFloorPlanDoc.floorPlans.push(newFloorPlanEntry);

			const updatedDoc = await existingFloorPlanDoc.save();

			console.log('Floor plan added to existing document:', updatedDoc._id);
			return res.status(200).json({
				message: 'Floor plan added successfully.',
				data: updatedDoc,
			});
		} else {
			const newDoc = new PropertyFloorPlan({
				propertyId: propertyId,
				floorPlans: [newFloorPlanEntry],
			});

			const savedDoc = await newDoc.save();

			console.log('New floor plan document created:', savedDoc._id);
			return res.status(201).json({
				message: 'Floor plan collection created successfully.',
				data: savedDoc,
			});
		}
	} catch (error) {
		console.error('Error in createFloorPlan:', error);

		if (error.name === 'ValidationError') {
			return res
				.status(400)
				.json({ message: 'Validation Error', error: error.message });
		}

		return res
			.status(500)
			.json({
				message: 'Server Error creating floor plan.',
				error: error.message,
			});
	}
};

export const getFloorPlanByPropertyId = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Validate if propertyId is provided
    if (!propertyId) {
      return res.status(400).json({ message: 'Property ID is required' });
    }

    // Validate if it's a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ message: 'Invalid property ID format' });
    }

    // Find the floor plan document by propertyId
    const floorPlanDoc = await PropertyFloorPlan.findOne({ propertyId });

    if (!floorPlanDoc) {
      return res.status(404).json({ message: 'No floor plans found for this property' });
    }

    // Success response
    res.status(200).json({
      message: 'Floor plans fetched successfully',
      data: floorPlanDoc,
    });
  } catch (error) {
    console.error('Error fetching floor plans:', error);
    res.status(500).json({
      message: 'Server error fetching floor plans',
      error: error.message,
    });
  }
};


export const deleteFloorPlan = async (req, res) => {
  try {
    const { propertyId, index } = req.params;

    // Validate propertyId and index
    if (!propertyId || !index) {
      return res.status(400).json({ message: 'propertyId and index are required.' });
    }

    // Validate if the propertyId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ message: 'Invalid propertyId format.' });
    }

    // Convert index to number
    const floorPlanIndex = parseInt(index, 10);

    if (isNaN(floorPlanIndex) || floorPlanIndex < 0) {
      return res.status(400).json({ message: 'Invalid index number.' });
    }

    // Find the PropertyFloorPlan document by propertyId
    const propertyFloorPlanDoc = await PropertyFloorPlan.findOne({ propertyId });

    if (!propertyFloorPlanDoc) {
      return res.status(404).json({ message: 'No floor plan found for this property.' });
    }

    // Check if the floor plan exists at the given index
    if (floorPlanIndex >= propertyFloorPlanDoc.floorPlans.length) {
      return res.status(404).json({ message: 'Floor plan not found at the specified index.' });
    }

    // Remove the floor plan at the given index
    propertyFloorPlanDoc.floorPlans.splice(floorPlanIndex, 1);

    // Save the updated document
    const updatedDoc = await propertyFloorPlanDoc.save();

    // Return success response
    res.status(200).json({
      message: 'Floor plan removed successfully.',
      data: updatedDoc,
    });
  } catch (error) {
    console.error('Error deleting floor plan:', error);
    res.status(500).json({
      message: 'Server error deleting floor plan.',
      error: error.message,
    });
  }
};


export const createVideo = async (req, res) => {
	try {
		const { propertyId, videoUrl } = req.body;

		// Validate input
		if (!propertyId || !videoUrl) {
			return res.status(400).json({
				message:
					'Missing required fields: propertyId and videoUrl are required.',
			});
		}

		if (!mongoose.Types.ObjectId.isValid(propertyId)) {
			return res.status(400).json({ message: 'Invalid propertyId format.' });
		}

		// Check if the property video document already exists
		const existingVideoDoc = await PropertyVideo.findOne({ propertyId });

		if (existingVideoDoc) {
			// If document exists, push the new video URL
			existingVideoDoc.propertyVideoUrl.push(videoUrl);
			const updatedDoc = await existingVideoDoc.save();

			console.log('Video URL added to existing document:', updatedDoc._id);
			return res.status(200).json({
				message: 'Video URL added successfully.',
				data: updatedDoc,
			});
		} else {
			// Create a new document if propertyId is new
			const newDoc = new PropertyVideo({
				propertyId: propertyId,
				propertyVideoUrl: [videoUrl],
			});

			const savedDoc = await newDoc.save();

			console.log('New video document created:', savedDoc._id);
			return res.status(201).json({
				message: 'Video collection created successfully.',
				data: savedDoc,
			});
		}
	} catch (error) {
		console.error('Error in createVideo:', error);

		if (error.name === 'ValidationError') {
			return res.status(400).json({
				message: 'Validation Error',
				error: error.message,
			});
		}

		return res.status(500).json({
			message: 'Server Error creating video collection.',
			error: error.message,
		});
	}
};

export const getPropertyVideoByPropertyId = async (req, res) => {
	try {
		const { propertyId } = req.params;

		if (!propertyId) {
			return res.status(400).json({ message: 'Property ID is required' });
		}

		if (!mongoose.Types.ObjectId.isValid(propertyId)) {
			return res.status(400).json({ message: 'Invalid property ID format' });
		}

		const propertyVideo = await PropertyVideo.findOne({ propertyId });

		if (!propertyVideo) {
			return res.status(404).json({ message: 'No videos found for this property' });
		}

		res.status(200).json({
			message: 'Property video(s) fetched successfully',
			data: propertyVideo,
		});
	} catch (error) {
		console.error('Error fetching property video:', error);
		res.status(500).json({
			message: 'Server error fetching property video',
			error: error.message,
		});
	}
};

export const deletePropertyVideoByIndex = async (req, res) => {
	try {
		const { propertyId, index } = req.body;

		if (!propertyId || index === undefined) {
			return res.status(400).json({ message: 'Property ID and index are required' });
		}

		if (!mongoose.Types.ObjectId.isValid(propertyId)) {
			return res.status(400).json({ message: 'Invalid property ID format' });
		}

		// Find the document
		const propertyVideo = await PropertyVideo.findOne({ propertyId });

		if (!propertyVideo) {
			return res.status(404).json({ message: 'No video document found for this property' });
		}

		if (index < 0 || index >= propertyVideo.propertyVideoUrl.length) {
			return res.status(400).json({ message: 'Invalid index for video deletion' });
		}

		// Remove video at specified index
		propertyVideo.propertyVideoUrl.splice(index, 1);

		// Save updated document
		await propertyVideo.save();

		return res.status(200).json({
			message: 'Video deleted successfully',
			data: propertyVideo,
		});
	} catch (error) {
		console.error('Error deleting property video:', error);
		res.status(500).json({
			message: 'Server error deleting property video',
			error: error.message,
		});
	}
};



export const createOtherMedia = async (req, res) => {
	try {
		const { propertyId, mediaUrls } = req.body;

		// Validate input
		if (
			!propertyId ||
			!mediaUrls ||
			!Array.isArray(mediaUrls) ||
			mediaUrls.length === 0
		) {
			return res.status(400).json({
				message:
					'Missing required fields: propertyId and mediaUrls (array) are required.',
			});
		}

		if (!mongoose.Types.ObjectId.isValid(propertyId)) {
			return res.status(400).json({ message: 'Invalid propertyId format.' });
		}

		// Check if a document exists for the given propertyId
		const existingMediaDoc = await PropertyOtherMedia.findOne({ propertyId });

		if (existingMediaDoc) {
			// Add new media URLs to the existing document
			existingMediaDoc.propertyOther.push(...mediaUrls);
			const updatedDoc = await existingMediaDoc.save();

			return res.status(200).json({
				message: 'Media added successfully.',
				data: updatedDoc,
			});
		} else {
			// Create a new document for a new propertyId
			const newDoc = new PropertyOtherMedia({
				propertyId: propertyId,
				propertyOther: mediaUrls,
			});

			const savedDoc = await newDoc.save();

			return res.status(201).json({
				message: 'New media collection created successfully.',
				data: savedDoc,
			});
		}
	} catch (error) {
		console.error('Error in createOtherMedia:', error);

		return res.status(500).json({
			message: 'Server Error creating other media.',
			error: error.message,
		});
	}
};

export const getOtherMediaByPropertyId = async (req, res) => {
	try {
		const { propertyId } = req.params;

		// Validate if propertyId is provided
		if (!propertyId) {
			return res.status(400).json({ message: 'Property ID is required' });
		}

		// Validate if it's a valid MongoDB ObjectId
		if (!mongoose.Types.ObjectId.isValid(propertyId)) {
			return res.status(400).json({ message: 'Invalid property ID format' });
		}

		// Find the document by propertyId
		const mediaDoc = await PropertyOtherMedia.findOne({ propertyId });

		if (!mediaDoc) {
			return res.status(404).json({ message: 'No other media found for this property' });
		}

		// Success response
		res.status(200).json({
			message: 'Other media fetched successfully',
			data: mediaDoc,
		});
	} catch (error) {
		console.error('Error fetching other media:', error);
		res.status(500).json({
			message: 'Server error fetching other media',
			error: error.message,
		});
	}
};


export const deleteOtherMediaByPropertyIdAndIndex = async (req, res) => {
	try {
			const { propertyId, index } = req.params;

			// Validate if propertyId and index are provided
			if (!propertyId || index === undefined) {
					return res.status(400).json({ message: 'Property ID and index are required' });
			}

			// Validate if it's a valid MongoDB ObjectId
			if (!mongoose.Types.ObjectId.isValid(propertyId)) {
					return res.status(400).json({ message: 'Invalid property ID format' });
			}

			// Find the document by propertyId
			const mediaDoc = await PropertyOtherMedia.findOne({ propertyId });

			if (!mediaDoc) {
					return res.status(404).json({ message: 'No other media found for this property' });
			}

			// Remove the media at the specified index
			const mediaToRemove = mediaDoc.propertyOther.splice(index, 1);

			// If mediaToRemove is empty, the index was not found
			if (mediaToRemove.length === 0) {
					return res.status(404).json({ message: 'No media found at the specified index' });
			}

			// Save the updated document
			await mediaDoc.save();

			// Success response
			res.status(200).json({
					message: 'Other media deleted successfully',
					data: mediaToRemove,
			});
	} catch (error) {
			console.error('Error deleting other media:', error);
			res.status(500).json({
					message: 'Server error deleting other media',
					error: error.message,
			});
	}
};


export const createFeature = async (req, res) => {
	try {
		const {
			propertyId,
			for: featureFor,
			state,
			price,
			currency,
			displayPrice,
			bedrooms,
			bathrooms,
			buildingSize,
			propertySizeUnit,
			lotSizePropertySize,
			customText,
			yearBuilt,
			propertyType,
			architecturalStyle,
			annualPropertyTaxes,
			condoHoaAssociationFee,
			feeAmount,
			terms,
			mlsNumber,
			parcelNumber,
			parking,
			storage,
			amenities,
		} = req.body;

		// Check if propertyId exists in Property collection
		const propertyExists = await Property.findById(propertyId);
		if (!propertyExists) {
			return res.status(404).json({ message: 'Property not found' });
		}

		// Check if feature already exists for the property
		const existingFeature = await Features.findOne({ propertyId });

		if (existingFeature) {
			// Update existing feature
			const updatedFeature = await Features.findOneAndUpdate(
				{ propertyId },
				{
					for: featureFor,
					state,
					price,
					currency,
					displayPrice,
					bedrooms,
					bathrooms,
					buildingSize,
					propertySizeUnit,
					lotSizePropertySize,
					customText,
					yearBuilt,
					propertyType,
					architecturalStyle,
					annualPropertyTaxes,
					condoHoaAssociationFee,
					feeAmount,
					terms,
					mlsNumber,
					parcelNumber,
					parking,
					storage,
					amenities,
				},
				{ new: true } // return updated document
			);

			return res.status(200).json({
				message: 'Feature updated successfully',
				feature: updatedFeature,
			});
		}

		// Create new feature if none exists
		const newFeature = new Features({
			propertyId,
			for: featureFor,
			state,
			price,
			currency,
			displayPrice,
			bedrooms,
			bathrooms,
			buildingSize,
			propertySizeUnit,
			lotSizePropertySize,
			customText,
			yearBuilt,
			propertyType,
			architecturalStyle,
			annualPropertyTaxes,
			condoHoaAssociationFee,
			feeAmount,
			terms,
			mlsNumber,
			parcelNumber,
			parking,
			storage,
			amenities,
		});

		const savedFeature = await newFeature.save();

		res.status(201).json({
			message: 'Feature created successfully',
			feature: savedFeature,
		});
	} catch (error) {
		res.status(500).json({
			message: 'Internal Server Error',
			error: error.message,
		});
	}
};

export const getFeatureByPropertyId = async (req, res) => {
	try {
		const { propertyId } = req.params;

		const features = await Features.find({ propertyId });

		if (!features || features.length === 0) {
			return res.status(404).json({ message: 'No features found for this property' });
		}

		res.status(200).json({
			message: 'Features fetched successfully',
			features,
		});
	} catch (error) {
		res.status(500).json({
			message: 'Internal Server Error',
			error: error.message,
		});
	}
};

