import React, { useState } from "react";
import { generatePassword } from "../utils/generator";

export default function PasswordGenerator({ onChoose }: { onChoose: (pwd: string) => void }) {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(false);
  const [pwd, setPwd] = useState("");

  function regen() {
    const p = generatePassword({ length, upper, lower, numbers, symbols });
    setPwd(p);
  }

  return (
    <div style={{border:'1px solid #ddd', padding:12, borderRadius:8, maxWidth:520}}>
      <div>
        <label>Length: {length}</label>
        <input type="range" min={8} max={64} value={length} onChange={(e)=>setLength(Number(e.target.value))}/>
      </div>
      <div style={{display:'flex',gap:8, marginTop:8}}>
        <label><input type="checkbox" checked={upper} onChange={e=>setUpper(e.target.checked)}/>Upper</label>
        <label><input type="checkbox" checked={lower} onChange={e=>setLower(e.target.checked)}/>Lower</label>
        <label><input type="checkbox" checked={numbers} onChange={e=>setNumbers(e.target.checked)}/>Numbers</label>
        <label><input type="checkbox" checked={symbols} onChange={e=>setSymbols(e.target.checked)}/>Symbols</label>
      </div>
      <div style={{marginTop:12, display:'flex', gap:8, alignItems:'center'}}>
        <button onClick={regen}>Generate</button>
        <input readOnly value={pwd} style={{width:300}}/>
        <button onClick={()=>onChoose(pwd)} disabled={!pwd}>Use</button>
      </div>
    </div>
  );
}
