/* v2.1.1: IIFE isolates tab-local declarations so modules can preload together. */
(()=>{
/* Wayfarer groceries tab renderer. Loaded on first tab selection. */
window.WayfarerTabRenderers = window.WayfarerTabRenderers || {};
window.WayfarerTabRenderers.groceries = function() {
 const groceryListEl=document.getElementById("groceryList");
 const groceryCountEl=document.getElementById("groceryCount");
 const openGroceries=state.groceries.filter(g=>!g.checked).length;
 if(groceryCountEl)groceryCountEl.textContent=`${openGroceries} to buy · ${state.groceries.length} total`;
 if(groceryListEl)groceryListEl.innerHTML=state.groceries.length?[...state.groceries].sort((a,b)=>Number(a.checked)-Number(b.checked)||(a.createdAt||"").localeCompare(b.createdAt||"")).map(g=>`<div class="logItem" style="margin-top:8px;padding:11px;border:1px solid var(--line);border-radius:12px"><div class="row" style="align-items:center;gap:8px"><label style="display:flex;align-items:center;gap:10px;flex:1;min-width:0"><input type="checkbox" data-grocery-check="${esc(g.id)}" ${g.checked?"checked":""} style="width:auto;flex-shrink:0"/><span style="${g.checked?"text-decoration:line-through;opacity:.6":""}"><strong>${esc(g.name)}</strong>${g.quantity?` <span class="sub">· ${esc(g.quantity)}</span>`:""}</span></label><button class="btn small" type="button" data-grocery-delete="${esc(g.id)}">Remove</button></div></div>`).join(""):'<div class="empty">Your list is empty. Add what you need to buy.</div>';
};
// Delegate list actions once; rendering replaces row nodes but not this container.
const groceryListRoot=document.getElementById("groceryList");
if(groceryListRoot&&!groceryListRoot.dataset.wayfarerGroceryActionsBound){
 groceryListRoot.dataset.wayfarerGroceryActionsBound="true";
 groceryListRoot.addEventListener("change",event=>{const el=event.target.closest("[data-grocery-check]");if(!el||!groceryListRoot.contains(el))return;const item=state.groceries.find(g=>String(g.id)===String(el.dataset.groceryCheck));if(item){item.checked=el.checked;save();render();}});
 groceryListRoot.addEventListener("click",event=>{const button=event.target.closest("[data-grocery-delete]");if(!button||!groceryListRoot.contains(button))return;state.groceries=state.groceries.filter(g=>String(g.id)!==String(button.dataset.groceryDelete));save();render();});
}
window.WayfarerTabModules = window.WayfarerTabModules || {};
window.WayfarerTabModules.groceries = function() { window.WayfarerTabRenderers.groceries(); };


/* Lazy Groceries form/actions extracted from index.html in v2.1.1. */
// Grocery list: saved alongside the user's existing local Wayfarer data.
const groceryForm=document.getElementById("groceryForm");
function createGroceryId(){
 try{if(window.crypto&&typeof window.crypto.randomUUID==="function")return window.crypto.randomUUID();}catch(error){/* Use the fallback below when a browser blocks randomUUID. */}
 try{if(window.crypto&&typeof window.crypto.getRandomValues==="function"){const bytes=new Uint32Array(4);window.crypto.getRandomValues(bytes);return "g-"+Array.from(bytes,n=>n.toString(16).padStart(8,"0")).join("");}}catch(error){/* Fall through to a timestamp/random fallback. */}
 return "g-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2)+"-"+Math.random().toString(36).slice(2);
}
if(groceryForm&&!groceryForm.dataset.wayfarerGroceryFormBound){
 groceryForm.dataset.wayfarerGroceryFormBound="true";
 groceryForm.addEventListener("submit",function(event){
  event.preventDefault();
  const name=document.getElementById("groceryItem").value.trim();
  const quantity=document.getElementById("groceryQty").value.trim();
  if(!name)return;
  const id=createGroceryId();
  state.groceries.push({id,name,quantity,checked:false,createdAt:new Date().toISOString()});
  groceryForm.reset();
  save();
  document.getElementById("groceryItem").focus();
 });
}
const clearBoughtGroceries=document.getElementById("clearBoughtGroceries");
if(clearBoughtGroceries&&!clearBoughtGroceries.dataset.wayfarerGroceryClearBoughtBound){
 clearBoughtGroceries.dataset.wayfarerGroceryClearBoughtBound="true";
 clearBoughtGroceries.addEventListener("click",()=>{const before=state.groceries.length;state.groceries=state.groceries.filter(g=>!g.checked);if(state.groceries.length!==before){save();toast("Checked items removed.");}});
}
const clearGroceries=document.getElementById("clearGroceries");
if(clearGroceries&&!clearGroceries.dataset.wayfarerGroceryClearAllBound){
 clearGroceries.dataset.wayfarerGroceryClearAllBound="true";
 clearGroceries.addEventListener("click",()=>{if(!state.groceries.length)return;if(!confirm("Clear your entire grocery list?"))return;state.groceries=[];save();toast("Grocery list cleared.");});
}
})();
