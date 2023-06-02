#!/usr/bin/env node

const path = require('path');
const contentfulImport = require('contentful-import');
const dotenv = require('dotenv');

dotenv.config();

const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN || process.argv[2];
const spaceId = process.env.CONTENTFUL_SPACE_ID || process.argv[3];

if (!managementToken || !spaceId) {
    console.error('Contentful management token or space ID were not provided.\n\nUsage:\n./import.js <managementToken> <spaceId>\n');
    process.exit(1);
}

const options = {
    contentFile: path.join(__dirname, 'export.json'),
    spaceId: spaceId,
    managementToken: managementToken,
    uploadAssets: true,
    assetsDirectory: __dirname
};

contentfulImport(options)
    .then(() => {
        console.log('Data imported successfully');
    })
    .catch((error) => {
        console.error('Error importing content:', error);
    });
