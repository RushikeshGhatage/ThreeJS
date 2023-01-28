import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat-gui'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

// Global Variables
//Essentials
var	canvas;
var	scene;
var	renderer;
var	camera;
var	controls;

var	requestAnimationFrame_rvg	=	window.requestAnimationFrame		||
								window.webkitRequestAnimationFrame	||
								window.mozRequestAnimationFrame	||
								window.oRequestAnimationFrame		||
								window.msRequestAnimationFrame;

//Normal
var	bFullscreen = false;

const cursor = {
	x	:	0,
	y	:	0	
}

////////////// dat-gui //////////////
const gui	=	new dat.GUI();
const debugObject	=	{};

////////////// Loaders //////////////
var	cubeTextureLoader	=	new THREE.CubeTextureLoader();
var	gltfLoader		=	new GLTFLoader();

var	clock	=	new THREE.Clock();
var	canvasOriginalWidth;
var	canvasOriginalHeight;

const updateAllMaterial = () =>
{
	scene.traverse((child) =>
	{
		if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial);
		{
			child.material.envMapIntensity	=	debugObject.envMapIntensity;
			child.material.needsUpdate		=	true;
			child.castShadow				=	true;
			child.receiveShadow				=	true;
		}
	});
};

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
	var	fullscreen_element	=	document.fullscreenElement		||
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
	renderer = new THREE.WebGLRenderer({ 
		canvas	:	canvas,
		antialias	:	true
	});

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

	////////////// Model //////////////
	gltfLoader.load(
		'/models/FlightHelmet/glTF/FlightHelmet.gltf',
		(gltf)=>
		{
			gltf.scene.scale.set(10,10,10);
			gltf.scene.position.set(0,-4,0);
			gltf.scene.rotation.y	=	Math.PI * 0.5;
			scene.add(gltf.scene);

			gui
			.add(gltf.scene.rotation, 'y')
			.min(-Math.PI)
			.max(Math.PI)
			.step(0.001)
			.name('Rotation');

			updateAllMaterial();
		}
	);

	////////////// Environment Map //////////////
	var environmentMap = cubeTextureLoader.load([
		'/textures/environmentMaps/0/px.jpg',
		'/textures/environmentMaps/0/nx.jpg',
		'/textures/environmentMaps/0/py.jpg',
		'/textures/environmentMaps/0/ny.jpg',
		'/textures/environmentMaps/0/pz.jpg',
		'/textures/environmentMaps/0/nz.jpg',
	]);

	environmentMap.encoding	=	THREE.sRGBEncoding;
	scene.background		=	environmentMap;
	scene.environment		=	environmentMap;

	debugObject.envMapIntensity = 5;
	gui
	.add(debugObject, 'envMapIntensity')
	.min(0)
	.max(10)
	.step(0.001)
	.onChange(updateAllMaterial);

	//////////////// Lights ////////////////
	var directionalLight	=	new THREE.DirectionalLight('#ffffff', 1);
	directionalLight.intensity		=	5;
	directionalLight.castShadow		=	true;
	directionalLight.shadow.camera.far	=	50;
	directionalLight.shadow.mapSize.set(1024, 1024)
	directionalLight.position.set(0.25, 3, -2.25)
	scene.add(directionalLight);

	gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('Light Intensity');
	gui.add(directionalLight.position, 'x').min(-5).max(5).step(0.001).name('Light X');
	gui.add(directionalLight.position, 'y').min(-5).max(5).step(0.001).name('Light Y');
	gui.add(directionalLight.position, 'z').min(-5).max(5).step(0.001).name('Light Z');

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

	renderer.physicallyCorrectLights	=	true;
	renderer.outputEncoding			=	THREE.sRGBEncoding;
	renderer.toneMapping			=	THREE.CineonToneMapping;
	renderer.toneMappingExposure 		=	3;
	renderer.shadowMap.enabled		=	true;
	renderer.shadowMap.type			=	THREE.PCFSoftShadowMap;

	gui
	.add(renderer, 'toneMapping', {
		No: THREE.NoToneMapping,
		Linear: THREE.LinearToneMapping,
		Reinhard: THREE.ReinhardToneMapping,
		Cineon: THREE.CineonToneMapping,
		ACESFilmic: THREE.ACESFilmicToneMapping
	})
	.onFinishChange(() =>
	{
		renderer.toneMapping = Number(renderer.toneMapping)
		updateAllMaterial()
	});

	gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(1);

	// Set Camera
	camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.01, 1000);
	camera.position.set(4, 1, -4);
	
	// Add camera to Scene
	scene.add(camera);

	controls	=	new OrbitControls(camera, canvas);
	controls.enableDamping	=	true;
};

function display()
{
	// Local Variable Declaration
	const elapsedTime	=	clock.getElapsedTime();

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
	scene	=	null;
	canvas	=	null;
};
 