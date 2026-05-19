export function SettingsDashboard() {
  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-[--muted-foreground:rgb(160,160,160)]">Configure your AIOS environment</p>
      </div>
      
      <div className="space-y-6">
        {/* Model Settings */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">AI Models</h2>
          <div className="gap-4">
            <div className="glass-card p-4">
              <h3 className="font-medium">Primary Model</h3>
              <select className="mt-2 w-full p-2 border rounded">
                <option>GPT-4o</option>
                <option>Claude 3.5 Sonnet</option>
                <option>Gemini Pro</option>
                <option>Llama 3</option>
                <option>DeepSeek R1</option>
              </select>
            </div>

            <div className="glass-card p-4">
              <h3 className="font-medium">Fallback Model</h3>
              <select className="mt-2 w-full p-2 border rounded">
                <option>Ollama Llama 3</option>
                <option>Local Model</option>
              </select>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">API Keys</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="w-32">OpenAI:</span>
              <input type="password" className="flex-1 p-2 border rounded" placeholder="sk-..." />
            </div>
            <div className="flex items-center">
              <span className="w-32">Anthropoic:</span>
              <input type="password" className="flex-1 p-2 border rounded" placeholder="sk-ant-..." />
            </div>
            <div className="flex items-center">
              <span className="w-32">Google:</span>
              <input type="password" className="flex-1 p-2 border rounded" placeholder="AIza..." />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">System</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="w-32">Theme:</span>
              <select className="w-full p-2 border rounded">
                <option>Dark</option>
                <option>Light</option>
                <option>System</option>
              </select>
            </div>
            <div className="flex items-center">
              <span className="w-32">Auto-save:</span>
              <input type="checkbox" className="w-4 h-4" checked />
            </div>
            <div className="flex items-center">
              <span className="w-32">Telemetry:</span>
              <input type="checkbox" className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button className="px-6 py-3 bg-[--primary:rgb(59,130,246)] hover:bg-[--primary-hover:rgb(29,78,216)] text-white rounded hover:bg-[--primary-hover:rgb(29,78,216)]">
          Save Settings
        </button>
        <button className="ml-4 px-6 py-3 bg-[--muted:rgb(24,24,27)] text-[--muted-foreground:rgb(160,160,160)] rounded hover:bg-[--muted-hover:rgb(32,32,35)]">
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}