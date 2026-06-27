import yahooFinance from 'yahoo-finance2';
(async () => {
  const r = await yahooFinance.search('SPY', { newsCount: 5 });
  console.log(JSON.stringify(r.news.map(n => n.title), null, 2));
})();
