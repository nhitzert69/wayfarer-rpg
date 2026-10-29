// Wayfarer modular script segment. Keep load order in index.html.
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


