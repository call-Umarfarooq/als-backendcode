import mongoose from 'mongoose';
import Teams from '../models/team.modal.js';

// Create Team
export const createTeam = async (req, res) => {
    try {
        const {
            ownerId,
            basicInfo = {},
            agents = [],
            logos = []
        } = req.body;

        // Destructure basicInfo
        const {
            name,
            city,
            state,
            address,
            unit,
            zipCode,
            website
        } = basicInfo;

        // Validate required fields
        if (!name || !ownerId || !address) {
            return res.status(400).json({
                success: false,
                message: 'Company Name, Owner ID, and Address are required'
            });
        }

        // Validate agents and logos (if required)
        if (!Array.isArray(agents)) {
            return res.status(400).json({
                success: false,
                message: 'Agents must be an array'
            });
        }

        if (!Array.isArray(logos)) {
            return res.status(400).json({
                success: false,
                message: 'Logos must be an array'
            });
        }

        // Validate ownerId
        if (!mongoose.Types.ObjectId.isValid(ownerId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid owner ID'
            });
        }

        // Process logos - set first logo as display if none specified
        const processedLogos = logos.map((logo, index) => ({
            url: logo.url,
            display: logo.display !== undefined ? logo.display : index === 0,
            uploadedAt: new Date()
        }));

        // Ensure only one logo is set to display
        const displayCount = processedLogos.filter(logo => logo.display).length;
        if (displayCount > 1) {
            return res.status(400).json({
                success: false,
                message: 'Only one logo can be set as display'
            });
        }

        // If no logo is set to display, set the first one
        if (displayCount === 0 && processedLogos.length > 0) {
            processedLogos[0].display = true;
        }

        const newTeam = new Teams({
            ownerId,
            basicInfo: {
                name,
                city,
                state,
                address,
                unit,
                zipCode,
                website
            },
            agents: agents.map(agent => ({
                agentId: agent.agentId,
                name: agent.name,
                email: agent.email,
                level: agent.level || 'JUNIOR',
                joinDate: new Date()
            })),
            logos: processedLogos
        });

        const savedTeam = await newTeam.save();

        res.status(201).json({
            success: true,
            data: savedTeam
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Team name already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating team',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


export const countTeam =async (req, res) =>{
    try {
      const totalTeams = await Teams.countDocuments();
      res.status(200).json({ total: totalTeams });
    } catch (error) {
      res.status(500).json({ message: "Error counting teams", error: error.message });
    }
  }

  export const summary =async (req, res) =>{
    try {
      const teams = await Teams.find({},{
        'basicInfo.name': 1,
        'basicInfo.city': 1,
        agents: 1
      });
  
      const response = teams.map(team => ({
        name: team.basicInfo?.name || 'Unnamed Team',
        city: team.basicInfo?.city || 'Unknown City',
        agentCount: team.agents.length
      }));
  
      res.status(200).json(response);
    } catch (err) {
      console.error('Error fetching team summary:', err);
      res.status(500).json({ error: 'Server Error' });
    }
  }
// Get Team by ID
export const getTeamById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid team ID' });
        }

        const team = await Teams.findById(id);

        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        res.status(200).json({ success: true, data: team });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching team', error: error.message });
    }
};

// Get All Teams by Owner ID
export const getTeamsByOwner = async (req, res) => {
    try {
        const { ownerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(ownerId)) {
            return res.status(400).json({ success: false, message: 'Invalid owner ID' });
        }

        const teams = await Teams.find({ ownerId });

        res.status(200).json({ success: true, data: teams });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching teams', error: error.message });
    }
};

