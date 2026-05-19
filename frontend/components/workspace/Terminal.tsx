import { useEffect, useState } from 'react';

export function Terminal() {
  const [output, setOutput] = useState<string[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Simulate terminal output
    const welcomeMsg = 'Welcome to AIOS Terminal\nType "help" for available commands\n';
    setOutput([welcomeMsg]);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Process command
      const newOutput = [...output, `$ ${input}`];

      // Simulate command response
      if (input.trim() === 'help') {
        newOutput.push('Available commands:');
        newOutput.push('  ls - List files');
        newOutput.push('  cd <dir> - Change directory');
        newOutput.push('  clear - Clear terminal');
        newOutput.push('  help - Show this help');
      } else if (input.trim() === 'clear') {
        setOutput(['Terminal cleared. Type "help" for commands']);
        return;
      } else {
        newOutput.push(`Command not found: ${input}`);
        newOutput.push('Type "help" for available commands');
      }

      setOutput(newOutput);
      setInput('');
    }
  };

  return (
    <div className="flex-1 p-4 bg-black text-green-100 font-mono overflow-y-auto">
      <div>
        {output.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
      <div className="mt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-gray-800 text-green-100 border-none outline-none pl-2 pr-2"
          placeholder="$ "
        />
      </div>
    </div>
  );
}