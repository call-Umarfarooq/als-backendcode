import User from '../models/userModel.js';
import nodemailer from 'nodemailer';
import Contract from '../models/contractModel.js';

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'umarfarooqtech55@gmail.com',
		pass: 'stwf hidv rlsd klte',
	},
});

export const createContract = async (req, res) => {
	try {
		const { userId, name, email, date, fileUrl } = req.body;
console.log(userId, name, email, date, fileUrl )
		if (!name || !email || !userId) {
			return res
				.status(400)
				.json({ message: 'Name, email, and userId are required.' });
		}

		const agentExists = await User.findOne({ _id: userId.trim() });
		if (!agentExists) {
			return res.status(404).json({ message: 'Agent not found.' });
		}

		const contract = await Contract.create({
			userId: userId.trim(),
			name,
			email,
			date,
			fileUrl,
		});


		const baseUrl = process.env.BASE_URL || 'http://localhost:5000'; // your server base
		// const trackEmailOpenUrl  = `${baseUrl}/api/contracts/track-view/${contract._id}`;
		const acceptUrl = `${process.env.FRONT}/contract?id=${contract._id}`;
    // const viewDocumentUrl = `${baseUrl}/api/contracts/view/${contract._id}`;


		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: email,
			subject: 'New Contract Document',
      html: `
      <p>Hi ${name},</p>
      <p>You have received a new contract document.</p>
      <a href="${acceptUrl}" style="
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
      ">View Contract</a>

     
    `,
		};

		await transporter.sendMail(mailOptions);

		res.status(201).json({
			message: 'Contract created and email sent.',
			contractId: contract._id,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to create contract or send email.' });
	}
};

export const getContractById = async (req, res) => {
	try {
		// Get the contract ID from the query parameters
		const { id } = req.query;

		if (!id) {
			return res.status(400).json({ message: 'Contract ID is required.' });
		}

		// Find the contract by ID
		const contract = await Contract.findById(id);
		if (!contract) {
			return res.status(404).json({ message: 'Contract not found.' });
		}

		res.status(200).json(contract);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to fetch contract.' });
	}
};

export const updateContractStatus = async (req, res) => {
	try {
		const { contractId } = req.params; // Get the contract ID from URL parameters
		const { status } = req.body; // Get the new status from request body

		// Check if the status is valid
		if (!['Pending', 'Viewed', 'Rejected', 'Accepted'].includes(status)) {
			return res.status(400).json({ message: 'Invalid status.' });
		}

		// Find contract by ID and update status
		const contract = await Contract.findByIdAndUpdate(
			contractId,
			{ status },
			{ new: true } // Return the updated contract
		);

		// If contract not found
		if (!contract) {
			return res.status(404).json({ message: 'Contract not found.' });
		}

		// Return the updated contract
		res.status(200).json({
			message: 'Contract status updated successfully.',
			contract,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to update contract status.' });
	}
};


export const updateSignature = async (req, res) => {
  const { contractId } = req.params; 
  const { signfileUrl, status } = req.body; 

  try {
    const contract = await Contract.findById(contractId);

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    contract.signfileUrl = signfileUrl || contract.signfileUrl; 
    contract.status = status || contract.status; 

    const updatedContract = await contract.save();

    return res.status(200).json({
      message: 'Contract updated successfully',
      contract: updatedContract,
    });
  } catch (error) {
    console.error('Error updating contract:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const getContractsByUserId = async (req, res) => {
	try {
		const { userId } = req.params;
    const agentExists = await User.findOne({ _id: userId });
		if (!agentExists) {
			return res.status(404).json({ message: 'Agent not found.' });
		}
    
		const contracts = await Contract.find({ userId });

		if (!contracts || contracts.length === 0) {
			return res.status(404).json({ message: 'No contracts found for this user.' });
		}

		res.status(200).json(contracts);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to fetch contracts.' });
	}
};


export const trackAndViewContract = async (req, res) => {
  try {
      const contract = await Contract.findById(req.params.id);
      if (!contract) {
          return res.status(404).send('Contract not found');
      }

      if (contract.status === 'Pending') {
          console.log(`Contract ${contract._id} status changing from Pending to Viewed.`);
          contract.status = 'Viewed';
          
          await contract.save();
      } else {
          console.log(`Contract ${contract._id} already viewed or accepted (Status: ${contract.status}). Not changing status.`);
      }

      if (!contract.fileUrl) {
           console.error(`Contract ${contract._id} has no fileUrl defined.`);
           return res.status(500).send('Error: Document URL not found for this contract.');
      }
      console.log(`Redirecting user to PDF: ${contract.fileUrl}`);
      res.redirect(contract.fileUrl);

  } catch (err) {
      console.error('Error tracking contract view:', err);
      res.status(500).send('Error processing your request.');
  }
};

export const trackEmailOpen = async (req, res) => {
  console.log("ssssssssssssssssss")
	try {
		const contract = await Contract.findById(req.params.id);
		if (!contract) return res.status(404).send('Not found');

		if (contract.status === 'Pending') {
			contract.status = 'Viewed';
			await contract.save();
		}

		const pixel = Buffer.from(
			'R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==',
			'base64'
		);

		res.set('Content-Type', 'image/gif');
		res.send(pixel);
	} catch (err) {
		console.error(err);
		res.status(500).send('Error tracking email open.');
	}
};


export const acceptContract = async (req, res) => {
	try {
		const contract = await Contract.findById(req.params.id);
		if (!contract) return res.status(404).send('Contract not found');

		contract.status = 'Accepted';
		await contract.save();

		res.send(
			'<h2>Contract Accepted</h2><p>Thank you for accepting the contract.</p>'
		);
	} catch (err) {
		console.error(err);
		res.status(500).send('Error accepting contract.');
	}
};


export const  countSignd = async (req, res) => {
  try {
    const acceptedContractsCount = await Contract.countDocuments({ status: "Accepted" });
    res.status(200).json({ totalAccepted: acceptedContractsCount });
  } catch (error) {
    res.status(500).json({ message: "Error counting accepted contracts", error: error.message });
  }
}