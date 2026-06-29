const yf = require('yahoo-finance2');
const YFClass = yf.default || yf;
const yahooFinance = new YFClass({ suppressNotices: ['yahooSurvey'] });

async function test() {
  try {
    const p1 = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const result = await yahooFinance.chart('^GSPC', { interval: '5m', period1: p1 });
    console.log("Success, data points:", result.quotes.length);
  } catch(e) {
    console.error("Error:", e.message);
  }
}
test();
