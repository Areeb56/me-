import { useEffect, useState } from 'react';

export function ActivityPanel() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Simulate activity feed
    const initialActivities = [
      { id: 1, agent: 'CodingAI', action: 'Created file: src/components/Button.tsx', timestamp: new Date(Date.now() - 5 * 60 * 1000) },
      { id: 2, agent: 'TerminalAI', action: 'Ran: npm install', timestamp: new Date(Date.now() - 4 * 60 * 1000) },
      { id: 3, agent: 'ResearchAI', action: 'Researched: React 18 new features', timestamp: new Date(Date.now() - 3 * 60 * 1000) },
      { id: 4, agent: 'BrowserAI', action: 'Visited: https://react.dev', timestamp: new Date(Date.now() - 2 * 60 * 1000) },
      { id: 5, agent: 'CodingAI', action: 'Updated file: src/App.tsx', timestamp: new Date(Date.now() - 60 * 1000) }
    ];

    setActivities(initialActivities);
  }, []);

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded">
                {activity.agent === 'CodingAI' ? '</>' :
                 activity.agent === 'TerminalAI' ? '>_':
                 activity.agent === 'BrowserAI' ? '🌐':
                 activity.agent === 'ResearchAI' ? '🔍':
                 activity.agent === 'DeploymentAI' ? '🚀':
                 activity.agent === 'GitHubAI' ? '🐙':
                 activity.agent === 'EmailAI' ? '📧':
                 '🧠'}
              </div>
            </div>
            <div className="flex-1">
              <p className="font-medium">{activity.agent}</p>
              <p className="text-sm text-gray-600">{activity.action}</p>
              <p className="text-xs text-gray-400">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}