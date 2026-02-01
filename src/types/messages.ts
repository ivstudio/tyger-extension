import { z } from 'zod';

export const MessageType = {
    SCAN_REQUEST: 'SCAN_REQUEST',
    SCAN_COMPLETE: 'SCAN_COMPLETE',
    SCAN_ERROR: 'SCAN_ERROR',
    HIGHLIGHT_ISSUE: 'HIGHLIGHT_ISSUE',
    CLEAR_HIGHLIGHTS: 'CLEAR_HIGHLIGHTS',
    TOGGLE_PICKER: 'TOGGLE_PICKER',
    INSPECT_ELEMENT: 'INSPECT_ELEMENT',
    UPDATE_ISSUE_STATUS: 'UPDATE_ISSUE_STATUS',
    OPEN_SIDEPANEL: 'OPEN_SIDEPANEL',
} as const;

export type MessageTypeKeys = keyof typeof MessageType;

export const ScanRequestSchema = z.object({
    type: z.literal(MessageType.SCAN_REQUEST),
    data: z.object({
        url: z.string(),
        runId: z.string().optional(),
    }),
});

export const ScanCompleteSchema = z.object({
    type: z.literal(MessageType.SCAN_COMPLETE),
    data: z.object({
        result: z.any(), // ScanResult - using any to avoid circular type issues
        runId: z.string().optional(),
    }),
});

export const ScanErrorSchema = z.object({
    type: z.literal(MessageType.SCAN_ERROR),
    data: z.object({
        error: z.string(),
        runId: z.string().optional(),
    }),
});

export const HighlightIssueSchema = z.object({
    type: z.literal(MessageType.HIGHLIGHT_ISSUE),
    data: z.object({
        issueId: z.string(),
    }),
});

export const ClearHighlightsSchema = z.object({
    type: z.literal(MessageType.CLEAR_HIGHLIGHTS),
});

export const TogglePickerSchema = z.object({
    type: z.literal(MessageType.TOGGLE_PICKER),
    data: z.object({
        enabled: z.boolean(),
    }),
});

export const InspectElementSchema = z.object({
    type: z.literal(MessageType.INSPECT_ELEMENT),
    data: z.object({
        selector: z.string(),
        elementInfo: z.record(z.string(), z.any()),
    }),
});

export const UpdateIssueStatusSchema = z.object({
    type: z.literal(MessageType.UPDATE_ISSUE_STATUS),
    data: z.object({
        issueId: z.string(),
        status: z.enum([
            'open',
            'fixed',
            'ignored',
            'needs-design',
            'false-positive',
        ]),
        notes: z.string().optional(),
    }),
});

export const OpenSidePanelSchema = z.object({
    type: z.literal(MessageType.OPEN_SIDEPANEL),
});

// Union type for all messages
export const MessageSchema = z.discriminatedUnion('type', [
    ScanRequestSchema,
    ScanCompleteSchema,
    ScanErrorSchema,
    HighlightIssueSchema,
    ClearHighlightsSchema,
    TogglePickerSchema,
    InspectElementSchema,
    UpdateIssueStatusSchema,
    OpenSidePanelSchema,
]);

export type Message = z.infer<typeof MessageSchema>;
export type ScanRequestMessage = z.infer<typeof ScanRequestSchema>;
export type ScanCompleteMessage = z.infer<typeof ScanCompleteSchema>;
export type ScanErrorMessage = z.infer<typeof ScanErrorSchema>;
export type HighlightIssueMessage = z.infer<typeof HighlightIssueSchema>;
export type ClearHighlightsMessage = z.infer<typeof ClearHighlightsSchema>;
export type TogglePickerMessage = z.infer<typeof TogglePickerSchema>;
export type InspectElementMessage = z.infer<typeof InspectElementSchema>;
export type UpdateIssueStatusMessage = z.infer<typeof UpdateIssueStatusSchema>;
export type OpenSidePanelMessage = z.infer<typeof OpenSidePanelSchema>;
