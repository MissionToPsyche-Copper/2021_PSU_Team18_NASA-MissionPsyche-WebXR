import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.120.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.120.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";
import { STLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.120.1/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.120.1/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.120.1/examples/jsm/loaders/MTLLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'https://cdn.jsdelivr.net/npm/three@0.120.1/examples/jsm/renderers/CSS2DRenderer.js';
import { CSS3DRenderer, CSS3DObject, CSS3DSprite } from 'https://cdn.jsdelivr.net/npm/three@0.120.1/examples/jsm/renderers/CSS3DRenderer.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.120.1/examples/jsm/webxr/VRButton.js';

// checkForXRSupport();

// check for XR support
// displaying enter AR if XR is supported
// if not it will display session not supported in the web dev browser
// async function checkForXRSupport() {
//     navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
//         if (supported) {
//             console.log('xr supported.');
//             enterXRExperiencePrompt();
//         } else {
//             console.log("xr not supported.");
//             if(isUsingAndroidDevice()) {
//                 window.alert("WebXR experience not supported. Try downloading the \"Google Play Services for Ar\" application on the Google Play Store, and rescanning this QR code.");
//             }
//             else if(isUsingAppleDevice()) {
//                 window.alert("WebXR experience not supported. Try downloading the \"WebXR Viewer\" application on the Apple App Store, and rescanning this QR code.");
//             }
//             else {
//                 window.alert("WebXR experience not supported on Desktop devices.");
//             }
//             // comment this line out if you are using on a PC.
//             window.history.back()
//         }
//     });
// }

function isUsingAndroidDevice() {
    var ua = navigator.userAgent.toLowerCase();
    return ua.indexOf("android") > -1;
}

function isUsingAppleDevice() {
    return [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
        ].includes(navigator.platform)
        // iPad on iOS 13 detection
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

function enterXRExperiencePrompt() {
    // We should add additional information here about the mission, the application, etc.
    let promptText = "This is a webXR experience based on the Psyche Asteroid Misson, 2022. To load the WebXR application, press OK. To exit, press cancel.";
    if (confirm(promptText) == true) {
        console.log("loading WebXR experience...");
    } else {
        // exit webXR experience by navigating "back" in the browser.
        // If there are no pages in the history, this will exit the browser.
        window.history.back();
    }
}


var mesh,
    renderer,
    cssrenderer,
    css2Drenderer,
    scene,
    camera,
    orbitControls,
    geometry,
    cubes,
    points,
    lineGeometry,
    material,
    line,
    gtlfLoader,
    spacecraftMesh,
    gammaRaySpectrometerMesh,
    neutronSpectrometerMesh,
    magnetometerMesh,
    envTexture,
    raycaster,
    // raycaster "object intersected"
    INTERSECTED,
    previousObjectSelected = "",
    objectSelected,
    // track mouse
    mouseX = 0, mouseY = 0,
    // hold particles
    particles = [];

var orbit="init";
var moveAway = true;
var loaded=false;
var instrumentView=false;

const amount = parseInt( window.location.search.substr( 1 ) ) || 10;

// This pointer is used for the raycaster
const pointer = new THREE.Vector2();

init();

function init() {
    //=================//
    // Create a scene ||
    //=================//

    // -- scene: parent obj where all rendered obj, lights, and cameras live
    scene = new THREE.Scene();

    // -- camera: obj allows us to see other obj
    // Parameters:
    // FOV - Field of View - number in degrees representing vertical field of view - up down
    // Aspect Ratio: ratio between width and height (width divided by height) - innerWidth/Height grabs window size
    // Near Clipping Plane: plane closest to the camera - current val is max - anything closer and nothing is rendered
    // Far Clipping Plane: plane furtherst from camera - current val is max - anything bigger and nothing will be rendered
    // setting far clipping to be =< near clipping then nothing will be rendered
    camera = new THREE.PerspectiveCamera(
        45, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.set(amount, amount, amount);
    // -- renderer: obj renders scene using WebGL
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.shadowMap.enabled = true;

    // -- raycaster: intersect object models & register events based on mouse interactions
    raycaster = new THREE.Raycaster();

   // document.body.appendChild( VRButton.createButton( renderer ) );
    renderer.xr.enabled = true;

    // -- lighting
    scene.add(new THREE.AmbientLight(0x888888));

    var light = new THREE.DirectionalLight(0xcccccc, 1);
    light.position.set(0.9, 5, 5);
    scene.add(light);
    light.caseShadow = true;
    light.shadow.camera.near = 0.01;
    light.shadow.camera.far = 45;
    light.shadow.camera.fov = 55;

    light.shadow.camera.left = -10;
    light.shadow.camera.right = 1;
    light.shadow.camera.top = 1;
    light.shadow.camera.bottom = -10;

    light.shadow.bias = 0.001;
    light.shadow.mapSize.width = 1024 * 3;

    // sets size of app
    renderer.setSize(window.innerWidth, window.innerHeight);
    // appends renderer to html doc as canvas to draw in browser
    document.body.appendChild(renderer.domElement);

    // -- controls: allows mouse controls such as click+drag, zoom, etc.
    // Add mouse controls
    orbitControls = new OrbitControls(camera, renderer.domElement);
    // limiting zoom determine how far zoom in and zoom out
    orbitControls.minDistance = 4;
    orbitControls.maxDistance = 100;
    orbitControls.maxPolarAngle = Math.PI / 2;
    orbitControls.enableDamping = true;

    // allows me to display the css elements in our scene
    cssrenderer = new CSS3DRenderer();
    cssrenderer.setSize(window.innerWidth, window.innerHeight);
    cssrenderer.domElement.style.position = 'absolute';
    document.getElementById('info').appendChild(cssrenderer.domElement);

    css2Drenderer = new CSS2DRenderer();
    css2Drenderer.domElement.style.position = 'absolute';
    css2Drenderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('info').appendChild(css2Drenderer.domElement);


    // -- models: load object model resources
    loadPsyche('../src/res/mtl/base psyche/Psyche_.mtl',-125,-25,0,0);
    // document.getElementById("tip").style.visibility = 'hidden';
    document.getElementById("orbit-a").style.visibility = 'hidden';
    document.getElementById("orbit-b").style.visibility = 'hidden';
    document.getElementById("orbit-c").style.visibility = 'hidden';
    document.getElementById("orbit-d").style.visibility = 'hidden';

    // Button listeners for the orbits
    const buttonOrbitA = document.getElementById('orbitA');
    buttonOrbitA.addEventListener('click', function(){
        if(orbit != "A") {
            orbit = "A";
            changeOrbit(orbit);
           // document.getElementById("tip").style.visibility = 'hidden';
            document.getElementById("orbit-a").style.visibility = 'visible';
            document.getElementById("orbit-b").style.visibility = 'hidden';
            document.getElementById("orbit-c").style.visibility = 'hidden';
            document.getElementById("orbit-d").style.visibility = 'hidden';
            document.getElementById("canvas3").style.visibility = 'visible';
            document.getElementById("OA").style.visibility = 'visible';
            document.getElementById("OB").style.visibility = 'hidden';
            document.getElementById("OC").style.visibility = 'hidden';
            document.getElementById("OD").style.visibility = 'hidden';
        }

        // css renderer testing
        // displays that psyche label in the scene
        // using this for testing
        const OrbitA = document.getElementById('orbit-a');
        OrbitA.style.marginTop = '-1em';
        OrbitA.style.fontSize = '10px';
        OrbitA.style.color = 'white';
        const orbitALabel = new CSS3DObject(OrbitA);
        orbitALabel.position.set(-20,-50,-500);
        scene.add(orbitALabel);
    });

    const buttonOrbitB = document.getElementById('orbitB');
    buttonOrbitB.addEventListener('click', function(){
        if(orbit != "B") {
            orbit = "B";
            changeOrbit(orbit);
          //  document.getElementById("tip").style.visibility = 'hidden';
            document.getElementById("orbit-a").style.visibility = 'hidden';
            document.getElementById("orbit-b").style.visibility = 'visible';
            document.getElementById("orbit-c").style.visibility = 'hidden';
            document.getElementById("orbit-d").style.visibility = 'hidden';
   
            document.getElementById("OB").style.visibility = 'visible';
            document.getElementById("OA").style.visibility = 'hidden';

            document.getElementById("OC").style.visibility = 'hidden';
            document.getElementById("OD").style.visibility = 'hidden';
        }

        const OrbitB = document.getElementById('orbit-b');
        OrbitB.style.visibility = 'visible';
        OrbitB.style.marginTop = '-1em';
        OrbitB.style.fontSize = '10px';
        OrbitB.style.color = 'white';
        const orbitBLabel = new CSS3DObject(OrbitB);
        orbitBLabel.position.set(-400,10,-300);
        scene.add(orbitBLabel);
    });

    const buttonOrbitC = document.getElementById('orbitC');
    buttonOrbitC.addEventListener('click', function(){
        if(orbit != "C") {
            orbit = "C";
            changeOrbit(orbit);
          //  document.getElementById("tip").style.visibility = 'hidden';
            document.getElementById("orbit-a").style.visibility = 'hidden';
            document.getElementById("orbit-b").style.visibility = 'hidden';
            document.getElementById("orbit-c").style.visibility = 'visible';
            document.getElementById("orbit-d").style.visibility = 'hidden';

            document.getElementById("OC").style.visibility = 'visible';
            document.getElementById("OA").style.visibility = 'hidden';
            document.getElementById("OB").style.visibility = 'hidden';

            document.getElementById("OD").style.visibility = 'hidden';
        }
        const OrbitC = document.getElementById('orbit-c');
        OrbitC.style.visibility = 'visible';
        OrbitC.style.marginTop = '-1em';
        OrbitC.style.fontSize = '10px';
        OrbitC.style.color = 'white';
        const orbitCLabel = new CSS3DObject(OrbitC);
        orbitCLabel.position.set(-400,10,-300);
        scene.add(orbitCLabel);
    });

    const buttonOrbitD = document.getElementById('orbitD');
    buttonOrbitD.addEventListener('click', function(){
        if(orbit != "D") {
            orbit = "D";
            changeOrbit(orbit);
          //  document.getElementById("tip").style.visibility = 'hidden';
            document.getElementById("orbit-a").style.visibility = 'hidden';
            document.getElementById("orbit-b").style.visibility = 'hidden';
            document.getElementById("orbit-c").style.visibility = 'hidden';
            document.getElementById("orbit-d").style.visibility = 'visible';
            document.getElementById("OD").style.visibility = 'visible';
            document.getElementById("OB").style.visibility = 'hidden';
            document.getElementById("OC").style.visibility = 'hidden';
            document.getElementById("OA").style.visibility = 'hidden';

   
        }
        const OrbitD = document.getElementById('orbit-d');
        OrbitD.style.visibility = 'visible';
        OrbitD.style.marginTop = '-1em';
        OrbitD.style.fontSize = '10px';
        OrbitD.style.color = 'white';
        const orbitDLabel = new CSS3DObject(OrbitD);
        orbitDLabel.position.set(-400,10,-300);
        scene.add(orbitDLabel);
    });

    scene.fog = new THREE.FogExp2(0x141414, 0.0001);
    // window.addEventListener( 'resize', onWindowResize );
    document.addEventListener( 'mousemove', onMouseMove );
    document.addEventListener( 'pointerdown', onPointerDown );

    // Responsive Design //
    // allow for window resizing //
    window.addEventListener('resize', () => { // if window is resized
        renderer.setSize(window.innerWidth, window.innerHeight); // identify new win size
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix(); // apply new changes to new win size
    });
}
// for stars random color generator helper
var rgbToHex = function (rgb) {
    var hex = Number(rgb).toString(16);
    if (hex.length < 2) {
        hex = "0" + hex;
    }
    return hex;
};
// for stars random color generator
var fullColorHex = function(r,g,b) {
    var red = rgbToHex(r);
    var green = rgbToHex(g);
    var blue = rgbToHex(b);
    return red+green+blue;
};

function onMouseMove( event ) {

    event.preventDefault();
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // console.log("Mouse position: ", pointer.x, pointer.y)

    raycaster.setFromCamera( pointer, camera );

    const intersects = raycaster.intersectObjects( scene.children, true );

    if ( intersects.length > 0 ) {
        const intersect = intersects[0];
        // console.log(intersect.object.name);
        // console.log(intersect.object.parent.name);
    }
}

function onPointerDown(event) {
    event.preventDefault();
    pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, -
        ( event.clientY / window.innerHeight ) * 2 + 1 );

    raycaster.setFromCamera( pointer, camera );

    const intersects = raycaster.intersectObjects( scene.children, true );

    if ( intersects.length > 0 ) {
        const intersect = intersects[ 0 ];
        // console.log(intersect.object.name);
        // console.log(intersect.object.parent.name);

        switch(intersect.object.parent.name) {
            case "gammaRaySpectrometer":
                onGammaRaySpectrometerClicked();
                break;
            case "imager1":
                onImagerClicked();
                break;
            case "imager2":
                onImagerClicked();
                break;
            case "psyche":
                onPsycheClicked();
                break;
            default:
                break;
        }

        switch(intersect.object.name) {
            case "spacecraft":
                onSpacecraftClicked();
                break;
            case "neutronSpectrometer":
                onNeutronSpectrometerClicked();
                break;
            case "magnetometer":
                onMagnetometerClicked();
                break;
            default:
                break;
        }
    }


}

// for stars
function generateRandomColor()
{
    var randomColor = randomRange(0,6);
    switch(randomColor) {
        case 0: return '#'+fullColorHex(175,201,255);
        case 1: return '#'+fullColorHex(199,216,255);
        case 2: return '#'+fullColorHex(255,244,243);
        case 3: return '#'+fullColorHex(255,229,207);
        case 4: return '#'+fullColorHex(255,217,178);
        case 5: return '#'+fullColorHex(255,199,142);
        case 6: return '#'+fullColorHex(255,166,81);

        default: break;
    }
    //random color will be freshly served
}

function addStars() {
    const textureLoader = new THREE.TextureLoader();
    const sprite1 = textureLoader.load('./res/spikey.png');
    const radius = 200;
    // particles - called point sprinte or bill-board
    // create random filed of particle objects
    const geo = new THREE.BufferGeometry();
    const vertices = [];
    const sizes = [];

    for ( let i = 0; i < 100000; i++ ) {
        vertices.push( ( ( Math.random() * 2 - 1 ) * radius )  ); // x
        vertices.push( (( Math.random() * 2 - 1 ) * radius  ) ); // y
        vertices.push( (( Math.random() * 2 - 1 ) * radius  )); // z

        sizes.push( 20 );
    }

    geo.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geo.setAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ).setUsage( THREE.DynamicDrawUsage ) );

        var BGparticles = new THREE.Points(geo, new THREE.PointsMaterial({
            transparent: true,
            map: sprite1
        }));

        BGparticles.rotation.x = Math.random() * 2;
        BGparticles.rotation.y = Math.random() * 2;
        BGparticles.rotation.z = Math.random() * 2;

        scene.add(BGparticles);
    }

