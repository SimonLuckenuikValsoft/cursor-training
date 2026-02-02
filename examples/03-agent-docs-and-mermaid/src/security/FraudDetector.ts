import { PaymentRequest, Customer, FraudCheckResult } from '../types.js';

export class FraudDetector {
  private velocityWindow: number; // seconds
  private maxTransactionsPerWindow: number;
  private highRiskThreshold: number;
  private recentTransactions: Map<string, Date[]> = new Map();

  constructor(options?: {
    velocityWindow?: number;
    maxTransactionsPerWindow?: number;
    highRiskThreshold?: number;
  }) {
    this.velocityWindow = options?.velocityWindow || 3600; // 1 hour
    this.maxTransactionsPerWindow = options?.maxTransactionsPerWindow || 10;
    this.highRiskThreshold = options?.highRiskThreshold || 0.7;
  }

  async checkTransaction(request: PaymentRequest, customer: Customer): Promise<FraudCheckResult> {
    const reasons: string[] = [];
    let riskScore = customer.riskScore;

    // Check 1: Velocity check
    const velocityCheck = this.checkVelocity(customer.id);
    if (!velocityCheck.passed) {
      reasons.push(velocityCheck.reason);
      riskScore += 0.2;
    }

    // Check 2: Amount anomaly
    const amountCheck = this.checkAmountAnomaly(request.amount);
    if (!amountCheck.passed) {
      reasons.push(amountCheck.reason);
      riskScore += 0.15;
    }

    // Check 3: Geographic check (simplified)
    const geoCheck = this.checkGeographic(request.metadata);
    if (!geoCheck.passed) {
      reasons.push(geoCheck.reason);
      riskScore += 0.25;
    }

    // Record this transaction for velocity tracking
    this.recordTransaction(customer.id);

    const approved = riskScore < this.highRiskThreshold;
    const requiresReview = riskScore >= 0.5 && riskScore < this.highRiskThreshold;

    return {
      approved,
      riskScore: Math.min(riskScore, 1),
      reasons,
      requiresReview,
    };
  }

  private checkVelocity(customerId: string): { passed: boolean; reason: string } {
    const now = new Date();
    const windowStart = new Date(now.getTime() - this.velocityWindow * 1000);
    
    const transactions = this.recentTransactions.get(customerId) || [];
    const recentCount = transactions.filter(t => t > windowStart).length;

    if (recentCount >= this.maxTransactionsPerWindow) {
      return { passed: false, reason: 'Too many transactions in short time period' };
    }
    return { passed: true, reason: '' };
  }

  private checkAmountAnomaly(amount: number): { passed: boolean; reason: string } {
    // Flag unusually large transactions
    if (amount > 5000) {
      return { passed: false, reason: 'Unusually large transaction amount' };
    }
    // Flag suspicious round numbers
    if (amount % 1000 === 0 && amount > 1000) {
      return { passed: false, reason: 'Suspicious round amount' };
    }
    return { passed: true, reason: '' };
  }

  private checkGeographic(metadata?: Record<string, string>): { passed: boolean; reason: string } {
    if (!metadata?.country) {
      return { passed: true, reason: '' };
    }
    
    // Simplified: flag certain high-risk regions
    const highRiskCountries = ['XX', 'YY', 'ZZ']; // Placeholder
    if (highRiskCountries.includes(metadata.country)) {
      return { passed: false, reason: 'Transaction from high-risk region' };
    }
    return { passed: true, reason: '' };
  }

  private recordTransaction(customerId: string): void {
    const transactions = this.recentTransactions.get(customerId) || [];
    transactions.push(new Date());
    
    // Clean up old transactions
    const windowStart = new Date(Date.now() - this.velocityWindow * 1000);
    const filtered = transactions.filter(t => t > windowStart);
    
    this.recentTransactions.set(customerId, filtered);
  }

  getRiskScore(customerId: string): number {
    const transactions = this.recentTransactions.get(customerId) || [];
    // More transactions = higher base risk
    return Math.min(transactions.length * 0.05, 0.5);
  }
}
