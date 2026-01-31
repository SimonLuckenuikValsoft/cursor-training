import { NotificationPayload, NotificationChannel } from '../types.js';

export interface NotificationProvider {
  channel: NotificationChannel;
  send(payload: NotificationPayload): Promise<boolean>;
}

export class EmailProvider implements NotificationProvider {
  channel: NotificationChannel = 'email';
  
  async send(payload: NotificationPayload): Promise<boolean> {
    // Simulate email sending
    console.log(`[EMAIL] To: ${payload.recipient}, Subject: ${payload.subject}`);
    return true;
  }
}

export class SMSProvider implements NotificationProvider {
  channel: NotificationChannel = 'sms';
  
  async send(payload: NotificationPayload): Promise<boolean> {
    // Simulate SMS sending
    console.log(`[SMS] To: ${payload.recipient}: ${payload.body.substring(0, 160)}`);
    return true;
  }
}

export class WebhookProvider implements NotificationProvider {
  channel: NotificationChannel = 'webhook';
  
  async send(payload: NotificationPayload): Promise<boolean> {
    // Simulate webhook call
    console.log(`[WEBHOOK] POST ${payload.recipient}: ${JSON.stringify(payload)}`);
    return true;
  }
}

export class NotificationService {
  private providers: Map<NotificationChannel, NotificationProvider> = new Map();
  private queue: NotificationPayload[] = [];
  private retryAttempts: number;

  constructor(retryAttempts: number = 3) {
    this.retryAttempts = retryAttempts;
    
    // Register default providers
    this.registerProvider(new EmailProvider());
    this.registerProvider(new SMSProvider());
    this.registerProvider(new WebhookProvider());
  }

  registerProvider(provider: NotificationProvider): void {
    this.providers.set(provider.channel, provider);
  }

  async send(payload: NotificationPayload): Promise<boolean> {
    const provider = this.providers.get(payload.channel);
    
    if (!provider) {
      console.error(`No provider registered for channel: ${payload.channel}`);
      return false;
    }

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const success = await provider.send(payload);
        if (success) {
          return true;
        }
      } catch (error) {
        console.error(`Notification attempt ${attempt} failed:`, error);
        if (attempt < this.retryAttempts) {
          await this.delay(attempt * 1000); // Exponential backoff
        }
      }
    }

    // Add to retry queue
    this.queue.push(payload);
    return false;
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const payload of payloads) {
      const success = await this.send(payload);
      if (success) {
        sent++;
      } else {
        failed++;
      }
    }

    return { sent, failed };
  }

  getQueuedNotifications(): NotificationPayload[] {
    return [...this.queue];
  }

  async processQueue(): Promise<number> {
    const toProcess = [...this.queue];
    this.queue = [];
    
    let processed = 0;
    for (const payload of toProcess) {
      const success = await this.send(payload);
      if (success) {
        processed++;
      }
    }
    
    return processed;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
