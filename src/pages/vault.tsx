import React, { useEffect, useState } from "react";
import PasswordGenerator from "../components/PasswordGenerator";
import { deriveKeyFromPassword, encryptData, decryptData } from "../utils/crypto";
import Router from "next/router";

type Item = { _id?: string; encrypted: { iv:string; data:string } };

export default function VaultPage() {
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null);
  const [items, setItems] = useState<Array<{ id:string; data:any; raw:Item }>>([]);
  const [password, setPassword] = useState("");
  const [vaultSalt, setVaultSalt] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(()=> {
    // fetch me to check auth
    fetch("/api/auth/me").then(r=>r.json()).then(j=>{
      if (!j.ok) Router.push("/");
    });
  },[]);

  async function onLoginPassword() {
    if (!password) return alert("Enter your login password to derive vault key");
    // fetch vaultSalt from server via a lightweight call: call /api/auth/login? But we already logged in previously.
    // For demo, ask user to paste vaultSalt (or in real flow, server returns vaultSalt on login)
    // We'll fetch user's document (server doesn't expose salt; so in this demo we ask user to paste the salt they saved from signup)
    const s = prompt("Enter your login password:");
    if (!s) return;
    setVaultSalt(s);
    const key = await deriveKeyFromPassword(password, s);
    setVaultKey(key);
    await loadItems(key);
  }

  async function loadItems(key: CryptoKey) {
    const res = await fetch("/api/vault/list");
    if (!res.ok) return alert("Failed to load");
    const j = await res.json();
    const rows: any[] = [];
    for (const it of j.items) {
      try {
        const d = await decryptData(key, it.encrypted);
        rows.push({ id: it._id, data: d, raw: it });
      } catch (e) {
        // skip or keep encrypted
      }
    }
    setItems(rows);
  }

  async function handleSave(entry:any) {
    if (!vaultKey) return alert("Derive vault key first");
    const encrypted = await encryptData(vaultKey, entry);
    await fetch("/api/vault/create", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ encrypted }) });
    await loadItems(vaultKey);
  }

  async function handleDelete(id:string) {
    await fetch("/api/vault/delete", { method:"DELETE", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id }) });
    if (vaultKey) await loadItems(vaultKey);
  }

  // copy with auto-clear
  async function copyWithAutoClear(text:string, ms=12000) {
    await navigator.clipboard.writeText(text);
    setTimeout(async ()=>{ try { await navigator.clipboard.writeText(""); } catch(e){} }, ms);
  }

  const visible = items.filter(it => {
    if (!search) return true;
    const s = search.toLowerCase();
    return JSON.stringify(it.data).toLowerCase().includes(s);
  });

  return (
    <div style={{padding:20, fontFamily:'system-ui, sans-serif'}}>
      <h2>Vault</h2>
      <div style={{marginBottom:12}}>
        <input placeholder="Login password (used only to derive key)" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:300}}/>
        <button onClick={onLoginPassword}>Derive key & load</button>
      </div>

      <div style={{display:'flex', gap:20}}>
        <div style={{flex:1}}>
          <h3>Generator</h3>
          <PasswordGenerator onChoose={(pwd)=>{ document.getElementById('entry-password') && ((document.getElementById('entry-password') as any).value = pwd) }} />
          <h3 style={{marginTop:16}}>Add entry</h3>
          <form onSubmit={async (e)=>{ e.preventDefault(); const f = e.target as any; await handleSave({ title:f.title.value, username:f.username.value, password:f.password.value, url:f.url.value, notes:f.notes.value }); f.reset(); }}>
            <div><input name="title" placeholder="Title" required style={{width:320}}/></div>
            <div><input name="username" placeholder="Username" style={{width:320}}/></div>
            <div><input id="entry-password" name="password" placeholder="Password" style={{width:320}}/></div>
            <div><input name="url" placeholder="URL" style={{width:320}}/></div>
            <div><textarea name="notes" placeholder="Notes" style={{width:320}}/></div>
            <div style={{marginTop:8}}><button type="submit">Save</button></div>
          </form>
        </div>

        <div style={{flex:1}}>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <input placeholder="Search" value={search} onChange={e=>setSearch(e.target.value)} style={{width:220}}/>
            <button onClick={()=>{ setSearch('') }}>Clear</button>
          </div>
          <h3 style={{marginTop:12}}>Items</h3>
          <div>
            {visible.map(it=>(
              <div key={it.id} style={{border:'1px solid #eee', padding:8, borderRadius:6, marginBottom:8}}>
                <div><strong>{it.data.title}</strong></div>
                <div>user: {it.data.username}</div>
                <div>url: {it.data.url}</div>
                <div style={{marginTop:8}}>
                  <button onClick={()=>copyWithAutoClear(it.data.password)}>Copy(auto-clear)</button>
                  <button onClick={()=>{ const newTitle = prompt('Edit title', it.data.title); if (!newTitle) return; (async ()=>{ const newData = {...it.data, title:newTitle}; if (!vaultKey) return; const encrypted = await encryptData(vaultKey, newData); await fetch('/api/vault/update', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: it.id, encrypted }) }); await loadItems(vaultKey); })(); }}>Edit</button>
                  <button onClick={()=>handleDelete(it.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
