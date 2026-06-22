export class SecFilingsService {
  async getLatestFilings(ticker: string) {
    return [{ type: "10-K", link: "https://sec.gov/..." }];
  }
}

export const secFilingsService = new SecFilingsService();
