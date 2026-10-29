/* v2.1.1: IIFE isolates tab-local declarations so modules can preload together. */
(()=>{
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


/* Lazy To Do form/actions extracted from index.html in v2.1.1. */
let todoEditingId=null;
const todoForm=document.getElementById("todoForm"),todoSubmitBtn=document.getElementById("todoSubmitBtn"),cancelTodoEditBtn=document.getElementById("cancelTodoEditBtn");
function resetTodoForm(){todoEditingId=null;if(todoForm)todoForm.reset();if(todoSubmitBtn)todoSubmitBtn.textContent="Save task";if(cancelTodoEditBtn)cancelTodoEditBtn.style.display="none";}
function editTodo(id){const t=state.todo.find(x=>String(x.id)===String(id));if(!t)return;todoEditingId=t.id;document.getElementById("todoTitle").value=t.title||"";document.getElementById("todoDue").value=t.dueDate||"";document.getElementById("todoPriority").value=t.priority||"normal";document.getElementById("todoNotes").value=t.notes||"";todoSubmitBtn.textContent="Update task";cancelTodoEditBtn.style.display="inline-flex";document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab==="todo"));document.querySelectorAll(".section").forEach(s=>s.classList.toggle("active",s.id==="section-todo"));window.scrollTo({top:0,behavior:"smooth"});}
function deleteTodo(id){const t=state.todo.find(x=>String(x.id)===String(id));if(!t||!confirm(`Delete task "${t.title}"?`))return;state.todo=state.todo.filter(x=>String(x.id)!==String(id));if(String(todoEditingId)===String(id))resetTodoForm();save();toast("Task deleted.");}
function saveTodoTask(){
 const wasEditing=todoEditingId!==null;
 try{
  const titleEl=document.getElementById("todoTitle");
  const title=titleEl.value.trim();
  if(!title){titleEl.focus();toast("Please enter a task name.");return;}
  const now=new Date();
  const data={title,dueDate:document.getElementById("todoDue").value,priority:document.getElementById("todoPriority").value,notes:document.getElementById("todoNotes").value.trim(),updatedAt:now.toISOString()};
  if(todoEditingId!==null){
   const task=state.todo.find(x=>String(x.id)===String(todoEditingId));
   if(!task){resetTodoForm();toast("That task could not be found.");return;}
   Object.assign(task,data);
  }else{
   const id=(window.crypto&&typeof window.crypto.randomUUID==="function")?window.crypto.randomUUID():String(Date.now())+"-"+Math.random().toString(36).slice(2);
   state.todo.push({id,...data,completed:false,createdAt:now.toISOString()});
  }
  localStorage.setItem(KEY,JSON.stringify(state));
  resetTodoForm();
  render();
  toast(wasEditing?"Task updated.":"Task saved.");
 }catch(error){
  console.error("Could not save To Do task",error);
  toast("Couldn't save task. Please try again.");
 }
}
todoSubmitBtn.addEventListener("click",saveTodoTask);
todoForm.addEventListener("submit",function(event){event.preventDefault();saveTodoTask();});
cancelTodoEditBtn.addEventListener("click",resetTodoForm);
document.getElementById("addTodoBtn").addEventListener("click",()=>document.getElementById("todoTitle").focus());
})();
