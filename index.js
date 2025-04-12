import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io'; // Add this import
import http from 'http';
import connectMongoDB from './config/db.js';
import user from './routes/user.js';
import socialLink from './routes/socialLink.js';
import externalLink from './routes/externalLink.js';
import galleryImage from './routes/galleryImage.js';
import bodyparser from 'body-parser';
import property from './routes/property.js';
import agents from './routes/agents.routes.js';
import contracts from './routes/contracts.js';
import board from './routes/board.js';
import team from './routes/team.routes.js'
import Board from './models/boardModel.js';
import calender from './routes/calender.js'
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
connectMongoDB();
app.use(bodyparser.urlencoded([{ extended: true }]));
app.use('/public', express.static('public'));

app.get('/', (req, res) => {
	res.send(`
        <html>
            <head>
                <title>Matrimony API</title>
            </head>
            <body>
                <h1>Welcome to the Node.js API for the Matrimony App</h1>
                <p>Navigate to the <a href="/docs">API Documentation</a></p>
            </body>
        </html>
    `);
});

const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
	cors: {
		origin: "http://localhost:3000" , // Change this to your frontend URL
		methods: ['GET', 'POST'],
	},
});

// Socket.io connection handler
io.on('connection', (socket) => {
	console.log('A user connected:', socket.id);
	socket.on('send-message', async ({ senderId, receiverId, content }) => {
		console.log(senderId, receiverId, content);
		try {
			const message = new Board({
				sender: senderId,
				receiver: receiverId,
				content,
			});

			await message.save();
			io.emit('new-message', message);
		} catch (error) {
			console.log(error);
		}
	});

	// Join a room based on user ID
	socket.on('joinRoom', (userId) => {
		socket.join(userId);
		console.log(`User ${userId} joined their room`);
	});

	// Handle disconnection
	socket.on('disconnect', () => {
		console.log('User disconnected:', socket.id);
	});
});

// Make io accessible to routes
app.set('io', io);

app.use('/api/auth', user);
app.use('/api/social', socialLink);
app.use('/api/external', externalLink);
app.use('/api/gallery', galleryImage);
app.use('/api/property', property);
app.use('/api/agents', agents);
app.use('/api/contracts', contracts);
app.use('/api/board', board);
app.use('/api/team', team)
app.use('/api/calender', calender)

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});