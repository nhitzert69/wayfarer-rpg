/* v2.1.1: IIFE isolates tab-local declarations so modules can preload together. */
(()=>{
/* Wayfarer journal tab renderer. Loaded on first tab selection. */
window.WayfarerTabRenderers = window.WayfarerTabRenderers || {};
window.WayfarerTabRenderers.journal.renderSummary = function(){
 const count=document.getElementById("journalCount");
 if(count)count.textContent=String(Array.isArray(state?.journal)?state.journal.length:0);
};
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


/* Lazy Journal form/actions extracted from index.html in v2.1.1. */
// Journal entries are saved locally with a timestamp and can be edited or deleted.
let journalEditingId = null;
const journalForm = document.getElementById("journalForm");
const journalSubmitBtn = document.getElementById("journalSubmitBtn");
const cancelJournalEditBtn = document.getElementById("cancelJournalEditBtn");
function resetJournalForm(){
  journalEditingId = null;
  if(journalForm) journalForm.reset();
  if(journalSubmitBtn) journalSubmitBtn.textContent = "Save journal entry";
  if(cancelJournalEditBtn) cancelJournalEditBtn.style.display = "none";
}
function editJournalEntry(id){
  const entry = state.journal.find(item => String(item.id) === String(id));
  if(!entry) return;
  journalEditingId = entry.id;
  document.getElementById("entryTitle").value = entry.title || "";
  document.getElementById("entryType").value = entry.type || "Lifestyle & personal growth";
  document.getElementById("entryText").value = entry.text || "";
  if(journalSubmitBtn) journalSubmitBtn.textContent = "Update journal entry";
  if(cancelJournalEditBtn) cancelJournalEditBtn.style.display = "inline-flex";
  if(typeof activateWayfarerTab==="function")activateWayfarerTab("journal",true);
 }
function deleteJournalEntry(id){
  const entry = state.journal.find(item => String(item.id) === String(id));
  if(!entry) return;
  if(!window.confirm(`Delete journal entry "${entry.title}"? This cannot be undone.`)) return;
  state.journal = state.journal.filter(item => String(item.id) !== String(id));
  if(String(journalEditingId) === String(id)) resetJournalForm();
  save();
  toast("Journal entry deleted.");
}
if(journalForm){
  journalForm.addEventListener("submit",function(event){
    event.preventDefault();
    const title = document.getElementById("entryTitle").value.trim();
    const type = document.getElementById("entryType").value;
    const text = document.getElementById("entryText").value.trim();
    if(!title){ document.getElementById("entryTitle").focus(); return; }
    const now = new Date();
    const displayDate = now.toLocaleString(undefined,{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
    if(journalEditingId !== null){
      const entry = state.journal.find(item => String(item.id) === String(journalEditingId));
      if(!entry){ resetJournalForm(); toast("That journal entry could not be found."); return; }
      entry.title = title;
      entry.type = type;
      entry.text = text;
      entry.updatedAt = now.toISOString();
      entry.updatedDisplayDate = displayDate;
      // Preserve the original creation date/time when editing.
      entry.displayDate = entry.displayDate || entry.date || displayDate;
      save();
      resetJournalForm();
      render();
      toast("Journal entry updated.");
    } else {
      const id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + "-" + Math.random().toString(36).slice(2);
      state.journal.push({id,title,type,text,createdAt:now.toISOString(),date:now.toISOString(),displayDate});
      save();
      resetJournalForm();
      render();
      toast("Journal entry saved.");
    }
  });
}
if(cancelJournalEditBtn) cancelJournalEditBtn.addEventListener("click",function(){resetJournalForm();toast("Edit cancelled.");});
})();
