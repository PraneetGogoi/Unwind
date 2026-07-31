"use client";

import { useState, useEffect } from "react";
import { startSync, stopSync } from "@/lib/sync";
import { Card } from "@/components/ui/card";
import { RefreshCw, Key, Shield, Network } from "lucide-react";

export default function SyncPage() {
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState("Not connected");

  useEffect(() => {
    const savedRoom = localStorage.getItem("unwind_sync_room");
    const savedPass = localStorage.getItem("unwind_sync_pass");
    if (savedRoom && savedPass) {
      setRoomId(savedRoom);
      setPassword(savedPass);
    }
  }, []);

  const handleStartSync = () => {
    if (!roomId || !password) return;
    
    startSync(roomId, password);
    setIsSyncing(true);
    setStatus("Connected via WebRTC");
    
    localStorage.setItem("unwind_sync_room", roomId);
    localStorage.setItem("unwind_sync_pass", password);
  };

  const handleStopSync = () => {
    stopSync();
    setIsSyncing(false);
    setStatus("Not connected");
  };

  const generateCredentials = () => {
    setRoomId("unwind-" + Math.random().toString(36).substring(2, 10));
    setPassword(Math.random().toString(36).substring(2, 14));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 pt-24 pb-32">
      <header className="mb-12 border-b-2 border-ink pb-6">
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tighter mb-4 flex items-center gap-3">
          <Network className="w-10 h-10" /> Peer-to-Peer Sync
        </h1>
        <p className="text-xl font-medium max-w-2xl text-muted-foreground">
          Sync your Unwind data across devices securely without a cloud server. 
          Data is end-to-end encrypted and transferred directly between your devices.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 brutal-card">
          <h2 className="text-xl font-bold uppercase mb-4 flex items-center gap-2"><Key className="w-5 h-5"/> Sync Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2">Room ID</label>
              <input 
                type="text" 
                value={roomId} 
                onChange={e => setRoomId(e.target.value)}
                placeholder="e.g. unwind-xy7z9"
                className="w-full p-3 border-2 border-ink bg-transparent font-mono"
                disabled={isSyncing}
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2">Encryption Password</label>
              <input 
                type="text" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                placeholder="Secure passphrase"
                className="w-full p-3 border-2 border-ink bg-transparent font-mono"
                disabled={isSyncing}
              />
            </div>
            
            {!isSyncing && (
               <button 
                 onClick={generateCredentials}
                 className="text-xs uppercase font-bold tracking-wider flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
               >
                 <RefreshCw className="w-3 h-3" /> Generate New Credentials
               </button>
            )}

            <div className="pt-4 border-t-2 border-ink mt-6">
              {isSyncing ? (
                <button 
                  onClick={handleStopSync}
                  className="w-full brutal-btn bg-[var(--high)] text-white py-3 font-bold uppercase"
                >
                  Stop Syncing
                </button>
              ) : (
                <button 
                  onClick={handleStartSync}
                  className="w-full brutal-btn brutal-btn-primary py-3 font-bold uppercase"
                >
                  Start Sync
                </button>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 brutal-card">
          <h2 className="text-xl font-bold uppercase mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-ink"/> How it works</h2>
          <div className="space-y-4 text-sm opacity-90">
            <p><strong>1. True Privacy:</strong> We don't have a database in the cloud. Your data lives on your device.</p>
            <p><strong>2. Peer-to-Peer:</strong> When you start sync, your devices find each other using public WebRTC signaling servers, and connect directly.</p>
            <p><strong>3. End-to-End Encryption:</strong> The data exchanged between your devices is encrypted using the password you set. Nobody else can read it.</p>
            <p className="pt-4 border-t border-ink/20">
              <strong>Status:</strong> <span className={isSyncing ? "text-low font-bold" : ""}>{status}</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
