import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChecklistItem } from './ChecklistItem';
import type { ChecklistItem as ChecklistItemType } from '@/types/checklist';

describe('ChecklistItem - Click to Highlight', () => {
    const mockItem: ChecklistItemType = {
        id: 'test-item-1',
        title: 'Test checklist item',
        description: 'This is a test description',
        status: 'pending',
    };

    it('should call onClick when item title is clicked', () => {
        const onClickMock = vi.fn();
        const onStatusChangeMock = vi.fn();

        render(
            <ChecklistItem
                item={mockItem}
                onStatusChange={onStatusChangeMock}
                onClick={onClickMock}
            />
        );

        const title = screen.getByText('Test checklist item');
        fireEvent.click(title);

        expect(onClickMock).toHaveBeenCalledTimes(1);
        expect(onStatusChangeMock).not.toHaveBeenCalled();
    });

    it('should call onClick when item description is clicked', () => {
        const onClickMock = vi.fn();
        const onStatusChangeMock = vi.fn();

        render(
            <ChecklistItem
                item={mockItem}
                onStatusChange={onStatusChangeMock}
                onClick={onClickMock}
            />
        );

        const description = screen.getByText('This is a test description');
        fireEvent.click(description);

        expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('should show hover cursor when onClick is provided', () => {
        const onClickMock = vi.fn();
        const onStatusChangeMock = vi.fn();

        render(
            <ChecklistItem
                item={mockItem}
                onStatusChange={onStatusChangeMock}
                onClick={onClickMock}
            />
        );

        const title = screen.getByText('Test checklist item');
        const parent = title.parentElement;

        expect(parent).toHaveClass('cursor-pointer');
    });

    it('should not show hover cursor when onClick is not provided', () => {
        const onStatusChangeMock = vi.fn();

        render(
            <ChecklistItem
                item={mockItem}
                onStatusChange={onStatusChangeMock}
            />
        );

        const title = screen.getByText('Test checklist item');
        const parent = title.parentElement;

        expect(parent).not.toHaveClass('cursor-pointer');
    });

    it('should not call onClick when status button is clicked', () => {
        const onClickMock = vi.fn();
        const onStatusChangeMock = vi.fn();

        render(
            <ChecklistItem
                item={mockItem}
                onStatusChange={onStatusChangeMock}
                onClick={onClickMock}
            />
        );

        // Click the pass button
        const passButton = screen.getByTitle('Pass');
        fireEvent.click(passButton);

        // Should call status change, not onClick
        expect(onStatusChangeMock).toHaveBeenCalledWith(
            'test-item-1',
            'pass',
            ''
        );
        expect(onClickMock).not.toHaveBeenCalled();
    });

    it('should work with incomplete check items', () => {
        const incompleteItem: ChecklistItemType = {
            id: 'incomplete-check-1',
            title: 'Image missing alt text',
            description: 'Verify if this image needs alternative text',
            status: 'pending',
            notes: 'This issue requires manual verification',
        };

        const onClickMock = vi.fn();
        const onStatusChangeMock = vi.fn();

        render(
            <ChecklistItem
                item={incompleteItem}
                onStatusChange={onStatusChangeMock}
                onClick={onClickMock}
            />
        );

        const title = screen.getByText('Image missing alt text');
        fireEvent.click(title);

        expect(onClickMock).toHaveBeenCalledTimes(1);
    });
});
