/* Wayfarer groceries tab renderer. Loaded on first tab selection. */
window.WayfarerTabRenderers = window.WayfarerTabRenderers || {};
window.WayfarerTabRenderers.groceries = function() {
 const groceryListEl=document.getElementById("groceryList");
 const groceryCountEl=document.getElementById("groceryCount");
 const openGroceries=state.groceries.filter(g=>!g.checked).length;
 if(groceryCountEl)groceryCountEl.textContent=`${openGroceries} to buy · ${state.groceries.length} total`;
 if(groceryListEl)groceryListEl.innerHTML=state.groceries.length?[...state.groceries].sort((a,b)=>Number(a.checked)-Number(b.checked)||(a.createdAt||"").localeCompare(b.createdAt||"")).map(g=>`<div class="logItem" style="margin-top:8px;padding:11px;border:1px solid var(--line);border-radius:12px"><div class="row" style="align-items:center;gap:8px"><label style="display:flex;align-items:center;gap:10px;flex:1;min-width:0"><input type="checkbox" data-grocery-check="${esc(g.id)}" ${g.checked?"checked":""} style="width:auto;flex-shrink:0"/><span style="${g.checked?"text-decoration:line-through;opacity:.6":""}"><strong>${esc(g.name)}</strong>${g.quantity?` <span class="sub">· ${esc(g.quantity)}</span>`:""}</span></label><button class="btn small" type="button" data-grocery-delete="${esc(g.id)}">Remove</button></div></div>`).join(""):'<div class="empty">Your list is empty. Add what you need to buy.</div>';
 if(groceryListEl){
  groceryListEl.querySelectorAll("[data-grocery-check]").forEach(el=>el.addEventListener("change",()=>{const item=state.groceries.find(g=>String(g.id)===String(el.dataset.groceryCheck));if(item){item.checked=el.checked;save();}}));
  groceryListEl.querySelectorAll("[data-grocery-delete]").forEach(el=>el.addEventListener("click",()=>{state.groceries=state.groceries.filter(g=>String(g.id)!==String(el.dataset.groceryDelete));save();}));
 }
};
window.WayfarerTabModules = window.WayfarerTabModules || {};
window.WayfarerTabModules.groceries = function() { window.WayfarerTabRenderers.groceries(); };
