import browser from 'webextension-polyfill';
import { Message, MessageType } from '@/types/messages';
import {
    onMessage,
    sendMessageToTab,
    openSidePanel,
} from '@/services/messaging';

console.log('Worker initialized');

// Listen for app connection to detect when it closes
chrome.runtime.onConnect.addListener(port => {
    if (port.name === 'app') {
        console.log('App connected');

        port.onDisconnect.addListener(async () => {
            console.log('App disconnected, clearing highlights');
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
                console.error(
                    'Failed to clear highlights on disconnect:',
                    error
                );
            }
        });
    }
});

// Handle extension icon click - open app programmatically
browser.action.onClicked.addListener(async tab => {
    console.log('Extension icon clicked');
    try {
        // Open app for the current window
        if (tab.windowId) {
            await chrome.sidePanel.open({ windowId: tab.windowId });
            console.log('App opened successfully');
        }
    } catch (error) {
        console.error('Failed to open app:', error);
    }
});

// Message routing between content scripts and app
onMessage(async (message: Message, sender) => {
    console.log('Worker received message:', message.type, sender);

    switch (message.type) {
        case MessageType.SCAN_COMPLETE:
        case MessageType.SCAN_ERROR:
            // Forward scan results from content scripts to app
            // App will be listening for these messages
            // No action needed here - message will be delivered to all listeners
            break;

        case MessageType.SCAN_REQUEST:
            // Forward scan request from app to content scripts
            if (sender.tab?.id) {
                // Already from content scripts, ignore
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
            // Forward to active tab's content scripts
            const activeTabs = await browser.tabs.query({
                active: true,
                currentWindow: true,
            });
            if (activeTabs[0]?.id) {
                await sendMessageToTab(activeTabs[0].id, message);
            }
            break;

        case MessageType.INSPECT_ELEMENT:
            // Forward from content scripts to app
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
