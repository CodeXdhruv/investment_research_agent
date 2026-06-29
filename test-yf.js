const yf = require('yahoo-finance2').default;
async function test() {
  try {
    const gainers = await yf.dailyGainers({ count: 5 });
    console.log("Gainers:", gainers.quotes[0].symbol);
  } catch (e) {
    console.error(e.message);
  }
}
test();
