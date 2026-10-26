import type { Order } from '../types';
import { getJson } from './client';

export function fetchOrders(): Promise<Order[]> {
  return getJson<Order[]>('/orders');
}
