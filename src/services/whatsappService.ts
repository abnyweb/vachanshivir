import { queueMessage, TEMPLATES, type OutboundMessage } from './notificationService';

/**
 * WhatsApp boundary. Credentials live on the backend; nothing is hard-coded here.
 * Templates must be pre-approved with the provider before they can be sent.
 */
export function registrationConfirmation(phone: string, reference: string, name: string): OutboundMessage {
  return queueMessage({
    channel: 'whatsapp',
    template: TEMPLATES.registrationConfirmation,
    to: phone,
    variables: { reference, name },
  });
}

export function checkInInformation(phone: string, venue: string, checkIn: string): OutboundMessage {
  return queueMessage({
    channel: 'whatsapp',
    template: TEMPLATES.checkInInformation,
    to: phone,
    variables: { venue, checkIn },
  });
}
