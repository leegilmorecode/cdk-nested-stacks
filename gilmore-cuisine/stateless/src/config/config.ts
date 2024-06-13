const convict = require('convict');

export const config = convict({
  tableName: {
    doc: 'The table name',
    format: String,
    default: '',
    env: 'TABLE_NAME',
  },
  eventBus: {
    doc: 'The event bus',
    format: String,
    default: '',
    env: 'BUS',
  },
}).validate({ allowed: 'strict' });
