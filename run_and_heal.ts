import { execSync } from 'child_process';
import * as fs from 'fs';

const MAX_RETRIES = 3;

/**
 * Runs Playwright tests.
 * Returns { success: boolean, output: string, healed: boolean }
 */
function runTests(): { success: boolean; output: string; healed: boolean } {
    try {
        console.log("Running Playwright tests...");
        execSync('npx playwright test tests/SK_Playground/scenarios.spec.ts', { stdio: 'pipe', encoding: 'utf-8' });
        return { success: true, output: "", healed: false };
    } catch (error: any) {
        const output = error.stdout + '\n' + error.stderr;
        // Check for our special "HEALED_LOCATOR_UPDATED" signal
        if (output.includes("HEALED_LOCATOR_UPDATED")) {
            return { success: false, output, healed: true };
        }
        return { success: false, output, healed: false };
    }
}

async function main() {
    let attempt = 1;

    while (attempt <= MAX_RETRIES) {
        console.log(`\n--- Attempt ${attempt} ---`);
        const result = runTests();

        if (result.success) {
            console.log("\n✅ Tests Passed!");

            // Check if git status is dirty (meaning we healed previously and now it passes)
            const clean = execSync('git status --porcelain').toString().trim() === '';
            if (!clean) {
                console.log("Committing self-healing fix...");
                execSync('git commit -am "style: auto-fix locator via MCP self-healing"', { stdio: 'inherit' });
                console.log("✅ Fix Committed.");
            }
            process.exit(0);
        } else if (result.healed) {
            console.log("\n⚠️ Self-Healing Triggered! Source code updated. Re-running...");
            attempt++;
        } else {
            console.log("\n❌ Tests Failed (No healing possible or error persists).");
            console.log(result.output);
            process.exit(1);
        }
    }

    console.log("❌ Max retries exceeded.");
    process.exit(1);
}

main();
