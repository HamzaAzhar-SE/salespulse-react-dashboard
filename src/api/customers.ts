import type { Customer } from '../types';
import { getJson } from './client';

export function fetchCustomers(): Promise<Customer[]> {
  return getJson<Customer[]>('/customers');
}
