import { AuditEvent } from '../types.js';

export interface AuditStorage {
  save(event: AuditEvent): Promise<void>;
  query(filters: Partial<AuditEvent>): Promise<AuditEvent[]>;
}

export class InMemoryAuditStorage implements AuditStorage {
  private events: AuditEvent[] = [];

  async save(event: AuditEvent): Promise<void> {
    this.events.push(event);
  }

  async query(filters: Partial<AuditEvent>): Promise<AuditEvent[]> {
    return this.events.filter(event => {
      for (const [key, value] of Object.entries(filters)) {
        if (event[key as keyof AuditEvent] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  getAll(): AuditEvent[] {
    return [...this.events];
  }
}

export class AuditLogger {
  private storage: AuditStorage;
  private serviceName: string;

  constructor(storage: AuditStorage, serviceName: string = 'payment-service') {
    this.storage = storage;
    this.serviceName = serviceName;
  }

  async log(event: AuditEvent): Promise<void> {
    const enrichedEvent: AuditEvent = {
      ...event,
      details: {
        ...event.details,
        service: this.serviceName,
        environment: process.env.NODE_ENV || 'development',
      },
    };

    await this.storage.save(enrichedEvent);
    
    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUDIT] ${event.eventType}: ${event.action} on ${event.resource} by ${event.actor} - ${event.outcome}`);
    }
  }

  async getEventsByActor(actorId: string): Promise<AuditEvent[]> {
    return this.storage.query({ actor: actorId });
  }

  async getEventsByResource(resourceId: string): Promise<AuditEvent[]> {
    return this.storage.query({ resource: resourceId });
  }

  async getFailedEvents(): Promise<AuditEvent[]> {
    return this.storage.query({ outcome: 'failure' });
  }

  async getEventsByType(eventType: string): Promise<AuditEvent[]> {
    return this.storage.query({ eventType });
  }
}
