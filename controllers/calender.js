import CalendarEvent from '../models/calendarEvent.js'

export const createCalendarEvent = async (req, res) => {
  try {
    const { userId, eventName, referralName, date, status, email } = req.body;

    if (!userId || !eventName || !date) {
      return res.status(400).json({ message: 'userId, eventName, and date are required' });
    }

    const newEvent = new CalendarEvent({
      userId,
      eventName,
      referralName,
      date,
      status,
      email,
    });

    await newEvent.save();

    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
};


export const getEventsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate that userId is provided
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Fetch all events for the given userId
    const events = await CalendarEvent.find({ userId });

    // If no events found
    if (events.length === 0) {
      return res.status(404).json({ message: 'No events found for this user' });
    }

    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

export const getEventsByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // Validate that email is provided
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Fetch all events for the given email
    const events = await CalendarEvent.find({ email });

    // If no events found
    if (events.length === 0) {
      return res.status(404).json({ message: 'No events found for this email' });
    }

    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};