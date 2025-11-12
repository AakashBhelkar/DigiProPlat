import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export const useRealtimeNotifications = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    // Subscribe to notifications table changes
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as any;
          
          // Show toast notification
          if (notification.is_important) {
            toast.error(notification.title || 'New Notification', {
              duration: 5000,
              description: notification.message,
            });
          } else {
            toast.success(notification.title || 'New Notification', {
              duration: 3000,
              description: notification.message,
            });
          }

          // If there's an action URL, you could navigate to it
          if (notification.action_url) {
            // Optionally navigate to action URL
            // navigate(notification.action_url);
          }
        }
      )
      .subscribe();

    return () => {
      // Cleanup subscription on unmount
      supabase.removeChannel(channel);
    };
  }, [user]);
};

