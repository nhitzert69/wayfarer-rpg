/* Shared inventory helpers. Item classification and ownership checks must agree across Store, Character, Debug, and theme lifecycle code. */
(function(root){
  function getInventoryItemType(item){
    const raw=String(item?.type||item?.category||"").trim().toLowerCase();
    if(raw==="theme"||raw==="themes")return "theme";
    if(raw==="pet"||raw==="pets")return "pet";
    if(raw==="artifact"||raw==="artifacts")return "artifact";
    return raw||"artifact";
  }
  root.getInventoryItemType=getInventoryItemType;
  root.isThemeInventoryItem=function(item){return getInventoryItemType(item)==="theme";};
  root.isPetInventoryItem=function(item){return getInventoryItemType(item)==="pet";};
  root.isArtifactInventoryItem=function(item){return getInventoryItemType(item)==="artifact";};
  root.hasUnlockable=function(id,target=root.state){return Array.isArray(target?.inventory)&&target.inventory.some(item=>item&&String(item.id)===String(id));};
})(window);
