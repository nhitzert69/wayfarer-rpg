/* Wayfarer Chess: chess.js rules and Stockfish ASM UCI worker, lazy loaded. */
(()=>{
const CHESS_URL="https://cdn.jsdelivr.net/npm/chess.js@1.4.0/dist/esm/chess.js";
const ENGINE_URLS=["https://unpkg.com/stockfish@19.0.1/bin/stockfish-19-asm.js","https://cdn.jsdelivr.net/npm/stockfish@19.0.1/bin/stockfish-19-asm.js"];
let ChessClass=null, game=null, worker=null, selected=null, busy=false, initialized=false, engineReady=false, requestId=0, loadedAccount="", engineError="", chessNotice="", choosingSide=false;
const root=()=>document.getElementById("chessRoot");
const data=()=>{if(!state.chess||typeof state.chess!=="object")state.chess={elo:800,wins:0,losses:0,draws:0,history:[],pgn:"",active:false,color:"w"};return state.chess;};
const human=()=>data().color==="b"?"b":"w";
const computer=()=>human()==="w"?"b":"w";
const escape=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const persist=()=>{data().pgn=game.pgn();save(true);};
const target=()=>Math.max(400,Math.min(2400,Math.round(data().elo/100)*100));
const strength=()=>Math.max(0,Math.min(20,Math.round((target()-400)/100)));
const opponent=()=>Math.max(400,target());
function finish(result){const d=data();if(!d.active)return;d.active=false;const score=result==="win"?1:result==="draw"?.5:0;const expected=1/(1+Math.pow(10,(opponent()-d.elo)/400));const delta=Math.round(24*(score-expected));d.elo=Math.max(100,Math.min(3000,d.elo+delta));d[result==="win"?"wins":result==="loss"?"losses":"draws"]++;d.history.unshift({date:new Date().toISOString(),result,delta,elo:d.elo,pgn:game.pgn()});d.history=d.history.slice(0,50);persist();draw();}
function terminal(){if(!game.isGameOver())return false;finish(game.isDraw()?"draw":game.isCheckmate()?(game.turn()===human()?"loss":"win"):"draw");return true;}
function stop(){requestId++;busy=false;if(worker&&engineReady)worker.postMessage("stop");}
function newGame(color){if(data().active)return;stop();selected=null;choosingSide=false;engineError="";game=new ChessClass();const d=data();d.pgn="";d.active=true;d.color=color==="b"?"b":"w";chessNotice="New game started. You play "+(human()==="w"?"White (red Catholic).":"Black (purple Orthodox).");persist();draw();if(game.turn()===computer())engineMove();}
function engineMove(){if(!game||!data().active||game.turn()!==computer()||busy)return;if(!engineReady){chessNotice="Waiting for Stockfish to finish loading.";draw();return;}busy=true;const id=++requestId;worker.postMessage("setoption name UCI_LimitStrength value true");worker.postMessage("setoption name UCI_Elo value "+target());worker.postMessage("setoption name Skill Level value "+strength());worker.postMessage("position fen "+game.fen());worker.postMessage("go movetime 500");worker._moveId=id;draw();}
function draw(){
 const el=root();if(!el||!game)return;const d=data();
 const legal=d.active&&selected?game.moves({square:selected,verbose:true}).map(m=>m.to):[];
 const names={k:"king",q:"queen",r:"rook",b:"bishop",n:"knight",p:"pawn"};
 const assets="assets/Chess/";
 let html='<div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:8px"><strong>Rating: '+d.elo+' Elo</strong><span class="sub">Stockfish target: '+target()+' · '+d.wins+'W / '+d.losses+'L / '+d.draws+'D</span></div>';
 html+='<p class="sub" role="status">'+(d.active?(busy?"Stockfish is thinking…":game.turn()===human()?"Your move ("+(human()==="w"?"White · red Catholic":"Black · purple Orthodox")+")":engineReady?"Stockfish to move":"Waiting for Stockfish…"):"No active match — choose New Game to play")+'</p>';
 html+='<p class="sub" role="status" aria-live="polite">'+escape(engineError||chessNotice)+'</p>';
 html+='<div id="wayfarerChessBoard" class="christendom-board" role="group" aria-label="Christendom chessboard, red Catholic pieces versus purple Orthodox pieces"><div class="christendom-squares">';
 for(let row=0;row<8;row++)for(let col=0;col<8;col++){
  const sq=(human()==="b"?"hgfedcba":"abcdefgh")[col]+(human()==="b"?row+1:8-row),p=game.get(sq),selectedSquare=selected===sq,possible=legal.includes(sq);
  const label=sq+(p?" "+(p.color==="w"?"Catholic ":"Orthodox ")+names[p.type]:" empty");
  const img=p?'<img draggable="false" alt="" src="'+assets+(p.color==="w"?"catholic_":"orthodox_")+names[p.type]+'.png">':"";
  html+='<button type="button" class="christendom-square'+(selectedSquare?' is-selected':'')+(possible?' is-legal':'')+'" data-square="'+sq+'" aria-label="'+label+'" aria-pressed="'+(selectedSquare?'true':'false')+'">'+img+'</button>';
 }
 html+='</div></div><div class="christendom-actions">';
 if(!d.active){
  html+='<button class="christendom-action" id="chessNew" type="button" aria-label="New game"><img alt="" src="'+assets+'new_game.png"></button>';
 }else{
  html+='<button class="christendom-action" id="chessResign" type="button" aria-label="Resign"><img alt="" src="'+assets+'resign.png"></button>';
 }
 html+='</div>';
 if(!d.active&&choosingSide)html+='<div class="card" role="group" aria-label="Choose chess side"><strong>Choose your side</strong><div class="row" style="flex-wrap:wrap;gap:10px;margin-top:10px"><button class="btn" id="chessWhite" type="button">White · Catholic (red)</button><button class="btn secondary" id="chessBlack" type="button">Black · Orthodox (purple)</button><button class="btn secondary" id="chessCancel" type="button">Cancel</button></div></div>';
 html+='<p class="sub">Rating is local to Wayfarer, not an official FIDE or Chess.com rating. Internet is needed to load the chess engine and rules.</p>';
 if(d.history.length)html+='<details><summary>Recent games ('+d.history.length+')</summary><ol>'+d.history.slice(0,12).map(x=>'<li>'+escape(x.result)+' · '+(x.delta>=0?"+":"")+x.delta+' Elo · '+escape(x.elo)+'</li>').join("")+'</ol></details>';
 el.innerHTML=html;
 el.querySelectorAll("[data-square]").forEach(b=>b.addEventListener("click",()=>clickSquare(b.dataset.square)));
 const newBtn=el.querySelector("#chessNew");
 if(newBtn)newBtn.onclick=()=>{choosingSide=true;chessNotice="Choose White or Black to start.";draw();};
 const whiteBtn=el.querySelector("#chessWhite");
 if(whiteBtn)whiteBtn.onclick=()=>newGame("w");
 const blackBtn=el.querySelector("#chessBlack");
 if(blackBtn)blackBtn.onclick=()=>newGame("b");
 const cancelBtn=el.querySelector("#chessCancel");
 if(cancelBtn)cancelBtn.onclick=()=>{choosingSide=false;draw();};
 const resignBtn=el.querySelector("#chessResign");
 if(resignBtn)resignBtn.onclick=()=>{if(confirm("Resign and record a loss?")){stop();selected=null;finish("loss");}};

}
function clickSquare(sq){
 if(!game||!data().active)return;
 if(busy||game.turn()!==human()){chessNotice="Wait for Stockfish to move.";draw();return;}
 const p=game.get(sq);
 if(selected===sq){selected=null;chessNotice="Selection cleared.";draw();return;}
 if(selected){
  try{
   const m=game.move({from:selected,to:sq,promotion:"q"});
   if(m){selected=null;chessNotice="Played "+m.san+".";persist();draw();if(!terminal())engineMove();return;}
  }catch(e){console.warn("Chess move rejected",e);}
 }
 selected=p?.color===human()?sq:null;
 chessNotice=selected?"Selected "+selected+". Choose a highlighted destination.":"Select one of your pieces.";
 draw();
}
function startEngine(attempt=0){
 if(attempt>=ENGINE_URLS.length){
  engineReady=false;busy=false;
  engineError="Stockfish could not load from either provider. Your match is saved; reconnect and reopen Chess to retry.";
  draw();return;
 }
 try{
  if(worker){worker.terminate();worker=null;}
  engineReady=false;busy=false;
  const source='try { importScripts('+JSON.stringify(ENGINE_URLS[attempt])+'); } catch (error) { postMessage("wayfarer-engine-load-error: "+String(error)); }';
  const blob=new Blob([source],{type:"text/javascript"});
  const url=URL.createObjectURL(blob);
  const current=new Worker(url);
  worker=current;
  URL.revokeObjectURL(url);
  let ready=false;
  const timeout=setTimeout(()=>{if(worker===current&&!ready)fail("Stockfish initialization timed out");},18000);
  function fail(reason){
   if(worker!==current)return;
   clearTimeout(timeout);current.terminate();worker=null;
   engineReady=false;busy=false;
   console.warn("Stockfish source "+(attempt+1)+" failed:",reason);
   engineError="Retrying Stockfish from another provider…";
   draw();
   startEngine(attempt+1);
  }
  current.onmessage=ev=>{
   if(worker!==current)return;
   const line=String(ev.data);
   if(line.startsWith("wayfarer-engine-load-error:")){fail(line);return;}
   if(line.includes("uciok")){
    ready=true;clearTimeout(timeout);engineReady=true;engineError="";draw();
    if(data().active&&game?.turn()===computer())engineMove();
   }
   const match=line.match(/bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)/);
   if(match&&busy&&current._moveId===requestId&&game?.turn()===computer()){
    busy=false;
    try{
     game.move({from:match[1].slice(0,2),to:match[1].slice(2,4),promotion:match[1][4]||"q"});
     selected=null;chessNotice="Stockfish played "+match[1].slice(0,4)+".";
     persist();draw();terminal();
    }catch(e){console.error("Stockfish illegal move",e);draw();}
   }
  };
  current.onerror=e=>{e.preventDefault?.();fail(e.message||"Worker script failed");};
  current.onmessageerror=()=>fail("Worker message error");
  current.postMessage("uci");
 }catch(e){console.warn("Stockfish startup failed",e);engineError="Retrying Stockfish…";draw();startEngine(attempt+1);}
}
async function init(){const el=root();if(!el)return;const account=String(cloudUser?.id||"");if(!account)return;if(initialized&&loadedAccount===account){draw();return;}loadedAccount=account;initialized=true;engineReady=false;engineError="";chessNotice="";selected=null;choosingSide=false;busy=false;if(worker){worker.terminate();worker=null;}el.textContent="Loading chess rules and Stockfish…";try{if(!ChessClass){const mod=await import(CHESS_URL);ChessClass=mod.Chess;}game=new ChessClass();const d=data();if(d.active&&d.pgn){try{game.loadPgn(d.pgn);}catch(e){d.pgn="";game.reset();}}if(d.active&&game.isGameOver())terminal();draw();startEngine();}catch(e){el.textContent="Chess could not load. Check your internet connection and reopen this tab.";console.error("Chess dependency failed",e);initialized=false;}}
window.WayfarerTabModules=window.WayfarerTabModules||{};window.WayfarerTabRenderers=window.WayfarerTabRenderers||{};window.WayfarerTabModules.chess=()=>{if(document.querySelector(".tab.active")?.dataset.tab==="chess")init();};window.WayfarerTabRenderers.chess=()=>{if(initialized&&game&&loadedAccount===String(cloudUser?.id||""))draw();else init();};
})();
