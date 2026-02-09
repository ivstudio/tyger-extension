import { describe, it, expect } from 'vitest';
import {
    getRuleMetadata,
    requiresManualValidation,
    getRuleNote,
    RULE_METADATA,
} from './ruleMetadata';

describe('ruleMetadata', () => {
    describe('getRuleMetadata', () => {
        it('returns metadata for known rule', () => {
            const meta = getRuleMetadata('color-contrast');

            expect(meta).toBeDefined();
            expect(meta?.note).toContain('Complex backgrounds');
            expect(meta?.requiresManualValidation).toBe(true);
            expect(meta?.knownIssues).toHaveLength(3);
        });

        it('returns undefined for unknown rule', () => {
            expect(getRuleMetadata('unknown-rule')).toBeUndefined();
        });

        it('returns undefined for empty string', () => {
            expect(getRuleMetadata('')).toBeUndefined();
        });
    });

    describe('requiresManualValidation', () => {
        it('returns true for rule that requires manual validation', () => {
            expect(requiresManualValidation('color-contrast')).toBe(true);
        });

        it('returns false for unknown rule', () => {
            expect(requiresManualValidation('unknown-rule')).toBe(false);
        });

        it('returns false when rule has requiresManualValidation false', () => {
            expect(requiresManualValidation('image-alt')).toBe(false);
        });
    });

    describe('getRuleNote', () => {
        it('returns note for known rule', () => {
            const note = getRuleNote('color-contrast');

            expect(note).toBeDefined();
            expect(note).toContain('Complex backgrounds');
            expect(note).toContain('contrast checker');
        });

        it('returns undefined for unknown rule', () => {
            expect(getRuleNote('unknown-rule')).toBeUndefined();
        });
    });

    describe('RULE_METADATA', () => {
        it('exposes color-contrast entry with expected shape', () => {
            const entry = RULE_METADATA['color-contrast'];

            expect(entry).toBeDefined();
            expect(entry.note).toBeDefined();
            expect(entry.requiresManualValidation).toBe(true);
            expect(Array.isArray(entry.knownIssues)).toBe(true);
        });
    });
});
