#!/usr/bin/env node

import { Command } from 'commander';
import { connectCommand } from './commands/connect.js';
import { launchCommand } from './commands/launch.js';
import { extractCommand } from './commands/extract.js';

const program = new Command();

program
  .name('browser-tool')
  .description('CLI tool for browser automation and content extraction')
  .version('0.1.0');

program.addCommand(connectCommand);
program.addCommand(launchCommand);
program.addCommand(extractCommand);

program.parse();
