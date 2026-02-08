/**
 * Metadata for specific axe-core rules
 * Use this to add custom notes, warnings, or context for rules that have known limitations
 */

export interface RuleMetadata {
    /**
     * Additional note to display to users about this rule
     */
    note?: string;
    /**
     * Whether this rule requires manual validation
     */
    requiresManualValidation?: boolean;
    /**
     * Known issues or limitations with this rule
     */
    knownIssues?: string[];
}

/**
 * Rule-specific metadata configuration
 * Add entries here for rules that need special handling or user context
 */
export const RULE_METADATA: Record<string, RuleMetadata> = {
    'color-contrast': {
        note: 'Complex backgrounds (images, gradients, overlays) can cause false positives. If this looks fine to you, verify with a contrast checker.',
        requiresManualValidation: true,
        knownIssues: [
            'Transparent overlays may cause incorrect contrast calculations',
            'Background images cannot be reliably assessed',
            'CSS positioning can confuse background detection',
        ],
    },
    // Add more rules here as needed
    // Example:
    // 'image-alt': {
    //     note: 'Decorative images should have empty alt text (alt="")',
    //     requiresManualValidation: false,
    // },
};

/**
 * Get metadata for a specific rule
 */
export function getRuleMetadata(ruleId: string): RuleMetadata | undefined {
    return RULE_METADATA[ruleId];
}

/**
 * Check if a rule requires manual validation
 */
export function requiresManualValidation(ruleId: string): boolean {
    return RULE_METADATA[ruleId]?.requiresManualValidation ?? false;
}

/**
 * Get note for a specific rule
 */
export function getRuleNote(ruleId: string): string | undefined {
    return RULE_METADATA[ruleId]?.note;
}
