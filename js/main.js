import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Create the scene
const scene = new THREE.Scene();

// Set up the camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(200, 100, 200);

// Set up the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
// Set up Audio Listener
const listener = new THREE.AudioListener();
camera.add(listener);

// Load and set up audio files
const audioLoader = new THREE.AudioLoader();

const sunNarration = new THREE.Audio(listener);
audioLoader.load('./assets/sun_audio.mp3', function (buffer) {
    sunNarration.setBuffer(buffer);
    sunNarration.setLoop(false);
    sunNarration.setVolume(0.8);
});

const earthNarration = new THREE.Audio(listener);
audioLoader.load('earth-narration.mp3', function (buffer) {
    earthNarration.setBuffer(buffer);
    earthNarration.setLoop(false);
    earthNarration.setVolume(0.8);
});

const moonNarration = new THREE.Audio(listener);
audioLoader.load('moon-narration.mp3', function (buffer) {
    moonNarration.setBuffer(buffer);
    moonNarration.setLoop(false);
    moonNarration.setVolume(0.8);
});




// Create a button for voice activation toggle
const voiceToggleButton = document.createElement('button');
voiceToggleButton.innerText = 'Enable Voice';
voiceToggleButton.style.position = 'fixed';
voiceToggleButton.style.bottom = '20px';
voiceToggleButton.style.left = '20px';
voiceToggleButton.style.padding = '10px 20px';
voiceToggleButton.style.fontSize = '16px';
voiceToggleButton.style.zIndex = '30';
voiceToggleButton.style.cursor = 'pointer';
voiceToggleButton.style.backgroundColor = '#333';
voiceToggleButton.style.color = '#fff';
voiceToggleButton.style.border = 'none';
voiceToggleButton.style.borderRadius = '5px';
document.body.appendChild(voiceToggleButton);

// Toggle flag for voice activation
let isVoiceEnabled = false;
voiceToggleButton.addEventListener('click', () => {
    isVoiceEnabled = !isVoiceEnabled;
    voiceToggleButton.innerText = isVoiceEnabled ? 'Disable Voice' : 'Enable Voice';

    // Stop all sounds if disabling voice
    if (!isVoiceEnabled) {
        stopAllNarrations();
    }
});


// Raycaster and Mouse for tooltips
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// HTML Elements for tooltip and info box
const tooltip = document.createElement('div');
tooltip.style.position = 'absolute';
tooltip.style.padding = '8px';
tooltip.style.background = 'rgba(0, 0, 0, 0.75)';
tooltip.style.color = 'white';
tooltip.style.borderRadius = '5px';
tooltip.style.display = 'none';
tooltip.style.pointerEvents = 'none';
tooltip.style.zIndex = '10';
document.body.appendChild(tooltip);

// Static Information Panel
const infoBox = document.createElement('div');
infoBox.style.position = 'fixed';
infoBox.style.top = '10px';
infoBox.style.right = '10px';
infoBox.style.width = '250px';
infoBox.style.height = 'auto';
infoBox.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
infoBox.style.color = '#ffffff';
infoBox.style.padding = '15px';
infoBox.style.borderRadius = '10px';
infoBox.style.zIndex = '20';
infoBox.style.fontSize = '14px';
infoBox.style.overflowY = 'auto';
infoBox.innerHTML = '<h3>Solar System Information</h3><p>Hover over objects to see details.</p>';
document.body.appendChild(infoBox);

// Load textures
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load('assets/images/earth.jpg'); 
const moonTexture = textureLoader.load('assets/images/moon.jpg'); 
const sunTexture = textureLoader.load('assets/images/sun.jpeg'); 

// Create the Sun
const sunGeometry = new THREE.SphereGeometry(25, 64, 64);
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(0, 0, 0);
sun.name = "Sun";
sun.description = "Type: Star<br>Mass: 1.989 × 10^30 kg<br>Radius: 696,340 km<br>Surface Temperature: 5,778 K";
scene.add(sun);

// Create the Sun's light
const sunLight = new THREE.PointLight(0xffffff, 2, 1500);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// Create ambient light for general illumination
const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
scene.add(ambientLight);

// Create the Earth
const earthGeometry = new THREE.SphereGeometry(15, 64, 64);
const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.castShadow = true;
earth.receiveShadow = true;
earth.name = "Earth";
earth.description = "Type: Planet<br>Mass: 5.972 × 10^24 kg<br>Radius: 6,371 km<br>Surface Temperature: 288 K";
scene.add(earth);

// Keplerian parameters for Earth's orbit
const semiMajorAxis = 100;
const eccentricity = 0.4;

