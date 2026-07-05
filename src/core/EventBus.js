export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(eventName, callback) {
    const callbacks = this.listeners.get(eventName) ?? new Set();
    callbacks.add(callback);
    this.listeners.set(eventName, callbacks);
    return () => callbacks.delete(callback);
  }

  emit(eventName, payload) {
    this.listeners.get(eventName)?.forEach((callback) => callback(payload));
  }
}
