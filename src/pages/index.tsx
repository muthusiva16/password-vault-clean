import React, { useState } from "react";
import Router from "next/router";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login"|"signup">("signup");
  const [msg, setMsg] = useState("");

  async function submit(e:any) {
    e.preventDefault();
    setMsg("...");
    const path = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
    const res = await fetch(path, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ email, password }) });
    const j = await res.json();
    if (!res.ok) setMsg(j.error || 'Error');
    else {
      setMsg("OK");
      if (mode === "login") {
        // on successful login, server returns vaultSalt in body for login handler
        // but we kept simple: call /api/auth/login returns vaultSalt (login route does)
        Router.push("/vault");
      }
    }
  }

  return (
    <div style={{padding:24, fontFamily:'system-ui, sans-serif'}}>
      <h2>Password Vault — MVP</h2>
      <div style={{display:'flex', gap:12}}>
        <button onClick={()=>setMode("signup")} disabled={mode==="signup"}>Signup</button>
        <button onClick={()=>setMode("login")} disabled={mode==="login"}>Login</button>
      </div>
      <form onSubmit={submit} style={{marginTop:12, maxWidth:420}}>
        <div><label>Email</label><input required value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%'}}/></div>
        <div style={{marginTop:8}}><label>Password</label><input required type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%'}}/></div>
        <div style={{marginTop:12}}>
          <button type="submit">{mode==="signup" ? "Sign up" : "Log in"}</button>
        </div>
        <div style={{marginTop:8}}>{msg}</div>
      </form>
    </div>
  );
}
