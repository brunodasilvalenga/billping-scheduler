import EventEmitter from 'events'

// Create an event emitter instance
class UserEventEmitter extends EventEmitter {}

const userEventEmitter = new UserEventEmitter()

// Export the event emitter instance
export { userEventEmitter }
