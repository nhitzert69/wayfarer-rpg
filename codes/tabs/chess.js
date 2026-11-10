/* Wayfarer Chess: chess.js rules and Stockfish ASM UCI worker, lazy loaded. */
(()=>{
const CHESS_URL="https://cdn.jsdelivr.net/npm/chess.js@1.4.0/dist/esm/chess.js";
const ENGINE_URL="https://cdn.jsdelivr.net/npm/stockfish@19.0.1/bin/stockfish-19-asm.js";
let ChessClass=null, game=null, worker=null, selected=null, busy=false, initialized=false, engineReady=false, requestId=0, loadedAccount="";
const root=()=>document.getElementById("chessRoot");
const data=()=>{if(!state.chess||typeof state.chess!=="object")state.chess={elo:800,wins:0,losses:0,draws:0,history:[],pgn:"",active:true,color:"w"};return state.chess;};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const persist=()=>{data().pgn=game.pgn();save(true);};
const target=()=>Math.max(400,Math.min(2400,Math.round(data().elo/100)*100));
const strength=()=>Math.max(0,Math.min(20,Math.round((target()-400)/100)));
const opponent=()=>Math.max(400,target());
function finish(result){const d=data();if(!d.active)return;d.active=false;const score=result==="win"?1:result==="draw"?.5:0;const expected=1/(1+Math.pow(10,(opponent()-d.elo)/400));const delta=Math.round(24*(score-expected));d.elo=Math.max(100,Math.min(3000,d.elo+delta));d[result==="win"?"wins":result==="loss"?"losses":"draws"]++;d.history.unshift({date:new Date().toISOString(),result,delta,elo:d.elo,pgn:game.pgn()});d.history=d.history.slice(0,50);persist();draw();}
function terminal(){if(!game.isGameOver())return false;finish(game.isDraw()?"draw":game.isCheckmate()?(game.turn()==="w"?"loss":"win"):"draw");return true;}
function stop(){requestId++;busy=false;if(worker&&engineReady)worker.postMessage("stop");}
function newGame(){stop();game=new ChessClass();const d=data();d.pgn="";d.active=true;d.color="w";persist();draw();}
function engineMove(){if(!game||!data().active||game.turn()!=="b"||busy||!engineReady)return;busy=true;const id=++requestId;worker.postMessage("setoption name UCI_LimitStrength value true");worker.postMessage("setoption name UCI_Elo value "+target());worker.postMessage("setoption name Skill Level value "+strength());worker.postMessage("position fen "+game.fen());worker.postMessage("go movetime 500");worker._moveId=id;draw();}
function draw(){
 const el=root();if(!el||!game)return;const d=data();
 const legal=selected?game.moves({square:selected,verbose:true}).map(m=>m.to):[];
 const names={k:"king",q:"queen",r:"rook",b:"bishop",n:"knight",p:"pawn"};
 const assets="assets/Chess/";
 let html='<div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:8px"><strong>Rating: '+d.elo+' Elo</strong><span class="sub">Stockfish target: '+target()+' · '+d.wins+'W / '+d.losses+'L / '+d.draws+'D</span></div>';
 html+='<p class="sub" role="status">'+(d.active?(busy?"Stockfish is thinking…":game.turn()==="w"?"Your move (Western Catholic — red)":engineReady?"Eastern Orthodox — purple to move":"Loading Stockfish…"):"Game finished — start a new game")+'</p>';
 html+='<div id="wayfarerChessBoard" class="christendom-board" role="group" aria-label="Christendom chessboard, red Catholic pieces versus purple Orthodox pieces"><div class="christendom-squares">';
 for(let row=0;row<8;row++)for(let col=0;col<8;col++){
  const sq="abcdefgh"[col]+(8-row),p=game.get(sq),selectedSquare=selected===sq,possible=legal.includes(sq);
  const label=sq+(p?" "+(p.color==="w"?"Catholic ":"Orthodox ")+names[p.type]:" empty");
  const img=p?'<img draggable="false" alt="" src="'+assets+(p.color==="w"?"catholic_":"orthodox_")+names[p.type]+'.png">':"";
  html+='<button type="button" class="christendom-square'+(selectedSquare?' is-selected':'')+(possible?' is-legal':'')+'" data-square="'+sq+'" aria-label="'+label+'" aria-pressed="'+(selectedSquare?'true':'false')+'">'+img+'</button>';
 }
 html+='</div></div><div class="christendom-actions"><button class="christendom-action" id="chessNew" type="button" aria-label="New game"><img alt="" src="'+assets+'new_game.png"></button><button class="christendom-action" id="chessResign" type="button" aria-label="Resign" '+(!d.active?"disabled":"")+'><img alt="" src="'+assets+'resign.png"></button></div><p class="sub">Rating is local to Wayfarer, not an official FIDE or Chess.com rating. Internet is needed to load the chess engine and rules.</p>';
 if(d.history.length)html+='<details><summary>Recent games ('+d.history.length+')</summary><ol>'+d.history.slice(0,12).map(x=>'<li>'+escape(x.result)+' · '+(x.delta>=0?"+":"")+x.delta+' Elo · '+escape(x.elo)+'</li>').join("")+'</ol></details>';
 el.innerHTML=html;
 el.querySelectorAll("[data-square]").forEach(b=>b.addEventListener("click",()=>clickSquare(b.dataset.square)));
 el.querySelector("#chessNew").onclick=()=>{if(d.active&&game.history().length&&!confirm("Abandon the current game? It will count as a loss."))return;if(d.active&&game.history().length)finish("loss");newGame();};
 el.querySelector("#chessResign").onclick=()=>{if(confirm("Resign and record a loss?")){stop();finish("loss");}};
}
function clickSquare(sq){if(!game||busy||!data().active||game.turn()!=="w"||!engineReady)return;const p=game.get(sq);if(selected){try{const m=game.move({from:selected,to:sq,promotion:"q"});if(m){selected=null;persist();draw();if(!terminal())engineMove();return;}}catch(e){} }selected=p?.color==="w"?sq:null;draw();}
function startEngine(){try{const blob=new Blob(['importScripts('+JSON.stringify(ENGINE_URL)+');'],{type:"text/javascript"});const url=URL.createObjectURL(blob);worker=new Worker(url);URL.revokeObjectURL(url);worker.onmessage=ev=>{const line=String(ev.data);if(line.includes("uciok")){engineReady=true;draw();if(game?.turn()==="b")engineMove();}const match=line.match(/bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)/);if(match&&busy&&worker._moveId===requestId&&game?.turn()==="b"){busy=false;try{game.move({from:match[1].slice(0,2),to:match[1].slice(2,4),promotion:match[1][4]||"q"});persist();draw();terminal();}catch(e){console.error("Stockfish illegal move",e);draw();}}};worker.onerror=e=>{engineReady=false;busy=false;const el=root();if(el)el.insertAdjacentHTML("beforeend",'<p role="alert">Stockfish could not load. Check your connection and reopen Chess.</p>');console.error("Stockfish worker error",e);};worker.postMessage("uci");}catch(e){root().textContent="Unable to start Stockfish: "+e.message;}}
async function init(){const el=root();if(!el)return;const account=String(cloudUser?.id||"");if(!account)return;if(initialized&&loadedAccount===account){draw();return;}loadedAccount=account;initialized=true;engineReady=false;busy=false;if(worker){worker.terminate();worker=null;}el.textContent="Loading chess rules and Stockfish…";try{if(!ChessClass){const mod=await import(CHESS_URL);ChessClass=mod.Chess;}game=new ChessClass();const d=data();if(d.active&&d.pgn){try{game.loadPgn(d.pgn);}catch(e){d.pgn="";game.reset();}}draw();startEngine();}catch(e){el.textContent="Chess could not load. Check your internet connection and reopen this tab.";console.error("Chess dependency failed",e);initialized=false;}}
window.WayfarerTabModules=window.WayfarerTabModules||{};window.WayfarerTabRenderers=window.WayfarerTabRenderers||{};window.WayfarerTabModules.chess=()=>{if(document.querySelector(".tab.active")?.dataset.tab==="chess")init();};window.WayfarerTabRenderers.chess=()=>{if(initialized&&game&&loadedAccount===String(cloudUser?.id||""))draw();else init();};
})();
