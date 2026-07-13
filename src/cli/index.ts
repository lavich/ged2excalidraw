import * as fs from 'fs';
import { parseGedcom } from '../shared/gedcom-parser';
import { assignGenerations } from '../shared/generations';
import { layoutTree } from '../shared/layout';
import { createExcalidraw } from '../shared/excalidraw';

function convert(inputFile: string, outputFile?: string): string {
  if (!outputFile) {
    outputFile = inputFile.replace(/\.\w+$/, '') + '.excalidraw';
  }

  console.log(`Parsing ${inputFile}...`);
  const content = fs.readFileSync(inputFile, 'utf-8');
  const { individuals, families } = parseGedcom(content);
  console.log(`  ${individuals.size} individuals, ${families.size} families`);

  console.log('Computing generations...');
  const generations = assignGenerations(individuals, families);
  console.log(`  ${Math.max(0, ...generations.values()) + 1} generations`);

  console.log('Laying out tree...');
  const positions = layoutTree(individuals, families, generations);

  console.log('Generating Excalidraw file...');
  const excalidraw = createExcalidraw(positions, individuals, families, generations);

  fs.writeFileSync(outputFile, JSON.stringify(excalidraw, null, 2), 'utf-8');
  console.log(`Done → ${outputFile}`);
  return outputFile;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: ged2excalidraw <input.ged> [output.excalidraw]');
  process.exit(1);
}

convert(args[0], args[1]);
