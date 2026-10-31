// Kingdoms of the Unknown — standalone Three.js terrain viewer.
// Uses browser ES modules; does not depend on Wayfarer state.
const THREE_URL="https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
const GLTF_LOADER_URL="https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";
const FBX_LOADER_URL="https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/FBXLoader.js";
// Reusable asset loader: GLB for the authored terrain, FBX for future game models.
export async function loadGameModel(path) {
  const extension=path.split(/[?#]/,1)[0].split(".").pop().toLowerCase();
  if(extension==="fbx"){
    const {FBXLoader}=await import(FBX_LOADER_URL);
    return new FBXLoader().loadAsync(path);
  }
  if(extension==="glb"||extension==="gltf"){
    const {GLTFLoader}=await import(GLTF_LOADER_URL);
    const asset=await new GLTFLoader().loadAsync(path);
    return asset.scene;
  }
  throw new Error("Unsupported 3D model format: "+extension);
}
// CDN addons import "three" as a bare specifier, resolved by the game's import map.
export async function startTerrain(host) {
  const THREE=await import("three");
  const terrainFile="./models/terrain/Playmap/terrain_kingdoms.glb";
  const scene=new THREE.Scene();
  // Procedural starfield behind the terrain, with no external asset dependency.
  const skyCanvas=document.createElement("canvas");
  skyCanvas.width=2048;skyCanvas.height=1024;
  const sky=skyCanvas.getContext("2d");
  const gradient=sky.createLinearGradient(0,0,0,1024);
  gradient.addColorStop(0,"#030713");gradient.addColorStop(0.5,"#10152b");gradient.addColorStop(1,"#080b19");
  sky.fillStyle=gradient;sky.fillRect(0,0,2048,1024);
  let seed=93217;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<2200;i++){
    const x=random()*2048,y=random()*1024,r=0.25+random()*1.15;
    sky.beginPath();sky.arc(x,y,r,0,Math.PI*2);
    sky.fillStyle="rgba(225,235,255,"+(0.2+random()*0.75)+")";sky.fill();
  }
  const starTexture=new THREE.CanvasTexture(skyCanvas);
  starTexture.colorSpace=THREE.SRGBColorSpace;
  starTexture.mapping=THREE.EquirectangularReflectionMapping;
  scene.background=starTexture;
  const renderer=new THREE.WebGLRenderer({canvas:host.querySelector("#viewport"),antialias:true,powerPreference:"high-performance",logarithmicDepthBuffer:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  
  scene.add(new THREE.HemisphereLight(0xe9f1ff,0x515049,2));
  const sun=new THREE.DirectionalLight(0xffe7c7,2.2);sun.position.set(200,450,260);scene.add(sun);
  const model=await loadGameModel(terrainFile);
  // GLB preserves supported Blender PBR materials and packed textures.
  // The single arena includes its own rectangular ground surface.
  // Keep the exported orientation and avoid loading obsolete separate floors.
  scene.add(model);
  model.updateMatrixWorld(true);
  const cameras=[];
  model.traverse(node=>{if(node.isCamera)cameras.push(node);});
  if(!cameras.length)throw new Error("No Blender camera in terrain GLB. In Blender export glTF Binary (.glb) with Cameras enabled, then upload terrain_kingdoms.glb.");
  const source=cameras.find(c=>c.name.toLowerCase()==="camera")||cameras[0];
  source.updateWorldMatrix(true,false);
  const camera=source.clone();
  source.matrixWorld.decompose(camera.position,camera.quaternion,camera.scale);
  camera.scale.set(1,1,1);
  // GLB camera axes are defined consistently with Three.js; retain Blender orientation.
  const playable=model.getObjectByName("Playable_Area")||model.getObjectByName("Playable Area");
  const targetBounds=new THREE.Box3().setFromObject(playable||model);
  // Keep the authored camera rotation, including its intentional framing.
  const origin=camera.position.clone(),rotation=camera.quaternion.clone(),baseZoom=camera.zoom||1;
  // Blender authored frame is 16:9. Wider viewports must crop, not reveal terrain outside it.
  const authoredAspect=16/9;
  let viewportCrop=1;
  const orthoHeight=camera.isOrthographicCamera?camera.top-camera.bottom:0;
  const orthoCenterX=camera.isOrthographicCamera?(camera.left+camera.right)/2:0;
  const orthoCenterY=camera.isOrthographicCamera?(camera.top+camera.bottom)/2:0;
  camera.near=0.1;camera.far=100000;scene.add(camera);
  const groundY=targetBounds.min.y;
  const state={zoom:1,offset:new THREE.Vector3()},zoomMin=1,zoomMax=5.25;
  const resizeCamera=()=>{
    const aspect=Math.max(.2,host.clientWidth/Math.max(1,host.clientHeight));
    viewportCrop=Math.max(1,aspect/authoredAspect);
    if(camera.isPerspectiveCamera)camera.aspect=aspect;
    if(camera.isOrthographicCamera){
      camera.left=orthoCenterX-orthoHeight*aspect/2;camera.right=orthoCenterX+orthoHeight*aspect/2;
      camera.top=orthoCenterY+orthoHeight/2;camera.bottom=orthoCenterY-orthoHeight/2;
    }
    camera.updateProjectionMatrix();
  };
  const footprint=(position,zoom)=>{
    const probe=camera.clone();probe.position.copy(position);probe.quaternion.copy(rotation);
    probe.zoom=baseZoom*viewportCrop*zoom;probe.updateProjectionMatrix();probe.updateMatrixWorld(true);
    const ray=new THREE.Raycaster(),hits=[];
    for(const x of [-1,1])for(const y of [-1,1]){
      ray.setFromCamera(new THREE.Vector2(x,y),probe);
      const d=ray.ray.direction.y;
      if(Math.abs(d)<1e-6)return null;
      const distance=(groundY-ray.ray.origin.y)/d;
      if(distance<=0)return null;
      hits.push(ray.ray.at(distance,new THREE.Vector3()));
    }
    return {minX:Math.min(...hits.map(p=>p.x)),maxX:Math.max(...hits.map(p=>p.x)),
      minZ:Math.min(...hits.map(p=>p.z)),maxZ:Math.max(...hits.map(p=>p.z))};
  };
  const updateCamera=()=>{
    camera.position.copy(origin).add(state.offset);camera.quaternion.copy(rotation);
    camera.zoom=baseZoom*viewportCrop*state.zoom;camera.updateProjectionMatrix();
    const outer=footprint(origin,1),inner=footprint(camera.position,state.zoom);
    if(outer&&inner){
      const dx=Math.max(outer.minX-inner.minX,Math.min(outer.maxX-inner.maxX,0));
      const dz=Math.max(outer.minZ-inner.minZ,Math.min(outer.maxZ-inner.maxZ,0));
      state.offset.x+=dx;state.offset.z+=dz;camera.position.copy(origin).add(state.offset);
    }else{state.offset.set(0,0,0);camera.position.copy(origin);}
    camera.updateMatrixWorld(true);
  };
  resizeCamera();updateCamera();
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
      const area=footprint(camera.position,state.zoom);
      const factor=area?(area.maxX-area.minX)/Math.max(150,host.clientWidth):0;
      const right=new THREE.Vector3(1,0,0).applyQuaternion(rotation);
      const up=new THREE.Vector3(0,1,0).applyQuaternion(rotation);
      state.offset.addScaledVector(right,-dx*factor).addScaledVector(up,dy*factor);
      state.offset.y=0;
      updateCamera();
    }
    down.lastX=e.clientX;down.lastY=e.clientY;
  };
  const onUp=e=>{
    const wasPinching=touches.size>=2;
    touches.delete(e.pointerId);
    pinchDistance=null;
    // Keep Blender camera framing; tapping terrain does not recenter.
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
  const observer=new ResizeObserver(()=>{const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);resizeCamera();updateCamera();});
  observer.observe(host);
  renderer.setSize(Math.max(1,host.clientWidth),Math.max(1,host.clientHeight),false);
  let frame=0,disposed=false;
  function draw(){if(disposed)return;frame=requestAnimationFrame(draw);renderer.render(scene,camera);}
  draw();
  return ()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();canvas.removeEventListener("pointerdown",onDown);canvas.removeEventListener("pointermove",onMove);canvas.removeEventListener("pointerup",onUp);canvas.removeEventListener("pointercancel",onUp);canvas.removeEventListener("wheel",onWheel);renderer.dispose();starTexture.dispose();};
}
