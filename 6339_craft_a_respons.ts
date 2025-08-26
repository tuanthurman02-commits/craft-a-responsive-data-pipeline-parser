// Importing necessary libraries
import * as fs from 'fs';
import * as readline from 'readline';
import { Pipeline, ParseError } from './pipeline';

// Define an interface for pipeline configuration
interface PipelineConfig {
  input: string;
  output: string;
  format: string;
}

// Define a class for the responsive data pipeline parser
class ResponsiveDataPipelineParser {
  private config: PipelineConfig;
  private pipeline: Pipeline;

  constructor(config: PipelineConfig) {
    this.config = config;
    this.pipeline = new Pipeline();
  }

  // Method to parse the input data
  async parse(): Promise<void> {
    const rl = readline.createInterface({
      input: fs.createReadStream(this.config.input),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      try {
        const data = this.pipeline.parse(line, this.config.format);
        console.log(data);
      } catch (error) {
        if (error instanceof ParseError) {
          console.error(`Error parsing line: ${error.message}`);
        } else {
          console.error(`Unexpected error: ${error.message}`);
        }
      }
    });

    rl.on('close', () => {
      console.log('Parsing complete');
    });
  }
}

// Define a class for the pipeline
class Pipeline {
  private steps: ((data: string) => string)[];

  constructor() {
    this.steps = [];
  }

  // Method to add a step to the pipeline
  addStep(step: (data: string) => string): void {
    this.steps.push(step);
  }

  // Method to parse the data
  parse(data: string, format: string): string {
    for (const step of this.steps) {
      data = step(data);
    }
    return data;
  }
}

// Example usage
const config: PipelineConfig = {
  input: 'input.txt',
  output: 'output.txt',
  format: 'json',
};

const parser = new ResponsiveDataPipelineParser(config);
parser.parse();