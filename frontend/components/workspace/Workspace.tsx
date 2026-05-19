import { FileExplorer } from './FileExplorer';
import { MonacoEditor } from './MonacoEditor';
import { Terminal } from './Terminal';
import { GitPanel } from './GitPanel';
import { ActivityPanel } from './ActivityPanel';
import { Preview } from './Preview';

export function Workspace() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b">
        <h1 className="text-lg font-bold">AIOS Workspace</h1>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-blue-500 text-white rounded">
            New File
          </button>
          <button className="px-3 py-1 bg-gray-300 rounded">
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 flex flex-col border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold">Explorer</h2>
          </div>
          <FileExplorer />
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-1 overflow-hidden">
            {/* Editor */}
            <div className="flex-1 border-r border-gray-200 dark:border-gray-700">
              <MonacoEditor />
            </div>

            {/* Right Sidebar */}
            <div className="w-64 flex flex-col border-l border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold">Activity</h2>
              </div>
              <ActivityPanel />
            </div>
          </div>

          {/* Bottom Panel */}
          <div className="h-20 flex flex-col border-t border-gray-200 dark:border-gray-700">
            <div className="flex-1 flex overflow-hidden">
              <Terminal />
              <GitPanel />
            </div>
            <Preview />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-10 flex items-center px-3 bg-gray-100 dark:bg-gray-800 border-t text-sm">
        <span className="mr-4">Model: GPT-4</span>
        <span className="mr-4">Tokens: 0</span>
        <span className="mr-4">Status: Ready</span>
        <div className="ml-auto">
          <span className="mr-2">●</span>
          <span>Connected</span>
        </div>
      </div>
    </div>
  );
}