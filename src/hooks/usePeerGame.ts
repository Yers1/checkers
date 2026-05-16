"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DataConnection } from "peerjs";
import type { GameMove, GameState } from "@/lib/game/types";

type PeerMessage =
  | { type: "state"; state: GameState }
  | { type: "move"; move: GameMove };

export function usePeerGame(roomId: string | null, role: "host" | "guest" | null) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const peerRef = useRef<import("peerjs").default | null>(null);

  const connect = useCallback(
    async (
      onMove: (move: GameMove) => void,
      onState: (state: GameState) => void,
    ) => {
      if (!roomId || !role) return;

      try {
        const { default: Peer } = await import("peerjs");
        const peer =
          role === "host"
            ? new Peer(roomId, { debug: 0 })
            : new Peer({ debug: 0 });
        peerRef.current = peer;

        peer.on("open", () => {
          if (role === "guest") {
            const conn = peer.connect(roomId, { reliable: true });
            setupConn(conn, onMove, onState);
          }
        });

        peer.on("connection", (conn) => {
          if (role === "host") setupConn(conn, onMove, onState);
        });

        peer.on("error", (err) => {
          setError(err.message);
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка P2P");
      }
    },
    [roomId, role],
  );

  function setupConn(
    conn: DataConnection,
    onMove: (move: GameMove) => void,
    onState: (state: GameState) => void,
  ) {
    connRef.current = conn;
    conn.on("open", () => setConnected(true));
    conn.on("data", (data: unknown) => {
      const msg = data as PeerMessage;
      if (msg.type === "move") onMove(msg.move);
      if (msg.type === "state") onState(msg.state);
    });
    conn.on("close", () => setConnected(false));
  }

  const sendMove = useCallback((move: GameMove) => {
    connRef.current?.send({ type: "move", move } satisfies PeerMessage);
  }, []);

  const sendState = useCallback((state: GameState) => {
    connRef.current?.send({ type: "state", state } satisfies PeerMessage);
  }, []);

  useEffect(() => {
    return () => {
      connRef.current?.close();
      peerRef.current?.destroy();
    };
  }, []);

  return { connected, error, connect, sendMove, sendState };
}