/// create a random between any two values
function randomRange(min, max) {
    return Math.floor(Math.random() * (max-min + 1) + min);
}

// function animateStars() {
//     for(var i = 0; i < particles.length; i++) {
//         var particle = particles[i];
//         // move particle forward based on mouse y position
//         particle.position.z += mouseY * 0.00002;
//
//         // if particle is too close move it backwards
//         if(particle.position.z > 1000) particle.position.z -=2000;
//     }
//     particle.rotation.y += 0.000001;
// }

function loadSpacecraft() {
    var spacecraftMaterial = loadModelMaterial(0x8c8c8c);
    loadSpacecraftModel(spacecraftMaterial);

    var neutronSpectrometerMaterial = loadModelMaterial(0xFFFFFF);
    loadNeutronSpectrometer(neutronSpectrometerMaterial);

    var magnetometerMaterial = loadModelMaterial(0xFFFFFF);
    loadMagnetometers(magnetometerMaterial);

    loadImagers();
    loadGammaRaySpectrometer();
}

function loadGammaRaySpectrometer() {
    const objLoader = new OBJLoader();
    objLoader.load('../src/res/stl/instruments/gamma_ray_spectrometer.obj',
        function (gammaRaySpectrometer) {
            gammaRaySpectrometer.position.set(-1.1, 2.7, 0.1);
            gammaRaySpectrometer.rotation.y = (3 * Math.PI) / 2;
            gammaRaySpectrometer.scale.setScalar(0.2);
            gammaRaySpectrometer.name = "gammaRaySpectrometer";
            scene.add(gammaRaySpectrometer);
        },
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function(error) {
            console.log('An error occurred');
        }
    );
}

