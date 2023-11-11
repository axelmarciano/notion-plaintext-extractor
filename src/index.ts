import * as dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import { Notion } from './modules/notion';

async function init() {
  const notion = new Notion();
  await notion.extractBlocks();
}

init();
