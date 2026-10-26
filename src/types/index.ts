export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  amount: number;
  status: OrderStatus;
  category: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
}

export interface User {
  name: string;
  email: string;
}
