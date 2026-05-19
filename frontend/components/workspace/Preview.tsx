export function Preview() {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Live Preview</h2>
        <div className="ml-auto">
          <button className="px-3 py-1 bg-blue-500 text-white rounded">
            Open in New Tab
          </button>
        </div>
      </div>
      <div className="flex-1 p-4">
        <div className="w-full h-64 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center">
          <div className="text-gray-400 dark:text-gray-500">
            <span className="material-icons">remove_red_eye</span>
            <span className="ml-2">Preview will appear here</span>
          </div>
        </div>
      </div>
    </div>
  );
}