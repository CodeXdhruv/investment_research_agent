export class FinanceAgent {
  async analyze(data: any) {
    return {
      score: 85,
      strengths: ["High Revenue Growth"],
      weaknesses: ["High Debt"],
      metrics: data,
    };
  }
}
export const financeAgent = new FinanceAgent();