function loadNeutronSpectrometer(material) {
    const stlLoader = new STLLoader();
    stlLoader.load(
        '../src/res/stl/instruments/neutron_spectrometer.stl',
        function (geometry) {
            neutronSpectrometerMesh = new THREE.Mesh(geometry, material)
            neutronSpectrometerMesh.position.set(-1.12,1.8,0.115);
            neutronSpectrometerMesh.rotation.x = -1 * Math.PI / 2;
            neutronSpectrometerMesh.rotation.z = 3 * Math.PI / 2;
            neutronSpectrometerMesh.scale.setScalar(0.14);
            neutronSpectrometerMesh.name = "neutronSpectrometer";
            scene.add(neutronSpectrometerMesh)
        },
        (xhr) => {
            console.log(`${( xhr.loaded / xhr.total ) * 100}% loaded`);
        },
        (error) => {
            console.log(error)
        }
    )
}

function loadImagers() {
    loadImager(-1.175, 1.075, -0.25, 1);
    loadImager(-1.175, 1.075, -0.45, 2);
}

function loadImager(x, y, z, id) {
    const objLoader = new OBJLoader();
    objLoader.load('../src/res/stl/instruments/imager.obj',
        function (imager) {
            imager.position.set(x, y, z);
            imager.rotation.y = Math.PI;
            imager.scale.setScalar(0.09);
            imager.name = "imager" + id;
            scene.add(imager);
        },
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function(error) {
            console.log('An error occurred');
        }
    );
}

