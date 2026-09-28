export type NotificationChannel = 'email' | 'whatsapp' | 'in-app';

export interface OutboundMessage {
  channel: NotificationChannel;
  template: string;
  to: string;
  variables: Record<string, string>;
}

/** Templates the future backend will render. No provider is called from the browser. */
export const TEMPLATES = {
  registrationConfirmation: 'registration-confirmation',
  paymentPending: 'payment-pending',
  enquiryAcknowledgement: 'enquiry-acknowledgement',
  speakerApplicationAcknowledgement: 'speaker-application-acknowledgement',
  eventReminder: 'event-reminder',
  checkInInformation: 'check-in-information',
  adminNotification: 'admin-notification',
} as const;

export function queueMessage(message: OutboundMessage): OutboundMessage {
  // Placeholder queue. A backend job runner sends these; the frontend only describes intent.
  return message;
}
