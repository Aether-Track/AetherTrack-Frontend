import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3001/ws';

export function useShipmentSocket(shipmentId: string | null) {
  const ws = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!shipmentId) return;

    const socket = new WebSocket(WS_URL);
    ws.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'subscribe', shipmentId }));
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as { type: string; shipmentId?: string };

        if (msg.shipmentId === shipmentId || msg.type === 'shipment:update') {
          // Invalidate the shipment query so it refetches fresh data
          queryClient.invalidateQueries({ queryKey: ['shipment', shipmentId] });
        }
      } catch {
        // ignore parse errors
      }
    };

    socket.onclose = () => {
      // Reconnect after 3s
      reconnectTimer.current = setTimeout(connect, 3_000);
    };

    socket.onerror = () => {
      socket.close();
    };
  }, [shipmentId, queryClient]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (ws.current) {
        ws.current.send(JSON.stringify({ type: 'unsubscribe', shipmentId }));
        ws.current.close();
      }
    };
  }, [connect, shipmentId]);
}
