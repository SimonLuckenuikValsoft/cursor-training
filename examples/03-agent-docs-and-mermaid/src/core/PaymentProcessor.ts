import { PaymentGateway } from '../gateways/PaymentGateway.js';
import { FraudDetector } from '../security/FraudDetector.js';
import { AuditLogger } from '../audit/AuditLogger.js';
import { NotificationService } from '../notifications/NotificationService.js';
import { PaymentRequest, PaymentResult, Customer } from '../types.js';

export class PaymentProcessor {
  private gateway: PaymentGateway;
  private fraudDetector: FraudDetector;
  private auditLogger: AuditLogger;
  private notificationService: NotificationService;

  constructor(
    gateway: PaymentGateway,
    fraudDetector: FraudDetector,
    auditLogger: AuditLogger,
    notificationService: NotificationService
  ) {
    this.gateway = gateway;
    this.fraudDetector = fraudDetector;
    this.auditLogger = auditLogger;
    this.notificationService = notificationService;
  }

  async processPayment(request: PaymentRequest, customer: Customer): Promise<PaymentResult> {
    // Step 1: Log payment attempt
    await this.auditLogger.log({
      timestamp: new Date(),
      eventType: 'PAYMENT_INITIATED',
      actor: customer.id,
      resource: request.id,
      action: 'process_payment',
      outcome: 'success',
      details: { amount: request.amount, currency: request.currency },
    });

    // Step 2: Fraud check
    const fraudResult = await this.fraudDetector.checkTransaction(request, customer);
    if (!fraudResult.approved) {
      await this.auditLogger.log({
        timestamp: new Date(),
        eventType: 'FRAUD_REJECTED',
        actor: customer.id,
        resource: request.id,
        action: 'fraud_check',
        outcome: 'failure',
        details: { reasons: fraudResult.reasons },
      });
      return { success: false, error: 'Payment declined due to fraud check' };
    }

    // Step 3: Process through gateway
    const result = await this.gateway.charge(request);

    // Step 4: Log result
    await this.auditLogger.log({
      timestamp: new Date(),
      eventType: result.success ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED',
      actor: customer.id,
      resource: request.id,
      action: 'charge',
      outcome: result.success ? 'success' : 'failure',
      details: { transactionId: result.transactionId },
    });

    // Step 5: Send notifications
    if (result.success) {
      await this.notificationService.send({
        channel: 'email',
        recipient: customer.email,
        subject: 'Payment Confirmation',
        body: `Your payment of ${request.amount} ${request.currency} was successful.`,
      });
    }

    return result;
  }

  async refundPayment(transactionId: string, amount: number, reason: string): Promise<PaymentResult> {
    await this.auditLogger.log({
      timestamp: new Date(),
      eventType: 'REFUND_INITIATED',
      actor: 'system',
      resource: transactionId,
      action: 'refund',
      outcome: 'success',
      details: { amount, reason },
    });

    const result = await this.gateway.refund(transactionId, amount);

    await this.auditLogger.log({
      timestamp: new Date(),
      eventType: result.success ? 'REFUND_SUCCESS' : 'REFUND_FAILED',
      actor: 'system',
      resource: transactionId,
      action: 'refund_complete',
      outcome: result.success ? 'success' : 'failure',
    });

    return result;
  }

  async getTransactionStatus(transactionId: string): Promise<string> {
    return this.gateway.getStatus(transactionId);
  }
}
