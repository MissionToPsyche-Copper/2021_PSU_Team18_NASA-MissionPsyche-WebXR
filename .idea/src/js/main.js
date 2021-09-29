import * as THREE
from '/Users/miablo/Desktop/PSU_Team18-SWENG480/node_modules/three/build/three.module.js';

import { TrackballControls }
    from '/Users/miablo/Desktop/PSU_Team18-SWENG480/node_modules/three/examples/jsm/controls/TrackballControls.js';

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
camera.position.z = 5; // change camera position from z axis

// -- renderer: obj renders scene using WebGL
const renderer = new THREE.WebGLRenderer({antialias: true});

// set color of bg in hex - 0-1 can be sent for alpha - opacity
renderer.setClearColor("#233143");
// sets size of app
renderer.setSize(window.innerWidth, window.innerHeight);
// appends renderer to html doc as canvas to draw in browser
document.body.appendChild(renderer.domElement);

// Responsive Design //
// allow for window resizing //
window.addEventListener('resize', () => { // if window is resized
    renderer.setSize(window.innerWidth,window.innerHeight); // identify new win size
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // apply new changes to new win size
})

// --- creating box --- //
const boxGeometry = new THREE.BoxGeometry(2,2,2); // width, height, depth
const boxMaterial = new THREE.MeshLambertMaterial({color:0xFFFFFF}); // box material - white
boxMesh.rotation.sest(40,0,40); // build box pass float for x, y , z rotation (degrees)
scene.add(boxMesh); // added box at (0,0)

// check for XR support
async function  checkForXRSupport() {
    navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        if(supported) {
            var enterXrBtn = document.createElement("button");
            enterXrBtn.innerHTML = "Enter Ar";
            enterXrBtn.addEventListener("click", beginXRSession);
            document.body.appendChild(enterXrBtn);
        } else {
            console.log("Session not supported: " + reason);
        }
    });
}

// render scene
// animation loop
// redraw scene 60FPS
// keep function at bottom
// needs to reference the above definitions
const rendering = function() {

    requestAnimationFrame(rendering);

    // Constantly rotate box
    scene.rotation.z -= 0.005;
    scene.rotation.x -= 0.01;

    renderer.render(scene, camera);
}

rendering();