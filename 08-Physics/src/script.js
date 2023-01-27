import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat-gui'
import CANNON from 'cannon';

// Global Variables
//Essentials
var	canvas;
var	scene;
var	floor;
var	ambientLight;
var	directionalLight;
var	renderer;
var	camera;
var	controls;

var requestAnimationFrame_rvg	=	window.requestAnimationFrame		||
							window.webkitRequestAnimationFrame	||
							window.mozRequestAnimationFrame	||
							window.oRequestAnimationFrame		||
							window.msRequestAnimationFrame;

//Normal
var	bFullscreen	=	false;

const cursor = {
	x	:	0,
	y	:	0
};

///////////// PHYSICS /////////////
var	world;
var	objectToUpdate = [];
var	createSphere;
var	createBox;

////////////// dat-gui //////////////
const gui = new dat.GUI();

var	playHitSound;
var	hitSound;

////////////// Textures //////////////
var cubeTextureLoader = new THREE.CubeTextureLoader();

var environmentMapTexture = cubeTextureLoader.load([
	'/textures/environmentMaps/1/px.png',
	'/textures/environmentMaps/1/nx.png',
	'/textures/environmentMaps/1/py.png',
	'/textures/environmentMaps/1/ny.png',
	'/textures/environmentMaps/1/pz.png',
	'/textures/environmentMaps/1/nz.png'
]);

var	clock	=	new THREE.Clock();
let	oldElapsedTime	=	0;

var	canvasOriginalWidth;
var	canvasOriginalHeight;

main();

function main()
{
	// Code
	canvas = document.getElementById("RVG");

	if(!canvas)
	{
		console.log("Obtaining Canvas Failed!");
	}
	else
	{
		console.log("Canvas obtained Successfully!");
	}

	canvasOriginalWidth		=	canvas.width;
	canvasOriginalHeight	=	canvas.height;

	window.addEventListener("keydown", keyDown, false);
	window.addEventListener("click", mouseDown, false);
	window.addEventListener("resize", resize, false);

	window.addEventListener("mousemove", (event)=>
	{
		cursor.x	=	event.clientX / canvas.width - 0.5;
		cursor.y	=	-(event.clientY / canvas.height - 0.5);
	});

    initialize();

    resize();

    display();
};

function toggleFullscreen()
{
	var fullscreen_element	=	document.fullscreenElement			||
								document.webkitFullscreenElement	||
								document.mozFullScreenElement 	||
								document.msFullscreenElement 		||
								null;

	if (fullscreen_element == null)
	{
		if (canvas.requestFullscreen)
		{
			canvas.requestFullscreen();
		}
		else if (canvas.webkitRequestFullscreen)
		{
			canvas.webkitRequestFullscreen();
		}
		else if (canvas.mozRequestFullScreen)
		{
			canvas.mozRequestFullScreen();
		}
		else if (canvas.msRequestFullscreen)
		{
			canvas.msRequestFullscreen();
		}

		bFullscreen	=	true;
	}
	else
	{
		if (document.exitFullscreen)
		{
			document.exitFullscreen();
		}
		else if (document.webkitExitFullscreen)
		{
			document.webkitExitFullscreen();
		}
		else if (document.mozCancelFullScreen)
		{
			document.mozCancelFullScreen();
		}
		else if (document.msExitFullscreen)
		{
			document.msExitFullscreen();
		}

		bFullscreen	=	false;
	}
};

function keyDown(event)
{
	switch(event.keyCode)
	{
		case 70:	//F or f
			toggleFullscreen();
			break;

		case 27:	//Esc
			uninitialize();
			window.close();
			break;

		default:
			break;
	}
};

function mouseDown()
{
	// Code
};

