import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import galaxy from '../img/galaxy.png';
import blackhole from '../img/blackhole.jpeg';

//import the mailBox objects
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
const mailboxUrl = new URL('../objects/mailbox.glb', import.meta.url);

//make a renderer
const renderer = new THREE.WebGLRenderer();

//set the value for shadow rendering to true
renderer.shadowMap.enabled = true;

//set the render size
renderer.setSize(window.innerWidth, window.innerHeight);

//get the renderer on the body element
document.body.appendChild(renderer.domElement);

//creating a scene
const scene = new THREE.Scene();

//create a camera with FOV, ____,...
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

//import a helper with size arg and add it to the scene
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

//add gridhelper
const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

//set the camera position (x, y ,z)
camera.position.set(-10, 30 ,30);

//implement the orbit camera and make sure it updates everytime the camera position changes
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

//creating a box geometry and a material, create a mesh with the box geometry and material, and add it to the scene (Basic Material needs no light to show up)
const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshBasicMaterial({color: 0x00FF00});
const box = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);

//creating a sphere geometry and a material, create a mesh with the sphere geometry and material, and add it to the scene (Standard Material needs light to show up and is shiny. BTW Toon Material is catoon like)
const sphereGeometry = new THREE.SphereGeometry(4, 50, 50);
const sphereMaterial = new THREE.MeshStandardMaterial({
    wireframe: false
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

sphere.position.set(-10, 10, 0);

//define that the sphere cast a shadow
sphere.castShadow = true;

//create and instance of ambient light, with the color as argument, and add it to the scene
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

//create and instance of directional light, with the color and intensety as argument, and add it to the scene at given position
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
scene.add(directionalLight);
directionalLight.position.set(-30, 50, 0);

//define that the directionalLight cast a shadow, because its the main reasson for shadows
directionalLight.castShadow = true;

//expand the bottom of the directional light viewport (bc its like a camera)
directionalLight.shadow.camera.bottom = -12;

//add directional light helper (args are light source and size of helper square)
const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
scene.add(dLightHelper);

//Use a camera helper for the directional light camera as shadow helper, because lights wotk like cameras in ThreeJs
const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(dLightShadowHelper);

// //add fog instance with lienar growinf densety closer to far vsb (color, near visible space barder, far visible space boarder)
// scene.fog = new THREE.Fog(0xFFFFFF, 0 ,200);

//add Fog with exponentional growing densety close to far vsb 
scene.fog = new THREE.FogExp2(0xFFFFFF, 0.01);

// //set backgrund color of the renderer
// renderer.setClearColor(0xFFEA00);

//use regualr texture loader to load the 2d image at the background
const textureLoader = new THREE.TextureLoader();
scene.background = textureLoader.load(galaxy);

// //use cube texture loader to load the images in a array to all faces for a more 3d like image 
// const cubeTextureLoader = new THREE.CubeTextureLoader();
// scene.background = cubeTextureLoader.load([
//     galaxy,
//     galaxy,
//     blackhole,
//     blackhole,
//     blackhole,
//     blackhole
// ]);

//create a second box at set postision
const box2Geometry = new THREE.BoxGeometry(4, 4, 4);
const box2Material = new THREE.MeshBasicMaterial({
    //map picture to all sides of the second box via texture loader (wich means all faces will be the same)
    map:textureLoader.load(blackhole)
});
const box2 = new THREE.Mesh(box2Geometry, box2Material);
scene.add(box2);
box2.position.set(0, 15 ,10);

//change material of second cube afterwards
box2.material.map = textureLoader.load(blackhole);

//array of texures for third box
const box3MultiMaterial = [
    new THREE.MeshBasicMaterial({map: textureLoader.load(galaxy)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(blackhole)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(galaxy)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(blackhole)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(blackhole)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(galaxy)})
];

//create a third box at set postision and make array of images to material, to asign diffrent images to each face
const box3Geometry = new THREE.BoxGeometry(4, 4, 4);
const box3 = new THREE.Mesh(box3Geometry, box3MultiMaterial);
scene.add(box3);
box3.position.set(10, 15 ,0);


//createing a plane (Labert Material needs light to show up and isn't shiny like Standard Material)
const planeGeometry = new THREE.PlaneGeometry(30,30);
const planeMaterial = new THREE.MeshLambertMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;

//define that plane recives casted shadows
plane.receiveShadow = true;

//create an inszace of the GLFTLoader and load the fireEx obejct
const assetLoader = new GLTFLoader();

assetLoader.load(mailboxUrl.href, function(gltf){
    const model = gltf.scene;
    scene.add(model);
    model.position.set(-10, 20, -5);
}, undefined, 
//create a function for error case
function(error){
    console.log(error);
})

//create an instace of dat.gui for better debuging
const gui = new dat.GUI();

//creating a options object for gui
const options = {
        sphereColor: '#ffea00',
        wireframe: false,
        speed: 0.01
};

//add option for sphere color to the gui and specify what should happen on change  (e = color code from colorpalet)
gui.addColor(options, 'sphereColor').onChange(function(e){
    sphere.material.color.set(e);
});

//add show wireframe option for the sphere to the gui (e = true or false)
gui.add(options, 'wireframe').onChange(function(e){
    sphere.material.wireframe = e;
})

//add speed to the gui option with minimal and maximal
gui.add(options, 'speed', 0, 0.1);

//define step for gui controlled sphere animation
let step = 0;

//storage for mouse postition
const mousePosition = new THREE.Vector2();

//Eventistener to the posotion of the  curser and upadte the Vector with value of the nomalized cordiantes of the curser (e.clientX is the x postition, e.clientY the y position)
window.addEventListener('mousemove', function(e){
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = - (e.clientY / window.innerHeight) * 2 + 1;
})

//create an instance of the array caster class
const rayCaster = new THREE.Raycaster();

//element we want do get by id
const sphereId = sphere.id;

//create a animation function, set the animation movement with the speed vars, render scene and camera
function animate() {
    box.rotation.x += 0.01;
    box.rotation.y += 0.01;

    //make a bounce animation for sphere, connected with the speed option
    step += options.speed;
    sphere.position.y = 10 * Math.abs(Math.sin(step));

    //set the camera as startpoint of the ray caster
    rayCaster.setFromCamera(mousePosition, camera);
    
    //obejects which intersect with the ray (in this case all objects of the scene)
    const intersects = rayCaster.intersectObjects(scene.children);
    console.log(intersects);

     //check if the ray intersects with the element with the sphereId and change its color
     for(let i = 0; i < intersects.length; i++){
        if(intersects[i].object.id === sphereId)
            intersects[i].object.material.color.set(0xFF0FF);
    }
    renderer.render(scene, camera);
}

//call the animate function, with the renderer of scene and camera, as a animation loop 
renderer.setAnimationLoop(animate);

//make canvas responsive
window.addEventListener('resize', function(){
    camera.aspect = this.window.innerWidth / this.window.innerHeight;
    camera.updateProjectionMatrixM
    renderer.setSize(w.innerWidth, window.innerHeight);
})