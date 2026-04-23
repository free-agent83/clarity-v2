"use client";

import { useCallback } from "react";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";
import { refetchAllOrders } from "@/app/buyer/(shop)/orders/actions";
import type { Order } from "@/lib/api/orders";
import { OrdersFilterableList } from "./orders-filterable-list";

interface OrdersRealtimeWrapperProps {
  initialData: Order[];
}

export function OrdersRealtimeWrapper({
  initialData,
}: OrdersRealtimeWrapperProps) {
  const refetch = useCallback(() => refetchAllOrders(), []);
  const orders = useRealtimeSync(initialData, "orders", refetch);
  return <OrdersFilterableList orders={orders} />;
}
