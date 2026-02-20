/**
 * Command line argument parser
 */

interface ParsedArgs {
  transport: 'stdio' | 'sse';
  port: number;
}

export function parseArgs(args: string[]): ParsedArgs {
  const result: ParsedArgs = {
    transport: 'stdio',
    port: 3100
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--transport' && args[i + 1]) {
      result.transport = args[i + 1] as 'stdio' | 'sse';
      i++;
    }
    
    if (arg === '--port' && args[i + 1]) {
      result.port = parseInt(args[i + 1], 10);
      i++;
    }
  }

  return result;
}
