# Notion Plain Text Extractor for Custom ChatGPT Training

This tool is specifically designed for extracting plain text from Notion pages, including child pages and databases. Its primary function is to facilitate the creation of knowledge databases (knowledges) for customizing and training versions of AI models like ChatGPT. By providing a streamlined method to gather and organize text data from Notion, this tool aids in compiling diverse and comprehensive datasets, which are crucial for training effective and well-informed AI models.

## Configuration

1. Create a `.env` file at the root of the project.
2. In this file, add your Notion API key and the root page ID as follows:
    ```
    NOTION_API_KEY=your_api_key
    NOTION_ROOT_PAGE=your_page_id
    ```

## Installation

Run the following command to install the necessary dependencies:

```bash
npm install

## Start extraction

```bash
npm start

## Retrieve the .txt file

The text file should be available at /extract/{ROOT_PAGE_ID}.txt