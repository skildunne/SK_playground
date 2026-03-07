import { StitchService } from './stitchService';

async function main() {
    const apiKey = 'AQ.Ab8RN6Jkua8KBd0OWamaskkejeSoQJpry2h5C77n0hzgnNoOQw'; // From mcp_config.json
    const service = new StitchService(apiKey);

    console.log('Fetching screens from Stitch...');
    const screens = await service.getScreens();

    console.log(`Found ${screens.length} screens.`);
    for (const screen of screens) {
        console.log(`- [${screen.name}] ${screen.title}`);
    }

    if (screens.length > 0 && screens[0].htmlCode?.downloadUrl) {
        console.log('\nFetching HTML for first screen...');
        const html = await service.fetchAssetContent(screens[0].htmlCode.downloadUrl);
        console.log(`HTML length: ${html.length} characters`);
        console.log('Snippet:', html.substring(0, 100) + '...');
    }
}

main().catch(console.error);
