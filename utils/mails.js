export const referalInvitation = (user, agent, token) => {
	const frontEndUrl = 'https://als-frontend-zysoftec.vercel.app';
	// const frontEndUrl = 'http://localhost:3000'
	const invitationUrl = `${frontEndUrl}/accept-invitation?token=${token}`;

	const mailOptions = {
		to: agent.email,
		from: process.env.EMAIL_USER,
		subject: 'Invitation to Join ALS',
		html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Referal Invitation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .logo {
            max-width: 150px;
        }
        .content {
            padding: 20px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4CAF50;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
        }
        .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #777;
        }
        .token {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            word-break: break-all;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Referal Invitation</h2>
    </div>
    
    <div class="content">
        <p>Hello,</p>
        
        <p><strong>${
					user.firstName || user.name
				}</strong> has invited you to join ALS platform.</p>
        
        <p>To accept this invitation and complete your registration, please click the button below:</p>
        
        <p style="text-align: center;">
            <a href="${invitationUrl}" class="button">Accept Invitation</a>
        </p>
        
        <p>Or copy and paste this link into your browser:</p>
        <div class="token">${invitationUrl}</div>
        
        <p><strong>This invitation will expire in 24 hours.</strong> If you don't accept it within this time, you'll need to request a new invitation.</p>
        
        <p>If you didn't expect this invitation, please ignore this email.</p>
    </div>
    
    <div class="footer">
        <p>Best regards,<br>The Team</p>
    </div>
</body>
</html>`,
	};
	return mailOptions;
};
