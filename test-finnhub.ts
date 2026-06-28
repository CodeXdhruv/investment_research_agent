import { finnhubService } from './src/services/providers/finnhub-service';
import axios from 'axios';

async function run() {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) { console.log("No key"); return; }
  try {
    const res = await axios.get(`https://finnhub.io/api/v1/calendar/ipo?from=2026-06-28&to=2026-07-28&token=${apiKey}`);
    console.log("IPO:", res.data?.ipoCalendar?.length);
  } catch (e: any) { console.log("IPO err:", e.response?.status); }
  
  try {
    const res = await axios.get(`https://finnhub.io/api/v1/calendar/economic?token=${apiKey}`);
    console.log("Eco:", res.data?.economicCalendar?.length);
  } catch (e: any) { console.log("Eco err:", e.response?.status); }
}
run();
