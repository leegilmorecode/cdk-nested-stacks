type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled';

export type Booking = {
  id: string;
  customerName: string;
  contactNumber: string;
  bookingDate: string;
  bookingTime: string;
  numberOfGuests: number;
  specialRequests?: string;
  tableNumber?: number;
  status?: BookingStatus;
  email?: string;
};

export type Bookings = {
  items: Booking[];
};

export type CreateBooking = {
  customerName: string;
  contactNumber: string;
  bookingDate: string;
  bookingTime: string;
  numberOfGuests: number;
  specialRequests?: string;
  tableNumber?: number;
  email?: string;
};
