import { Client, MessageMedia } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

const client = new Client({});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log('QR code generated, please scan it with your WhatsApp app.');
});

client.on('ready', () => {
  console.log('WhatsApp client is ready!');
});

client.initialize();

export const sendWhatsAppMessage = async (to: string, message: string) => {
  try {
    const formattedNumber = to.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    const chatId = `${formattedNumber}@c.us`; // WhatsApp format for phone numbers

    await client.sendMessage(chatId, message);
    console.log('WhatsApp message sent to:', to);
    return { success: true, message: 'Message sent successfully' };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}; 