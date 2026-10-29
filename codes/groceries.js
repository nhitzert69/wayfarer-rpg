// Wayfarer modular script segment. Keep load order in index.html.
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

