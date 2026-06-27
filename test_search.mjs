import yahooFinance from 'yahoo-finance2';

(async () => {
  try {
    const r = await yahooFinance.search("MICRO");
    console.log(JSON.stringify(r.quotes, null, 2));
  } catch (e) {
    console.error(e);
  }
})();
