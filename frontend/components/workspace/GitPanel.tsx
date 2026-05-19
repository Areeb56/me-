export function GitPanel() {
  const changes = [
    { file: 'src/components/Button.tsx', status: 'modified' },
    { file: 'src/components/Header.tsx', status: 'modified' },
    { file: 'src/utils/helpers.ts', status: 'added' },
    { file: 'src/App.tsx', status: 'deleted' }
  ];

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Git Changes</h2>
      <div className="space-y-2">
        {changes.map((change, index) => (
          <div key={index} className="flex items-center px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <span className="w-8 text-center">
              {change.status === 'modified' ? 'M' :
               change.status === 'added' ? 'A' :
               change.status === 'deleted' ? 'D' : '?'}
            </span>
            <span className="flex-1">{change.file}</span>
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded">
              {change.status === 'modified' ? 'M' :
               change.status === 'added' ? 'A' :
               change.status === 'deleted' ? 'D' : '?'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}