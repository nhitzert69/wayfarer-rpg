/* Wayfarer artifact registry, purchase and generation-time bonus rules. */
(function(root){
 const items=[{"id":"artifact-compass","name":"Compass of Discovery","skill":"Adventure","theme":"adventure-theme","category":"Artifact","type":"artifact","icon":"./assets/images/artifacts/artifact-03.png"},{"id":"artifact-owl","name":"Owl of Wisdom","skill":"Reading","theme":"academy-theme","category":"Artifact","type":"artifact","icon":"./assets/images/artifacts/artifact-04.png"},{"id":"artifact-mask","name":"Masquerade of Charisma","skill":"Social Interactions","theme":"social-interactions-theme","category":"Artifact","type":"artifact","icon":"./assets/images/artifacts/artifact-01.png"},{"id":"artifact-heart","name":"Heartkeeper's Pendant","skill":"Relationships","theme":"relationships-theme","category":"Artifact","type":"artifact","icon":"./assets/images/artifacts/artifact-02.png"},{"id":"artifact-cross","name":"Cross of Faith","skill":"Orthodox Christianity","theme":"orthodox-theme","category":"Artifact","type":"artifact","icon":"./assets/images/artifacts/artifact-09.png"},{"id":"artifact-laurel","name":"Laurel of Discipline","skill":"Fitness","theme":"fitness-theme","category":"Artifact","type":"artifact","icon":"./assets/images/artifacts/artifact-08.png"},{"id":"artifact-serenaders-guitar","name":"The Serenader\u0027s Guitar","skill":"Guitar","theme":"andalusian-serenade-theme","category":"Artifact","type":"artifact","icon":"./assets/images/artifacts/artifact-serenaders-guitar.webp"},{"id":"artifact-watch","name":"Maestro's Pocket Watch","skill":"Piano","theme":"mozart-salon-theme","category":"Artifact","type":"artifact","icon":"./assets/images/artifacts/artifact-06.png"},{"id":"artifact-signet","name":"Merchant's Signet","skill":"Business","theme":"ceo-theme","category":"Artifact","type":"artifact","icon":"./assets/images/artifacts/artifact-07.png"},{"id":"artifact-shield","name":"Spartan Shield","skill":"Cardio","theme":"spartan-endurance-theme","category":"Artifact","type":"artifact","icon":"./assets/images/artifacts/artifact-05.png"}];
 root.WAYFARER_ARTIFACTS=items;
 root.getArtifactDefinition=id=>items.find(item=>item.id===id)||null;
 root.artifactRequirement=level=>[Infinity,6,15,25][level]??Infinity;
 root.artifactPrice=level=>[Infinity,150,250,400][level]??Infinity;
 root.artifactPurchase=function(id,target){
  const item=root.getArtifactDefinition(id);
  if(!item||!target)return {ok:false,reason:"invalid-item"};
  if(!Array.isArray(target.inventory))target.inventory=[];
  const owned=target.inventory.find(x=>x&&x.id===id);
  const current=owned?Math.max(1,Math.min(3,Math.floor(Number(owned.artifactLevel)||1))):0;
  const next=current+1;
  if(next>3)return {ok:false,reason:"max-level"};
  const skillLevel=root.getSkillProgress(target.skillXp?.[item.skill]).level;
  if(skillLevel<root.artifactRequirement(next))return {ok:false,reason:"locked",required:root.artifactRequirement(next)};
  const price=root.artifactPrice(next),gold=Math.max(0,Number(target.gold)||0);
  if(gold<price)return {ok:false,reason:"insufficient-gold",price};
  target.gold=gold-price;
  if(owned)Object.assign(owned,{...item,artifactLevel:next});
  else target.inventory.push({...item,artifactLevel:1});
  return {ok:true,level:next};
 };
 root.artifactRewardBonus=function(target,skill){
  const id=target?.equipment?.artifact,def=root.getArtifactDefinition(id);
  if(!def)return {xp:0,gold:0};
  const owned=target?.inventory?.find(x=>x&&x.id===id&&root.isArtifactInventoryItem(x));
  if(!owned)return {xp:0,gold:0};
  const level=Math.max(1,Math.min(3,Math.floor(Number(owned.artifactLevel)||1)));
  const factor=2**(level-1),own=skill===def.skill?3*factor:0,synergy=target.equipment.theme===def.theme?factor:0;
  return {xp:own+synergy,gold:own+synergy};
 };
})(window);
