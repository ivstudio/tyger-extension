import browser from 'webextension-polyfill';
import { Message, MessageType } from '@/types/messages';
import {
    onMessage,
    sendMessage,
    sendMessageToTab,
    openSidePanel,
} from '@/services/messaging';

const appPorts = new Set<chrome.runtime.Port>();

function sendCurrentUrlToApp(url: string): void {
    const msg = {
        type: MessageType.CURRENT_URL_UPDATE,
        data: { url },
    };
    sendMessage(msg).catch(err =>
        console.error('Failed to send current URL to app:', err)
    );
    appPorts.forEach(p => {
        try {
            p.postMessage(msg);
        } catch {
            appPorts.delete(p);
        }
    });
}

async function broadcastCurrentUrl(): Promise<void> {
    try {
        let tabs = await browser.tabs.query({
            active: true,
            currentWindow: true,
        });
        if (!tabs[0]?.url) {
            tabs = await browser.tabs.query({
                active: true,
                lastFocusedWindow: true,
            });
        }
        const url = tabs[0]?.url ?? null;
        if (url) {
            sendCurrentUrlToApp(url);
        }
    } catch (error) {
        console.error('Failed to broadcast current URL:', error);
    }
}

chrome.runtime.onConnect.addListener(port => {
    if (port.name === 'app') {
        appPorts.add(port);
        broadcastCurrentUrl();
        port.onDisconnect.addListener(async () => {
            appPorts.delete(port);
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
            if (sender.tab) {
                const clone =
                    message.type === MessageType.SCAN_COMPLETE
                        ? {
                              type: MessageType.SCAN_COMPLETE,
                              data: {
                                  result: message.data.result,
                                  runId: message.data.runId,
                              },
                          }
                        : {
                              type: MessageType.SCAN_ERROR,
                              data: {
                                  error: message.data.error,
                                  runId: message.data.runId,
                              },
                          };
                appPorts.forEach(p => {
                    try {
                        p.postMessage(clone);
                    } catch {
                        appPorts.delete(p);
                    }
                });
                await sendMessage(clone);
            }
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
        case MessageType.TOGGLE_PICKER: {
            // Forward to active tab's content scripts
            const activeTabs = await browser.tabs.query({
                active: true,
                currentWindow: true,
            });
            if (activeTabs[0]?.id) {
                await sendMessageToTab(activeTabs[0].id, message);
            }
            break;
        }

        case MessageType.INSPECT_ELEMENT:
            // Forward from content scripts to app
            // No action needed - will be delivered to listeners
            break;

        case MessageType.OPEN_SIDEPANEL:
            await openSidePanel();
            break;

        case MessageType.GET_CURRENT_URL:
            await broadcastCurrentUrl();
            break;

        default:
            console.warn('Unknown message type:', message.type);
    }
});

browser.tabs.onActivated.addListener(() => {
    broadcastCurrentUrl();
});

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    const urlChanged = Boolean(changeInfo.url);
    const loadComplete = changeInfo.status === 'complete';
    if (!urlChanged && !loadComplete) return;

    const activeTabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
    });

    if (activeTabs[0]?.id !== tabId) return;

    const urlToSend = changeInfo.url ?? tab.url ?? null;
    if (urlToSend) {
        sendCurrentUrlToApp(urlToSend);
    }
});

browser.webNavigation.onCommitted.addListener(async details => {
    if (details.frameId !== 0) return;
    const activeTabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
    });
    if (activeTabs[0]?.id === details.tabId && details.url) {
        sendCurrentUrlToApp(details.url);
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
