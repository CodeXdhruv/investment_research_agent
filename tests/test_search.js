const yahooFinance = require('yahoo-finance2').default;
(async () => {
  const r = await yahooFinance.search("MICRO");
  console.log(JSON.stringify(r.quotes, null, 2));
})();
