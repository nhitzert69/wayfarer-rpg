/* Wayfarer journal tab renderer. Loaded on first tab selection. */
window.WayfarerTabRenderers = window.WayfarerTabRenderers || {};
window.WayfarerTabRenderers.journal = function() {
 const journalListEl=document.getElementById("journalList");
 if(journalListEl) journalListEl.innerHTML=state.journal.length?[...state.journal].sort((a,b)=>(b.createdAt||b.date||"").localeCompare(a.createdAt||a.date||"")).map(j=>`<div class="logItem" style="margin-top:10px;padding:12px;border:1px solid var(--line);border-radius:12px"><div class="row" style="align-items:flex-start"><strong>${esc(j.title)}</strong><span class="tag">${esc(j.type)}</span></div><div class="sub">${esc(j.displayDate||j.date||"Date unknown")}</div><p style="margin:7px 0 0;color:#d2c2a6;white-space:pre-wrap">${esc(j.text||"")}</p><div class="row" style="margin-top:10px;gap:8px"><button class="btn small" type="button" data-edit-journal="${esc(j.id||"")}">Edit</button><button class="btn small" type="button" data-delete-journal="${esc(j.id||"")}">Delete</button></div></div>`).join(""):'<div class="empty">Your chronicles will appear here.</div>';
 if(journalListEl){
   journalListEl.querySelectorAll("[data-edit-journal]").forEach(button=>button.addEventListener("click",()=>editJournalEntry(button.dataset.editJournal)));
   journalListEl.querySelectorAll("[data-delete-journal]").forEach(button=>button.addEventListener("click",()=>deleteJournalEntry(button.dataset.deleteJournal)));
 }
};
window.WayfarerTabModules = window.WayfarerTabModules || {};
window.WayfarerTabModules.journal = function() { window.WayfarerTabRenderers.journal(); };
