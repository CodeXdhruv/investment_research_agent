const yf = require('yahoo-finance2');
const YFClass = yf.default || yf;
const yahooFinance = new YFClass({ suppressNotices: ['yahooSurvey'] });

async function test() {
  const p1 = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const res = await yahooFinance.chart('^VIX', { interval: '5m', period1: p1 });
  console.log("VIX data points:", res.quotes.length);
}
test();
