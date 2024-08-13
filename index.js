#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const { convertVE3ToReact } = require('./convert');

const program = new Command();

program
  .version('1.0.0')
  .description('CLI tool to convert VE3 code to React with hooks and performance optimizations')
  .argument('<input>', 'Input VE3 file')
  .argument('<output>', 'Output React file')
  .action((input, output) => {
    const inputPath = path.resolve(input);
    const outputPath = path.resolve(output);

    if (!fs.existsSync(inputPath)) {
      console.error(`Input file ${inputPath} does not exist.`);
      process.exit(1);
    }

    const ve3Code = fs.readFileSync(inputPath, 'utf8');
    const reactCode = convertVE3ToReact(ve3Code);

    fs.writeFileSync(outputPath, reactCode);
    console.log(`Converted VE3 code written to ${outputPath}`);
  });

program.parse(process.argv);