function loadMagnetometers(material) {
    loadMagnetometer(-1.28, 2.7, -0.85, material);
    loadMagnetometer(-1.28, 2.2, -0.85, material);
}

function loadMagnetometerMaterial() {
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xDEDEDE,
        metalness: 0.25,
        roughness: 0.1,
        transparent: false,
        transmission: 0.99,
        clearcoat: 1.0,
        clearcoatRoughness: 0.25
    })
    return material;
}

function loadMagnetometer(x, y, z, material) {
    const stlLoader = new STLLoader();
    stlLoader.load(
        '../src/res/stl/instruments/magnetometer.stl',
        function (geometry) {
            magnetometerMesh = new THREE.Mesh(geometry, material)
            magnetometerMesh.rotation.set(-Math.PI / 2, 0,  Math.PI / 2);
            magnetometerMesh.rotation.y = Math.PI / 2;
            magnetometerMesh.position.set(x,y,z);
            magnetometerMesh.scale.setScalar(0.05);
            magnetometerMesh.name = "magnetometer";
            scene.add(magnetometerMesh)
        },
        (xhr) => {
            console.log(`${( xhr.loaded / xhr.total ) * 100}% loaded`);
        },
        (error) => {
            console.log(error)
        }
    )
}

function loadModelMaterial(color) {
    const material = new THREE.MeshPhysicalMaterial({
        color: color,
        // envMap: envTexture,
        metalness: 0.25,
        roughness: 0.1,
        //opacity: 2,
        transparent: false,
        transmission: 0.99,
        clearcoat: 1.0,
        clearcoatRoughness: 0.25
    })
    return material;
}

