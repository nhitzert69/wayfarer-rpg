/* Wayfarer v3.1.9 — Admin-only educational reflux food guide. No account state or persistence. */
(()=>{
"use strict";
window.WayfarerTabRenderers=window.WayfarerTabRenderers||{};
window.WayfarerTabModules=window.WayfarerTabModules||{};
const groups=[
 {heading:"✓ Foods and drinks to favor",items:[
 ["Breakfast and grains","Oatmeal, wholegrain bread, rice, couscous, potatoes, plain crackers."],
 ["Fruits","Bananas, melon, pears, apples (cooked if preferred), papaya."],
 ["Vegetables","Carrots, green beans, zucchini, spinach, cucumber; broccoli if tolerated."],
 ["Proteins","Skinless chicken or turkey, white fish, eggs, tofu, lean meat."],
 ["Drinks","Still water, chamomile or rooibos tea, warm water with a little honey for throat comfort, low-fat milk if tolerated."]]},
 {heading:"⚠ Common triggers to limit if they worsen symptoms",items:[
 ["Drinks","Coffee, espresso, energy drinks, carbonated drinks, alcohol, strong caffeinated tea."],
 ["Mint and chocolate","Peppermint, spearmint, mint tea or sweets, chocolate, cocoa."],
 ["Fatty foods","Deep-fried foods, fatty burgers, bacon, sausages, creamy sauces, large amounts of butter or cheese."],
 ["Acidic and spicy foods","Tomato sauce, citrus fruit and juice, vinegar-heavy dressings, hot peppers and spicy sauces; onions and garlic if triggering."]]},
 {heading:"Daily meal example",items:[
 ["Breakfast","Oatmeal with banana and water."],
 ["Snack","Pear and plain crackers."],
 ["Lunch","Wholegrain chicken sandwich with cucumber."],
 ["Afternoon","Low-fat yogurt if tolerated."],
 ["Dinner","Grilled fish or chicken, rice and cooked vegetables."],
 ["Evening","Caffeine-free tea; finish food at least 3 hours before bed."]]},
 {heading:"Habits that can reduce reflux",items:[
 ["Meals","Choose smaller portions, eat slowly, and avoid lying down after eating."],
 ["Night","Finish eating at least 3 hours before bed; sleep on your left side and elevate the head of the bed if needed."],
 ["Posture","Stay comfortably upright after meals; avoid tight abdominal bracing and tight waistbands."],
 ["Smoking","Work toward stopping smoking; smoke and heated tobacco can irritate the throat."]]}
];
function render(){
 const root=document.getElementById("refluxGuideContent");
 const allowed=typeof cloudUser!=="undefined" && !!cloudUser && typeof debugIsAdmin==="function" && debugIsAdmin();
 const button=document.getElementById("refluxTabButton");
 if(button){button.style.display=allowed?"inline-flex":"none";button.disabled=!allowed;}
 if(!root)return;
 root.replaceChildren();
 if(!allowed){root.textContent="Admin access required.";return;}
 const intro=document.createElement("p");intro.className="sub";intro.textContent="Personal triggers vary. These foods are options, not a cure; do not eliminate foods that cause no symptoms.";root.append(intro);
 for(const group of groups){
  const section=document.createElement("section");section.style.marginTop="18px";
  const h=document.createElement("h3");h.textContent=group.heading;section.append(h);
  const list=document.createElement("ul");list.style.lineHeight="1.7";
  for(const [name,detail] of group.items){const li=document.createElement("li");const strong=document.createElement("strong");strong.textContent=name+": ";li.append(strong,document.createTextNode(detail));list.append(li);}
  section.append(list);root.append(section);
 }
 const note=document.createElement("p");note.className="notice";note.textContent="For recurring regurgitation, throat burning or difficulty eating, consult a GP. Seek prompt medical care for trouble swallowing, food sticking, bleeding or unexplained weight loss.";root.append(note);
}
window.WayfarerTabRenderers.reflux=render;
window.WayfarerTabModules.reflux=render;
})();
