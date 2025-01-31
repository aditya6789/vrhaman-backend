import { Request, Response } from 'express';
import { sendWhatsAppMessage } from '../services/whatsapp_service';
import { successResponse, failureResponse } from '../utils/response';

export const sendWhatsAppMessageController = async (req: Request, res: Response) => {
  const { to, message, duration } = req.body;

  if (!to || !message) {
    return res.status(400).json(failureResponse('Recipient and message are required'));
  }

  const intervalDuration = duration || 1000; // Default to 1 second if not provided

  try {
    const intervalId = setInterval(async () => {
      try {
        const response = await sendWhatsAppMessage(to, message);
        console.log('Message sent:', response);
      } catch (error) {
        console.error('Failed to send message:', error);
        clearInterval(intervalId); // Stop sending if there's an error
      }
    }, intervalDuration);

    // Optionally, stop the interval after a certain number of messages or time
    setTimeout(() => {
      clearInterval(intervalId);
      console.log('Stopped sending messages');
    }, 10000); // Stop after 10 seconds for example

    return res.status(200).json(successResponse('Started sending messages every second'));
  } catch (error) {
    return res.status(500).json(failureResponse('Failed to start sending messages'));
  }
}; 