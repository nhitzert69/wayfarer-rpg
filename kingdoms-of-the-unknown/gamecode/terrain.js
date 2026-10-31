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
  // One directional sun provides both illumination and shadows (no doubled key light).
  const gameSun=sun;
  gameSun.layers.enable(1);
  gameSun.castShadow=true;
  gameSun.shadow.mapSize.set(2048,2048);
  gameSun.shadow.camera.near=.01;
  gameSun.shadow.bias=-.00008;
  gameSun.shadow.normalBias=.002;
  gameSun.shadow.radius=3;
  scene.add(gameSun.target);
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
    {id:"townhall",name:"Town Hall",w:50,d:30,path:"./models/buildings/level%20one/Townhalllvl1.glb"},
    {id:"barracks",name:"Barracks",w:40,d:30,path:"./models/buildings/level%20one/Militarybarrackslvl1.glb"},
    {id:"camp",name:"Military Camp",w:45,d:30,path:"./models/buildings/level%20one/Militarycamplvl1.glb"}
  ];
  const saved=placement.read?.()||{};
  const positions=saved.buildings||{};
  const buildings=[];
  const roadLayer=new THREE.Group();scene.add(roadLayer);
  const grid=new THREE.GridHelper(Math.min(playSize.x,playSize.z),250,0x7eff68,0xb4ff94);
  grid.position.set(playCenter.x,groundLevel+.07,playCenter.z);
  grid.material.transparent=true;grid.material.opacity=.85;grid.material.depthWrite=false;grid.visible=false;scene.add(grid);
  const gridFill=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(playSize.x,playSize.z),Math.min(playSize.x,playSize.z)),new THREE.MeshBasicMaterial({color:0x54ed5b,transparent:true,opacity:.14,depthWrite:false,side:THREE.DoubleSide}));
  gridFill.rotation.x=-Math.PI/2;gridFill.position.set(playCenter.x,groundLevel+.055,playCenter.z);gridFill.visible=false;scene.add(gridFill);
  const floorModel=await loadGameModel("./models/terrain/TerrainTiles/BuildingsTerrain.glb");
  const floorBox=new THREE.Box3().setFromObject(floorModel),floorSize=floorBox.getSize(new THREE.Vector3());
  if(floorBox.isEmpty()||floorSize.x<=0||floorSize.z<=0)throw new Error("BuildingsTerrain tile has invalid dimensions.");
  const makeFloor=(width,depth,offsetX=0,offsetZ=0)=>{
    // The dirt follows the actual scaled mesh bounds, not the larger gameplay collision plot.
    // Keep 10 gameplay-metre tile repeats and trim the final row/column to the mesh footprint.
    const group=new THREE.Group(),tileSpan=10*unit;
    const nx=Math.max(1,Math.ceil(width/tileSpan)),nz=Math.max(1,Math.ceil(depth/tileSpan));
    for(let ix=0;ix<nx;ix++)for(let iz=0;iz<nz;iz++){
      const tw=Math.min(tileSpan,width-ix*tileSpan),td=Math.min(tileSpan,depth-iz*tileSpan);
      const tile=floorModel.clone(true);
      // Flatten the imported terrain tile so its vertical sides cannot form a raised platform.
      const sy=Math.min(tw/floorSize.x,td/floorSize.z)*.002;
      tile.scale.set(tw/floorSize.x,sy,td/floorSize.z);
      tile.position.set(offsetX-width/2+ix*tileSpan+tw/2,0,offsetZ-depth/2+iz*tileSpan+td/2);
      tile.position.x-=((floorBox.min.x+floorBox.max.x)/2)*tile.scale.x;
      tile.position.z-=((floorBox.min.z+floorBox.max.z)/2)*tile.scale.z;
      // Root sits 0.015 above ground; place the tile top just 0.001 above ground.
      tile.position.y=-floorBox.max.y*tile.scale.y-.014;
      // Preserve the same texel density on partial edge tiles as on full tiles.
      // Each clone gets its own geometry so the source GLB and neighboring tiles stay untouched.
      tile.traverse(node=>{
        if(!node.isMesh)return;
        node.receiveShadow=true;node.castShadow=false;
        if(!node.geometry?.attributes?.uv)return;
        node.geometry=node.geometry.clone();
        const uv=node.geometry.attributes.uv;
        const repeatX=tw/tileSpan,repeatZ=td/tileSpan;
        for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*repeatX,uv.getY(i)*repeatZ);
        uv.needsUpdate=true;
      });
      group.add(tile);
    }
    return group;
  };
  for(const def of definitions){
    const visual=await loadGameModel(def.path);
    if(def.id==='camp')visual.rotation.y+=Math.PI/2;
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
    // Entrance nodes are authored in Blender and travel with the building transform.
    const entrances=[];
    visual.traverse(node=>{
      if(!/^entr(?:ance|ence)/i.test(node.name))return;
      entrances.push(node);
      // Mesh markers must not be rendered, cast shadows, or intercept building clicks.
      node.traverse(part=>{if(part.isMesh){part.visible=false;part.raycast=()=>{};}});
    });
    const root=new THREE.Group();root.add(visual);
    // The authored entrance/visual alignment is not necessarily centred on the
    // collision plot. Tailor dirt bounds in grid-cell increments per building.
    // Offsets are in unrotated local plot coordinates and rotate with the root.
    const dirtAdjust={
      townhall:{left:0.5,right:-2.5,front:1,back:-1},
      camp:{left:-1,right:1.5,front:-1,back:1},
      barracks:{left:-0.5,right:1,front:-1,back:1}
    }[def.id];
    const dirtStep=cell;
    const dirtLeft=-def.w*unit/2+dirtAdjust.left*dirtStep;
    const dirtRight=def.w*unit/2+dirtAdjust.right*dirtStep;
    const dirtFront=-def.d*unit/2+dirtAdjust.front*dirtStep;
    const dirtBack=def.d*unit/2+dirtAdjust.back*dirtStep;
    const floor=makeFloor(dirtRight-dirtLeft,dirtBack-dirtFront,(dirtLeft+dirtRight)/2,(dirtFront+dirtBack)/2);root.add(floor);
    visual.traverse(node=>{if(node.isMesh){node.castShadow=true;node.layers.enable(1);}});
    scene.add(root);
    const old=def.id==="townhall"&&!positions[def.id]&&Number.isFinite(saved.x)?saved:null;
    const stored=positions[def.id]||old;
    const defaultX=playCenter.x+(def.id==="barracks"?-65:def.id==="camp"?75:0)*unit;
    const defaultZ=playCenter.z+(def.id==="barracks"?-40:def.id==="camp"?-35:0)*unit;
    const item={...def,root,floor,entrances,finishAt:Number(stored?.finishAt)||0,visualWidth:scaled.max.x-scaled.min.x,visualDepth:scaled.max.z-scaled.min.z,present:stored?.present!==false,rotation:stored?.rotation===1?1:0};
    root.rotation.y=item.rotation?Math.PI*.5:Math.PI;
    root.position.set(Number.isFinite(stored?.x)?stored.x:defaultX,groundLevel+.015,Number.isFinite(stored?.z)?stored.z:defaultZ);
    root.visible=item.present;
    buildings.push(item);
  }
  const templates=new Map(buildings.map(item=>[item.id,item]));
  let nextInstance=1;
  const cloneBuilding=(base,id,stored=null)=>{
    const root=base.root.clone(true),entrances=[];
    root.traverse(node=>{if(/^entr(?:ance|ence)/i.test(node.name))entrances.push(node);});
    const item={...base,id,templateId:base.id,root,floor:root.children[1],entrances,
      present:stored?.present!==false,rotation:stored?.rotation===1?1:0,finishAt:Number(stored?.finishAt)||0};
    root.rotation.y=item.rotation?Math.PI*.5:Math.PI;
    root.position.set(Number.isFinite(stored?.x)?stored.x:base.root.position.x+nextInstance*cell*2,
      groundLevel+.015,Number.isFinite(stored?.z)?stored.z:base.root.position.z+nextInstance*cell*2);
    root.visible=item.present;scene.add(root);buildings.push(item);
    return item;
  };
  for(const [id,stored] of Object.entries(positions)){
    const match=/^(barracks|camp)-copy-([0-9]+)$/.exec(id);
    if(!match||!templates.has(match[1]))continue;
    nextInstance=Math.max(nextInstance,Number(match[2])+1);
    cloneBuilding(templates.get(match[1]),id,stored);
  }
  const refreshConstruction=()=>{for(const item of buildings){if(item.finishAt&&item.finishAt<=Date.now())item.finishAt=0;if(item.root.children[0])item.root.children[0].visible=!item.finishAt;}};
  refreshConstruction();
  const constructionTimer=setInterval(refreshConstruction,1000);
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
  const collisionDims=item=>item.rotation?{x:item.visualDepth,z:item.visualWidth}:{x:item.visualWidth,z:item.visualDepth};
  const overlaps=item=>buildings.some(other=>{
    if(other===item||!other.present)return false;
    const a=collisionDims(item),b=collisionDims(other);
    return Math.abs(item.root.position.x-other.root.position.x)<(a.x+b.x)/2-1e-7 &&
      Math.abs(item.root.position.z-other.root.position.z)<(a.z+b.z)/2-1e-7;
  });
  // Road connections use exported Entrance nodes, never guessed building centres.
  // Build a low-cost grid path around occupied plots, then merge straight runs.
  // Low-cost repeatable soil texture: mottled earth rather than a flat brown band.
  const roadCanvas=document.createElement("canvas");roadCanvas.width=128;roadCanvas.height=256;
  const roadCtx=roadCanvas.getContext("2d");
  roadCtx.fillStyle="#927552";roadCtx.fillRect(0,0,128,256);
  let roadSeed=18479;
  const roadRandom=()=>{roadSeed=(Math.imul(roadSeed,1664525)+1013904223)>>>0;return roadSeed/4294967296;};
  for(let i=0;i<5000;i++){
    const x=roadRandom()*128,y=roadRandom()*256,r=.3+roadRandom()*3.2;
    roadCtx.fillStyle=roadRandom()<.55?"rgba(70,48,27,.10)":"rgba(211,179,120,.12)";
    roadCtx.beginPath();roadCtx.ellipse(x,y,r,r*.7,roadRandom()*Math.PI,0,Math.PI*2);roadCtx.fill();
  }
  const roadTexture=new THREE.CanvasTexture(roadCanvas);
  roadTexture.colorSpace=THREE.SRGBColorSpace;
  roadTexture.wrapS=THREE.RepeatWrapping;roadTexture.wrapT=THREE.RepeatWrapping;
  roadTexture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const roadMaterials=[new THREE.MeshStandardMaterial({
    map:roadTexture,color:0xffffff,roughness:1,side:THREE.DoubleSide,
    polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2
  })];
  const roadGridStep=2*unit;
  const roadAnchor=item=>{
    if(!item.entrances.length)return null;
    item.root.updateMatrixWorld(true);
    const marker=item.entrances[0];
    const center=marker.getWorldPosition(new THREE.Vector3());
    // Find the outward face of the plot closest to the authored marker.
    const d=collisionDims(item),dx=center.x-item.root.position.x,dz=center.z-item.root.position.z;
    const sides=[
      {score:Math.abs(dx-d.x/2),x:item.root.position.x+d.x/2+roadGridStep*1.5,z:center.z},
      {score:Math.abs(dx+d.x/2),x:item.root.position.x-d.x/2-roadGridStep*1.5,z:center.z},
      {score:Math.abs(dz-d.z/2),x:center.x,z:item.root.position.z+d.z/2+roadGridStep*1.5},
      {score:Math.abs(dz+d.z/2),x:center.x,z:item.root.position.z-d.z/2-roadGridStep*1.5}
    ].sort((a,b)=>a.score-b.score);
    const chosen=sides[0];
    const bounds=new THREE.Box3().setFromObject(marker);
    const width=bounds.isEmpty()?3*unit:THREE.MathUtils.clamp(Math.max(bounds.max.x-bounds.min.x,bounds.max.z-bounds.min.z),2*unit,5*unit);
    return {point:new THREE.Vector3(chosen.x,groundLevel+.019,chosen.z),door:new THREE.Vector3(center.x,groundLevel+.019,center.z),width};
  };
  const clearRoads=()=>{
    for(const child of [...roadLayer.children]){roadLayer.remove(child);child.geometry?.dispose();}
  };
  const updateRoads=()=>{
    clearRoads();
    const hall=buildings.find(b=>b.id==="townhall"&&b.present);
    if(!hall)return;
    const start=roadAnchor(hall);
    if(!start)return;
    const gridX=x=>Math.round((x-playBox.min.x)/roadGridStep);
    const gridZ=z=>Math.round((z-playBox.min.z)/roadGridStep);
    const world=(x,z)=>new THREE.Vector3(playBox.min.x+x*roadGridStep,groundLevel+.019,playBox.min.z+z*roadGridStep);
    const nx=Math.floor(playSize.x/roadGridStep),nz=Math.floor(playSize.z/roadGridStep);
    const blocked=(x,z)=>{
      if(x<0||z<0||x>nx||z>nz)return true;
      const p=world(x,z);
      return buildings.some(b=>{
        if(!b.present)return false;
        const d=collisionDims(b),margin=roadGridStep*.55;
        return Math.abs(p.x-b.root.position.x)<d.x/2+margin&&Math.abs(p.z-b.root.position.z)<d.z/2+margin;
      });
    };
    const route=(from,to)=>{
      const sx=gridX(from.x),sz=gridZ(from.z),tx=gridX(to.x),tz=gridZ(to.z);
      const key=(x,z)=>x+","+z;
      const initial=key(sx,sz),goal=key(tx,tz);
      const open=[{x:sx,z:sz,g:0,f:Math.abs(sx-tx)+Math.abs(sz-tz)}],seen=new Map([[initial,0]]),previous=new Map();
      let found=false,iterations=0;
      while(open.length&&iterations++<16000){
        let best=0;for(let i=1;i<open.length;i++)if(open[i].f<open[best].f)best=i;
        const cur=open.splice(best,1)[0],k=key(cur.x,cur.z);
        if(cur.g!==seen.get(k))continue;
        if(k===goal){found=true;break;}
        for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
          const x=cur.x+dx,z=cur.z+dz,nk=key(x,z);
          if(blocked(x,z)&&nk!==goal)continue;
          const g=cur.g+1;
          if(g>=(seen.get(nk)??Infinity))continue;
          seen.set(nk,g);previous.set(nk,k);
          open.push({x,z,g,f:g+Math.abs(x-tx)+Math.abs(z-tz)});
        }
      }
      if(!found)return [];
      const points=[];let k=goal;
      while(k){const [x,z]=k.split(",").map(Number);points.push(world(x,z));k=previous.get(k);}
      points.reverse();
      // Preserve corners, discarding collinear grid points.
      return points.filter((p,i)=>i===0||i===points.length-1||
        Math.abs((points[i+1].x-p.x)*(p.z-points[i-1].z)-(points[i+1].z-p.z)*(p.x-points[i-1].x))>1e-8);
    };
    const drawTrail=(points,width)=>{
      if(points.length<2)return;
      // Smooth a routed centreline while keeping the authored entrance positions.
      const curve=new THREE.CatmullRomCurve3(points,false,"centripetal",.3);
      const length=points.reduce((sum,p,i)=>i?sum+p.distanceTo(points[i-1]):0,0);
      const count=Math.max(8,Math.min(320,Math.ceil(length/(roadGridStep*.65))));
      const positions=[],uvs=[],indices=[];
      for(let i=0;i<=count;i++){
        const u=i/count,p=curve.getPoint(u),tangent=curve.getTangent(u);
        const lateral=new THREE.Vector3(-tangent.z,0,tangent.x).normalize();
        // Subtle irregular edges, with no sharp zigzags.
        const wobble=(Math.sin(u*67+1.7)*.055+Math.sin(u*129)*.025)*width;
        const spread=width*(.5+Math.sin(u*51)*.025);
        for(const side of [-1,1]){
          positions.push(p.x+lateral.x*(side*spread+wobble),groundLevel+.024,p.z+lateral.z*(side*spread+wobble));
          uvs.push(side===-1?0:1,u*length/Math.max(width,.001));
        }
        if(i<count){const k=i*2;indices.push(k,k+2,k+1,k+1,k+2,k+3);}
      }
      const geometry=new THREE.BufferGeometry();
      geometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
      geometry.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));
      geometry.setIndex(indices);geometry.computeVertexNormals();
      const mesh=new THREE.Mesh(geometry,roadMaterials[0]);
      mesh.receiveShadow=true;mesh.castShadow=false;roadLayer.add(mesh);
    };
    for(const item of buildings){
      if(item===hall||!item.present)continue;
      const end=roadAnchor(item);if(!end)continue;
      const path=route(start.point,end.point);
      if(!path.length)continue;
      const width=Math.min(start.width,end.width,3.5*unit);
      const points=[start.door,start.point,...path.slice(1,-1),end.point,end.door];
      const clean=points.filter((p,i)=>i===0||p.distanceTo(points[i-1])>.00001);
      drawTrail(clean,width);
    }
  };
  updateRoads();
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
  const persist=()=>placement.write?.({version:1,buildings:Object.fromEntries(buildings.map(item=>[item.id,{x:item.root.position.x,z:item.root.position.z,rotation:item.rotation,present:item.present,finishAt:item.finishAt||0}]))});
  const updateHallLight=()=>{const hall=buildings[0];gameSun.target.position.copy(hall.root.position);gameSun.position.copy(hall.root.position).add(new THREE.Vector3(.6,1.4,.6));gameSun.target.updateMatrixWorld();gameSun.updateMatrixWorld();};
  const reach=Math.max(playSize.x,playSize.z)*.15;
  Object.assign(gameSun.shadow.camera,{left:-reach,right:reach,top:reach,bottom:-reach,far:reach*12});
  gameSun.shadow.camera.updateProjectionMatrix();updateHallLight();
  const beginMove=(item,isNew=false)=>{
    // While placement is open, selecting a different building switches the
    // moving target without committing the first building's draft location.
    if(moving&&active&&active!==item){
      active.root.position.copy(original.position);
      active.rotation=original.rotation;
      active.root.rotation.y=active.rotation?Math.PI*.5:Math.PI;
      active.present=original.present;active.root.visible=active.present;
      pendingBuild=false;
    }
    active=item;original={position:item.root.position.clone(),rotation:item.rotation,present:item.present};
    pendingBuild=isNew;moving=true;item.present=true;item.root.visible=true;showPanels();
  };
  const finishMove=commit=>{
    if(!active)return;
    if(commit&&!valid())return;
    if(!commit){active.root.position.copy(original.position);active.rotation=original.rotation;active.root.rotation.y=active.rotation?Math.PI*.5:Math.PI;active.present=original.present;active.root.visible=active.present;}
    else if(pendingBuild&&!placement.buy?.(active.id)){return;}
    if(commit&&pendingBuild){
      active.finishAt=placement.sandboxOptions?.()?.instant?0:Date.now()+60000;
      refreshConstruction();
    }
    if(commit)persist();
    updateRoads();
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
    active.present=false;active.root.visible=false;persist();updateRoads();active=null;refreshCatalog();showPanels();
  };
  placement.setBuildHandler?.(id=>{
    const item=buildings.find(b=>b.id===id);
    if(!placement.sandboxOptions?.()?.active||moving||!item)return false;
    if(item.present){
      if(!placement.sandboxOptions?.()?.unlimited)return false;
      const copy=cloneBuilding(item,id+"-copy-"+nextInstance++);
      copy.present=false;copy.root.visible=false;beginMove(copy,true);return true;
    }
    beginMove(item,true);return true;
  });
  const refreshCatalog=()=>placement.refreshBuild?.([...templates.values()].map(item=>({id:item.id,name:item.name,present:item.present})));
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
    if(moving){const hit=hallHit(e);if(hit){if(hit!==active)beginMove(hit);draggingHall=true;renderer.domElement.setPointerCapture(e.pointerId);return;}}
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
  return ()=>{placement.setBuildHandler?.(null);moveUi.remove();clearInterval(constructionTimer);clearRoads();roadMaterials.forEach(m=>m.dispose());roadTexture.dispose();grid.geometry.dispose();grid.material.dispose();gridFill.geometry.dispose();gridFill.material.dispose();disposed=true;cancelAnimationFrame(frame);observer.disconnect();canvas.removeEventListener("pointerdown",onDown);canvas.removeEventListener("pointermove",onMove);canvas.removeEventListener("pointerup",onUp);canvas.removeEventListener("pointercancel",onUp);canvas.removeEventListener("wheel",onWheel);gameSun.shadow.map?.dispose();groundMaterials.forEach(material=>material.dispose());renderer.dispose();starTexture.dispose();};
}
