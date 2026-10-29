// Wayfarer modular script segment. Keep load order in index.html.
function render(){
 // The old global-character-level widgets were removed from the main page.
 // Update them only if a future version puts those elements back.
 const level=Math.floor(state.xp/100)+1, rem=state.xp%100;
 const levelEl=document.getElementById("level"); if(levelEl) levelEl.textContent=level;
 const totalXpEl=document.getElementById("totalXp"); if(totalXpEl) totalXpEl.textContent=state.xp;
 const toNextEl=document.getElementById("toNext"); if(toNextEl) toNextEl.textContent=100-rem;
 const xpBarEl=document.getElementById("xpBar"); if(xpBarEl) xpBarEl.style.width=rem+"%";
 const xpCaptionEl=document.getElementById("xpCaption"); if(xpCaptionEl) xpCaptionEl.textContent=`${rem} / 100 XP toward your next level`;
 const done=state.quests.filter(q=>q.done).length;
 const dailyCountEl=document.getElementById("dailyCount"); if(dailyCountEl) dailyCountEl.textContent=`${done} / ${state.quests.length}`;
 const completedCountEl=document.getElementById("completedCount"); if(completedCountEl) completedCountEl.textContent=state.completedTotal;
 const journalCountEl=document.getElementById("journalCount"); if(journalCountEl) journalCountEl.textContent=state.journal.length;
 const streakEl=document.getElementById("streak"); if(streakEl) streakEl.textContent=`${state.questDays.length} days`;
 const dateLabelEl=document.getElementById("dateLabel"); if(dateLabelEl) dateLabelEl.textContent=new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
 const shiftNoteEl=document.getElementById("shiftNote"); if(shiftNoteEl) shiftNoteEl.textContent=({low:"Keep it gentle. Recovery is part of the campaign.",normal:"Small steps forge a different life.",free:"Your wider world awaits. Consider a longer adventure."})[state.settings.shift]||"Small steps forge a different life.";
 ensureSelectedSkills();
 const activeQuests=state.quests.filter(q=>!q.done);
 const mainQuests=activeQuests.filter(q=>getSkillPriority(q.skill)==="priority");
 const sideQuests=activeQuests.filter(q=>getSkillPriority(q.skill)!=="priority");
 function questCard(q){return `<article class="card questActive" data-quest-card="${esc(q.id)}">
  <div class="questTop"><div class="questBody"><div class="row" style="align-items:flex-start"><h3>${categoryIcon(q.category,q.skill)} ${esc(q.title)}</h3><span class="xp">+${q.xp} XP · +${5+Math.max(0,Number(q.perkBonusGold)||0)} coins${q.skillLevelBonusXp?` <small style="display:block;font-size:11px;opacity:.85">Includes +${q.skillLevelBonusXp} skill-level bonus XP (Lv ${q.generatedForLevel||1})</small>`:""}${q.perkBonusXp?` <small style="display:block;font-size:11px;opacity:.85">Includes +${q.perkBonusXp} ${esc(q.perkThemeName||"theme")} bonus XP</small>`:""}${q.perkThemeId==="bloodthirst-theme"&&Number(q.perkBonusGold)>0?` <small style="display:block;font-size:11px;opacity:.85">Includes +${q.perkBonusGold} Bloodthirst bonus gold</small>`:""}</span></div>
   <p>${esc(q.description||"Complete this quest in a way that fits your day.")}</p><div class="row"><span class="tag">${esc(q.category)}</span><span class="tag">${esc(q.skill||"Discipline")}</span>${q.estimatedMinutes?`<span class="tag">~${q.estimatedMinutes} min</span>`:""}<button class="btn small" data-complete-btn="${q.id}">Complete</button></div></div></div>
 </article>`;}
 const mainGrid=document.getElementById("mainQuestGrid"),sideGrid=document.getElementById("sideQuestGrid");
 if(mainGrid)mainGrid.innerHTML=mainQuests.length?mainQuests.map(questCard).join(""):'<div class="empty">No main quests yet. Mark one or more selected skills as Priority in the Skills tab, then generate quests.</div>';
 if(sideGrid)sideGrid.innerHTML=sideQuests.length?sideQuests.map(questCard).join(""):'<div class="empty">No side quests right now. Select secondary skills and generate quests, or enjoy your clear board.</div>';
 const gridRoots=[mainGrid,sideGrid].filter(Boolean);
 gridRoots.forEach(grid=>grid.querySelectorAll("[data-complete-btn]").forEach(el=>el.addEventListener("click",()=>completeQuest(el.dataset.completeBtn,true))));
 updateGenerateButtonStatus();
 ensureSelectedSkills();
 renderSkillProgress();
 renderSkillCatalog();

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

 const groceryListEl=document.getElementById("groceryList");
 const groceryCountEl=document.getElementById("groceryCount");
 const openGroceries=state.groceries.filter(g=>!g.checked).length;
 if(groceryCountEl)groceryCountEl.textContent=`${openGroceries} to buy · ${state.groceries.length} total`;
 if(groceryListEl)groceryListEl.innerHTML=state.groceries.length?[...state.groceries].sort((a,b)=>Number(a.checked)-Number(b.checked)||(a.createdAt||"").localeCompare(b.createdAt||"")).map(g=>`<div class="logItem" style="margin-top:8px;padding:11px;border:1px solid var(--line);border-radius:12px"><div class="row" style="align-items:center;gap:8px"><label style="display:flex;align-items:center;gap:10px;flex:1;min-width:0"><input type="checkbox" data-grocery-check="${esc(g.id)}" ${g.checked?"checked":""} style="width:auto;flex-shrink:0"/><span style="${g.checked?"text-decoration:line-through;opacity:.6":""}"><strong>${esc(g.name)}</strong>${g.quantity?` <span class="sub">· ${esc(g.quantity)}</span>`:""}</span></label><button class="btn small" type="button" data-grocery-delete="${esc(g.id)}">Remove</button></div></div>`).join(""):'<div class="empty">Your list is empty. Add what you need to buy.</div>';
 if(groceryListEl){
  groceryListEl.querySelectorAll("[data-grocery-check]").forEach(el=>el.addEventListener("change",()=>{const item=state.groceries.find(g=>String(g.id)===String(el.dataset.groceryCheck));if(item){item.checked=el.checked;save();}}));
  groceryListEl.querySelectorAll("[data-grocery-delete]").forEach(el=>el.addEventListener("click",()=>{state.groceries=state.groceries.filter(g=>String(g.id)!==String(el.dataset.groceryDelete));save();}));
 }

 const journalListEl=document.getElementById("journalList");
 if(journalListEl) journalListEl.innerHTML=state.journal.length?[...state.journal].sort((a,b)=>(b.createdAt||b.date||"").localeCompare(a.createdAt||a.date||"")).map(j=>`<div class="logItem" style="margin-top:10px;padding:12px;border:1px solid var(--line);border-radius:12px"><div class="row" style="align-items:flex-start"><strong>${esc(j.title)}</strong><span class="tag">${esc(j.type)}</span></div><div class="sub">${esc(j.displayDate||j.date||"Date unknown")}</div><p style="margin:7px 0 0;color:#d2c2a6;white-space:pre-wrap">${esc(j.text||"")}</p><div class="row" style="margin-top:10px;gap:8px"><button class="btn small" type="button" data-edit-journal="${esc(j.id||"")}">Edit</button><button class="btn small" type="button" data-delete-journal="${esc(j.id||"")}">Delete</button></div></div>`).join(""):'<div class="empty">Your chronicles will appear here.</div>';
 if(journalListEl){
   journalListEl.querySelectorAll("[data-edit-journal]").forEach(button=>button.addEventListener("click",()=>editJournalEntry(button.dataset.editJournal)));
   journalListEl.querySelectorAll("[data-delete-journal]").forEach(button=>button.addEventListener("click",()=>deleteJournalEntry(button.dataset.deleteJournal)));
 }
 for(const [id,val] of Object.entries(state.settings)){const el=document.getElementById(id);if(el&&el.type!=="checkbox"&&el.type!=="range")el.value=val}
updateMusicControls();
renderCharacterOverview();}
function awardQuestRewards(target,q){
 const amount=Math.max(0,Number(q?.xp)||0);
 target.xp=(Number(target.xp)||0)+amount;
 const coins=5+Math.max(0,Number(q?.perkBonusGold)||0);
 target.gold=Math.max(0,Number(target.gold)||0)+coins;
 if(!target.skillXp||typeof target.skillXp!=="object")target.skillXp={};
 const skill=q?.skill||({"Social":"Social Interactions","Adventure":"Adventure","Skill":"Creativity","Knowledge":"Knowledge","Relationships":"Relationships","Daily":"Discipline","Side quest":"Discipline","Boss quest":"Adventure"})[q?.category]||"Discipline";
 target.skillXp[skill]=(Number(target.skillXp[skill])||0)+amount;
 target.completedTotal=(Number(target.completedTotal)||0)+1;
 return {xp:amount,skill,coins};
}
function completeQuest(id,done=true){
 const q=state.quests.find(q=>String(q.id)===String(id));
 if(!q||q.done===done)return;
 if(!done){toast("Earned XP is never removed. Your completed quest stays recorded.");return;}
 if(!debugQuestRulesOverridden()&&!window.confirm(`Complete “${q.title}” and claim +${Number(q.xp)||0} XP + ${5+Math.max(0,Number(q.perkBonusGold)||0)} coins${q.perkBonusXp?` (includes ${q.perkBonusXp} ${q.perkThemeName||"theme"} bonus XP)`:""}?`))return;
 // Record completion and award XP immediately, before the visual card animation.
 q.done=true;
 const award=awardQuestRewards(state,q);
 const skill=award.skill;
 const perkThemeName=q.perkThemeName||"";
 if(!state.questDays.includes(today()))state.questDays.push(today());
 toast(`Quest complete! +${q.xp} XP · +${award.coins} coins${q.perkBonusXp?` · includes +${q.perkBonusXp} ${perkThemeName} bonus`:""}`);
 const grids=[document.getElementById("mainQuestGrid"),document.getElementById("sideQuestGrid")].filter(Boolean);
 const trigger=grids.flatMap(grid=>[...grid.querySelectorAll("[data-complete-btn]")]).find(el=>String(el.dataset.completeBtn)===String(id));
 const card=trigger?trigger.closest("article"):null;
 // Save immediately without rerendering, so the user can see the checked/complete state slide away.
 save(true);
 if(!card){render();return;}
 card.classList.add("questDone","questLeaving");
 card.querySelectorAll("button").forEach(el=>{el.disabled=true;});
 const title=card.querySelector("h3");if(title)title.setAttribute("aria-label","Completed: "+q.title);
 const completeButton=card.querySelector("[data-complete-btn]");if(completeButton){completeButton.textContent="Completed ✓";completeButton.setAttribute("aria-label","Quest completed");}
 window.setTimeout(()=>render(),340);
}

