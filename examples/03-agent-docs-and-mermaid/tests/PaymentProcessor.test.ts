import { PaymentProcessor } from '../src/core/PaymentProcessor';
import { StripeGateway } from '../src/gateways/StripeGateway';
import { FraudDetector } from '../src/security/FraudDetector';
import { AuditLogger, InMemoryAuditStorage } from '../src/audit/AuditLogger';
import { NotificationService } from '../src/notifications/NotificationService';
import { PaymentRequest, Customer } from '../src/types';

describe('PaymentProcessor', () => {
  let processor: PaymentProcessor;
  let gateway: StripeGateway;
  let fraudDetector: FraudDetector;
  let auditLogger: AuditLogger;
  let notificationService: NotificationService;

  const testCustomer: Customer = {
    id: 'cust_123',
    email: 'test@example.com',
    name: 'Test User',
    riskScore: 0.1,
  };

  const testPaymentRequest: PaymentRequest = {
    id: 'pay_123',
    amount: 100,
    currency: 'USD',
    customerId: 'cust_123',
    paymentMethodId: 'pm_test',
  };

  beforeEach(() => {
    gateway = new StripeGateway('sk_test_xxx');
    fraudDetector = new FraudDetector();
    auditLogger = new AuditLogger(new InMemoryAuditStorage());
    notificationService = new NotificationService();
    
    processor = new PaymentProcessor(
      gateway,
      fraudDetector,
      auditLogger,
      notificationService
    );
  });

  describe('processPayment', () => {
    it('should successfully process a valid payment', async () => {
      const result = await processor.processPayment(testPaymentRequest, testCustomer);
      
      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
    });

    it('should reject payment with zero amount', async () => {
      const invalidRequest = { ...testPaymentRequest, amount: 0 };
      const result = await processor.processPayment(invalidRequest, testCustomer);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject high-risk customer transactions', async () => {
      const highRiskCustomer = { ...testCustomer, riskScore: 0.9 };
      const result = await processor.processPayment(testPaymentRequest, highRiskCustomer);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('fraud');
    });
  });

  describe('refundPayment', () => {
    it('should successfully refund a processed payment', async () => {
      // First, process a payment
      const paymentResult = await processor.processPayment(testPaymentRequest, testCustomer);
      expect(paymentResult.success).toBe(true);
      
      // Then refund it
      const refundResult = await processor.refundPayment(
        paymentResult.transactionId!,
        50,
        'Customer request'
      );
      
      expect(refundResult.success).toBe(true);
    });

    it('should fail to refund non-existent transaction', async () => {
      const result = await processor.refundPayment('invalid_tx', 100, 'Test');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });
});

describe('FraudDetector', () => {
  let detector: FraudDetector;

  beforeEach(() => {
    detector = new FraudDetector({
      velocityWindow: 60,
      maxTransactionsPerWindow: 3,
    });
  });

  it('should approve low-risk transactions', async () => {
    const request: PaymentRequest = {
      id: 'pay_1',
      amount: 50,
      currency: 'USD',
      customerId: 'cust_1',
      paymentMethodId: 'pm_1',
    };
    
    const customer: Customer = {
      id: 'cust_1',
      email: 'test@example.com',
      name: 'Test',
      riskScore: 0.1,
    };

    const result = await detector.checkTransaction(request, customer);
    expect(result.approved).toBe(true);
  });

  it('should flag velocity violations', async () => {
    const customer: Customer = {
      id: 'cust_velocity',
      email: 'test@example.com',
      name: 'Test',
      riskScore: 0.1,
    };

    // Make several transactions quickly
    for (let i = 0; i < 4; i++) {
      const request: PaymentRequest = {
        id: `pay_${i}`,
        amount: 50,
        currency: 'USD',
        customerId: customer.id,
        paymentMethodId: 'pm_1',
      };
      await detector.checkTransaction(request, customer);
    }

    // The 5th transaction should have elevated risk
    const finalRequest: PaymentRequest = {
      id: 'pay_final',
      amount: 50,
      currency: 'USD',
      customerId: customer.id,
      paymentMethodId: 'pm_1',
    };

    const result = await detector.checkTransaction(finalRequest, customer);
    expect(result.riskScore).toBeGreaterThan(0.1);
  });
});
