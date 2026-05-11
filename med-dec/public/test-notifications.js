// Test script to simulate real-time notifications
// Run this in browser console to test the notification system

// Simulate different types of notifications
const testNotifications = [
  {
    type: 'order-placed',
    title: 'Order Placed',
    message: 'Your order ORD-2024-001 has been placed successfully',
    orderId: 'ORD-2024-001'
  },
  {
    type: 'pharmacy-response',
    title: 'Order Accepted',
    message: 'Pharmacy has accepted your order ORD-2024-001',
    orderId: 'ORD-2024-001'
  },
  {
    type: 'logistics-assigned',
    title: 'Delivery Assigned',
    message: 'A delivery driver has been assigned to your order ORD-2024-001',
    orderId: 'ORD-2024-001'
  },
  {
    type: 'delivery-update',
    title: 'Delivery Update',
    message: 'Your order ORD-2024-001 is out for delivery',
    orderId: 'ORD-2024-001'
  },
  {
    type: 'delivery-completed',
    title: 'Order Delivered',
    message: 'Your order ORD-2024-001 has been delivered successfully',
    orderId: 'ORD-2024-001'
  }
];

// Function to emit test notifications
window.testNotifications = (index = 0) => {
  if (index >= testNotifications.length) {
    console.log('All test notifications sent!');
    return;
  }

  const notification = testNotifications[index];
  console.log(`Sending notification: ${notification.title}`);

  // This would normally come from the server via Socket.IO
  // For testing, we'll manually trigger the socket events
  if (window.socket) {
    window.socket.emit('test-notification', notification);
  }

  // Schedule next notification
  setTimeout(() => testNotifications(index + 1), 2000);
};

console.log('Test notification functions loaded!');
console.log('Run testNotifications() to start testing the notification system');