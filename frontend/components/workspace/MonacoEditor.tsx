import { useEffect, useRef } from 'react';
import { Monaco } from '@monaco-editor/react';

export function MonacoEditor() {
  const editorRef = useRef<Monaco | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      // Set initial content
      editorRef.current.getModel()?.setValue('// Welcome to AIOS\n// Start coding here...\n\nfunction main() {\n  console.log("Hello, World!");\n}\n');

      // Set theme to match our dark mode
      editorRef.current.updateOptions({
        theme: 'vs-dark',
        fontSize: 14,
        tabSize: 2
      });
    }
  }, []);

  return (
    <div
      className="flex-1 p-4"
      ref={editorRef}
    >
      {/* Monaco editor will be mounted here */}
    </div>
  );
}