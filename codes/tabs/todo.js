/* Wayfarer todo tab renderer. Loaded on first tab selection. */
window.WayfarerTabRenderers = window.WayfarerTabRenderers || {};
window.WayfarerTabRenderers.todo = function() {
 const todoListEl=document.getElementById("todoList");
 const todoCountEl=document.getElementById("todoCount");
 const openTodoCount=state.todo.filter(t=>!t.completed).length;
 if(todoCountEl)todoCountEl.textContent=`${openTodoCount} open`;
 if(todoListEl)todoListEl.innerHTML=state.todo.length?[...state.todo].sort((a,b)=>Number(a.completed)-Number(b.completed)||(a.dueDate||"9999-12-31").localeCompare(b.dueDate||"9999-12-31")||(b.createdAt||"").localeCompare(a.createdAt||"")).map(t=>`<div class="logItem" style="margin-top:10px;padding:12px;border:1px solid var(--line);border-radius:12px"><div class="row" style="align-items:flex-start;gap:8px"><label style="display:flex;align-items:flex-start;gap:8px;flex:1"><input type="checkbox" data-todo-complete="${esc(t.id)}" ${t.completed?"checked":""} style="width:auto;margin-top:5px"/><span style="${t.completed?"text-decoration:line-through;opacity:.7":""}"><strong>${esc(t.title)}</strong>${t.dueDate?`<span class="sub" style="display:block">Due ${esc(t.dueDate)}</span>`:""}${t.notes?`<span class="sub" style="display:block;white-space:pre-wrap">${esc(t.notes)}</span>`:""}</span></label><span class="tag">${esc(t.priority||"normal")}</span></div><div class="row" style="margin-top:10px;gap:8px"><button class="btn small" type="button" data-edit-todo="${esc(t.id)}">Edit</button><button class="btn small" type="button" data-delete-todo="${esc(t.id)}">Delete</button></div></div>`).join(""):'<div class="empty">No tasks yet. Add something you want to remember.</div>';
 if(todoListEl){
 todoListEl.querySelectorAll("[data-todo-complete]").forEach(el=>el.addEventListener("change",()=>{const t=state.todo.find(x=>String(x.id)===String(el.dataset.todoComplete));if(t){t.completed=el.checked;save();}}));
 todoListEl.querySelectorAll("[data-edit-todo]").forEach(el=>el.addEventListener("click",()=>editTodo(el.dataset.editTodo)));
 todoListEl.querySelectorAll("[data-delete-todo]").forEach(el=>el.addEventListener("click",()=>deleteTodo(el.dataset.deleteTodo)));
 }
};
window.WayfarerTabModules = window.WayfarerTabModules || {};
window.WayfarerTabModules.todo = function() { window.WayfarerTabRenderers.todo(); };
