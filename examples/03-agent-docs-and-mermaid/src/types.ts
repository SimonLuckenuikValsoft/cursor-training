export interface PaymentRequest {
  id: string;
  amount: number;
  currency: string;
  customerId: string;
  paymentMethodId: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  gatewayResponse?: unknown;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  riskScore: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  lastFour?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface AuditEvent {
  timestamp: Date;
  eventType: string;
  actor: string;
  resource: string;
  action: string;
  outcome: 'success' | 'failure';
  details?: Record<string, unknown>;
}

export interface FraudCheckResult {
  approved: boolean;
  riskScore: number;
  reasons: string[];
  requiresReview: boolean;
}

export type NotificationChannel = 'email' | 'sms' | 'push' | 'webhook';

export interface NotificationPayload {
  channel: NotificationChannel;
  recipient: string;
  subject: string;
  body: string;
  metadata?: Record<string, string>;
}
