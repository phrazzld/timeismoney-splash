#!/usr/bin/env node

/**
 * Enforces pnpm as the package manager
 * Fails installation if npm or yarn is detected
 */

const isNpm = process.env.npm_execpath && process.env.npm_execpath.includes('npm');
const isYarn = process.env.npm_execpath && process.env.npm_execpath.includes('yarn');
const isPnpm = process.env.npm_execpath && process.env.npm_execpath.includes('pnpm');

if (!isPnpm && (isNpm || isYarn)) {
  console.error(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ERROR: Use pnpm for installing dependencies!                ║
║                                                               ║
║   This project requires pnpm as the package manager.          ║
║                                                               ║
║   To install pnpm:                                            ║
║     npm install -g pnpm                                       ║
║                                                               ║
║   Then run:                                                   ║
║     pnpm install                                              ║
║                                                               ║
║   For more info: https://pnpm.io/installation                 ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
  process.exit(1);
}

// Additional check for direct npm/yarn usage
if (process.env.npm_config_user_agent) {
  const agent = process.env.npm_config_user_agent;
  if (!agent.includes('pnpm')) {
    console.error(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ERROR: Wrong package manager detected!                      ║
║                                                               ║
║   Detected: ${agent.split(' ')[0].padEnd(45)}║
║   Required: pnpm                                              ║
║                                                               ║
║   Please use pnpm to install dependencies:                    ║
║     pnpm install                                              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
    process.exit(1);
  }
}
