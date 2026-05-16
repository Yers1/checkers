"use client";

import { useEffect, useState } from "react";
import { usePeerGame } from "@/hooks/usePeerGame";
import { useGameStore } from "@/store/gameStore";

function randomRoomId() {
  return `blitz-${Math.random().toString(36).slice(2, 8)}`;
}

export function OnlinePanel() {
  const { newGame, setOnlineRoom, applyRemoteMove, setPeerSender } = useGameStore();
  const [roomId, setRoomId] = useState("");
  const [role, setRole] = useState<"host" | "guest" | null>(null);
  const [copied, setCopied] = useState(false);

  const { connected, error, connect, sendMove } = usePeerGame(roomId, role);

  useEffect(() => {
    if (connected) setPeerSender(sendMove);
    return () => setPeerSender(null);
  }, [connected, sendMove, setPeerSender]);

  useEffect(() => {
    if (!role || !roomId) return;
    connect((move) => applyRemoteMove(move), () => {});
  }, [role, roomId, connect, applyRemoteMove]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) {
      setRoomId(room);
      setRole("guest");
      setOnlineRoom(room);
      newGame("online");
    }
  }, [newGame, setOnlineRoom]);

  const hostGame = () => {
    const id = randomRoomId();
    setRoomId(id);
    setRole("host");
    setOnlineRoom(id);
    newGame("online");
  };

  const joinGame = () => {
    if (!roomId.trim()) return;
    setRole("guest");
    setOnlineRoom(roomId.trim());
    newGame("online");
  };

  const shareUrl =
    typeof window !== "undefined" && roomId
      ? `${window.location.origin}?room=${roomId}`
      : "";

  const copyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="online-panel">
      <p>Игра с другом по ссылке (WebRTC P2P через PeerJS)</p>
      <div className="online-actions">
        <button type="button" className="btn" onClick={hostGame}>
          Создать комнату
        </button>
        <input
          placeholder="ID комнаты"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button type="button" className="btn ghost" onClick={joinGame}>
          Войти
        </button>
      </div>
      {roomId && (
        <div className="room-info">
          <code>{roomId}</code>
          {shareUrl && (
            <button type="button" className="btn ghost" onClick={copyLink}>
              {copied ? "Скопировано!" : "Копировать ссылку"}
            </button>
          )}
          <span className={connected ? "status ok" : "status"}>
            {connected ? "Подключено" : "Ожидание соперника…"}
          </span>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
