"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { fetchNotifications, markNotificationsRead } from "@/lib/feedbackApi";
import type { Notification } from "@/types/admin";
import { NotificationItem } from "./NotificationItem";
import { hasStoredSession } from "@/lib/authStorage";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const isLoggedIn = hasStoredSession();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications().then(setNotifications).catch(console.error);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleOpenDropdown = async () => {
    setIsOpen(!isOpen);
    
    if (!isOpen) {
      const hasUnread = notifications.some((n) => !n.read);
      if (hasUnread) {
        await markNotificationsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    }
  };

  if (!isLoggedIn) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleOpenDropdown}
        className="btn btn-ghost btn-circle relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden z-50">
          <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-200/30">
            <h3 className="font-bold text-base-content">Notifications</h3>
            {unreadCount > 0 && (
              <span className="badge badge-primary badge-sm">{unreadCount} new</span>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-base-content/50">
                You have no notifications yet.
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-base-200/50">
                {notifications.map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onClick={() => setIsOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-base-200 bg-base-50 text-center">
            <button 
              className="text-xs font-semibold text-base-content/60 hover:text-primary transition-colors py-1"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