function loadSpacecraftModel(material) {
    // Spacecraft Loader
    const stlLoader = new STLLoader();
    stlLoader.load(
        '../src/res/stl/spacecraft/spacecraft_with_frame.stl',
        function (geometry) {
            spacecraftMesh = new THREE.Mesh(geometry, material)
            // change these values to modify the x,y,z plane that this model sits on when it is loaded.

            // orbiting setup (DO NOT DELETE. Use this for final realistic orbiting view.)
            // spacecraftMesh.rotation.set(-Math.PI / 1.8, 0.3,  Math.PI / 2);
            // spacecraftMesh.rotation.z = Math.PI / 1.8;
            // spacecraftMesh.position.set(0,0,0.5);

            // DO NOT DELETE.
            // flat setup is used for loading & aligning other 3d objects.
            spacecraftMesh.rotation.set(-Math.PI / 2, 0,  Math.PI / 2);
            spacecraftMesh.rotation.z = Math.PI / 2;
            spacecraftMesh.position.set(-4,0,0);
            spacecraftMesh.name = 'spacecraft';

            //todo: fix camera zoom to be closer on load.
            spacecraftMesh.scale.set(0.025,0.025,0.025);
            scene.add(spacecraftMesh)
            //camera.lookAt(spacecraftMesh);
            camera.position.x = -80;
            camera.position.y = -20;
            camera.position.z = 150;
        },
        (xhr) => {
            console.log(`${( xhr.loaded / xhr.total ) * 100}% loaded`);
        },
        (error) => {
            console.log(error)
        }
    )
}