let trueAnomaly = 0;
const earthOrbitalSpeed = 0.001;

// Earth Rotation Speed
const earthRotationSpeed = 0.007;

// Function to calculate the Earth's position based on Keplerian parameters
function calculateKeplerianOrbit(a, e, theta) {
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    return { x, z };
}

// Create Earth's Orbit Path
const earthOrbitSegments = 128;
const earthOrbitPoints = [];
for (let i = 0; i <= earthOrbitSegments; i++) {
    const angle = (i / earthOrbitSegments) * Math.PI * 2;
    const { x, z } = calculateKeplerianOrbit(semiMajorAxis, eccentricity, angle);
    earthOrbitPoints.push(new THREE.Vector3(x, 0, z));
}
const earthOrbitGeometry = new THREE.BufferGeometry().setFromPoints(earthOrbitPoints);
const earthOrbitMaterial = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
const earthOrbitPath = new THREE.Line(earthOrbitGeometry, earthOrbitMaterial);
scene.add(earthOrbitPath);

// Create the Moon
const moonGeometry = new THREE.SphereGeometry(5, 32, 32);
const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.castShadow = true;
moon.receiveShadow = true;
moon.name = "Moon";
moon.description = "Type: Satellite<br>Mass: 7.35 × 10^22 kg<br>Radius: 1,737 km<br>Orbital Period: 27.3 days";
earth.add(moon);

const moonOrbitRadius = 25;
moon.position.set(moonOrbitRadius, 0, 0);

// Moon Rotation Speed
const moonRotationSpeed = 0.005;

// Create 17 Potentially Hazardous Asteroids (PHAs)
const asteroidGroup = new THREE.Group();
const phaCount = 17;
const asteroidOrbitSegments = 128;

for (let i = 1; i <= phaCount; i++) {
    const a = 150 + Math.random() * 100;
    const e = 0.2 + Math.random() * 0.3;
    const inclination = Math.random() * Math.PI / 6;
    const asteroidOrbitPoints = [];

    for (let j = 0; j <= asteroidOrbitSegments; j++) {
        const angle = (j / asteroidOrbitSegments) * Math.PI * 2;
        const { x, z } = calculateKeplerianOrbit(a, e, angle);
        const y = x * Math.sin(inclination);
        asteroidOrbitPoints.push(new THREE.Vector3(x, y, z));
    }

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(asteroidOrbitPoints);
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });
    const orbitPath = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(orbitPath);

    const asteroidGeometry = new THREE.SphereGeometry(2, 32, 32);
    const asteroidMaterial = new THREE.MeshStandardMaterial({ color: 0xADD8E6 });
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    asteroid.name = `PHA #${i}`;
    asteroid.description = `Type: Potentially Hazardous Asteroid<br>Semi-Major Axis: ${a.toFixed(2)}<br>Eccentricity: ${e.toFixed(2)}<br>Inclination: ${(inclination * 180 / Math.PI).toFixed(2)}°`;
    const { x, z } = calculateKeplerianOrbit(a, e, Math.random() * Math.PI * 2);
    const y = x * Math.sin(inclination);
    asteroid.position.set(x, y, z);
    asteroidGroup.add(asteroid);
}

scene.add(asteroidGroup);

// Set up OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// Create Starry Background
function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });

    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = THREE.MathUtils.randFloatSpread(2000);
        const y = THREE.MathUtils.randFloatSpread(2000);
        const z = THREE.MathUtils.randFloatSpread(2000);
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

createStars();

// Animation Loop
function animate() {
    trueAnomaly += earthOrbitalSpeed;
    if (trueAnomaly >= 2 * Math.PI) trueAnomaly = 0;

    const earthPosition = calculateKeplerianOrbit(semiMajorAxis, eccentricity, trueAnomaly);
    earth.position.x = earthPosition.x;
    earth.position.z = earthPosition.z;

    earth.rotation.y += earthRotationSpeed;
    moon.rotation.y += moonRotationSpeed;

    controls.update();
    renderer.render(scene, camera);
}

// Hover detection for displaying detailed information
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([sun, earth, moon, ...asteroidGroup.children]);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        tooltip.style.display = 'block';
        tooltip.style.left = event.clientX + 'px';
        tooltip.style.top = event.clientY + 'px';
        tooltip.innerHTML = `${intersectedObject.name}`;

        // Update Information Box
        infoBox.innerHTML = `<h3>${intersectedObject.name}</h3><p>${intersectedObject.description}</p>`;
    } else {
        tooltip.style.display = 'none';
    }
}

window.addEventListener('mousemove', onMouseMove);

// Start animation loop
renderer.setAnimationLoop(animate);
