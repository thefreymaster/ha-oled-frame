import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { socket } from "../lib/socket";

export interface HAState<A = Record<string, unknown>> {
  entity_id: string;
  state: string;
  attributes: A;
  last_changed: string;
  last_updated: string;
}

const refCounts = new Map<string, number>();

function refSubscribe(entityId: string) {
  const cur = refCounts.get(entityId) ?? 0;
  refCounts.set(entityId, cur + 1);
  if (cur === 0) socket.emit("entity:subscribe", entityId);
}

function refUnsubscribe(entityId: string) {
  const cur = refCounts.get(entityId) ?? 0;
  if (cur <= 0) return;
  const next = cur - 1;
  if (next === 0) {
    refCounts.delete(entityId);
    socket.emit("entity:unsubscribe", entityId);
  } else {
    refCounts.set(entityId, next);
  }
}

// Re-subscribe everything after a reconnect so rooms survive socket drops.
socket.on("connect", () => {
  for (const entityId of refCounts.keys()) {
    socket.emit("entity:subscribe", entityId);
  }
});

export function useEntity<A = Record<string, unknown>>(entityId: string) {
  const qc = useQueryClient();

  useEffect(() => {
    function onUpdate(data: HAState<A>) {
      qc.setQueryData<HAState<A>>(["entity", entityId], data);
    }

    socket.on(entityId, onUpdate);
    refSubscribe(entityId);

    return () => {
      refUnsubscribe(entityId);
      socket.off(entityId, onUpdate);
    };
  }, [entityId, qc]);

  return useQuery<HAState<A> | undefined>({
    queryKey: ["entity", entityId],
    queryFn: () => qc.getQueryData<HAState<A>>(["entity", entityId]),
    enabled: false,
    staleTime: Infinity,
  });
}
