export function Agents() {
  const agents = [
    { id: 1, name: 'CodingAI', status: 'idle', type: 'coder', description: 'Writes and edits code' },
    { id: 2, name: 'TerminalAI', status: 'idle', type: 'terminal', description: 'Executes terminal commands' },
    { id: 3, name: 'BrowserAI', status: 'idle', type: 'browser', description: 'Controls web browser' },
    { id: 4, name: 'ResearchAI', status: 'idle', type: 'research', description: 'Researches and summarizes information' },
    { id: 5, name: 'DeploymentAI', status: 'idle', type: 'deploy', description: 'Handles deployment processes' },
    { id: 6, name: 'GitHubAI', status: 'idle', type: 'github', description: 'Manages GitHub operations' },
    { id: 7, name: 'EmailAI', status: 'idle', type: 'email', description: 'Sends and manages emails' },
    { id: 8, name: 'MemoryAI', status: 'idle', type: 'memory', description: 'Manages memory and context' }
  ];

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold">AI Agents</h2>
        <div className="flex flex-wrap gap-2 mt-2">
          <button className="px-3 py-1 bg-blue-500 text-white rounded">
            Start New Task
          </button>
          <button className="px-3 py-1 bg-gray-300 rounded">
            Agent Settings
          </button>
        </div>
      </div>
      <div className="grid gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded">
                  {agent.type === 'coder' ? '</>' :
                   agent.type === 'terminal' ? '>_':
                   agent.type === 'browser' ? '🌐':
                   agent.type === 'research' ? '🔍':
                   agent.type === 'deploy' ? '🚀':
                   agent.type === 'github' ? '🐙':
                   agent.type === 'email' ? '📧':
                   '🧠'}
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold">{agent.name}</h3>
                  <p className="text-sm text-gray-500">{agent.description}</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full text-xs">
                {agent.status === 'idle' ? '● Idle' :
                 agent.status === 'running' ? '● Running' :
                 agent.status === 'completed' ? '● Done' :
                 agent.status === 'error' ? '● Error' : '● Unknown'}
              </div>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded">
              <div className="h-2 bg-blue-500 rounded" style={{ width: '50%' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}