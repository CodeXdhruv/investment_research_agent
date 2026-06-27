import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '../../../../lib/prisma';

import { yahooFinanceService } from '../../../../services/providers/yahoo-finance-service';
import { NewsApiService } from '../../../../services/providers/news-api-service';

const newsApiService = new NewsApiService();

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: "Unauthorized" } }, { status: 401 });
    }

    let user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses[0]?.emailAddress || `${userId}@placeholder.com`;
      user = await prisma.user.create({
        data: { clerkUserId: userId, email }
      });
    }

    const watchlistItems = await prisma.watchlist.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    const enrichedWatchlist = await Promise.all(
      watchlistItems.map(async (item) => {
        const quote = await yahooFinanceService.getQuote(item.ticker);
        
        let mcapStr = 'N/A';
        if (quote?.marketCap) {
          if (quote.marketCap >= 1e12) mcapStr = `$${(quote.marketCap / 1e12).toFixed(2)}T`;
          else if (quote.marketCap >= 1e9) mcapStr = `$${(quote.marketCap / 1e9).toFixed(2)}B`;
          else if (quote.marketCap >= 1e6) mcapStr = `$${(quote.marketCap / 1e6).toFixed(2)}M`;
        }

        let verdict = 'Hold';
        let score = 0;
        let reasoning = "Fairly valued";

        if (quote?.currentPrice) {
          const p = quote.currentPrice;
          const ma50 = quote.fiftyDayAverage || p;
          const ma200 = quote.twoHundredDayAverage || p;
          const high52 = quote.fiftyTwoWeekHigh || p;
          const low52 = quote.fiftyTwoWeekLow || p;
          
          if (p > ma50) score += 1;
          else score -= 1;
          
          if (p > ma200) score += 1;
          else score -= 1;
          
          if (ma50 > ma200) score += 1;
          else score -= 1;
          
          const range = high52 - low52;
          const pos = range > 0 ? (p - low52) / range : 0.5;
          if (pos > 0.8) score -= 1;
          if (pos < 0.2) score += 1;
          
          if (score >= 2) { verdict = 'Strong Buy'; reasoning = "Strong upside momentum with technical breakout."; }
          else if (score === 1) { verdict = 'Buy'; reasoning = "Positive trend alignment across averages."; }
          else if (score === 0) { verdict = 'Hold'; reasoning = "Consolidating, lacks clear directional momentum."; }
          else if (score === -1) { verdict = 'Sell'; reasoning = "Technical weakness, trading below moving averages."; }
          else if (score <= -2) { verdict = 'Strong Sell'; reasoning = "Significant bearish momentum and overextended."; }
        }

        let ytdChange = quote?.changePercent || 0;
        let oneYearChange = quote?.changePercent || 0;
        
        try {
          const now = new Date();
          const janFirst = new Date(now.getFullYear(), 0, 1);
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          
          const hist = await yahooFinanceService.getHistoricalPrices(item.ticker, oneYearAgo.toISOString().split('T')[0]);
          if (hist && hist.length > 0) {
            const currentP = quote?.currentPrice || hist[hist.length - 1].close;
            const oneYearP = hist[0].close;
            oneYearChange = ((currentP - oneYearP) / oneYearP) * 100;
            
            let ytdP = oneYearP;
            for (let i = 0; i < hist.length; i++) {
                if (hist[i].date >= janFirst) {
                    ytdP = hist[i].close;
                    break;
                }
            }
            ytdChange = ((currentP - ytdP) / ytdP) * 100;
          }
        } catch (e) {}

        let newsCrux = "";
        try {
          const articles = await newsApiService.getCompanyNews(item.ticker, true);
          if (articles && articles.length > 0 && articles[0].title) {
             newsCrux = `News: ${articles[0].title}. `;
          }
        } catch (e) {}

        const finalReasoning = `${newsCrux}Technical: ${reasoning}`;

        return {
          id: item.id,
          ticker: item.ticker,
          name: item.ticker,
          price: quote?.currentPrice || 0,
          today: quote?.changePercent || 0,
          ytd: ytdChange,
          oneYear: oneYearChange,
          verdict: verdict,
          reasoning: finalReasoning,
          mcap: mcapStr,
          added: item.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
      })
    );

    return NextResponse.json({ success: true, data: { watchlist: enrichedWatchlist } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: "Unauthorized" } }, { status: 401 });
    }

    let user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses[0]?.emailAddress || `${userId}@placeholder.com`;
      user = await prisma.user.create({
        data: { clerkUserId: userId, email }
      });
    }

    const { ticker } = await req.json();
    if (!ticker) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: "Ticker is required" } }, { status: 400 });
    }

    const existing = await prisma.watchlist.findFirst({
      where: { userId: user.id, ticker }
    });

    if (existing) {
      await prisma.watchlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, added: false });
    } else {
      const watchlistItem = await prisma.watchlist.create({
        data: { userId: user.id, ticker }
      });
      return NextResponse.json({ success: true, added: true });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
