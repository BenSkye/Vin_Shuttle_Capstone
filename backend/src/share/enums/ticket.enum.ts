export enum TicketStatus {
  PENDING = 'pending',      // Vé đã đặt nhưng chưa thanh toán
  BOOKED = 'booked',       // Vé đã thanh toán
  CHECKED_IN = 'checked_in', // Hành khách đã lên xe
  COMPLETED = 'completed',  // Hành khách đã xuống xe
  CANCELLED = 'cancelled'   // Vé đã bị hủy
} 