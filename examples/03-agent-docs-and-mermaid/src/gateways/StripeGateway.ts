import { PaymentGateway } from './PaymentGateway.js';
import { PaymentRequest, PaymentResult } from '../types.js';

export class StripeGateway implements PaymentGateway {
  name = 'Stripe';
  private apiKey: string;
  private transactions: Map<string, { status: string; amount: number }> = new Map();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async charge(request: PaymentRequest): Promise<PaymentResult> {
    // Simulate API call to Stripe
    const transactionId = `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate some validation
    if (request.amount <= 0) {
      return { success: false, error: 'Invalid amount' };
    }

    if (request.amount > 10000) {
      return { success: false, error: 'Amount exceeds limit' };
    }

    this.transactions.set(transactionId, {
      status: 'completed',
      amount: request.amount,
    });

    return {
      success: true,
      transactionId,
      gatewayResponse: { provider: 'stripe', chargeId: transactionId },
    };
  }

  async refund(transactionId: string, amount: number): Promise<PaymentResult> {
    const transaction = this.transactions.get(transactionId);
    
    if (!transaction) {
      return { success: false, error: 'Transaction not found' };
    }

    if (amount > transaction.amount) {
      return { success: false, error: 'Refund amount exceeds original charge' };
    }

    transaction.status = 'refunded';
    transaction.amount -= amount;

    return {
      success: true,
      transactionId: `refund_${transactionId}`,
    };
  }

  async getStatus(transactionId: string): Promise<string> {
    const transaction = this.transactions.get(transactionId);
    return transaction?.status || 'not_found';
  }

  async validatePaymentMethod(paymentMethodId: string): Promise<boolean> {
    // Simulate validation
    return paymentMethodId.startsWith('pm_');
  }
}
