import { useState, useEffect } from 'react';

export function Browser() {
  const [url, setUrl] = useState('https://example.com');
  const [loading, setLoading] = useState(false);
  const [screenshot, setScreenshot] = useState(null);

  const navigate = async () => {
    setLoading(true);
    // In a real implementation, this would communicate with the backend
    // to control the browser and get a screenshot
    setTimeout(() => {
      setLoading(false);
      // Simulate getting a screenshot
      setScreenshot('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmZmYiLz48dGV4dCB4PSIyMDAiIHk9IjE1MCIgZm9udC1zaXplPSIyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2NyZWVuc2hvdDwvdGV4dD48L3N2Zz4=');
    }, 1000);
  };

  useEffect(() => {
    navigate();
  }, []);

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold">AI Browser</h2>
        <div className="flex items-center mt-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && navigate()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter URL..."
          />
          <button onClick={navigate} disabled={loading} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
            {loading ? 'Loading...' : 'Go'}
          </button>
        </div>
      </div>
      <div className="border border-gray-300 rounded">
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : screenshot ? (
          <img src={screenshot} alt="Browser screenshot" className="w-full h-96 object-contain" />
        ) : (
          <div className="h-96 flex items-center justify-center">
            <div className="text-gray-500">Browser view will appear here</div>
          </div>
        )}
      </div>
    </div>
  );
}