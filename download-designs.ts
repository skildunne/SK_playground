import fs from 'fs';
import path from 'path';
import { StitchService } from './stitchService';

async function main() {
    const apiKey = 'AQ.Ab8RN6Jkua8KBd0OWamaskkejeSoQJpry2h5C77n0hzgnNoOQw'; // From mcp_config.json
    const service = new StitchService(apiKey);

    console.log('Fetching screens from Stitch...');
    const screens = await service.getScreens();

    const publicDir = path.join(__dirname, 'sports-exchange-app', 'public', 'designs');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    console.log(`Found ${screens.length} screens.`);
    for (const screen of screens) {
        if (screen.htmlCode?.downloadUrl) {
            console.log(`Downloading HTML for ${screen.title}...`);
            const html = await service.fetchAssetContent(screen.htmlCode.downloadUrl);
            const filename = screen.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.html';
            fs.writeFileSync(path.join(publicDir, filename), html);
            console.log(`Saved ${filename}`);
        }
    }
}

main().catch(console.error);
