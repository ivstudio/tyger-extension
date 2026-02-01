import browser from 'webextension-polyfill';
import { Message, MessageType } from '@/types/messages';
import { onMessage, sendMessageToTab, openSidePanel } from '@/lib/messaging';

console.log('Background service worker initialized');

// Listen for sidepanel connection to detect when it closes
chrome.runtime.onConnect.addListener(port => {
    if (port.name === 'sidepanel') {
        console.log('Sidepanel connected');

        port.onDisconnect.addListener(async () => {
            console.log('Sidepanel disconnected, clearing highlights');
            try {
                const tabs = await browser.tabs.query({
                    active: true,
                    currentWindow: true,
                });
                if (tabs[0]?.id) {
                    await sendMessageToTab(tabs[0].id, {
                        type: MessageType.CLEAR_HIGHLIGHTS,
                    });
                }
            } catch (error) {
                console.error('Failed to clear highlights on disconnect:', error);
            }
        });
    }
});

// Handle extension icon click - open side panel programmatically
browser.action.onClicked.addListener(async tab => {
    console.log('Extension icon clicked');
    try {
        // Open side panel for the current window
        if (tab.windowId) {
            await chrome.sidePanel.open({ windowId: tab.windowId });
            console.log('Side panel opened successfully');
        }
    } catch (error) {
        console.error('Failed to open side panel:', error);
    }
});

// Message routing between content script and side panel
onMessage(async (message: Message, sender) => {
    console.log('Background received message:', message.type, sender);

    switch (message.type) {
        case MessageType.SCAN_COMPLETE:
        case MessageType.SCAN_ERROR:
            // Forward scan results from content script to side panel
            // Side panel will be listening for these messages
            // No action needed here - message will be delivered to all listeners
            break;

        case MessageType.SCAN_REQUEST:
            // Forward scan request from side panel to content script
            if (sender.tab?.id) {
                // Already from content script, ignore
                break;
            }
            // Get active tab and send scan request
            try {
                const tabs = await browser.tabs.query({
                    active: true,
                    currentWindow: true,
                });
                console.log('Active tabs found:', tabs.length, tabs[0]);

                if (tabs[0]?.id) {
                    console.log(
                        'Sending scan request to tab:',
                        tabs[0].id,
                        tabs[0].url
                    );
                    await sendMessageToTab(tabs[0].id, message);
                    console.log('Scan request sent successfully');
                } else {
                    console.error('No active tab found');
                }
            } catch (error) {
                console.error('Failed to send scan request:', error);
            }
            break;

        case MessageType.HIGHLIGHT_ISSUE:
        case MessageType.CLEAR_HIGHLIGHTS:
        case MessageType.TOGGLE_PICKER:
            // Forward to active tab's content script
            const activeTabs = await browser.tabs.query({
                active: true,
                currentWindow: true,
            });
            if (activeTabs[0]?.id) {
                await sendMessageToTab(activeTabs[0].id, message);
            }
            break;

        case MessageType.INSPECT_ELEMENT:
            // Forward from content script to side panel
            // No action needed - will be delivered to listeners
            break;

        case MessageType.OPEN_SIDEPANEL:
            await openSidePanel();
            break;

        default:
            console.warn('Unknown message type:', (message as any).type);
    }
});

// Handle installation/update
browser.runtime.onInstalled.addListener(async details => {
    if (details.reason === 'install') {
        console.log('Extension installed');
        // Could show welcome page or onboarding here
    } else if (details.reason === 'update') {
        console.log(
            'Extension updated to version:',
            browser.runtime.getManifest().version
        );
    }
});
