import { StateGraph, START, END } from '@langchain/langgraph';
import { bullAgent } from '../agents/bull-agent';
import { bearAgent } from '../agents/bear-agent';
import { moderatorAgent } from '../agents/moderator-agent';
import { committeeAgent } from '../agents/committee-agent';
import { prisma } from '../lib/prisma';

interface DebateState {
  ticker: string;
  data: any;
  bullOutput?: any;
  bearOutput?: any;
  moderatorSummary?: any;
  committeeDecision?: any;
}

const debateGraph = new StateGraph<DebateState>({
  channels: {
    ticker: null,
    data: null,
    bullOutput: null,
    bearOutput: null,
    moderatorSummary: null,
    committeeDecision: null,
  }
});

debateGraph.addNode("gather_data", async (state) => {
  return {
    data: {
      financials: { revenue: 100 },
      news: "Mixed",
      marketSentiment: "Volatile"
    }
  };
});

debateGraph.addNode("bull", async (state) => ({ bullOutput: await bullAgent.analyze(state.data) }));
debateGraph.addNode("bear", async (state) => ({ bearOutput: await bearAgent.analyze(state.data) }));

debateGraph.addNode("moderator", async (state) => ({
  moderatorSummary: await moderatorAgent.analyze(state.bullOutput, state.bearOutput)
}));

debateGraph.addNode("committee", async (state) => ({
  committeeDecision: await committeeAgent.evaluate([
    { type: 'bull', data: state.bullOutput },
    { type: 'bear', data: state.bearOutput },
    { type: 'moderator', data: state.moderatorSummary }
  ])
}));

debateGraph.addEdge(START, "gather_data");

debateGraph.addEdge("gather_data", "bull");
debateGraph.addEdge("gather_data", "bear");

debateGraph.addEdge("bull", "moderator");
debateGraph.addEdge("bear", "moderator");

debateGraph.addEdge("moderator", "committee");
debateGraph.addEdge("committee", END);

export const compiledDebateGraph = debateGraph.compile();

export class DebateWorkflow {
  async run(ticker: string, userId?: string) {
    const initialState = { ticker, data: null };
    const finalState = await compiledDebateGraph.invoke(initialState);
    
    if (userId) {
      try {
        await prisma.debate.create({
          data: {
            userId,
            ticker,
            bullOutput: JSON.stringify(finalState.bullOutput),
            bearOutput: JSON.stringify(finalState.bearOutput),
            moderatorOutput: JSON.stringify(finalState.moderatorSummary),
            committeeOutput: JSON.stringify(finalState.committeeDecision)
          }
        });
      } catch (e) {
        console.error("Failed to save debate", e);
      }
    }

    return {
      bull: finalState.bullOutput,
      bear: finalState.bearOutput,
      moderator: finalState.moderatorSummary,
      committee: finalState.committeeDecision
    };
  }
}

export const debateWorkflow = new DebateWorkflow();
