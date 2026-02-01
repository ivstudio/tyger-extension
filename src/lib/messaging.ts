import browser from 'webextension-polyfill';
import { Message, MessageSchema } from '@/types/messages';

/**
 * Type-safe message sending with runtime validation
 */
export async function sendMessage<T extends Message>(message: T): Promise<any> {
    try {
        // Validate message before sending
        MessageSchema.parse(message);
        return await browser.runtime.sendMessage(message);
    } catch (error) {
        console.error('Invalid message format:', error);
        throw error;
    }
}

/**
 * Type-safe message sending to specific tab
 */
export async function sendMessageToTab<T extends Message>(
    tabId: number,
    message: T
): Promise<any> {
    try {
        MessageSchema.parse(message);
        return await browser.tabs.sendMessage(tabId, message);
    } catch (error) {
        console.error('Invalid message format:', error);
        throw error;
    }
}

/**
 * Set up message listener with type validation.
 * Returns an unsubscribe function so callers can remove the listener (e.g. in useEffect cleanup).
 */
export function onMessage<T extends Message>(
    handler: (
        message: T,
        sender: browser.Runtime.MessageSender
    ) => Promise<any> | any
): () => void {
    const listener = (
        message: unknown,
        sender: browser.Runtime.MessageSender
    ): Promise<any> => {
        try {
            const validatedMessage = MessageSchema.parse(message) as T;
            const result = handler(validatedMessage, sender);
            if (result instanceof Promise) return result;
            return Promise.resolve(result);
        } catch (error) {
            console.error('Message validation failed:', error);
            return Promise.resolve(null);
        }
    };
    browser.runtime.onMessage.addListener(listener);
    return () => browser.runtime.onMessage.removeListener(listener);
}

/**
 * Get active tab
 */
export async function getActiveTab(): Promise<browser.Tabs.Tab | undefined> {
    const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
    });
    return tabs[0];
}

/**
 * Open side panel for current window
 */
export async function openSidePanel(): Promise<void> {
    const window = await browser.windows.getCurrent();
    if (window.id && (chrome as any).sidePanel) {
        await (chrome as any).sidePanel.open({ windowId: window.id });
    }
}
