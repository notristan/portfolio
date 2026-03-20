import './style.css';
import * as THREE from 'three';
import gsap from 'gsap';

// ==========================================
// 1. INITIALISATION & SCÈNE
// ==========================================
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.002); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 8; 

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); 
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2); 
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// ==========================================
// 2. CHARGEMENT ET CRÉATION DES SCÈNES
// ==========================================
const homeGroup = new THREE.Group();
const synapsePlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));
const tarmakPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));

synapsePlane.visible = false;
tarmakPlane.visible = false;
homeGroup.visible = true; 

scene.add(homeGroup, synapsePlane, tarmakPlane);
const textureLoader = new THREE.TextureLoader();

const smallCubeGeo = new THREE.BoxGeometry(1, 1, 1);
const grayMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.3, transparent: true, opacity: 1 });
const blueMat = new THREE.MeshStandardMaterial({ color: 0x0055ff, transparent: true, opacity: 1 });
const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 1 });
const mats = [grayMat, blueMat, whiteMat];

const gap = 0.1; 
let count = 0;
for (let x = -1; x <= 1; x += 2) {
    for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
            const material = mats[count % mats.length]; 
            const smallCube = new THREE.Mesh(smallCubeGeo, material);
            smallCube.position.set(x * (0.5 + gap/2), y * (0.5 + gap/2), z * (0.5 + gap/2));
            homeGroup.add(smallCube);
            count++;
        }
    }
}
homeGroup.scale.set(0.7, 0.7, 0.7); 
homeGroup.rotation.set(Math.PI / 4, Math.PI / 4, 0); 

function loadTextureWithRatio(url, mesh, baseHeight = 6.5) {
    textureLoader.load(url, (tex) => {
        mesh.material.map = tex;
        mesh.material.needsUpdate = true;
        const aspect = tex.image.width / tex.image.height;
        mesh.scale.set(baseHeight * aspect, baseHeight, 1);
    });
}

loadTextureWithRatio('/images/synapse.PNG', synapsePlane, 6.5);
loadTextureWithRatio('/images/tarmak.PNG', tarmakPlane, 6.5);

const partGeo = new THREE.BufferGeometry();
const pos = new Float32Array(200 * 3);
for(let i=0; i<600; i++) pos[i] = (Math.random()-0.5) * 15;
partGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
const partMat = new THREE.PointsMaterial({ size: 0.05, color: 0x444444, transparent: true, opacity: 0.2 });
const homeParticles = new THREE.Points(partGeo, partMat);
scene.add(homeParticles);

// ==========================================
// 3. BASE DE DONNÉES DES PROJETS
// ==========================================
const PROJECT_DATA = {
    synapse: {
        title: "SYNAPSE // FININT_CONSOLE",
        desc: "Visualisation temps-réel des flux blockchain Ethereum. Analyse chromatique des comportements (Whales, Flashloans) et tracking d'adresses sanctionnées.",
        link: "https://synapse-lime-pi.vercel.app", 
        color: "#00e5ff"
    },
    tarmak: {
        title: "TARMAK // GLOBAL_SURVEILLANCE",
        desc: "Système de fusion de données multi-sources. Tracking orbital, trafic aérien et monitoring géopolitique sur interface cartographique haute densité.",
        link: "https://tarmak.vercel.app", 
        color: "#ffaa00"
    }
};

// ==========================================
// 4. MOTEUR DE TRANSITION ET ÉTATS
// ==========================================
let currentProject = 'home';
const infoOverlay = document.getElementById('project-info');
const titleEl = document.querySelector('#project-title');
const descEl = document.querySelector('#project-desc');
const linkEl = document.querySelector('#project-link');

