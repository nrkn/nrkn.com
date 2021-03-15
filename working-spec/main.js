var camera, scene, renderer;
var geometry, group;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var xspeed = 0.2
var yspeed = 0.1
var zspeed = 0.075
var cubeCount = 150
init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 500;
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xffffff );
  scene.fog = new THREE.Fog( 0xffffff, 1, 10000 );
  var geometry = new THREE.BoxBufferGeometry( 100, 100, 100 );
  var material = new THREE.MeshNormalMaterial();
  group = new THREE.Group();
  for ( var i = 0; i < cubeCount; i++ ) {
    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.x = Math.random() * 2000 - 1000;
    mesh.position.y = Math.random() * 2000 - 1000;
    mesh.position.z = Math.random() * 2000 - 1000;
    mesh.rotation.x = Math.random() * 2 * Math.PI;
    mesh.rotation.y = Math.random() * 2 * Math.PI;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    group.add( mesh );
  }
  scene.add( group );
  //
  renderer = new THREE.WebGLRenderer( { antialias: false } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  //
  window.addEventListener( 'resize', onWindowResize, false );
}
function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
//
function animate() {
  requestAnimationFrame( animate );
  render();
}
function render() {

  var time = Date.now() * 0.001;
  var rx = Math.sin( time * xspeed ) * 0.5,
    ry = Math.sin( time * yspeed ) * 0.5,
    rz = Math.sin( time * zspeed ) * 0.5;
  camera.position.x += ( mouseX - camera.position.x ) * 0.05;
  camera.position.y += ( - mouseY - camera.position.y ) * 0.05;
  camera.lookAt( scene.position );
  group.rotation.x = rx;
  group.rotation.y = ry;
  group.rotation.z = rz;
  renderer.render( scene, camera );
}