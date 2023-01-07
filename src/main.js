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
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
  var scene = new THREE.Scene();

  window.addEventListener('resize', debounce(function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, 10), false);

  scene.background = new THREE.Color("rgb(10, 27, 45)");

  scene.add(camera);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  camera.position.z = 200;

  lights().forEach(L => camera.add(L));

  const group = new THREE.Group();

  var geometry = new THREE.IcosahedronGeometry(90, 5);

  const position = geometry.attributes.position;
  const vector = new THREE.Vector3();

  var original_vectors = []

  for (let i = 0, l = position.count; i < l; i++) {
    vector.fromBufferAttribute(position, i);
    const { x, y, z } = vector;
    original_vectors.push({ x, y, z });
  }

  const scale_range = [0.15, 0.3];
  const speed_range = [1, 2];
  var angle = { x: 0.5, y: 0.5 };

  var scale = scale_range[0];
  var speed = speed_range[0];

  var mouseDown = 0;

  document.body.onmousedown = function () {
    ++mouseDown;
  }
  document.body.onmouseup = function () {
    --mouseDown;
  }

  function updateBlob(a) {
    for (let i = 0, l = position.count; i < l; i++) {
      var { x, y, z } = original_vectors[i]
      var perlin = noise.simplex3(
        (x * 0.01) + (a * 0.0003),
        (y * 0.01) + (a * 0.0003),
        (z * 0.01)
      );

      const local_scale = mouseDown ? scale * 1.25 : scale

      var ratio = (perlin * local_scale) + 1
      const newVector = new THREE.Vector3(x, y, z)
      newVector.multiplyScalar(ratio);

      var { x, y, z } = newVector;

      position.setXYZ(i, x, y, z);
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
  }

  const lineMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color("rgba(135, 117, 0, .5)"),
    wireframe: true
  });

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

  document.addEventListener('mousemove', throttle(function (event) {
    const mouse = {
      x: event.pageX,
      y: event.pageY
    };

    const size = {
      x: renderer.domElement.width,
      y: renderer.domElement.height
    }

    const offset = {
      x: size.x / 2 - mouse.x - renderer.domElement.offsetLeft,
      y: size.y / 2 - mouse.y - renderer.domElement.offsetTop
    };

    angle = {
      x: Math.abs(offset.x) / (Math.abs(offset.x) + Math.abs(offset.y)),
      y: Math.abs(offset.y) / (Math.abs(offset.x) + Math.abs(offset.y))
    };

    console.log(angle);

    const length = (x, y) => Math.sqrt(x ** 2 + y ** 2)

    const dist = length(offset.x, offset.y);

    const perc = Math.min(dist / 800, 1);

    scale = scale_range[0] * perc + scale_range[1] * (1 - perc);
    speed = speed_range[0] * perc + speed_range[1] * (1 - perc);
  }, 20));

  var time = 0

  function animate(frames, delta, now) {
    const local_speed = mouseDown ? speed * 4 : speed;

    group.rotation.x += local_speed * delta * .00006;
    group.rotation.y += local_speed * delta * .00008;
    group.rotation.z += local_speed * delta * .00003;

    time += delta * local_speed;

    updateBlob(time);
    renderer.render(scene, camera);
  };

  new Clock(animate, 120).start();
}

app()