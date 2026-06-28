import { financialModelingPrepService } from './src/services/providers/financial-modeling-prep-service';

async function run() {
  console.log("Testing IPO Calendar");
  const ipo = await financialModelingPrepService.getIpoCalendar();
  console.log("IPO length:", ipo?.length);
  
  console.log("Testing Economic Calendar");
  const eco = await financialModelingPrepService.getEconomicCalendar();
  console.log("Eco length:", eco?.length);
}
run();
