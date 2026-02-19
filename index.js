// Three.js Advanced Animation for Loader Page

// Initialize scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a1a);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 8);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Controls (optional - uncomment if you want interactive camera)
// const controls = new THREE.OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.autoRotate = true;
// controls.autoRotateSpeed = 1;
// controls.enableZoom = false;

// Lighting
// Ambient light
const ambientLight = new THREE.AmbientLight(0x404060);
scene.add(ambientLight);

// Main directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight);

// Fill light
const fillLight = new THREE.PointLight(0x4466ff, 0.5);
fillLight.position.set(-5, 0, 5);
scene.add(fillLight);

// Back light
const backLight = new THREE.PointLight(0xff66aa, 0.3);
backLight.position.set(0, 0, -10);
scene.add(backLight);

// Colored lights for effect
const colorLight1 = new THREE.PointLight(0x667eea, 0.8);
colorLight1.position.set(3, 2, 4);
scene.add(colorLight1);

const colorLight2 = new THREE.PointLight(0x9f7aea, 0.8);
colorLight2.position.set(-3, -1, 4);
scene.add(colorLight2);

// Create central geometric object - Icosahedron with wireframe
const geometry = new THREE.IcosahedronGeometry(1.2, 3);
const material = new THREE.MeshStandardMaterial({
    color: 0x667eea,
    emissive: 0x1a1a2e,
    wireframe: true,
    transparent: true,
    opacity: 0.9
});
const icosahedron = new THREE.Mesh(geometry, material);
icosahedron.castShadow = true;
icosahedron.receiveShadow = true;
scene.add(icosahedron);

// Inner sphere
const sphereGeo = new THREE.SphereGeometry(0.8, 32, 32);
const sphereMat = new THREE.MeshStandardMaterial({
    color: 0x9f7aea,
    emissive: 0x2a1a4a,
    transparent: true,
    opacity: 0.3
});
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
sphere.castShadow = true;
sphere.receiveShadow = true;
scene.add(sphere);

// Create floating particles around the object
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 3000;
const posArray = new Float32Array(particlesCount * 3);
const colorArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i += 3) {
    // Spherical distribution
    const radius = 2.5 + Math.random() * 1.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    posArray[i] = x;
    posArray[i+1] = y;
    posArray[i+2] = z;
    
    // Colors based on position
    const r = Math.abs(x) / 3 + 0.3;
    const g = Math.abs(y) / 3 + 0.2;
    const b = Math.abs(z) / 3 + 0.5;
    
    colorArray[i] = r;
    colorArray[i+1] = g;
    colorArray[i+2] = b;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.03,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Create orbiting rings
const ringMaterial = new THREE.LineBasicMaterial({ color: 0x667eea });

// Ring 1
const ringPoints1 = [];
const radius1 = 2.2;
for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    ringPoints1.push(new THREE.Vector3(
        Math.cos(angle) * radius1,
        Math.sin(angle) * radius1 * 0.3,
        0
    ));
}
const ringGeo1 = new THREE.BufferGeometry().setFromPoints(ringPoints1);
const ring1 = new THREE.LineLoop(ringGeo1, ringMaterial);
scene.add(ring1);

// Ring 2 (rotated)
const ringPoints2 = [];
const radius2 = 2.4;
for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    ringPoints2.push(new THREE.Vector3(
        0,
        Math.cos(angle) * radius2 * 0.3,
        Math.sin(angle) * radius2
    ));
}
const ringGeo2 = new THREE.BufferGeometry().setFromPoints(ringPoints2);
const ring2 = new THREE.LineLoop(ringGeo2, ringMaterial);
scene.add(ring2);

// Ring 3
const ringPoints3 = [];
const radius3 = 2.0;
for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    ringPoints3.push(new THREE.Vector3(
        Math.cos(angle) * radius3 * 0.5,
        0,
        Math.sin(angle) * radius3 * 0.5
    ));
}
const ringGeo3 = new THREE.BufferGeometry().setFromPoints(ringPoints3);
const ring3 = new THREE.LineLoop(ringGeo3, ringMaterial);
scene.add(ring3);

// Create floating cubes
const cubeGroup = new THREE.Group();
for (let i = 0; i < 8; i++) {
    const cubeGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const cubeMat = new THREE.MeshStandardMaterial({
        color: Math.random() * 0xffffff,
        emissive: 0x220066,
        transparent: true,
        opacity: 0.7
    });
    const cube = new THREE.Mesh(cubeGeo, cubeMat);
    
    const angle = (i / 8) * Math.PI * 2;
    const radius = 3.5;
    cube.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.5,
        Math.sin(angle) * radius * 0.5
    );
    
    cube.castShadow = true;
    cube.receiveShadow = true;
    cubeGroup.add(cube);
}
scene.add(cubeGroup);

// Create starfield background
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 1500;
const starsPositions = new Float32Array(starsCount * 3);

for (let i = 0; i < starsCount * 3; i += 3) {
    starsPositions[i] = (Math.random() - 0.5) * 200;
    starsPositions[i+1] = (Math.random() - 0.5) * 200;
    starsPositions[i+2] = (Math.random() - 0.5) * 200;
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true });
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Animation variables
let time = 0;
let mouseX = 0;
let mouseY = 0;

// Mouse move effect
document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    time += 0.002;
    
    // Rotate central objects
    icosahedron.rotation.x += 0.001;
    icosahedron.rotation.y += 0.002;
    
    sphere.rotation.x += 0.0005;
    sphere.rotation.y += 0.001;
    
    // Rotate particles in opposite direction
    particlesMesh.rotation.y -= 0.0003;
    particlesMesh.rotation.x -= 0.0001;
    
    // Rotate rings
    ring1.rotation.x += 0.001;
    ring1.rotation.y += 0.002;
    
    ring2.rotation.y += 0.0015;
    ring2.rotation.z += 0.001;
    
    ring3.rotation.x += 0.002;
    ring3.rotation.z += 0.0015;
    
    // Animate cubes
    cubeGroup.rotation.y += 0.001;
    cubeGroup.rotation.x += 0.0005;
    
    // Rotate stars slowly
    stars.rotation.y += 0.0001;
    
    // Mouse follow effect
    icosahedron.rotation.y += mouseX * 0.01;
    icosahedron.rotation.x += mouseY * 0.01;
    
    // Pulse effect
    const scale = 1 + Math.sin(time * 5) * 0.05;
    icosahedron.scale.set(scale, scale, scale);
    
    // Camera movement
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
    
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add some random floating particles to HTML for extra effect
function createHtmlParticles() {
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 4 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 255, ${Math.random() * 0.5})`;
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '2';
        particle.style.animation = `floatParticle ${Math.random() * 10 + 10}s infinite`;
        particle.style.boxShadow = '0 0 10px currentColor';
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatParticle {
                0%, 100% { transform: translate(0, 0); }
                25% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px); }
                50% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px); }
                75% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px); }
            }
        `;
        document.head.appendChild(style);
        
        document.getElementById('loader-container').appendChild(particle);
    }
}

// Create HTML particles
createHtmlParticles();

// Performance optimization: reduce particle count on mobile
if (window.innerWidth < 768) {
    // Reduce particle count for mobile
    scene.remove(particlesMesh);
    const newParticlesCount = 1000;
    const newPosArray = new Float32Array(newParticlesCount * 3);
    // ... regenerate with fewer particles
}

// Log that 3D scene is ready
console.log('3D Scene initialized with advanced effects');