// Update Team
export const updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            basicInfo = {},
            agents,
            logos,
            ...otherUpdates
        } = req.body;

        // Validate team ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid team ID'
            });
        }

        // Prepare update object
        const updateData = { ...otherUpdates };

        // Handle basicInfo updates if provided
        if (Object.keys(basicInfo).length > 0) {
            updateData.$set = updateData.$set || {};
            updateData.$set['basicInfo'] = basicInfo;
        }

        // Handle agents array if provided
        if (Array.isArray(agents)) {
            updateData.$set = updateData.$set || {};
            updateData.$set['agents'] = agents.map(agent => ({
                agentId: agent.agentId,
                name: agent.name,
                email: agent.email,
                level: agent.level || 'JUNIOR',
                joinDate: agent.joinDate || new Date()
            }));
        }

        // Handle logos array if provided
        if (Array.isArray(logos)) {
            // Process logos - maintain display logic
            const processedLogos = logos.map((logo, index) => ({
                url: logo.url,
                display: logo.display !== undefined ? logo.display : false,
                uploadedAt: logo.uploadedAt || new Date()
            }));

            // Ensure only one logo is set to display
            const displayCount = processedLogos.filter(logo => logo.display).length;
            if (displayCount > 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Only one logo can be set as display'
                });
            }

            updateData.$set = updateData.$set || {};
            updateData.$set['logos'] = processedLogos;
        }

        // Prevent updating ownerId
        if (updateData.$set?.ownerId) {
            delete updateData.$set.ownerId;
        }

        const updatedTeam = await Teams.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).populate('ownerId', 'name email')
            .populate('agents.agentId', 'name email phone');

        if (!updatedTeam) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedTeam
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Team name already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error updating team',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Delete Team
export const deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid team ID' });
        }

        const deletedTeam = await Teams.findByIdAndDelete(id);

        if (!deletedTeam) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        res.status(200).json({ success: true, message: 'Team deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting team', error: error.message });
    }
};



// Add Agent to Team
export const addAgentToTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { agentId, name, email, level } = req.body;

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(agentId)) {
            return res.status(400).json({ success: false, message: 'Invalid team or agent ID' });
        }

        const updatedTeam = await Teams.findByIdAndUpdate(
            teamId,
            {
                $push: {
                    agents: {
                        agentId,
                        name,
                        email,
                        level: level || 'JUNIOR'
                    }
                }
            },
            { new: true, runValidators: true }
        ).populate('agents.agentId', 'name email phone');

        if (!updatedTeam) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        res.status(200).json({ success: true, data: updatedTeam });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding agent to team', error: error.message });
    }
};


// Add Logo to Team
export const addLogoToTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { url, display, disclaimer } = req.body;

        // Validate team ID
        if (!mongoose.Types.ObjectId.isValid(teamId)) {
            return res.status(400).json({ success: false, message: 'Invalid team ID' });
        }

        // Validate URL
        if (!url) {
            return res.status(400).json({ success: false, message: 'Logo URL is required' });
        }

        // First, check if we need to set any existing logos to display: false
        let updateOperation = {
            $push: {
                logos: {
                    url,
                    display: display || false,
                    uploadedAt: new Date()
                }
            }
        };

        // If this logo should be displayed, set all others to display: false
        if (display === true) {
            updateOperation = {
                ...updateOperation,
                $set: {
                    'logos.$[].display': false
                }
            };
        }

        if (disclaimer !== undefined) {
            updateOperation.$set = {
                ...updateOperation.$set,
                disclaimer
            };
        }

        const updatedTeam = await Teams.findByIdAndUpdate(
            teamId,
            updateOperation,
            { new: true, runValidators: true }
        );

        if (!updatedTeam) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        // If no display was specified and this is the first logo, set it as display
        if (updatedTeam.logos.length === 1 && display === undefined) {
            await Teams.findByIdAndUpdate(
                teamId,
                { $set: { 'logos.0.display': true } }
            );
        }

        res.status(200).json({
            success: true,
            data: updatedTeam
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding logo to team',
            error: error.message
        });
    }
};


// Remove Agent from Team
export const removeAgentFromTeam = async (req, res) => {
    try {
        const { teamId, agentId } = req.params;

        // Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(agentId)) {
            return res.status(400).json({ success: false, message: 'Invalid teamId or agentId' });
        }

        // Perform update to pull agent from agents array
        const updatedTeam = await Teams.findByIdAndUpdate(
            teamId,
            { $pull: { agents: { agentId: agentId } } },
            { new: true }
        );

        if (!updatedTeam) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        return res.status(200).json({ success: true, message: 'Agent removed successfully', data: updatedTeam });
    } catch (error) {
        console.error('Error removing agent:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
