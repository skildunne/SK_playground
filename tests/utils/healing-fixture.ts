import { test as base, Page, Locator, TestInfo } from '@playwright/test';
import { mcpClient } from './mcp-client';
import * as fs from 'fs';

// Extend the Page type to wrap methods if needed, 
// but Playwright is hard to wrap comprehensively without Proxy.
// A simpler approach for this demo:
// We will wrap the generic `page.click`, `page.fill`, and `locator.blah` is harder.
// BETTER APPROACH: Wrap the high-level `test` steps or use a helper function `heal(page.locator(...))`
// 
// However, to make it seamless, we can key off TestInfo and `test.step`.
//
// But the MOST robust way for a "Drop-in" replacement is to proxy the Page object.

type HealingPage = Page; // In a full impl, we'd add custom properties

export const test = base.extend<{ page: HealingPage }>({
    page: async ({ page }, use, testInfo) => {
        // Proxy the page object to intercept Locator actions?
        // That is complex. Let's try to intercept 'click', 'fill', 'check', etc.

        const originalClick = page.click.bind(page);
        // We actually need to intercept Locators themselves because users use `page.getByRole(...).click()`.
        // Proxifying `page` to intercept `getBy...` methods.

        const proxiedPage = new Proxy(page, {
            get(target, prop, receiver) {
                const originalValue = Reflect.get(target, prop, receiver);

                // Intercept locator creators
                if (typeof originalValue === 'function' && ['getByRole', 'getByText', 'getByLabel', 'locator'].includes(String(prop))) {
                    return function (...args: any[]) {
                        // Create the locator
                        const locator = originalValue.apply(this as any, args);

                        // Proxy the locator to intercept actions (click, fill, etc.)
                        return new Proxy(locator, {
                            get(lTarget, lProp) {
                                const lValue = Reflect.get(lTarget, lProp);
                                if (typeof lValue === 'function' && ['click', 'fill', 'check', 'selectOption'].includes(String(lProp))) {
                                    return async function (...lArgs: any[]) {
                                        try {
                                            return await lValue.apply(this as any, lArgs);
                                        } catch (error: any) {
                                            if (error.name === 'TimeoutError' || error.message.includes('Timeout')) {
                                                console.log(`[Healing] Intercepted Timeout on ${String(lProp)}!`);

                                                // Attempt Healing
                                                // 1. Reconstruct locator string (Approximation)
                                                // Note: Playwright locators don't easily expose their creation string.
                                                // We will approximate it from the arguments we captured above.
                                                const locatorCall = `${String(prop)}(${args.map(a => JSON.stringify(a)).join(', ')})`;

                                                const content = await page.content();
                                                const suggestion = await mcpClient.analyzeFailure(error, locatorCall, content);

                                                if (suggestion) {
                                                    console.log(`[Healing] FIX FOUND: ${suggestion.newLocator}`);

                                                    // Apply Patch to File
                                                    const testFile = testInfo.file; // Absolute path
                                                    const source = fs.readFileSync(testFile, 'utf8');

                                                    // STRICT REPLACEMENT
                                                    // We look for the `oldLocator` string in the file.
                                                    if (source.includes(suggestion.oldLocator)) {
                                                        const newSource = source.replace(suggestion.oldLocator, suggestion.newLocator);
                                                        fs.writeFileSync(testFile, newSource);
                                                        console.log(`[Healing] Patched file: ${testFile}`);

                                                        // Throw a special error to signal the Runner to Re-Run
                                                        throw new Error(`HEALED_LOCATOR_UPDATED: ${suggestion.description}`);
                                                    } else {
                                                        console.log(`[Healing] Could not find strict match for substitution in source.`);
                                                    }
                                                }
                                            }
                                            throw error;
                                        }
                                    };
                                }
                                return lValue;
                            }
                        });
                    };
                }

                return originalValue;
            }
        });

        await use(proxiedPage);
    },
});

export { expect } from '@playwright/test';
