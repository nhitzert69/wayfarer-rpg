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
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.12;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  
  // Stage 1: soft sky bounce and warm directional key light, without a second competing sun.
  scene.add(new THREE.HemisphereLight(0xe3efff,0x74664f,1.05));
  const sun=new THREE.DirectionalLight(0xffe3bd,2.0);sun.position.set(200,450,260);scene.add(sun);
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
  // Shadow-only local light: global sunlight handles direct illumination of every model.
  const gameSun=new THREE.DirectionalLight(0xffffff,0);
  gameSun.layers.set(1);
  gameSun.castShadow=true;
  gameSun.shadow.mapSize.set(2048,2048);
  gameSun.shadow.camera.near=.01;
  gameSun.shadow.bias=-.00008;
  gameSun.shadow.normalBias=.002;
  gameSun.shadow.radius=3;
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


  // v3.0.47: independently placeable starting buildings with a shared rectangular collision system.
  const playBox=new THREE.Box3().setFromObject(playable||model);
  if(!playable||playBox.isEmpty())throw new Error("Playable_Area is required for building placement.");
  const playSize=playBox.getSize(new THREE.Vector3()),playCenter=playBox.getCenter(new THREE.Vector3());
  const cell=Math.min(playSize.x,playSize.z)/250,unit=playSize.x/1000,groundLevel=playBox.max.y;
  const definitions=[
    {id:"townhall",name:"Town Hall",w:50,d:30,path:"./models/buildings/level%20one/townhall%2520level%25201%2520compressed.glb"},
    {id:"barracks",name:"Barracks",w:40,d:30,path:"./models/buildings/level%20one/military%20camp%20level%201.glb"},
    {id:"camp",name:"Military Camp",w:60,d:40,path:"./models/buildings/level%20one/barracks%20level%201.glb"}
  ];
  const saved=placement.read?.()||{};
  const positions=saved.buildings||{};
  const buildings=[];
  const grid=new THREE.GridHelper(Math.min(playSize.x,playSize.z),250,0x7eff68,0xb4ff94);
  grid.position.set(playCenter.x,groundLevel+.07,playCenter.z);
  grid.material.transparent=true;grid.material.opacity=.85;grid.material.depthWrite=false;grid.visible=false;scene.add(grid);
  const gridFill=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(playSize.x,playSize.z),Math.min(playSize.x,playSize.z)),new THREE.MeshBasicMaterial({color:0x54ed5b,transparent:true,opacity:.14,depthWrite:false,side:THREE.DoubleSide}));
  gridFill.rotation.x=-Math.PI/2;gridFill.position.set(playCenter.x,groundLevel+.055,playCenter.z);gridFill.visible=false;scene.add(gridFill);
  const floorModel=await loadGameModel("./models/terrain/TerrainTiles/BuildingsTerrain.glb");
  const floorBox=new THREE.Box3().setFromObject(floorModel),floorSize=floorBox.getSize(new THREE.Vector3());
  if(floorBox.isEmpty()||floorSize.x<=0||floorSize.z<=0)throw new Error("BuildingsTerrain tile has invalid dimensions.");
  const makeFloor=(def)=>{
    const group=new THREE.Group(),w=def.w*unit,d=def.d*unit;
    // Repeated 10 m tiles are clipped to the plot, never extended into neighboring cells.
    const nx=Math.ceil(def.w/10),nz=Math.ceil(def.d/10);
    for(let ix=0;ix<nx;ix++)for(let iz=0;iz<nz;iz++){
      const tw=Math.min(10,def.w-ix*10)*unit,td=Math.min(10,def.d-iz*10)*unit;
      const tile=floorModel.clone(true);
      // Keep the tile surface flat; the footprint is tiled rather than stretched past the plot.
      const scale=Math.min(tw/floorSize.x,td/floorSize.z);
      tile.scale.set(tw/floorSize.x,scale,td/floorSize.z);
      tile.position.set(-w/2+(ix*10*unit)+tw/2,0,-d/2+(iz*10*unit)+td/2);
      tile.position.x-=((floorBox.min.x+floorBox.max.x)/2)*tile.scale.x;
      tile.position.z-=((floorBox.min.z+floorBox.max.z)/2)*tile.scale.z;
      // Align the highest visible tile surface just below the terrain plane, not its lowest vertex.
      // This removes the raised slab effect while keeping the texture visible at the surface.
      tile.position.y=-floorBox.max.y*tile.scale.y+.0005;
      tile.traverse(node=>{if(node.isMesh){node.receiveShadow=true;node.castShadow=false;}});
      group.add(tile);
    }
    return group;
  };
  for(const def of definitions){
    const visual=await loadGameModel(def.path);
    visual.updateMatrixWorld(true);
    const box=new THREE.Box3().setFromObject(visual);
    if(box.isEmpty())throw new Error(def.name+" GLB has no visible geometry.");
    const size=box.getSize(new THREE.Vector3());
    // Preserve the authored aspect ratio: never stretch the imported mesh independently
    // along X and Z. The footprint remains the authoritative collision/ground plot.
    const scale=Math.min(def.w*unit/Math.max(size.x,.00001),def.d*unit/Math.max(size.z,.00001));
    visual.scale.multiplyScalar(scale);
    visual.updateMatrixWorld(true);
    const scaled=new THREE.Box3().setFromObject(visual);
    visual.position.sub(new THREE.Vector3((scaled.min.x+scaled.max.x)/2,scaled.min.y,(scaled.min.z+scaled.max.z)/2));
    const root=new THREE.Group();root.add(visual);
    const floor=makeFloor(def);root.add(floor);
    root.traverse(node=>{if(node.isMesh&&node!==floor){node.castShadow=true;node.layers.enable(1);}});
    scene.add(root);
    const old=def.id==="townhall"&&!positions[def.id]&&Number.isFinite(saved.x)?saved:null;
    const stored=positions[def.id]||old;
    const defaultX=playCenter.x+(def.id==="barracks"?-65:def.id==="camp"?75:0)*unit;
    const defaultZ=playCenter.z+(def.id==="barracks"?-40:def.id==="camp"?-35:0)*unit;
    const item={...def,root,floor,present:stored?.present!==false,rotation:stored?.rotation===1?1:0};
    root.rotation.y=item.rotation?Math.PI*.5:Math.PI;
    root.position.set(Number.isFinite(stored?.x)?stored.x:defaultX,groundLevel+.015,Number.isFinite(stored?.z)?stored.z:defaultZ);
    root.visible=item.present;
    buildings.push(item);
  }
  const dims=item=>item.rotation?{x:item.d*unit,z:item.w*unit}:{x:item.w*unit,z:item.d*unit};
  const snap=(item,x,z)=>{
    const dim=dims(item);
    return new THREE.Vector3(
      THREE.MathUtils.clamp(playCenter.x+Math.round((x-playCenter.x)/cell)*cell,playBox.min.x+dim.x/2,playBox.max.x-dim.x/2),
      groundLevel+.015,
      THREE.MathUtils.clamp(playCenter.z+Math.round((z-playCenter.z)/cell)*cell,playBox.min.z+dim.z/2,playBox.max.z-dim.z/2)
    );
  };
  for(const item of buildings)item.root.position.copy(snap(item,item.root.position.x,item.root.position.z));
  const overlaps=item=>buildings.some(other=>{
    if(other===item||!other.present)return false;
    const a=dims(item),b=dims(other);
    return Math.abs(item.root.position.x-other.root.position.x)<(a.x+b.x)/2-1e-7 &&
      Math.abs(item.root.position.z-other.root.position.z)<(a.z+b.z)/2-1e-7;
  });
  const valid=()=>!!active&&!overlaps(active);
  let active=null,moving=false,draggingHall=false,original=null,pendingBuild=false;
  const moveUi=document.createElement("div");moveUi.className="kotu-townhall-actions";
  moveUi.innerHTML='<div class="kotu-townhall-select" hidden><strong data-building-name></strong><button type="button" data-action="move">⚒ Move</button><button type="button" data-action="sell">🪙 Sell</button></div><div class="kotu-townhall-move" hidden><strong data-placement-status>Move building</strong><button type="button" data-action="rotate">↻ Rotate</button><button type="button" data-action="confirm">✓</button><button type="button" data-action="cancel">✕</button></div>';
  host.appendChild(moveUi);
  const selectPanel=moveUi.querySelector(".kotu-townhall-select"),movePanel=moveUi.querySelector(".kotu-townhall-move");
  const showPanels=()=>{
    selectPanel.hidden=!active||moving;movePanel.hidden=!moving;grid.visible=moving;gridFill.visible=moving;
    if(active)moveUi.querySelector("[data-building-name]").textContent=active.name+" · Level 1";
    if(moving){
      const ok=valid();grid.material.color.setHex(ok?0xffffff:0xff3333);
      gridFill.material.color.setHex(ok?0x54ed5b:0xff2424);
      moveUi.querySelector("[data-placement-status]").textContent=ok?"Move "+active.name:"Overlap — cannot place here";
      moveUi.querySelector('[data-action="confirm"]').disabled=!ok;
    }
  };
  const persist=()=>placement.write?.({version:1,buildings:Object.fromEntries(buildings.map(item=>[item.id,{x:item.root.position.x,z:item.root.position.z,rotation:item.rotation,present:item.present}]))});
  const updateHallLight=()=>{const hall=buildings[0];gameSun.target.position.copy(hall.root.position);gameSun.position.copy(hall.root.position).add(new THREE.Vector3(.6,1.4,.6));gameSun.target.updateMatrixWorld();gameSun.updateMatrixWorld();};
  const reach=Math.max(playSize.x,playSize.z)*.15;
  Object.assign(gameSun.shadow.camera,{left:-reach,right:reach,top:reach,bottom:-reach,far:reach*12});
  gameSun.shadow.camera.updateProjectionMatrix();updateHallLight();
  const beginMove=(item,isNew=false)=>{
    active=item;original={position:item.root.position.clone(),rotation:item.rotation,present:item.present};
    pendingBuild=isNew;moving=true;item.present=true;item.root.visible=true;showPanels();
  };
  const finishMove=commit=>{
    if(!active)return;
    if(commit&&!valid())return;
    if(!commit){active.root.position.copy(original.position);active.rotation=original.rotation;active.root.rotation.y=active.rotation?Math.PI*.5:Math.PI;active.present=original.present;active.root.visible=active.present;}
    else if(pendingBuild&&!placement.buy?.(active.id)){return;}
    if(commit)persist();
    refreshCatalog();
    moving=false;draggingHall=false;active=null;original=null;pendingBuild=false;updateHallLight();showPanels();
  };
  moveUi.querySelector('[data-action="move"]').onclick=()=>{if(active)beginMove(active);};
  moveUi.querySelector('[data-action="rotate"]').onclick=()=>{if(!active)return;active.rotation=1-active.rotation;active.root.rotation.y=active.rotation?Math.PI*.5:Math.PI;active.root.position.copy(snap(active,active.root.position.x,active.root.position.z));showPanels();};
  moveUi.querySelector('[data-action="confirm"]').onclick=()=>finishMove(true);
  moveUi.querySelector('[data-action="cancel"]').onclick=()=>finishMove(false);
  moveUi.querySelector('[data-action="sell"]').onclick=()=>{
    if(!active||active.id==="townhall")return;
    if(!window.confirm("Sell "+active.name+" for 1,000 gold, 150 wood and 100 stone?"))return;
    if(!placement.sell?.(active.id))return;
    active.present=false;active.root.visible=false;persist();active=null;refreshCatalog();showPanels();
  };
  placement.setBuildHandler?.(id=>{
    const item=buildings.find(b=>b.id===id);
    if(!item||item.present||moving)return false;
    beginMove(item,true);return true;
  });
  const refreshCatalog=()=>placement.refreshBuild?.(buildings.map(item=>({id:item.id,name:item.name,present:item.present})));
  refreshCatalog();
  const placementPlane=new THREE.Plane(new THREE.Vector3(0,1,0),-groundLevel);
  const terrainPoint=e=>{
    const rect=renderer.domElement.getBoundingClientRect();
    const ray=new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);
    return ray.ray.intersectPlane(placementPlane,new THREE.Vector3());
  };
  const hallHit=e=>{
    const rect=renderer.domElement.getBoundingClientRect(),ray=new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);
    return buildings.find(item=>item.present&&ray.intersectObject(item.root,true).length>0)||null;
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
    if(moving&&active&&hallHit(e)===active){draggingHall=true;renderer.domElement.setPointerCapture(e.pointerId);return;}
    if(!moving&&hallHit(e)){active=hallHit(e);showPanels();return;}
    if(!moving&&active){active=null;showPanels();}
    if(e.pointerType==="mouse"&&e.button!==0)return;
    if(e.pointerType!=="mouse"){
      touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(touches.size>=2){down=null;pinchDistance=null;}
    }
    if(touches.size<2)down={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};
    renderer.domElement.setPointerCapture(e.pointerId);
  };
  const onMove=e=>{
    if(draggingHall){const point=terrainPoint(e);if(point){active.root.position.copy(snap(active,point.x,point.z));updateHallLight();showPanels();}return;}
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
  return ()=>{placement.setBuildHandler?.(null);moveUi.remove();grid.geometry.dispose();grid.material.dispose();gridFill.geometry.dispose();gridFill.material.dispose();disposed=true;cancelAnimationFrame(frame);observer.disconnect();canvas.removeEventListener("pointerdown",onDown);canvas.removeEventListener("pointermove",onMove);canvas.removeEventListener("pointerup",onUp);canvas.removeEventListener("pointercancel",onUp);canvas.removeEventListener("wheel",onWheel);gameSun.shadow.map?.dispose();groundMaterials.forEach(material=>material.dispose());renderer.dispose();starTexture.dispose();};
}
