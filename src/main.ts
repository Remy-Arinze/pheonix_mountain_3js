import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'lil-gui'
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { gsap } from 'gsap'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('.canvas') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene()

let mixer: THREE.AnimationMixer | null = null;
let mixer2: THREE.AnimationMixer | null = null;
let mixer3: THREE.AnimationMixer | null = null;

let model;
let model2;
let model3;
const gtlfLoader = new GLTFLoader()
gtlfLoader.load('/models/phoenix_bird/scene.gltf', (gltf) => {

  model = gltf.scene;
  model2 = SkeletonUtils.clone(model)
  model3 = SkeletonUtils.clone(model)

  scene.add(model)
  scene.add(model2)
  scene.add(model3)

  model.scale.set(0.01, 0.01, 0.01)
  model2.scale.set(0.01, 0.01, 0.01)
  model3.scale.set(0.01, 0.01, 0.01)

  const clip = THREE.AnimationClip.findByName(gltf.animations, 'Take 001')

  model.position.set(-16, 8, -4)
  model2.position.set(-17, 9, 3)
  model3.position.set(-19, 8, -9)

  model.traverse((child) => {

    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      child.castShadow = true
      child.receiveShadow = true
    }

  })

  mixer = new THREE.AnimationMixer(model)
  mixer2 = new THREE.AnimationMixer(model2)
  mixer3 = new THREE.AnimationMixer(model3)

  const action = mixer.clipAction(clip)
  const action2 = mixer2.clipAction(clip)
  const action3 = mixer3.clipAction(clip)

  action.play()
  action.timeScale = 0.5
  action2.play()
  action2.startAt(0.2)
  action2.timeScale = 0.5
  action3.play()
  action3.startAt(0.35)
  action3.timeScale = 0.5

})

gtlfLoader.load('/models/rhino_animation_walk/scene.gltf', (gltf) => {
  console.log(gltf)
})

const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load('/models/snow mountain.jpg ')
const redTexture = textureLoader.load('/models/red moutain.jpg ')
const treesTexture = textureLoader.load('/models/forest tress.jpg ')
const displacementMap = textureLoader.load('/models/mountainDispMap.jpeg')
const alphaMap = textureLoader.load('/models/mountainAlpha.jpg')

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(150, 150, 50, 50),
  new THREE.MeshStandardMaterial({
    map: redTexture,
    displacementMap: displacementMap,
    displacementScale: 20,
    alphaMap: alphaMap
  })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
floor.position.y = -5
scene.add(floor)

/**
 * Lights
 */

const light = {
  color: '0xff0000'
}
const ambientLight = new THREE.AmbientLight(light.color, 0.3)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(812, 812)
directionalLight.shadow.camera.far = 50
directionalLight.shadow.camera.near = 10
directionalLight.shadow.camera.left = 50
directionalLight.shadow.camera.top = 20
directionalLight.shadow.camera.right = 1
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(20, 20, -25)
scene.add(directionalLight)



gui.add(floor.material, 'displacementScale').min(5).max(20).step(0.001)
gui.add(directionalLight.position, 'x').min(0.5).max(10).step(0.001)
gui.add(directionalLight, 'intensity').min(0.5).max(2).step(0.001)
gui.add(directionalLight.position, 'y').min(0.5).max(10).step(0.001)
gui.add(directionalLight.position, 'z').min(0.5).max(10).step(0.001)
gui.addColor(light, 'color').onChange(() => {
  floor.material.color.set(light.color)
})
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 2, 70)
camera.lookAt(floor.position)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true



const tl = gsap.timeline(
)

tl.to(camera.position, {
  x: -20,
  y: 50,

  duration: 3
}, 2)

tl.to(camera.position, {
  z: -20,
  y: 50,
  duration: 5
}, 2)

tl.to(camera.position, {
  y: 13,
  x: 15,
  duration: 5
}, 10)

tl.to(camera.position, {
  z: -25,
  x: -40,
  duration: 5
}, 15)

tl.to(camera.position, {
  z: -20,
  duration: 5
}, 20)


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))





/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime



  // Update controls
  controls.update()
  if (mixer !== null && mixer2 !== null && mixer3 !== null) {

    mixer.update(deltaTime)
    mixer2.update(deltaTime)
    mixer3.update(deltaTime)



  }

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()