// update radius
function changeOrbit(orbit = char){
    var psyche = scene.getObjectByName( "psyche" );
    var x, y, z;

    switch(orbit) {
        case "A":
            x = -125;
            y = -25;
            z = 0;
            break;
        case "B":
            x = -100;
            y = -25;
            z = 0;
            break;
        case "C":
            x = -75;
            y = -25;
            z = 0;
            break;
        case "D":
            x = -50;
            y = -25;
            z = 0;
            break;
    }
    if (instrumentView==false) psyche.position.set(x, y, z);
    else{
        var yRotation = psyche.rotation.y;
        if(instrumentView == true)
        {
            removePsyche();
            loadPsyche('../src/res/mtl/base psyche/Psyche_.mtl',x,y,z,yRotation);
            instrumentView = false;
            return;
        }
    }
}

// not working need to debug...
function beginXRSession() {
    // requestSession must be called within a user gesture event
    // like click or touch when requesting an immersive session.
    navigator.xr.requestSession('immersive-vr')
        .then(onSessionStarted)
        .catch(err => {
            // May fail for a variety of reasons. Probably just want to
            // render the scene normally without any tracking at this point.
            window.requestAnimationFrame(onDrawFrame);
        });
}

// Psyche object
function loadPsyche(filePath=string, x=int, y=int, z=int, yRotation=int) {
    new MTLLoader().load(filePath,
            (material) => {
            material.preload()

            // psyche loader
            new OBJLoader()
                .setMaterials(material)
                .setPath('../src/res/Psyche/')
                .load('Psyche_.obj', (psyche) => {
                        //psyche.position.set(-125, -25, 0);
                        psyche.position.set(x, y, z);
                        psyche.rotation.y = yRotation;
                        psyche.scale.setScalar(20);
                        psyche.name = "psyche";
                        scene.add(psyche);
                    },
                    function(xhr) {
                        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                    },
                    function(error) {
                        console.log('An error occurred');
                    }
                );
        })
}

function removePsyche() {
    var psyche = scene.getObjectByName( "psyche" );
    scene.remove( psyche );
}

