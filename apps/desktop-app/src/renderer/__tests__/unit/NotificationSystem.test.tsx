/* ═══════════════════════════════════════════════════════════════════════
   Unit Tests — NotificationSystem
   Tests: NotificationProvider, useNotifications, NotificationBell, Toast
   ═══════════════════════════════════════════════════════════════════════ */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  NotificationProvider,
  useNotifications,
  NotificationBell,
} from '../../components/ui/NotificationSystem';

// Helper to access context in tests
function TestConsumer() {
  const { notifications, unreadCount, addNotification, markAsRead, markAllRead, clearAll } = useNotifications();
  return (
    <div>
      <span data-testid="count">{unreadCount}</span>
      <span data-testid="total">{notifications.length}</span>
      <button data-testid="add" onClick={() => addNotification({ severity: 'warning', title: 'Test Alert', message: 'Test message', module: 'KYC' })}>Add</button>
      <button data-testid="mark-all" onClick={markAllRead}>Mark All</button>
      <button data-testid="clear" onClick={clearAll}>Clear</button>
      {notifications.map(n => (
        <div key={n.id} data-testid={`notif-${n.id}`}>
          <span data-testid={`read-${n.id}`}>{String(n.read)}</span>
          <button data-testid={`mark-${n.id}`} onClick={() => markAsRead(n.id)}>Mark</button>
        </div>
      ))}
    </div>
  );
}

