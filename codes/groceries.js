// Wayfarer Grocery feature extracted from the v2.0.3 inline script.
function renderGroceryList(){
 const groceryListEl=document.getElementById("groceryList");
 const groceryCountEl=document.getElementById("groceryCount");
 const openGroceries=state.groceries.filter(g=>!g.checked).length;
 if(groceryCountEl)groceryCountEl.textContent=`${openGroceries} to buy · ${state.groceries.length} total`;
 if(groceryListEl)groceryListEl.innerHTML=state.groceries.length?[...state.groceries].sort((a,b)=>Number(a.checked)-Number(b.checked)||(a.createdAt||"").localeCompare(b.createdAt||"")).map(g=>`<div class="logItem" style="margin-top:8px;padding:11px;border:1px solid var(--line);border-radius:12px"><div class="row" style="align-items:center;gap:8px"><label style="display:flex;align-items:center;gap:10px;flex:1;min-width:0"><input type="checkbox" data-grocery-check="${esc(g.id)}" ${g.checked?"checked":""} style="width:auto;flex-shrink:0"/><span style="${g.checked?"text-decoration:line-through;opacity:.6":""}"><strong>${esc(g.name)}</strong>${g.quantity?` <span class="sub">· ${esc(g.quantity)}</span>`:""}</span></label><button class="btn small" type="button" data-grocery-delete="${esc(g.id)}">Remove</button></div></div>`).join(""):'<div class="empty">Your list is empty. Add what you need to buy.</div>';
 if(groceryListEl){
  groceryListEl.querySelectorAll("[data-grocery-check]").forEach(el=>el.addEventListener("change",()=>{const item=state.groceries.find(g=>String(g.id)===String(el.dataset.groceryCheck));if(item){item.checked=el.checked;save();}}));
  groceryListEl.querySelectorAll("[data-grocery-delete]").forEach(el=>el.addEventListener("click",()=>{state.groceries=state.groceries.filter(g=>String(g.id)!==String(el.dataset.groceryDelete));save();}));
 }

}
// Grocery list: saved alongside the user's existing local Wayfarer data.
const groceryForm=document.getElementById("groceryForm");
if(groceryForm)groceryForm.addEventListener("submit",function(event){
 event.preventDefault();
 const name=document.getElementById("groceryItem").value.trim();
 const quantity=document.getElementById("groceryQty").value.trim();
 if(!name)return;
 state.groceries.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),name,quantity,checked:false,createdAt:new Date().toISOString()});
 groceryForm.reset();
 save();
 document.getElementById("groceryItem").focus();
});
const clearBoughtGroceries=document.getElementById("clearBoughtGroceries");
if(clearBoughtGroceries)clearBoughtGroceries.addEventListener("click",()=>{state.groceries=state.groceries.filter(g=>!g.checked);save();toast("Checked items removed.");});
const clearGroceries=document.getElementById("clearGroceries");
if(clearGroceries)clearGroceries.addEventListener("click",()=>{if(!state.groceries.length)return;if(!confirm("Clear your entire grocery list?"))return;state.groceries=[];save();toast("Grocery list cleared.");});

