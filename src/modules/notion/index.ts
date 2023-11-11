import { Client } from '@notionhq/client';
import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import sequential from 'promise-sequential';
import fs from 'fs';

export class Notion {
  client: Client;
  rootPageId: string;
  constructor() {
    const apiKey = process.env.NOTION_API_KEY;
    const rootPageId = process.env.NOTION_ROOT_PAGE;
    if (!apiKey) {
      throw new Error('Cannot find notion API Key');
    }
    if (!rootPageId) {
      throw new Error('Cannot find notion root page id');
    }
    const notion = new Client({
      auth: apiKey,
    });
    this.client = notion;
    this.rootPageId = rootPageId;
  }
  private async extractTextContentFromBlock(
    block: BlockObjectResponse,
    currentDepth: number,
  ) {
    if (block.type === 'callout') {
      return block.callout.rich_text.map((text) => text.plain_text).join(' ');
    }
    if (block.type === 'paragraph') {
      return block.paragraph.rich_text.map((text) => text.plain_text).join(' ');
    }
    if (block.type === 'heading_1') {
      return block.heading_1.rich_text.map((text) => text.plain_text).join(' ');
    }
    if (block.type === 'heading_2') {
      return block.heading_2.rich_text.map((text) => text.plain_text).join(' ');
    }
    if (block.type === 'heading_3') {
      return block.heading_3.rich_text.map((text) => text.plain_text).join(' ');
    }
    if (block.type === 'bulleted_list_item') {
      return block.bulleted_list_item.rich_text
        .map((text) => text.plain_text)
        .join(' ');
    }
    if (block.type === 'numbered_list_item') {
      return block.numbered_list_item.rich_text
        .map((text) => text.plain_text)
        .join(' ');
    }
    if (block.type === 'to_do') {
      return block.to_do.rich_text.map((text) => text.plain_text).join(' ');
    }
    if (block.type === 'toggle') {
      return block.toggle.rich_text.map((text) => text.plain_text).join(' ');
    }
    if (block.type === 'quote') {
      return block.quote.rich_text.map((text) => text.plain_text).join(' ');
    }
    if (block.type === 'divider') {
      return '';
    }
    if (block.type === 'image') {
      return '';
    }
    if (block.type === 'video') {
      return '';
    }
    if (block.type === 'file') {
      return '';
    }
    if (block.type === 'embed') {
      return '';
    }
    if (block.type === 'pdf') {
      return '';
    }
    if (block.type === 'code') {
      return block.code.rich_text.map((text) => text.plain_text).join(' ');
    }
    if (block.type === 'equation') {
      return '';
    }
    if (block.type === 'bookmark') {
      return block.bookmark.caption.map((c) => c.plain_text).join(' ');
    }
    if (block.type === 'table_of_contents') {
      return '';
    }
    if (block.type === 'breadcrumb') {
      return '';
    }
    if (block.type === 'column_list') {
      return '';
    }
    if (block.type === 'table_row') {
      return block.table_row.cells
        .flatMap((cell) => {
          return cell.map((c) => c.plain_text);
        })
        .join(' ');
    }
    if (block.type === 'child_database') {
      const databases = await this.client.databases.query({
        database_id: block.id,
      });
      const pageIds = databases.results.map((r) => r.id);
      const promises = pageIds.map((pageId) => {
        return async () => {
          return this.extractBlocks(pageId, currentDepth + 1);
        };
      });
      return (await sequential(promises)).join(' ');
    }
    if (block.type === 'child_page') {
      return (await this.extractBlocks(block.id, currentDepth + 1)).join(' ');
    }

    return '';
  }
  public async extractBlocks(
    pageId = this.rootPageId,
    currentDepth = 0,
  ): Promise<string[]> {
    console.log(
      `Extracting block from page ${pageId} (Depth: ${currentDepth})...`,
    );
    // Try to find the result in ${pageId}.txt
    const cachedFileName = `./extracts/${pageId}.txt`;
    if (fs.existsSync(cachedFileName)) {
      console.log(
        `Blocks already exists in cache ${cachedFileName} returning file contents`,
      );
      if (pageId === this.rootPageId) {
        console.log('Finished');
      }
      const cached = fs.readFileSync(cachedFileName).toString().split(' ');
      return cached;
    }
    const [page, blocks] = await Promise.all([
      this.client.pages.retrieve({ page_id: pageId }),
      this.client.blocks.children.list({
        block_id: pageId,
      }),
    ]);

    const promises = blocks.results.map((block) => {
      if (!('type' in block)) {
        return async () => null;
      }
      return async () => {
        return this.extractTextContentFromBlock(block, currentDepth);
      };
    });
    let pageTitle = pageId;
    if ('properties' in page) {
      if ('title' in page.properties) {
        if ('title' in page.properties.title) {
          pageTitle = page.properties.title.title[0].plain_text;
        }
      }
    }
    const finalResults = [pageTitle, ...(await sequential(promises))];
    fs.writeFileSync(`./extracts/${pageId}.txt`, finalResults.join(' '));
    if (pageId === this.rootPageId) {
      console.log('Finished');
    }
    console.log(`Successfully extracted blocks from page ${pageTitle}`);
    return finalResults;
  }
}