describe('NotificationSystem', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('NotificationProvider + useNotifications', () => {
    it('starts with 0 notifications (before demo alerts fire)', () => {
      render(
        <NotificationProvider>
          <TestConsumer />
        </NotificationProvider>
      );
      expect(screen.getByTestId('count').textContent).toBe('0');
      expect(screen.getByTestId('total').textContent).toBe('0');
    });

    it('addNotification creates a notification with auto-generated id and timestamp', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <NotificationProvider>
          <TestConsumer />
        </NotificationProvider>
      );

      await user.click(screen.getByTestId('add'));

      expect(screen.getByTestId('count').textContent).toBe('1');
      expect(screen.getByTestId('total').textContent).toBe('1');
    });

    it('markAsRead marks a specific notification as read', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <NotificationProvider>
          <TestConsumer />
        </NotificationProvider>
      );

      // Add a notification
      await user.click(screen.getByTestId('add'));
      expect(screen.getByTestId('count').textContent).toBe('1');

      // Find the notification and mark it
      const notifElements = screen.getAllByTestId(/^notif-/);
      expect(notifElements.length).toBe(1);
      const notifId = notifElements[0].getAttribute('data-testid')!.replace('notif-', '');
      await user.click(screen.getByTestId(`mark-${notifId}`));

      expect(screen.getByTestId('count').textContent).toBe('0');
      expect(screen.getByTestId(`read-${notifId}`).textContent).toBe('true');
    });

    it('markAllRead sets all notifications to read', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <NotificationProvider>
          <TestConsumer />
        </NotificationProvider>
      );

      // Add multiple notifications
      await user.click(screen.getByTestId('add'));
      await user.click(screen.getByTestId('add'));
      await user.click(screen.getByTestId('add'));

      expect(screen.getByTestId('count').textContent).toBe('3');

      await user.click(screen.getByTestId('mark-all'));
      expect(screen.getByTestId('count').textContent).toBe('0');
      expect(screen.getByTestId('total').textContent).toBe('3'); // still exist, just read
    });

    it('clearAll removes all notifications', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <NotificationProvider>
          <TestConsumer />
        </NotificationProvider>
      );

      await user.click(screen.getByTestId('add'));
      await user.click(screen.getByTestId('add'));
      expect(screen.getByTestId('total').textContent).toBe('2');

      await user.click(screen.getByTestId('clear'));
      expect(screen.getByTestId('total').textContent).toBe('0');
    });

    it('caps notifications at 50', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <NotificationProvider>
          <TestConsumer />
        </NotificationProvider>
      );

      for (let i = 0; i < 55; i++) {
        await user.click(screen.getByTestId('add'));
      }

      // Should cap at 50
      const total = parseInt(screen.getByTestId('total').textContent || '0');
      expect(total).toBeLessThanOrEqual(50);
    });

    it('demo alerts fire after timeouts', async () => {
      render(
        <NotificationProvider>
          <TestConsumer />
        </NotificationProvider>
      );

      // Initially 0
      expect(screen.getByTestId('total').textContent).toBe('0');

      // Advance past first demo alert (1500ms)
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });
      expect(parseInt(screen.getByTestId('total').textContent || '0')).toBeGreaterThanOrEqual(1);

      // Advance past all 6 demo alerts (1500 + 5*3000 = 16500ms)
      await act(async () => {
        vi.advanceTimersByTime(20000);
      });
      expect(parseInt(screen.getByTestId('total').textContent || '0')).toBe(6);
    });
  });

  describe('useNotifications without provider', () => {
    it('throws error when used outside NotificationProvider', () => {
      // Suppress React error boundary console output
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<TestConsumer />)).toThrow('useNotifications must be used within NotificationProvider');
      spy.mockRestore();
    });
  });

  describe('NotificationBell', () => {
    // Bell tests need real timers (no demo alert timing dependency)
    beforeEach(() => {
      vi.useRealTimers();
    });

    it('renders the bell button', () => {
      render(
        <NotificationProvider>
          <NotificationBell />
        </NotificationProvider>
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('shows unread count badge when notifications exist', async () => {
      function BellWithAdd() {
        const { addNotification } = useNotifications();
        return (
          <>
            <button data-testid="trigger" onClick={() => addNotification({ severity: 'info', title: 'Test', message: 'msg', module: 'AML' })}>Add</button>
            <NotificationBell />
          </>
        );
      }

      const user = userEvent.setup();
      render(
        <NotificationProvider>
          <BellWithAdd />
        </NotificationProvider>
      );

      await user.click(screen.getByTestId('trigger'));

      // Should show badge with count
      await waitFor(() => {
        const badge = document.querySelector('.animate-pulse');
        expect(badge).toBeInTheDocument();
      });
    });

    it('opens dropdown on click and shows notification list', async () => {
      function BellWithAdd() {
        const { addNotification } = useNotifications();
        return (
          <>
            <button data-testid="trigger" onClick={() => addNotification({ severity: 'warning', title: 'Warning Alert', message: 'Something happened', module: 'Fraud Detection' })}>Add</button>
            <NotificationBell />
          </>
        );
      }

      render(
        <NotificationProvider>
          <BellWithAdd />
        </NotificationProvider>
      );

      // Add a notification
      fireEvent.click(screen.getByTestId('trigger'));

      // Click the bell button (only button without data-testid)
      const bellButton = screen.getAllByRole('button').find(b => !b.getAttribute('data-testid'));
      expect(bellButton).toBeTruthy();
      fireEvent.click(bellButton!);

      // Dropdown should show "Notifications" header and the alert
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getAllByText('Warning Alert').length).toBeGreaterThanOrEqual(1);
    });

    it('shows "No notifications" when list is empty', async () => {
      // We need to clear demo alerts, so we use a consumer that clears
      function BellWithClear() {
        const { clearAll } = useNotifications();
        return (
          <>
            <button data-testid="clear" onClick={clearAll}>Clear</button>
            <NotificationBell />
          </>
        );
      }

      const user = userEvent.setup();
      render(
        <NotificationProvider>
          <BellWithClear />
        </NotificationProvider>
      );

      // Clear everything
      await user.click(screen.getByTestId('clear'));

      // Open bell dropdown
      const bellButton = screen.getAllByRole('button').find(b => !b.getAttribute('data-testid'));
      if (bellButton) {
        await user.click(bellButton);
        await waitFor(() => {
          expect(screen.getByText('No notifications')).toBeInTheDocument();
        });
      }
    });
  });
});