// ability to interact with obj on screen
function renderRaycaster() {
    raycaster.setFromCamera( pointer, camera );
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        if (INTERSECTED != intersects[0].object) {
            if (INTERSECTED){
                material = INTERSECTED.material;
                if(material.emissive){
                    material.emissive.setHex(INTERSECTED.currentHex);
                }
                else{
                    material.color = INTERSECTED.currentHex;
                }
            }
            INTERSECTED = intersects[0].object;
            material = INTERSECTED.material;
            if(material.emissive){
                INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                material.emissive.setHex(Math.random() * 0xffffff);
                material.emissive.needsUpdate = true;
                console.log(INTERSECTED.object);

            }
            else{
                INTERSECTED.currentHex = material.color;
            }
            objectSelected = INTERSECTED;
        }
    } else {
        if (INTERSECTED){
            material = INTERSECTED.material;
            if(material.emissive){
                material.emissive.setHex(INTERSECTED.currentHex);
            }
            else
            {
                material.color = INTERSECTED.currentHex;
            }
        }
        INTERSECTED = null;
    }
}

function onPsycheClicked() {
    console.log("Psyche clicked");
    document.getElementById("canvas3").style.visibility = 'visible';
}

function onSpacecraftClicked() {
    console.log("Spacecraft clicked");
    document.getElementById("canvas3").style.visibility = 'visible';
}

function onMagnetometerClicked() {
    console.log("Magnetometer clicked");
    document.getElementById("canvas3").style.visibility = 'visible';

    var psyche = scene.getObjectByName( "psyche" );
    var x = psyche.position.x;
    var y = psyche.position.y;
    var z = psyche.position.z;
    var yRotation = psyche.rotation.y;
    if(orbit == 'C' && instrumentView == false)
    {
        removePsyche();
        loadPsyche('../src/res/mtl/magnetometer/magnetometer.mtl',x,y,z,yRotation);
        instrumentView = true;
        return;
    }
    if(orbit == 'C' && instrumentView == true)
    {
        removePsyche();
        loadPsyche('../src/res/mtl/base psyche/Psyche_.mtl',x,y,z,yRotation);
        instrumentView = false;
        return;
    }
}

function onImagerClicked() {
    console.log("Imager clicked");
    document.getElementById("canvas3").style.visibility = 'visible';

    var psyche = scene.getObjectByName( "psyche" );
    var x = psyche.position.x;
    var y = psyche.position.y;
    var z = psyche.position.z;
    var yRotation = psyche.rotation.y;
    if(orbit == 'A' && instrumentView == false)
    {
        removePsyche();
        loadPsyche('../src/res/mtl/imager/imager.mtl',x,y,z,yRotation);
        instrumentView = true;
        return;
    }
    if(orbit == 'A' && instrumentView == true)
    {
        removePsyche();
        loadPsyche('../src/res/mtl/base psyche/Psyche_.mtl',x,y,z,yRotation);
        instrumentView = false;
        return;
    }
}

function onNeutronSpectrometerClicked() {
    console.log("Neutron Spectrometer clicked");
    document.getElementById("canvas3").style.visibility = 'visible';

    var psyche = scene.getObjectByName( "psyche" );
    var x = psyche.position.x;
    var y = psyche.position.y;
    var z = psyche.position.z;
    var yRotation = psyche.rotation.y;
    if(orbit == 'B' && instrumentView == false)
    {
        removePsyche();
        loadPsyche('../src/res/mtl/grns/grns.mtl',x,y,z,yRotation);
        instrumentView = true;
        return;
    }
    if(orbit == 'B' && instrumentView == true)
    {
        removePsyche();
        loadPsyche('../src/res/mtl/base psyche/Psyche_.mtl',x,y,z,yRotation);
        instrumentView = false;
        return;
    }
}

function onGammaRaySpectrometerClicked() {
    console.log("Gamma Ray Spectrometer clicked");
    document.getElementById("canvas3").style.visibility = 'visible';
    var psyche = scene.getObjectByName( "psyche" );
    var x = psyche.position.x;
    var y = psyche.position.y;
    var z = psyche.position.z;
    var yRotation = psyche.rotation.y;
    if(orbit == 'B' && instrumentView == false)
    {
        removePsyche();
        loadPsyche('../src/res/mtl/grns/grns.mtl',x,y,z,yRotation);
        instrumentView = true;
        return;
    }
    if(orbit == 'B' && instrumentView == true)
    {
        removePsyche();
        loadPsyche('../src/res/mtl/base psyche/Psyche_.mtl',x,y,z,yRotation);
        instrumentView = false;
        return;
    }
}

