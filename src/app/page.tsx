export default function Home() {
  const endpoints = [
    { method: 'POST', path: '/api/v1/research/start', desc: 'Start company research and generate full report' },
    { method: 'GET', path: '/api/v1/research/:id', desc: 'Get a completed research report by ID' },
    { method: 'GET', path: '/api/v1/company/:ticker', desc: 'Get company profile, financials, and peers' },
    { method: 'POST', path: '/api/v1/compare', desc: 'Compare multiple companies and generate a matrix' },
    { method: 'POST', path: '/api/v1/debate', desc: 'Run a Bull vs Bear AI debate for a ticker' },
    { method: 'GET', path: '/api/v1/discover', desc: 'Scan the market and discover investment opportunities' },
    { method: 'GET', path: '/api/v1/watchlist', desc: "Get the current user's watchlist" },
    { method: 'POST', path: '/api/v1/watchlist', desc: 'Add a ticker to the watchlist' },
    { method: 'DELETE', path: '/api/v1/watchlist/:ticker', desc: 'Remove a ticker from the watchlist' },
    { method: 'POST', path: '/api/v1/chat', desc: 'Chat with the RAG system regarding a research report' },
    { method: 'GET', path: '/api/v1/market/trending', desc: 'Get currently trending market symbols' },
    { method: 'GET', path: '/api/v1/market/mood', desc: 'Get general market sentiment from Reddit' },
  ];

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '3rem', maxWidth: '900px', margin: '0 auto', color: '#fff', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#fff' }}>AI Investment Research API</h1>
      <p style={{ color: '#888', marginBottom: '3rem', fontSize: '1.1rem' }}>
        The backend engine is running successfully. Below are the available API routes.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {endpoints.map((ep, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '1.2rem', 
            backgroundColor: '#171717', 
            border: '1px solid #333', 
            borderRadius: '8px' 
          }}>
            <span style={{ 
              display: 'inline-block',
              width: '80px',
              fontWeight: 'bold', 
              color: ep.method === 'GET' ? '#61dafb' : ep.method === 'POST' ? '#4caf50' : '#f44336',
              fontSize: '0.9rem'
            }}>
              {ep.method}
            </span>
            <code style={{ 
              fontSize: '1rem', 
              color: '#ffb86c', 
              flex: 1 
            }}>
              {ep.path}
            </code>
            <span style={{ color: '#aaa', fontSize: '0.9rem', width: '50%' }}>
              {ep.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
