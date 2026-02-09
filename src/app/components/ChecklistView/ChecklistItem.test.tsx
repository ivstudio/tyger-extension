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

describe('ChecklistItem - Status buttons', () => {
    const mockItem: ChecklistItemType = {
        id: 'item-1',
        title: 'Test item',
        description: 'Test description',
        status: 'pending',
    };

    it('should call onStatusChange with pass when Pass button clicked', () => {
        const onStatusChangeMock = vi.fn();
        render(
            <ChecklistItem
                item={mockItem}
                onStatusChange={onStatusChangeMock}
            />
        );
        fireEvent.click(screen.getByTitle('Pass'));
        expect(onStatusChangeMock).toHaveBeenCalledWith('item-1', 'pass', '');
    });

    it('should call onStatusChange with fail when Fail button clicked', () => {
        const onStatusChangeMock = vi.fn();
        render(
            <ChecklistItem
                item={mockItem}
                onStatusChange={onStatusChangeMock}
            />
        );
        fireEvent.click(screen.getByTitle('Fail'));
        expect(onStatusChangeMock).toHaveBeenCalledWith('item-1', 'fail', '');
    });

    it('should call onStatusChange with skip when Skip button clicked', () => {
        const onStatusChangeMock = vi.fn();
        render(
            <ChecklistItem
                item={mockItem}
                onStatusChange={onStatusChangeMock}
            />
        );
        fireEvent.click(screen.getByTitle('Skip'));
        expect(onStatusChangeMock).toHaveBeenCalledWith('item-1', 'skip', '');
    });

    it('should show notes section and Add notes when status is not pending', () => {
        const itemWithStatus: ChecklistItemType = {
            ...mockItem,
            id: 'item-2',
            status: 'pass',
        };
        render(
            <ChecklistItem item={itemWithStatus} onStatusChange={vi.fn()} />
        );
        expect(screen.getByText('Add notes')).toBeInTheDocument();
    });

    it('should toggle to Hide notes when Add notes is clicked', () => {
        const itemWithStatus: ChecklistItemType = {
            ...mockItem,
            id: 'item-3',
            status: 'fail',
        };
        render(
            <ChecklistItem item={itemWithStatus} onStatusChange={vi.fn()} />
        );
        fireEvent.click(screen.getByText('Add notes'));
        expect(screen.getByText('Hide notes')).toBeInTheDocument();
    });

    it('should call onStatusChange with notes when textarea is changed', () => {
        const itemWithStatus: ChecklistItemType = {
            ...mockItem,
            id: 'item-4',
            status: 'pass',
        };
        const onStatusChangeMock = vi.fn();
        render(
            <ChecklistItem
                item={itemWithStatus}
                onStatusChange={onStatusChangeMock}
            />
        );
        fireEvent.click(screen.getByText('Add notes'));
        const textarea = screen.getByPlaceholderText(
            'Add notes about this check...'
        );
        fireEvent.change(textarea, { target: { value: 'My note' } });
        expect(onStatusChangeMock).toHaveBeenCalledWith(
            'item-4',
            'pass',
            'My note'
        );
    });

    it('should display existing note when notes exist and showNotes is false', () => {
        const itemWithNotes: ChecklistItemType = {
            ...mockItem,
            id: 'item-5',
            status: 'pass',
            notes: 'Existing verification note',
        };
        render(<ChecklistItem item={itemWithNotes} onStatusChange={vi.fn()} />);
        expect(
            screen.getByText('Note: Existing verification note')
        ).toBeInTheDocument();
    });

    it('should initialize notes from item.notes', () => {
        const itemWithNotes: ChecklistItemType = {
            ...mockItem,
            id: 'item-6',
            status: 'skip',
            notes: 'Pre-filled note',
        };
        render(<ChecklistItem item={itemWithNotes} onStatusChange={vi.fn()} />);
        fireEvent.click(screen.getByText('Add notes'));
        const textarea = screen.getByPlaceholderText(
            'Add notes about this check...'
        );
        expect(textarea).toHaveValue('Pre-filled note');
    });
});
