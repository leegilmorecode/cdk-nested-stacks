export const schema = {
  type: 'object',
  required: [
    'id',
    'customerName',
    'contactNumber',
    'bookingDate',
    'bookingTime',
    'numberOfGuests',
  ],
  properties: {
    id: {
      type: 'string',
      description: 'Unique identifier for the booking',
    },
    customerName: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      description: 'Name of the customer making the booking',
    },
    contactNumber: {
      type: 'string',
      pattern: '^[+]?[(]?[0-9]{1,4}[)]?[-s./0-9]*$',
      minLength: 10,
      maxLength: 15,
      description: 'Contact number of the customer',
    },
    email: {
      type: 'string',
      format: 'email',
      description: 'Email address of the customer',
    },
    bookingDate: {
      type: 'string',
      format: 'date',
      description: 'Date of the booking',
    },
    bookingTime: {
      type: 'string',
      pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
      description: 'Time of the booking',
    },
    numberOfGuests: {
      type: 'integer',
      minimum: 1,
      maximum: 20,
      description: 'Number of guests for the booking',
    },
    specialRequests: {
      type: 'string',
      maxLength: 500,
      description: 'Any special requests or notes for the booking',
    },
    tableNumber: {
      type: 'integer',
      minimum: 1,
      description: 'Specific table number requested (if any)',
    },
    status: {
      type: 'string',
      enum: ['Pending', 'Confirmed', 'Cancelled'],
      description: 'Status of the booking',
    },
  },
};
