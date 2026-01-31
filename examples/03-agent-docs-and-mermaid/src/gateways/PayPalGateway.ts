import { PaymentGateway } from './PaymentGateway.js';
import { PaymentRequest, PaymentResult } from '../types.js';

export class PayPalGateway implements PaymentGateway {
  name = 'PayPal';
  private clientId: string;
  private clientSecret: string;
  private orders: Map<string, { status: string; amount: number }> = new Map();

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async charge(request: PaymentRequest): Promise<PaymentResult> {
    // Simulate PayPal order creation and capture
    const orderId = `paypal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (request.amount <= 0) {
      return { success: false, error: 'Invalid amount' };
    }

    // PayPal has different limits
    if (request.amount > 25000) {
      return { success: false, error: 'Amount exceeds PayPal limit' };
    }

    this.orders.set(orderId, {
      status: 'COMPLETED',
      amount: request.amount,
    });

    return {
      success: true,
      transactionId: orderId,
      gatewayResponse: { provider: 'paypal', orderId, captureId: `capture_${orderId}` },
    };
  }

  async refund(transactionId: string, amount: number): Promise<PaymentResult> {
    const order = this.orders.get(transactionId);
    
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    if (amount > order.amount) {
      return { success: false, error: 'Refund amount exceeds original payment' };
    }

    order.status = 'REFUNDED';
    order.amount -= amount;

    return {
      success: true,
      transactionId: `refund_${transactionId}`,
    };
  }

  async getStatus(transactionId: string): Promise<string> {
    const order = this.orders.get(transactionId);
    return order?.status || 'NOT_FOUND';
  }

  async validatePaymentMethod(paymentMethodId: string): Promise<boolean> {
    // PayPal uses different validation
    return paymentMethodId.startsWith('paypal_') || paymentMethodId.includes('@');
  }
}
