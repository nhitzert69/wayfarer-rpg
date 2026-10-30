// Kingdoms of the Unknown — standalone Three.js terrain viewer.
// Uses browser ES modules; does not depend on Wayfarer state.
const THREE_URL="https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
const LOADER_URL="https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/FBXLoader.js";
// CDN addons import "three" as a bare specifier, resolved by the game's import map.
export async function startTerrain(host, mapName="human") {
  const THREE=await import("three");
  const {FBXLoader}=await import(LOADER_URL);
  const files={
    human:"./models/human-terrain/Meshy_AI_Dark_Swamp_Terrain_20261030_texture.fbx",
    greek:"./models/greek-terrain/Meshy_AI_Grassy_Meadow_Terrain_20261030_texture.fbx",
    undead:"./models/undead-terrain/Meshy_AI_Volcanic_Crater_Terrain_20261030_texture.fbx"
  };
  if(!files[mapName])throw new Error("Unknown map.");
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x9aa6a8);
  const renderer=new THREE.WebGLRenderer({canvas:host.querySelector("#viewport"),antialias:true,powerPreference:"high-performance",logarithmicDepthBuffer:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  
  const camera=new THREE.OrthographicCamera(-1,1,1,-1,0.1,100000);
  scene.add(new THREE.HemisphereLight(0xe9f1ff,0x515049,2));
  const sun=new THREE.DirectionalLight(0xffe7c7,2.2);sun.position.set(200,450,260);scene.add(sun);
  const loader=new FBXLoader();
  const model=await loader.loadAsync(files[mapName]);
  // Use the matching texture set exported alongside each replacement FBX.
  const textureBases={
    human:"./models/human-terrain/Meshy_AI_Dark_Swamp_Terrain_20261030_texture",
    greek:"./models/greek-terrain/Meshy_AI_Grassy_Meadow_Terrain_20261030_texture",
    undead:"./models/undead-terrain/Meshy_AI_Volcanic_Crater_Terrain_20261030_texture"
  };
  const textureBase=textureBases[mapName];
  const textureLoader=new THREE.TextureLoader();
  const configureTexture=texture=>{
    texture.minFilter=THREE.LinearMipmapLinearFilter;
    texture.magFilter=THREE.LinearFilter;
    texture.generateMipmaps=true;
    texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    return texture;
  };
  try {
    const baseColor=configureTexture(await textureLoader.loadAsync(textureBase+".png"));
    baseColor.colorSpace=THREE.SRGBColorSpace;
    const [normal,roughness]=await Promise.all([
      textureLoader.loadAsync(textureBase+"_normal.png").then(configureTexture).catch(()=>null),
      textureLoader.loadAsync(textureBase+"_roughness.png").then(configureTexture).catch(()=>null)
    ]);
    model.traverse(node=>{
      if(!node.isMesh)return;
      const convert=material=>new THREE.MeshStandardMaterial({
        map:baseColor,normalMap:normal,roughnessMap:roughness,
        roughness:1,metalness:0,side:material?.side??THREE.FrontSide
      });
      node.material=Array.isArray(node.material)?node.material.map(convert):convert(node.material);
    });
  } catch(error) {
    console.warn("Terrain textures unavailable; using imported materials.",error);
  }
  // Small shared alignment correction; preserve the arena's original entrance orientation.
  model.rotation.y += THREE.MathUtils.degToRad(10);
  model.updateMatrixWorld(true);
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
  const direction=new THREE.Vector3(0.9,0.85,0.9).normalize();
  const cameraDistance=Math.max(width,depth)*1.5;
  // Orthographic strategy camera: no perspective-driven disappearance when zooming.
  const viewHeight=Math.min(width,depth)*0.42;
  const zoomMin=1.1,zoomMax=10.5;
  const state={target,zoom:2.0};
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
    camera.near=Math.max(1,cameraDistance*0.15);camera.far=cameraDistance*2.8;
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
  const touches=new Map();
  let pinchDistance=null;
  const onDown=e=>{
    if(e.pointerType==="mouse"&&e.button!==0)return;
    if(e.pointerType!=="mouse"){
      touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(touches.size>=2){down=null;pinchDistance=null;}
    }
    if(touches.size<2)down={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};
    renderer.domElement.setPointerCapture(e.pointerId);
  };
  const onMove=e=>{
    if(touches.has(e.pointerId))touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(touches.size>=2){
      const [a,b]=Array.from(touches.values());
      const distance=Math.hypot(a.x-b.x,a.y-b.y);
      if(pinchDistance&&distance>0){
        state.zoom=THREE.MathUtils.clamp(state.zoom*distance/pinchDistance,zoomMin,zoomMax);
        updateCamera();
      }
      pinchDistance=distance;
      return;
    }
    if(!down)return;
    const dx=e.clientX-down.lastX,dy=e.clientY-down.lastY;
    if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)down.moved=true;
    if(down.moved){
      const factor=viewHeight/(Math.max(150,host.clientHeight)*state.zoom);
      state.target.x-= (dx+dy)*factor*0.7;
      state.target.z+= (dx-dy)*factor*0.7;
      updateCamera();
    }
    down.lastX=e.clientX;down.lastY=e.clientY;
  };
  const onUp=e=>{
    const wasPinching=touches.size>=2;
    touches.delete(e.pointerId);
    pinchDistance=null;
    if(!wasPinching&&down&&!down.moved){const p=pick(e);if(p){state.target.x=p.x;state.target.z=p.z;updateCamera();}}
    down=null;
  };
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
