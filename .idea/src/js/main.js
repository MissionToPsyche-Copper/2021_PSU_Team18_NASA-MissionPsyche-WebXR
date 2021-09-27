// Import the entire three.js core library.
import * as THREE from
        '../node_modules/three/build/three.module.js';

// allows trackball controls module to drag and spin
import { TrackballControls } from
        '../node_modules/three/examples/jsm/controls/TrackballControls.js';

//=================//
// Create a scene ||
//=================//

// -- scene: parent obj where all rendered obj, lights, and cameras live
const scene = new THREE.Scene();

// -- camera: obj allows us to see other obj
// Parameters:
// FOV - Field of View - number in degrees representing vertical field of view - up down
// Aspect Ratio: ratio between width and height (width divided by height) - innerWidth/Height grabs window size
// Near Clipping Plane: plane closest to the camera - current val is max - anything close and nothing is rendered
// Far Clipping Plane: plane furthers from camera - current val is max - anything bigger and nothing will be rendered
// setting far clipping to be =< near clipping then nothing will be rendered
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight,
    0.6, 1200);

// -- renderer: obj renders scene using WebGL
const renderer = new THREE.WebGLRenderer({antialias: true});

// set color of bg in hex - 0-1 can be sent for alpha - opacity
renderer.setClearColor("#233143");
// sets size of app
renderer.setSize(window.innerWidth, window.innerHeight);
// appends renderer to html doc as canvas to draw in browser
document.body.appendChild(renderer.domElement);


// Responsive Design //
window.addEventListener('resize', () => { // if window is resized
    renderer.setSize(window.innerWidth,window.innerHeight); // identify new win size
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // apply new changes to new win size
})