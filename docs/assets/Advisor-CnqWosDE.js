import{c as S,u as w,r as p,j as o}from"./index-CUU8_zJk.js";import{u as P}from"./useColors-CKGZTfyN.js";function F(e,i){const r=(i||"moderate").toLowerCase(),a=new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),s=e.trim().toLowerCase();return/^(hi|hello|hey|yo|help|thanks|thank you|what is floboard|who are you)[.!?]*$/i.test(s)?`Hello! I'm **FloAI**, your AI financial advisor built into FloBoard.

We can chat about financial topics, or ask me to analyze any stock, crypto, or forex pair. I'll adjust to your **${r.toUpperCase()}** risk profile.`:/gold|gc=f|silver|si=f|xau|xag|metal/i.test(s)?`### FloAI [${r.toUpperCase()} MODE] Analysis (${a})

**Gold / Precious Metals**

As a ${r} investor, Gold (${r==="aggressive"?"focus on momentum breakouts":r==="conservative"?"focus on capital preservation with 5-10% allocation":"balanced 5-8% portfolio allocation as a hedge"}). Monitor DXY resistance and Treasury yield shifts for direction.`:/btc|bitcoin|eth|ethereum|sol|solana|crypto/i.test(s)?`### FloAI [${r.toUpperCase()} MODE] Analysis (${a})

**Bitcoin / Crypto**

${r==="aggressive"?"Allocate 15-20% to core Layer-1 assets (BTC, ETH, SOL). Target breakout entries.":r==="conservative"?"Keep crypto exposure under 3% — BTC only. Prioritize Treasury yields.":"Maintain 5-10% allocation via DCA on pullbacks. Quarterly rebalancing."}`:/aapl|nvda|msft|tsla|stock|share|equity/i.test(s)?`### FloAI [${r.toUpperCase()} MODE] Analysis (${a})

**Stock / Equity Analysis**

${r==="aggressive"?"Overweight AI/semiconductor leaders (NVDA, AVGO, AMD). Enter on volume breakouts.":r==="conservative"?"Prioritize dividend aristocrats (JNJ, PG, COST) with beta < 0.85. Fixed income cushion 50-60%.":"Core index allocation 50-60% via SPY/QQQ. Supplement with quality mega-caps."}`:/eurusd|usdjpy|forex|fx|currency|dollar|dxy/i.test(s)?`### FloAI [${r.toUpperCase()} MODE] Analysis (${a})

**Forex / Currencies**

${r==="aggressive"?"Trade momentum breakouts around central bank announcements. Ride carry-trade trends.":r==="conservative"?"Avoid speculative FX. Anchor reserves in T-bills. Use FX only to hedge international equity.":"Track G10 majors alongside DXY. Pair domestic equities with international ETFs."}`:`### FloAI [${r.toUpperCase()} MODE] Analysis (${a})

**General Market Outlook**

Based on your ${r} profile:
${r==="aggressive"?`- Focus on high-beta growth and AI infrastructure leaders
- Accept higher volatility for market-leading returns
- Monitor breakout patterns and volume surges`:r==="conservative"?`- Prioritize capital preservation and dividend compounding
- 50-60% in sovereign debt
- Blue-chip defensive sectors (XLP, XLU)`:`- Balanced 60/40 equity-to-bond allocation
- Core index funds with quality mega-caps
- Quarterly rebalancing discipline`}`}function D(){const e=P(),{settings:i,updateSetting:r}=S(),{data:a}=w(),[s,y]=p.useState([]),[g,x]=p.useState(""),[l,h]=p.useState(!1),v=p.useRef(null);p.useEffect(()=>{var t;(t=v.current)==null||t.scrollIntoView({behavior:"smooth"})},[s]);const b=async()=>{var d,c,k,A,$;const t=g.trim();if(!t||l)return;x("");const m={role:"user",content:t};if(y(u=>[...u,m]),h(!0),i.geminiApiKey)try{const u=Object.entries(a).slice(0,20).map(([j,n])=>`${j}: $${n.regularMarketPrice} (${n.regularMarketChangePercent>=0?"+":""}${n.regularMarketChangePercent.toFixed(2)}%)`).join(`
`),f=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${i.geminiApiKey}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:`You are FloAI, a financial advisor. Risk mode: ${i.riskProfile.toUpperCase()}.

Current market data:
${u}

User: ${t}`}]}]})});if(f.ok){const n=($=(A=(k=(c=(d=(await f.json()).candidates)==null?void 0:d[0])==null?void 0:c.content)==null?void 0:k.parts)==null?void 0:A[0])==null?void 0:$.text;if(n){y(C=>[...C,{role:"assistant",content:n}]),h(!1);return}}}catch{}setTimeout(()=>{const u=F(t,i.riskProfile);y(f=>[...f,{role:"assistant",content:u}]),h(!1)},500)};return o.jsxs("div",{className:"page-container",style:{background:e.void,display:"flex",flexDirection:"column",height:"100%"},children:[o.jsxs("div",{className:"page-header",style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[o.jsxs("div",{children:[o.jsx("div",{className:"page-title",children:"FloAI Advisor"}),o.jsxs("div",{className:"page-subtitle",children:["Powered by Gemini · ",i.riskProfile.toUpperCase()," mode"]})]}),o.jsx("div",{style:{display:"flex",gap:4},children:["conservative","moderate","aggressive"].map(t=>o.jsx("button",{onClick:()=>r("riskProfile",t),style:{padding:"3px 8px",borderRadius:6,border:`1px solid ${i.riskProfile===t?e.gain:e.rim}`,background:i.riskProfile===t?e.gainDim:e.card,color:i.riskProfile===t?e.gain:e.t3,fontSize:9,fontWeight:600,cursor:"pointer"},children:t.slice(0,3).toUpperCase()},t))})]}),o.jsxs("div",{style:{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:10},children:[s.length===0&&o.jsxs("div",{style:{textAlign:"center",padding:40,color:e.t4},children:[o.jsx("div",{style:{fontSize:14,marginBottom:8},children:"💬"}),o.jsx("div",{style:{fontSize:13,fontWeight:600,color:e.t2,marginBottom:4},children:"Ask FloAI anything"}),o.jsx("div",{style:{fontSize:11},children:'Try: "What is the outlook for Gold?" or "Should I buy Bitcoin?"'})]}),s.map((t,m)=>o.jsx("div",{style:{alignSelf:t.role==="user"?"flex-end":"flex-start",maxWidth:"80%"},children:o.jsx("div",{style:{padding:"10px 14px",borderRadius:12,background:t.role==="user"?e.blue:e.card,border:`1px solid ${t.role==="user"?"transparent":e.rim}`,color:e.t1,fontSize:12,lineHeight:1.6,whiteSpace:"pre-wrap"},children:t.content.split("**").map((d,c)=>c%2===1?o.jsx("strong",{children:d},c):d)})},m)),l&&o.jsx("div",{style:{alignSelf:"flex-start",padding:"10px 14px",borderRadius:12,background:e.card,border:`1px solid ${e.rim}`,color:e.t4,fontSize:12},children:o.jsx("div",{className:"spinner",style:{width:16,height:16}})}),o.jsx("div",{ref:v})]}),o.jsxs("div",{style:{padding:"10px 14px",borderTop:`1px solid ${e.rim}`,background:e.base,display:"flex",gap:8},children:[o.jsx("input",{value:g,onChange:t=>x(t.target.value),onKeyDown:t=>t.key==="Enter"&&b(),placeholder:"Ask about markets, stocks, crypto...",style:{flex:1,padding:"10px 14px",borderRadius:10,border:`1px solid ${e.rim}`,background:e.surface,color:e.t1,fontSize:12,outline:"none"}}),o.jsx("button",{onClick:b,disabled:l||!g.trim(),style:{padding:"10px 18px",borderRadius:10,border:"none",background:e.gain,color:"#080B10",fontWeight:700,fontSize:12,cursor:l?"not-allowed":"pointer",opacity:l||!g.trim()?.5:1},children:"Send"})]})]})}export{D as default};
