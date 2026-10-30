// Kingdoms of the Unknown — standalone Three.js terrain viewer.
// Uses browser ES modules; does not depend on Wayfarer state.
const THREE_URL="https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
const LOADER_URL="https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/FBXLoader.js";
// CDN addons import "three" as a bare specifier, resolved by the game's import map.
export async function startTerrain(host, mapName="human") {
  const THREE=await import("three");
  const {FBXLoader}=await import(LOADER_URL);
  const files={
    human:"./models/human-terrain/human-terrain.fbx",
    greek:"./models/greek-terrain/greek-terrain.fbx",
    undead:"./models/undead-terrain/undead-terrain.fbx"
  };
  if(!files[mapName])throw new Error("Unknown map.");
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x9aa6a8);
  const renderer=new THREE.WebGLRenderer({canvas:host.querySelector("#viewport"),antialias:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  
  const camera=new THREE.OrthographicCamera(-1,1,1,-1,0.1,100000);
  scene.add(new THREE.HemisphereLight(0xe9f1ff,0x515049,2));
  const sun=new THREE.DirectionalLight(0xffe7c7,2.2);sun.position.set(200,450,260);scene.add(sun);
  const loader=new FBXLoader();
  const model=await loader.loadAsync(files[mapName]);
  const textures={human:"./models/human-terrain/Meshy_AI_grassy_mountain_basin_1030145654_texture.png",greek:"./models/greek-terrain/Meshy_AI_bare_stone_basin_40k_1030153252_texture.png",undead:"./models/undead-terrain/Meshy_AI_undead_mountain_basin_1030153644_texture.png"};
  try{const texture=await new THREE.TextureLoader().loadAsync(textures[mapName]);texture.colorSpace=THREE.SRGBColorSpace;model.traverse(node=>{if(node.isMesh){for(const mat of (Array.isArray(node.material)?node.material:[node.material])){if(mat){mat.map=texture;mat.needsUpdate=true;}}}});}catch(error){console.warn("Terrain texture missing, showing material fallback.",error);}
  scene.add(model);
  // FBX files may contain several meshes and nested material groups.
  const bounds=new THREE.Box3().setFromObject(model);
  if(bounds.isEmpty())throw new Error("The terrain model has no geometry.");
  const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  // FBXLoader converts FBX axis metadata to Three.js Y-up coordinates.
  // Frame the buildable basin, not the surrounding cliff tips or the model's midpoint in height.
  const width=Math.max(size.x,1),depth=Math.max(size.z,1);
  const baseY=bounds.min.y+size.y*0.16;
  const target=new THREE.Vector3(center.x,baseY,center.z);
  const direction=new THREE.Vector3(0.8,1.15,0.8).normalize();
  const cameraDistance=Math.max(width,depth)*1.5;
  // Orthographic strategy camera: no perspective-driven disappearance when zooming.
  const viewHeight=Math.min(width,depth)*0.42;
  const zoomMin=1.6,zoomMax=4.2;
  const state={target,zoom:zoomMin};
  const clampTarget=()=>{
    // Reserve room around the center. The terrain is not rectangular, so this
    // is a conservative safe central area, not an exact polygon boundary.
    const xLimit=width*0.08,zLimit=depth*0.08;
    state.target.x=THREE.MathUtils.clamp(state.target.x,center.x-xLimit,center.x+xLimit);
    state.target.z=THREE.MathUtils.clamp(state.target.z,center.z-zLimit,center.z+zLimit);
    state.target.y=baseY;
  };
  const updateCamera=()=>{
    clampTarget();
    camera.position.copy(state.target).addScaledVector(direction,cameraDistance);
    camera.up.set(0,1,0);
    camera.lookAt(state.target);
    camera.zoom=state.zoom;
    camera.updateProjectionMatrix();
  };
  // Keep a fixed isometric orientation and restrict zoom-out to the playable basin.
  const resizeCamera=()=>{
    const aspect=Math.max(0.2,host.clientWidth/Math.max(1,host.clientHeight));
    const height=viewHeight;
    camera.left=-height*aspect/2;camera.right=height*aspect/2;
    camera.top=height/2;camera.bottom=-height/2;
    camera.near=0.1;camera.far=cameraDistance*5;
    camera.updateProjectionMatrix();
    updateCamera();
  };
  resizeCamera();
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  const pick=(e)=>{
    const rect=renderer.domElement.getBoundingClientRect();
    pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);
    return raycaster.intersectObject(model,true).find(hit=>hit.point)?.point||null;
  };
  let down=null;
  const onDown=e=>{if(e.button!==0)return;down={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};renderer.domElement.setPointerCapture(e.pointerId);};
  const onMove=e=>{
    if(!down)return;
    const dx=e.clientX-down.lastX,dy=e.clientY-down.lastY;
    if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)down.moved=true;
    if(down.moved){
      const factor=viewHeight/(Math.max(150,host.clientHeight)*state.zoom);\n      state.target.x-= (dx+dy)*factor*0.7;\n      state.target.z+= (dx-dy)*factor*0.7;\n      updateCamera();\n    }
    down.lastX=e.clientX;down.lastY=e.clientY;
  };
  const onUp=e=>{if(down&&!down.moved){const p=pick(e);if(p){state.target.x=p.x;state.target.z=p.z;updateCamera();}}down=null;};
  const onWheel=e=>{e.preventDefault();state.zoom=THREE.MathUtils.clamp(state.zoom*Math.exp(-e.deltaY*0.001),zoomMin,zoomMax);updateCamera();};
  const canvas=renderer.domElement;
  canvas.style.touchAction="none";
  canvas.addEventListener("pointerdown",onDown);
  canvas.addEventListener("pointermove",onMove);
  canvas.addEventListener("pointerup",onUp);
  canvas.addEventListener("pointercancel",onUp);
  canvas.addEventListener("wheel",onWheel,{passive:false});
  const observer=new ResizeObserver(()=>{const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);resizeCamera();});
  observer.observe(host);
  let frame=0,disposed=false;
  function draw(){if(disposed)return;frame=requestAnimationFrame(draw);renderer.render(scene,camera);}
  draw();
  return ()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();canvas.removeEventListener("pointerdown",onDown);canvas.removeEventListener("pointermove",onMove);canvas.removeEventListener("pointerup",onUp);canvas.removeEventListener("pointercancel",onUp);canvas.removeEventListener("wheel",onWheel);renderer.dispose();};
}
