import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'userAccounts',
    },
    eventName: {
      type: String,
      required: true,
    },
    referralName: {
      type: String,
     
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Open', 'Close'],
      default: 'Open',
    },
    email: {
      type: String,
     
    },
  },
  { timestamps: true }
);

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);

export default CalendarEvent;
