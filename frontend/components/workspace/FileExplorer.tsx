import { useState } from 'react';

export function FileExplorer() {
  const [search, setSearch] = useState('');

  const files = [
    { name: 'src', type: 'folder', children: [
      { name: 'components', type: 'folder', children: [
        { name: 'Button.tsx', type: 'file' },
        { name: 'Header.tsx', type: 'file' }
      ]},
      { name: 'utils', type: 'folder', children: [
        { name: 'helpers.ts', type: 'file' }
      ]},
      { name: 'App.tsx', type: 'file' },
      { name: 'main.tsx', type: 'file' }
    ]},
    { name: 'package.json', type: 'file' },
    { name: 'README.md', type: 'file' },
    { name: 'tsconfig.json', type: 'file' }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-2">
      <div className="mb-2">
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="space-y-1">
        {files.map((file) => (
          <div key={file.name} className="flex items-center px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            {file.type === 'folder' ? (
              <>
                <span className="material-icons mr-2">folder</span>
                <span>{file.name}</span>
              </>
            ) : (
              <>
                <span className="material-icons mr-2">insert_drive_file</span>
                <span>{file.name}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}