function switchProject(id) {
    if (id === currentProject) return;

    document.querySelectorAll('[data-project]').forEach(el => el.classList.remove('active'));
    const activeLink = document.querySelector(`[data-project="${id}"]`);
    if (activeLink) activeLink.classList.add('active');

    if (infoOverlay) infoOverlay.classList.remove('active');

    if (currentProject === 'home') {
        homeGroup.traverse(obj => { if(obj.material) gsap.to(obj.material, { opacity: 0, duration: 0.5 }); });
        gsap.to(partMat, { opacity: 0, duration: 0.5 });
    } else {
        const currentPlane = currentProject === 'synapse' ? synapsePlane : tarmakPlane;
        if (currentPlane) gsap.to(currentPlane.material, { opacity: 0, duration: 0.5 });
    }

    gsap.to(camera.position, { z: 8, duration: 1.5 }); 

    setTimeout(() => {
        homeGroup.visible = false;
        synapsePlane.visible = false;
        tarmakPlane.visible = false;
        homeParticles.visible = false;

        if (id === 'home') {
            homeGroup.visible = true;
            homeParticles.visible = true;
            homeGroup.traverse(obj => { if(obj.material) gsap.to(obj.material, { opacity: 1, duration: 1.0, delay: 0.4 }); });
            gsap.to(partMat, { opacity: 0.2, duration: 1 });
            canvas.style.filter = 'blur(12px)';
            gsap.to(camera.position, { z: 8, duration: 2.5 });

            triggerTypewriter("What is reality ?");

        } else {
            const targetPlane = id === 'synapse' ? synapsePlane : tarmakPlane;
            const data = PROJECT_DATA[id];

            targetPlane.visible = true;
            gsap.to(targetPlane.material, { opacity: 0.8, duration: 1.0, delay: 0.4 });
            canvas.style.filter = 'blur(0px)';

            titleEl.innerText = data.title;
            titleEl.style.color = data.color;
            descEl.innerText = data.desc;
            linkEl.href = data.link;
            infoOverlay.classList.add('active');

            if (id === 'synapse') gsap.to(camera.position, { z: 5.5, duration: 2 });
            else if (id === 'tarmak') gsap.to(camera.position, { z: 9, duration: 2.5 });
        }
        currentProject = id;
    }, 500); 
}

// ==========================================
// 5. GESTION DES CLICS (MENUS ET PROJETS)
// ==========================================

// --> CLIC SUR LES PROJETS
document.querySelectorAll('[data-project]').forEach(item => {
    item.addEventListener('click', (e) => {
        const projectId = e.currentTarget.dataset.project;
        if (projectId !== 'home' && !PROJECT_DATA[projectId]) {
            console.warn(`[SYSTEM] Standby : La cible ${projectId} n'est pas encore opérationnelle.`);
            return; 
        }
        switchProject(projectId);
    });
});

// --> 🟢 LE FAMEUX CLIC SUR LE MENU CONTACT (qui avait disparu)
const contactToggle = document.getElementById('contact-toggle');
const contactMenu = document.getElementById('contact-menu');

if (contactToggle && contactMenu) {
    contactToggle.addEventListener('click', (e) => {
        e.stopPropagation(); 
        contactMenu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!contactMenu.contains(e.target) && e.target !== contactToggle) {
            contactMenu.classList.remove('active');
        }
    });
}

// ==========================================
// 6. ANIMATION TYPEWRITER (Terminal)
// ==========================================
let typewriterTimeout;

function triggerTypewriter(text) {
    const terminalContainer = document.getElementById('welcome-terminal');
    const textElement = document.getElementById('typewriter-text');
    
    clearTimeout(typewriterTimeout);
    textElement.textContent = '';
    terminalContainer.classList.add('active');

    let i = 0;
    const speed = 70; 

    function typeWriter() {
        if (i < text.length) {
            textElement.textContent += text.charAt(i);
            i++;
            typewriterTimeout = setTimeout(typeWriter, speed);
        } else {
            typewriterTimeout = setTimeout(() => {
                terminalContainer.classList.remove('active');
                
                // Dissipation du brouillard !
                document.querySelector('#webgl-canvas').style.filter = 'blur(0px)';
            }, 1500); 
        }
    }
    typeWriter();
}

// ==========================================
// 7. BOUCLE D'ANIMATION THREE.JS
// ==========================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    homeParticles.rotation.y = elapsedTime * 0.05;

    if (homeGroup.visible) {
        homeGroup.rotation.y = elapsedTime * 0.1; 
        homeGroup.rotation.x = elapsedTime * 0.05;
    }
    if (synapsePlane.visible) {
        synapsePlane.rotation.y = Math.sin(elapsedTime * 0.5) * 0.05; 
    }
    if (tarmakPlane.visible) {
        tarmakPlane.rotation.y = Math.sin(elapsedTime * 0.5) * 0.05; 
    }

    renderer.render(scene, camera);
}
animate();

setTimeout(() => { canvas.style.filter = 'blur(12px)'; }, 100);
setTimeout(() => { canvas.style.filter = 'blur(0px)'; }, 1100);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});