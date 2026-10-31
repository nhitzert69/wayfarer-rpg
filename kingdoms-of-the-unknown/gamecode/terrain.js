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
export async function startTerrain(host, placement={}) {
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
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  
  scene.add(new THREE.HemisphereLight(0xe9f1ff,0x515049,1.35));
  const sun=new THREE.DirectionalLight(0xffe7c7,1.5);sun.position.set(200,450,260);scene.add(sun);
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
  // Grade only Playable_Area: keep imported texture images, UVs and perimeter materials untouched.
  // Apply the correction after sampling the texture, rather than tinting the Town Hall.
  const groundMaterials=[];
  if(playable)playable.traverse(node=>{
    if(!node.isMesh)return;
    const grade=material=>{
      const adjusted=material.clone();
      adjusted.onBeforeCompile=shader=>{
        shader.fragmentShader=shader.fragmentShader.replace(
          "#include <map_fragment>",
          "#include <map_fragment>\n" +
          "float groundLuma=dot(diffuseColor.rgb,vec3(0.2126,0.7152,0.0722));\n" +
          "diffuseColor.rgb=mix(vec3(groundLuma),diffuseColor.rgb,0.88)*0.97;"
        );
      };
      adjusted.customProgramCacheKey=()=>"kotu-playable-grade-v1";
      groundMaterials.push(adjusted);
      return adjusted;
    };
    node.material=Array.isArray(node.material)?node.material.map(grade):grade(node.material);
    node.receiveShadow=true;
    node.layers.enable(1);
  });
  // A local shadow frustum follows the Town Hall instead of wasting resolution on the whole map.
  // The light is on layer 1, shared only by Playable_Area and the Town Hall.
  const gameSun=new THREE.DirectionalLight(0xffe9cf,1.7);
  gameSun.layers.set(1);
  gameSun.castShadow=true;
  gameSun.shadow.mapSize.set(2048,2048);
  gameSun.shadow.camera.near=.01;
  gameSun.shadow.bias=-.00008;
  gameSun.shadow.normalBias=.004;
  gameSun.shadow.radius=2;
  scene.add(gameSun,gameSun.target);
  camera.layers.enable(1);

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
  const state={zoom:5,offset:new THREE.Vector3()},zoomMin=1,zoomMax=20;
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

  // Town Hall Level 1: placement is scoped to the playable square, not the decorative mountains.
  const hall=await loadGameModel("./models/townhall/Level1/human-townhall.fbx");
  const playBox=new THREE.Box3().setFromObject(playable||model);
  if(!playable||playBox.isEmpty())throw new Error("Playable_Area missing: Town Hall placement needs the authored playable square.");
  const playSize=playBox.getSize(new THREE.Vector3()),playCenter=playBox.getCenter(new THREE.Vector3());
  const divisions=250; // 4 gameplay metres per placement cell on the 1,000 m map.
  const cell=Math.min(playSize.x,playSize.z)/divisions;
  const hallBox=new THREE.Box3().setFromObject(hall);
  if(hallBox.isEmpty())throw new Error("Town Hall FBX contains no visible geometry.");
  const hallSize=hallBox.getSize(new THREE.Vector3());
  const hallScale=Math.min(playSize.x*.03/Math.max(hallSize.x,.0001),playSize.z*.03/Math.max(hallSize.z,.0001));
  hall.scale.multiplyScalar(hallScale);
  hall.updateMatrixWorld(true);
  const scaledBox=new THREE.Box3().setFromObject(hall);
  // Wrap the imported mesh so its visual base rests on the playable surface.
  const hallRoot=new THREE.Group();
  hall.position.sub(new THREE.Vector3((scaledBox.min.x+scaledBox.max.x)/2,scaledBox.min.y,(scaledBox.min.z+scaledBox.max.z)/2));
  hallRoot.add(hall);hallRoot.rotation.y=Math.PI;scene.add(hallRoot);
  hallRoot.traverse(node=>{if(node.isMesh){node.castShadow=true;node.layers.enable(1);}});
  const halfX=(scaledBox.max.x-scaledBox.min.x)/2,halfZ=(scaledBox.max.z-scaledBox.min.z)/2;
  // Fit the shadow camera to the actual scaled building (including its tall towers).
  // Recenter whenever the Town Hall is moved, so distant placements keep crisp shadows.
  const hallHeight=scaledBox.max.y-scaledBox.min.y;
  const shadowReach=Math.max(halfX,halfZ,hallHeight)*3.5;
  gameSun.shadow.camera.left=-shadowReach;
  gameSun.shadow.camera.right=shadowReach;
  gameSun.shadow.camera.top=shadowReach;
  gameSun.shadow.camera.bottom=-shadowReach;
  gameSun.shadow.camera.far=shadowReach*9;
  gameSun.shadow.camera.updateProjectionMatrix();
  const updateHallLight=()=>{
    gameSun.target.position.copy(hallRoot.position);
    gameSun.position.copy(hallRoot.position).add(new THREE.Vector3(shadowReach*1.1,shadowReach*2.4,shadowReach*1.1));
    gameSun.target.updateMatrixWorld();
    gameSun.updateMatrixWorld();
  };
  updateHallLight();
  const rotationAngle=()=>hallRoot.rotation.y;
  const limits=()=>{const quarter=Math.abs(Math.sin(rotationAngle()))>.5;return {x:Math.max(0,playSize.x/2-(quarter?halfZ:halfX)),z:Math.max(0,playSize.z/2-(quarter?halfX:halfZ))};};
  const snap=(x,z)=>{const limit=limits();return new THREE.Vector3(
    THREE.MathUtils.clamp(playCenter.x+Math.round((x-playCenter.x)/cell)*cell,playCenter.x-limit.x,playCenter.x+limit.x),
    playBox.max.y+.015,
    THREE.MathUtils.clamp(playCenter.z+Math.round((z-playCenter.z)/cell)*cell,playCenter.z-limit.z,playCenter.z+limit.z)
  );};
  const saved=placement.read?.();
  const initial=saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.z)?snap(saved.x,saved.z):snap(playCenter.x,playCenter.z);
  if(saved?.rotation===1)hallRoot.rotation.y=Math.PI*.5;
  hallRoot.position.copy(snap(initial.x,initial.z));
  const grid=new THREE.GridHelper(Math.min(playSize.x,playSize.z),divisions,0x7eff68,0xb4ff94);
  grid.position.set(playCenter.x,playBox.max.y+.07,playCenter.z);
  grid.material.transparent=true;grid.material.opacity=.98;grid.material.depthWrite=false;grid.visible=false;scene.add(grid);
  const gridFill=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(playSize.x,playSize.z),Math.min(playSize.x,playSize.z)),new THREE.MeshBasicMaterial({color:0x54ed5b,transparent:true,opacity:.14,depthWrite:false,side:THREE.DoubleSide}));
  gridFill.rotation.x=-Math.PI/2;gridFill.position.set(playCenter.x,playBox.max.y+.055,playCenter.z);gridFill.visible=false;scene.add(gridFill);
  const moveUi=document.createElement("div");
  moveUi.className="kotu-townhall-actions";
  moveUi.innerHTML='<div class="kotu-townhall-select" hidden><strong>Town Hall · Level 1</strong><button type="button" data-action="move">Move</button></div><div class="kotu-townhall-move" hidden><strong>Move Town Hall · drag to reposition</strong><button type="button" data-action="rotate" aria-label="Rotate Town Hall 90 degrees">↻ Rotate</button><button type="button" data-action="confirm" aria-label="Confirm position">✓</button><button type="button" data-action="cancel" aria-label="Cancel movement">✕</button></div>';
  host.appendChild(moveUi);
  const selectPanel=moveUi.querySelector(".kotu-townhall-select"),movePanel=moveUi.querySelector(".kotu-townhall-move");
  let moving=false,selected=false,draggingHall=false,originalPosition=null,originalRotation=null;
  const showPanels=()=>{selectPanel.hidden=!selected||moving;movePanel.hidden=!moving;grid.visible=moving;gridFill.visible=moving;};
  const beginMove=()=>{originalPosition=hallRoot.position.clone();originalRotation=hallRoot.rotation.y;moving=true;selected=false;showPanels();};
  const finishMove=confirm=>{if(!confirm&&originalPosition){hallRoot.position.copy(originalPosition);hallRoot.rotation.y=originalRotation;}updateHallLight();if(confirm)placement.write?.({x:hallRoot.position.x,z:hallRoot.position.z,rotation:Math.abs(hallRoot.rotation.y-Math.PI*.5)<.01?1:0});moving=false;selected=false;draggingHall=false;originalPosition=null;originalRotation=null;showPanels();};
  moveUi.querySelector('[data-action="move"]').onclick=beginMove;
  moveUi.querySelector('[data-action="rotate"]').onclick=()=>{hallRoot.rotation.y=Math.abs(hallRoot.rotation.y-Math.PI*.5)<.01?Math.PI:Math.PI*.5;hallRoot.position.copy(snap(hallRoot.position.x,hallRoot.position.z));updateHallLight();};
  moveUi.querySelector('[data-action="confirm"]').onclick=()=>finishMove(true);
  moveUi.querySelector('[data-action="cancel"]').onclick=()=>finishMove(false);
  const placementPlane=new THREE.Plane(new THREE.Vector3(0,1,0),-playBox.max.y);
  const terrainPoint=e=>{
    const rect=renderer.domElement.getBoundingClientRect();
    const ndc=new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
    const ray=new THREE.Raycaster();ray.setFromCamera(ndc,camera);
    return ray.ray.intersectPlane(placementPlane,new THREE.Vector3());
  };
  const hallHit=e=>{
    const rect=renderer.domElement.getBoundingClientRect();
    const ray=new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);
    if(ray.intersectObject(hallRoot,true).length>0)return true;
    // Small models remain selectable on touch screens without changing their visual size.
    const center=hallRoot.position.clone().add(new THREE.Vector3(0,(scaledBox.max.y-scaledBox.min.y)*.35,0)).project(camera);
    const px=(center.x+1)*rect.width/2+rect.left,py=(1-center.y)*rect.height/2+rect.top;
    return Math.hypot(e.clientX-px,e.clientY-py)<(e.pointerType==="mouse"?14:28);
  };
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
    if(moving&&hallHit(e)){draggingHall=true;renderer.domElement.setPointerCapture(e.pointerId);return;}
    if(!moving&&hallHit(e)){selected=true;showPanels();return;}
    if(!moving&&selected){selected=false;showPanels();}
    if(e.pointerType==="mouse"&&e.button!==0)return;
    if(e.pointerType!=="mouse"){
      touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(touches.size>=2){down=null;pinchDistance=null;}
    }
    if(touches.size<2)down={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};
    renderer.domElement.setPointerCapture(e.pointerId);
  };
  const onMove=e=>{
    if(draggingHall){const point=terrainPoint(e);if(point){hallRoot.position.copy(snap(point.x,point.z));updateHallLight();}return;}
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
      const factor=area?(area.maxX-area.minX)*Math.pow(state.zoom,.55)/Math.max(150,host.clientWidth):0;
      const right=new THREE.Vector3(1,0,0).applyQuaternion(rotation);
      const up=new THREE.Vector3(0,1,0).applyQuaternion(rotation);
      state.offset.addScaledVector(right,-dx*factor).addScaledVector(up,dy*factor);
      state.offset.y=0;
      updateCamera();
    }
    down.lastX=e.clientX;down.lastY=e.clientY;
  };
  const onUp=e=>{
    if(draggingHall){draggingHall=false;return;}
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
  return ()=>{moveUi.remove();grid.geometry.dispose();grid.material.dispose();gridFill.geometry.dispose();gridFill.material.dispose();disposed=true;cancelAnimationFrame(frame);observer.disconnect();canvas.removeEventListener("pointerdown",onDown);canvas.removeEventListener("pointermove",onMove);canvas.removeEventListener("pointerup",onUp);canvas.removeEventListener("pointercancel",onUp);canvas.removeEventListener("wheel",onWheel);gameSun.shadow.map?.dispose();groundMaterials.forEach(material=>material.dispose());renderer.dispose();starTexture.dispose();};
}
