// File: src/services/socket/webSocketClient.js
import { Client } from '@stomp/stompjs';
import { getAccessToken } from '../storage/localStorage';

let client = null;
const subscriptions = new Map();

function getClient() {
  if (client) return client;
  client = new Client({
    brokerURL: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws',
    reconnectDelay: 5000,
    connectHeaders: () => ({
      Authorization: `Bearer ${getAccessToken() || ''}`,
    }),
    onWebSocketClose: () => subscriptions.clear(),
  });
  return client;
}

export function connect() {
  const stompClient = getClient();
  if (!stompClient.active) stompClient.activate();
  return stompClient;
}
export async function disconnect() {
  if (client?.active) await client.deactivate();
  subscriptions.clear();
}
export function isConnected() {
  return Boolean(client?.connected);
}
export function subscribe(destination, handler, options = {}) {
  const stompClient = connect();
  const register = () => {
    const subscription = stompClient.subscribe(destination, handler, options);
    subscriptions.set(destination, subscription);
    return subscription;
  };
  return stompClient.connected
    ? register()
    : new Promise((resolve) => {
        const previous = stompClient.onConnect;
        stompClient.onConnect = (frame) => {
          previous?.(frame);
          resolve(register());
        };
      });
}
export function unsubscribe(destination) {
  const subscription = subscriptions.get(destination);
  subscription?.unsubscribe();
  subscriptions.delete(destination);
}
export function publish(destination, body, headers = {}) {
  const stompClient = connect();
  const message = typeof body === 'string' ? body : JSON.stringify(body);
  const publishMessage = () =>
    stompClient.publish({ destination, body: message, headers });
  if (stompClient.connected) publishMessage();
  else stompClient.onConnect = () => publishMessage();
}
export default {
  connect,
  disconnect,
  isConnected,
  subscribe,
  unsubscribe,
  publish,
};
