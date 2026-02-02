import { PaymentRequest, PaymentResult } from '../types.js';

export interface PaymentGateway {
  name: string;
  
  charge(request: PaymentRequest): Promise<PaymentResult>;
  
  refund(transactionId: string, amount: number): Promise<PaymentResult>;
  
  getStatus(transactionId: string): Promise<string>;
  
  validatePaymentMethod(paymentMethodId: string): Promise<boolean>;
}
