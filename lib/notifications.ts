export function requestNotificationPermission() {
  if (typeof window !== "undefined" && "Notification" in window) {
    Notification.requestPermission().then(permission => {
      console.log("Notification permission state:", permission);
    });
  }
}

export function sendBrowserNotification(title: string, body: string) {
  if (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    try {
      new Notification(title, {
        body,
        icon: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=120&auto=format&fit=crop", // placeholder icon
      });
    } catch (err) {
      console.warn("Notification constructor failed, attempting ServiceWorker alert:", err);
      // Fallback for chrome mobile which requires service worker registrations
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, { body });
        });
      }
    }
  }
}
