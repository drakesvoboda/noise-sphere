import './style.css'
import Clock from './clock';
import { throttle, debounce } from './throttle';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import * as THREE from 'three';
import noise from "./noise";
import { CameraControls } from "./controls";

function lights() {
  const L1 = new THREE.PointLight(0xffffff, 0.6);
  L1.position.z = 100;
  L1.position.y = 100;
  L1.position.x = 100;

  const L2 = new THREE.PointLight(0xffffff, 0.4);
  L2.position.z = 200;
  L2.position.y = 50;
  L2.position.x = -100;

  return [L1, L2]
}

function app() {
  var renderer = new THREE.WebGLRenderer({ antialias: true });
  var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
  var scene = new THREE.Scene();

  scene.background = new THREE.Color("rgb(10, 27, 45)");

  scene.add(camera);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.z = 200;

  lights().forEach(L => camera.add(L))

  const group = new THREE.Group();

  var geometry = new THREE.IcosahedronGeometry(75, 10);

  const position = geometry.attributes.position;
  const vector = new THREE.Vector3();

  var original_vectors = []

  for (let i = 0, l = position.count; i < l; i++) {
    vector.fromBufferAttribute(position, i);
    const { x, y, z } = vector;
    original_vectors.push({ x, y, z });
  }

  function updateBlob(a) {
    for (let i = 0, l = position.count; i < l; i++) {
      var { x, y, z } = original_vectors[i]
      var perlin = noise.simplex3(
        (x * 0.01) + (a * 0.0001),
        (y * 0.01) + (a * 0.0001),
        (z * 0.01)
      );

      var ratio = ((perlin * 0.4) + 1);
      const newVector = new THREE.Vector3(x, y, z)
      newVector.multiplyScalar(ratio);

      var { x, y, z } = newVector;

      position.setXYZ(i, x, y, z);
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
  }

  const lineMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color("rgba(135, 117, 0, .5)"), wireframe: true });

  const meshMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color("rgb(226, 124, 35)"),
    emissive: new THREE.Color("rgb(219, 182, 20)"),
    specular: new THREE.Color("rgb(255,155,255)"),
    polygonOffset: true,
    polygonOffsetFactor: 10,
    side: THREE.DoubleSide,
    flatShading: true,
    shininess: 5
  });

  group.add(new THREE.LineSegments(geometry, lineMaterial));
  group.add(new THREE.Mesh(geometry, meshMaterial));

  scene.add(group);

  const controls = new TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 5.0;
  controls.noPan = false;
  controls.noZoom = false;

  function animate(frames, delta, now) {
    controls.update()
    //group.rotation.x += 0.00015 * delta;
    //group.rotation.y += 0.0002 * delta;
    //group.rotation.z += 0.0001 * delta;
    updateBlob(now);
    renderer.render(scene, camera);
  }

  new Clock(animate, 120).start();
}

app()