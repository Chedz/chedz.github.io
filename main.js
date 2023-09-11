import * as THREE from 'https://cdn.skypack.dev/three';
// import * as OrbitControls from "https://cdn.jsdelivr.net/npm/three-orbitcontrols@2.110.3/OrbitControls.min.js";
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';

//Generate an array of all the colors from the rainbow
// var colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
let scene, renderer, camera;

function initScene(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    scene.fog = new THREE.Fog(0x000000, 500, 10000)

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(scene.fog.color)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild( renderer.domElement );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();
    camera.position.z = 5;
}


function addBox(){
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshLambertMaterial( { color: 0x00ff00,  } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
}

function addSphere(){
    const geometry = new THREE.SphereGeometry(1, 16, 16 )
    const material = new THREE.MeshLambertMaterial( { color: 0x00ff00, wireframe: true } );
    const sphere = new THREE.Mesh( geometry, material );
    scene.add( sphere );
}

function initLights(){
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.75)

    const distance = 20
    directionalLight.position.set(distance, distance, distance)

    directionalLight.castShadow = true

    directionalLight.shadow.mapSize.width = 1024
    directionalLight.shadow.mapSize.height = 1024

    directionalLight.shadow.camera.left = -distance
    directionalLight.shadow.camera.right = distance
    directionalLight.shadow.camera.top = distance
    directionalLight.shadow.camera.bottom = -distance

    directionalLight.shadow.camera.far = 3 * distance
    directionalLight.shadow.camera.near = distance

    scene.add(directionalLight)
}

function updateCamera() {
    camera.updateProjectionMatrix();
}

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
    // updateCamera();
}


initScene();
initLights();
// addBox();
addSphere();
animate();