function initialize()
{
	// Code
	renderer	=	new THREE.WebGLRenderer({	canvas	:	canvas });

	if(!renderer)
	{
		console.log("Obtaining Renderer Failed!");
	}
	else
	{
		console.log("Renderer obtained Successfully!");
	}

	// Create Scene
	scene = new THREE.Scene();

	///////////////// PHYSICS /////////////////
	world			=	new CANNON.World();
	world.broadphase	=	new CANNON.SAPBroadphase(world);
	world.allowSleep	=	true;
	world.gravity.set(0, -9.82, 0);

	// Materials
	const defaultMaterial	=	new CANNON.Material('default');

	const defaultContactMaterial = new CANNON.ContactMaterial(
		defaultMaterial,
		defaultMaterial,
		{
			friction: 0.1,
			restitution: 0.1
		}
	);

	world.addContactMaterial(defaultContactMaterial);
	world.defaultContactMaterial	=	defaultContactMaterial;

	//Floor
	const floorShape	=	new CANNON.Plane();
	const floorBody	=	new CANNON.Body();

	floorBody.mass		=	0;
	floorBody.addShape(floorShape);
	floorBody.quaternion.setFromAxisAngle(
		new CANNON.Vec3(-1, 0, 0),
		Math.PI * 0.5
	);
	world.addBody(floorBody);

	///////////////// FLOOR /////////////////
	floor = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(10, 10),
			new THREE.MeshStandardMaterial({
				color	:	'#777777',
				metalness	:	0.3,
				roughness	:	0.4,
				envMap	:	environmentMapTexture
		})
	);

	floor.receiveShadow	=	true;
	floor.rotation.x	=	-Math.PI * 0.5;
	scene.add(floor);
	
	//Dat-GUI
	const debugObject = {};

	debugObject.createSphere = () =>
	{
		createSphere
		(Math.random() * 0.5,
		{
			x	:	(Math.random() - 0.5) * 3,
			y	:	3,
			z	:	(Math.random() - 0.5) * 3
		});
	};
	gui.add(debugObject, 'createSphere');

	///////////////// SPHERE /////////////////
	const sphereGeometry = new THREE.SphereBufferGeometry(1, 90, 90);
	
	const sphereMaterial = new THREE.MeshStandardMaterial({
		metalness	:	0.3,
		roughness	:	0.4,
		envMap	:	environmentMapTexture
	});

	createSphere = (radius, position) =>
	{
		const mesh	=	new THREE.Mesh(
			sphereGeometry,
			sphereMaterial
		);

		mesh.scale.set(radius, radius, radius);
		mesh.castShadow	=	true;
		mesh.position.copy(position);
		scene.add(mesh);
	
		var shape	=	new CANNON.Sphere(radius);
		var body = new CANNON.Body({
			mass		:	1,
			position	:	new CANNON.Vec3(0, 3, 0),
			shape,
			material: defaultMaterial
		});

		body.position.copy(position);
		world.addBody(body);

		//Save in Object to Update
		objectToUpdate.push({
			mesh	:	mesh,
			body	:	body
		});
	};

	createSphere(0.5,
				{	x	:	0,
					y	:	3,
					z	:	0
				});

	debugObject.createBox = () =>
	{
		createBox(
		Math.random(),
		Math.random(),
		Math.random(),
		{
			x : (Math.random() - 0.5) * 3,
			y : 3,
			z : (Math.random() - 0.5) * 3
		});
	};
	gui.add(debugObject, 'createBox');

	///////////////// CUBE /////////////////
	const boxGeometry	=	new THREE.BoxBufferGeometry(1, 1, 1);
	const boxMaterial	=	new THREE.MeshStandardMaterial({
		metalness	:	0.3,
		roughness	:	0.4,
		envMap: environmentMapTexture
	});
	
	createBox = (width, height, depth, position) =>
	{
		const mesh = new THREE.Mesh(
			boxGeometry,
			boxMaterial
		);

		mesh.scale.set(width, height, depth);
		mesh.castShadow	=	true;
		mesh.position.copy(position);
		scene.add(mesh);
		
		var shape	=	new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5));
		var body	=	new CANNON.Body({
			mass		:	1,
			position	:	new CANNON.Vec3(0, 3, 0),
			shape,
			material: defaultMaterial
		});

		body.position.copy(position);
		body.addEventListener('collide', playHitSound);
		world.addBody(body);
	
		//Save in Object to Update
		objectToUpdate.push({
			mesh	:	mesh,
			body	:	body
		});
	};

	debugObject.reset = () =>
	{
		for (const object of objectToUpdate)
		{
			//Remove
			object.body.removeEventListener('collide', playHitSound)
			world.removeBody(object.body);

			//Remove Mesh
			scene.remove(object.mesh);
		}
	};
	gui.add(debugObject, 'reset');

	///////////////// SOUNDS /////////////////
	hitSound	=	new Audio('/sounds/hit.mp3');

	playHitSound	=	(collision) =>
	{
		const impactStrength = collision.contact.getImpactVelocityAlongNormal();

		if (impactStrength > 1.5)
		{
			hitSound.volume = Math.random()
			hitSound.currentTime = 0
			hitSound.play()	
		};
	};

	///////////////// LIGHTS /////////////////
	ambientLight	=	new THREE.AmbientLight(0xffffff, 0.7);
	scene.add(ambientLight);

	directionalLight	=	new THREE.DirectionalLight(0xffffff, 0.2);
	directionalLight.castShadow			=	true;
	directionalLight.shadow.camera.far		=	15;
	directionalLight.shadow.camera.left	=	-7;
	directionalLight.shadow.camera.top		=	7;
	directionalLight.shadow.camera.right	=	7;
	directionalLight.shadow.camera.bottom	=	-7;
	directionalLight.position.set(5, 5, 5);
	directionalLight.shadow.mapSize.set(1024, 1024);
	scene.add(directionalLight);

	renderer.setClearColor("#000000");
};

function resize()
{
    // Code
    if (bFullscreen == true)
	{
		canvas.width	=	window.innerWidth;
		canvas.height	=	window.innerHeight;
		renderer.setSize(canvas.width, canvas.height);
	}
	else
	{
		canvas.width	=	canvasOriginalWidth;
		canvas.height	=	canvasOriginalHeight;
		renderer.setSize(canvas.width, canvas.height);
	}

	renderer.shadowMap.enabled	=	true;
	renderer.shadowMap.type		=	THREE.PCFSoftShadowMap;

	// Set Camera
	camera	=	new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.01, 1000);
	camera.position.set(-3, 3, 8);

	// Add camera to Scene
	scene.add(camera);

	controls	=	new OrbitControls(camera, canvas);
	controls.enableDamping	=	true;
}

function display()
{
	// Local Variable Declaration
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - oldElapsedTime;
	oldElapsedTime = elapsedTime;

	world.step((1 / 60), deltaTime, 3);

	for (const object of objectToUpdate)
	{
		object.mesh.position.copy(object.body.position);
		object.mesh.quaternion.copy(object.body.quaternion);
	}

	// Code
	// Draw using Renderer
	renderer.render(scene, camera);

	// Animation Display
	controls.update();
	update();
	requestAnimationFrame_rvg(display, canvas);
};

function update()
{
	//Code
};

function uninitialize()
{
	// Code
	camera	=	null;
	renderer	=	null;
	plane	=	null;
	sphere	=	null;
	material	=	null;
	scene	=	null;
	canvas	=	null;
};