function animatePsyche(){
    var psyche = scene.getObjectByName( "psyche" );
    if(psyche != null && orbit != "init") {
        //rotation
        psyche.rotation.y -= 0.0006;

        /*

        //ellipse code - commented out for the time being for further testing
        switch(orbit) {
            case "A":
                if(psyche.position.x <= -150) moveAway = false;
                if(psyche.position.x >= -100) moveAway = true;
                break;
            case "B":
                if(psyche.position.x <= -125) moveAway = false;
                if(psyche.position.x >= -75) moveAway = true;
                break;
            case "C":
                if(psyche.position.x <= -100) moveAway = false;
                if(psyche.position.x >= -50) moveAway = true;
                break;
            case "D":
                if(psyche.position.x <= -75) moveAway = false;
                if(psyche.position.x >= -25) moveAway = true;
                break;
        }

        if (moveAway == true) psyche.position.x -= 0.025;
        else psyche.position.x += 0.025;

         */
    }
}

// render scene
// animation loop
// redraw scene 60FPS
// keep function at bottom
// needs to reference the above definitions
function animate() {
    // Rotate scene constantly

     //camera.position.x += ( mouseX + camera.position.x ) * .05;
     // camera.position.y = THREE.MathUtils.clamp( camera.position.y + ( - ( mouseY ) + camera.position.y ) * .05, 100, 100 );
    camera.lookAt( scene.position );
    render();
    cssrenderer.render(scene, camera);
    renderRaycaster();
    orbitControls.update();
    css2Drenderer.render(scene,camera);
    requestAnimationFrame(animate); // recursive call to animate function
    animatePsyche();
    // animateStars();
}

function render() {
    renderer.render(scene, camera);
}

addStars();
loadSpacecraft();
animate();

/*

*****THE FOLLOWING IS LEGACY CODE FROM WHEN THE SPACECRAFT ORBITED THE ASTEROID*****

// radius changes the orbit distance, but this must also be modified with
// spacecraft placement because as the radius changes, the "starting point"
// must also change.
//not sure why calling multiple times speeds up the orbit, must investigate

function startSpacecraftOrbit(radius) {
    var r = 0, t = -1, a = 1;
    var p = new THREE.Vector3(0, 0, 0);
    var ax = new THREE.Vector3(0, 1, 0);
    var frames = 1000;

    setInterval(function(){
        t ++;
        if (t % frames == 0) {
            a++;
            p.x = (a == 1 ? 1 : -1) * radius;
            r = a == 1 ? -1 : 1;
        }
        spacecraftMesh.rotateAroundWorldAxis(p, ax, r * Math.PI * 2 / frames);
    }, 20);
}

THREE.Object3D.prototype.rotateAroundWorldAxis = function() {

    var q = new THREE.Quaternion();

    return function rotateAroundWorldAxis(point, axis, angle) {
        q.setFromAxisAngle(axis, angle);
        this.applyQuaternion(q);
        this.position.sub(point);
        this.position.applyQuaternion(q);
        this.position.add(point);
        return this;
    }
}();

*****LEGACY CODE FOR REMOVING ENTITIES - STILL WORKS*****

// removes objects
// is this still working or needed?
// yes working, no longer needed - Odhran

    //this code used to live in changeOrbit()
    loadSpacecraft();
    var radius = 0;
    switch(orbit){
        case "A":
            radius = 125;
            break;
        case "B":
            radius = 100;
            break;
        case "C":
            radius = 75;
            break;
        case "D":
            radius = 50;
            break;
     }

     startSpacecraftOrbit(radius);


// If the spacecraft is not orbiting, we do not need this code.
// It could be good to keep around in case we need it for similar stuff later.

*****END OF LEGACY CODE*****

*/