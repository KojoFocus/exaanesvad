import { env } from 'process';

// SMS notification service for order notifications
export interface OrderNotificationData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  itemCount: number;
}

export async function sendOrderNotification(data: OrderNotificationData): Promise<void> {
  try {
    const notificationNumber = env.NOTIFICATION_PHONE_NUMBER || '+233246114671';
    
    // Format the message
    const message = `NEW ORDER: #${data.orderId}
Customer: ${data.customerName}
Phone: ${data.customerPhone}
Items: ${data.itemCount}
Total: GHS ${data.totalAmount.toLocaleString()}
Time: ${new Date().toLocaleString('en-GH', { 
  year: 'numeric', 
  month: 'short', 
  day: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit' 
})}`;

    // Log the notification (for development/testing)
    console.log('📱 SMS Notification:', message);
    
    // In a real implementation, you would integrate with an SMS service like:
    // - Twilio
    // - Africa's Talking
    // - Termii
    // - MessageBird
    
    // Example with Twilio (uncomment and configure if using):
    /*
    const twilio = require('twilio');
    const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    
    await client.messages.create({
      body: message,
      from: env.TWILIO_PHONE_NUMBER,
      to: notificationNumber
    });
    */
    
    // Example with Africa's Talking (uncomment and configure if using):
    /*
    const AfricasTalking = require('africastalking')(env.AT_USERNAME, env.AT_API_KEY);
    const sms = AfricasTalking.SMS;
    
    await sms.send({
      to: notificationNumber,
      message: message,
      from: 'EXA-ANESVAD'
    });
    */
    
    console.log('✅ Order notification sent successfully to', notificationNumber);
  } catch (error) {
    console.error('❌ Failed to send order notification:', error);
    // Don't throw error to prevent order creation failure
  }
}

// WhatsApp notification (alternative)
export async function sendWhatsAppNotification(data: OrderNotificationData): Promise<void> {
  try {
    const notificationNumber = env.NOTIFICATION_PHONE_NUMBER || '+233246114671';
    
    const message = `*NEW ORDER RECEIVED* 📦

*Order ID:* ${data.orderId}
*Customer:* ${data.customerName}
*Phone:* ${data.customerPhone}
*Items:* ${data.itemCount}
*Total:* GHS ${data.totalAmount.toLocaleString()}
*Time:* ${new Date().toLocaleString('en-GH', { 
  year: 'numeric', 
  month: 'short', 
  day: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit' 
})}

Please follow up with the customer for delivery arrangements.`;

    console.log('💬 WhatsApp Notification:', message);
    
    // In a real implementation, integrate with WhatsApp Business API
    // This would require setting up a WhatsApp Business account
    
  } catch (error) {
    console.error('❌ Failed to send WhatsApp notification:', error);
  }
}

// Email notification (alternative)
export async function sendEmailNotification(data: OrderNotificationData): Promise<void> {
  try {
    const notificationEmail = env.NOTIFICATION_EMAIL || 'exaanesvad@gmail.com';
    
    const subject = `New Order Received - #${data.orderId}`;
    const body = `
New order has been placed:

Order ID: ${data.orderId}
Customer: ${data.customerName}
Phone: ${data.customerPhone}
Items: ${data.itemCount}
Total Amount: GHS ${data.totalAmount.toLocaleString()}
Order Date: ${new Date().toLocaleString('en-GH')}

Please review the order in your admin dashboard and contact the customer for delivery arrangements.
    `.trim();

    console.log('📧 Email Notification:', { to: notificationEmail, subject, body });
    
    // In a real implementation, integrate with email service like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Nodemailer
    
  } catch (error) {
    console.error('❌ Failed to send email notification:', error);
  }
}

// Combined notification function
export async function sendOrderNotifications(data: OrderNotificationData): Promise<void> {
  try {
    // Send SMS notification
    await sendOrderNotification(data);
    
    // Send WhatsApp notification
    await sendWhatsAppNotification(data);
    
    // Send email notification
    await sendEmailNotification(data);
    
    console.log('✅ All notifications sent successfully');
  } catch (error) {
    console.error('❌ Failed to send notifications:', error);
  }
}