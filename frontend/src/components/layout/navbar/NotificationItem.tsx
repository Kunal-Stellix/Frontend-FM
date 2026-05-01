import Link from "next/link";
import { MessageSquare, RefreshCw, AtSign, Bell } from "lucide-react";
import type { Notification } from "@/types/admin";

type NotificationItemProps = {
  notification: Notification;
  onClick: () => void;
};

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.iconType) {
      case "comment":
        return <MessageSquare className="h-4 w-4 text-info" />;
      case "status_change":
        return <RefreshCw className="h-4 w-4 text-success" />;
      case "mention":
        return <AtSign className="h-4 w-4 text-primary" />;
      default:
        return <Bell className="h-4 w-4 text-base-content/50" />;
    }
  };

  return (
    <Link 
      href={notification.link}
      onClick={onClick}
      className={`flex items-start gap-3 p-3 hover:bg-base-200 transition-colors ${
        !notification.read ? "bg-primary/5" : ""
      }`}
    >
      <div className="mt-1 flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm text-base-content line-clamp-2 leading-snug ${
          !notification.read ? "font-semibold" : ""
        }`}>
          {notification.message}
        </p>
        <span className="text-xs text-base-content/50 mt-1 block">
          {formatTimeAgo(notification.timestamp)}
        </span>
      </div>
      {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
      )}
    </Link>
  );
}
