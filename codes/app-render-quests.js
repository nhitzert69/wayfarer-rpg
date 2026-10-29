// Extracted from v2.0.3. Preserve shared account state and save paths in index.html.
 function questCard(q){return `<article class="card questActive" data-quest-card="${esc(q.id)}">
  <div class="questTop"><div class="questBody"><div class="row" style="align-items:flex-start"><h3>${categoryIcon(q.category,q.skill)} ${esc(q.title)}</h3><span class="xp">+${q.xp} XP · +${5+Math.max(0,Number(q.perkBonusGold)||0)} coins${q.skillLevelBonusXp?` <small style="display:block;font-size:11px;opacity:.85">Includes +${q.skillLevelBonusXp} skill-level bonus XP (Lv ${q.generatedForLevel||1})</small>`:""}${q.perkBonusXp?` <small style="display:block;font-size:11px;opacity:.85">Includes ${q.perkBonusXp} ${esc(q.perkThemeName||"theme")} bonus XP</small>`:""}</span></div>
   <p>${esc(q.description||"Complete this quest in a way that fits your day.")}</p><div class="row"><span class="tag">${esc(q.category)}</span><span class="tag">${esc(q.skill||"Discipline")}</span>${q.estimatedMinutes?`<span class="tag">~${q.estimatedMinutes} min</span>`:""}<button class="btn small" data-complete-btn="${q.id}">Complete</button></div></div></div>
 </article>`;}

function awardQuestRewards(target,q){
 const amount=Math.max(0,Number(q?.xp)||0);const coins=5+Math.max(0,Number(q?.perkBonusGold)||0);
 target.xp=(Number(target.xp)||0)+amount;target.gold=Math.max(0,Number(target.gold)||0)+coins;
 if(!target.skillXp||typeof target.skillXp!=="object")target.skillXp={};
 const skill=q?.skill||({"Social":"Social Interactions","Adventure":"Adventure","Skill":"Creativity","Knowledge":"Knowledge","Relationships":"Relationships","Daily":"Discipline","Side quest":"Discipline","Boss quest":"Adventure"})[q?.category]||"Discipline";
 target.skillXp[skill]=(Number(target.skillXp[skill])||0)+amount;target.completedTotal=(Number(target.completedTotal)||0)+1;
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

