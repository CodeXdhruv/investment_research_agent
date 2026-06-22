export class CommitteeAgent {
  async evaluate(agentOutputs: any[]) {
    return {
      recommendation: "INVEST",
      confidence: 0.85,
      score: 85,
      reasoning: "Strong financials and industry tailwinds."
    };
  }
}
export const committeeAgent = new CommitteeAgent();
