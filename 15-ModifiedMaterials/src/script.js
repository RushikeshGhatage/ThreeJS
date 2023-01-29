import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat-gui'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ShaderLib } from 'three'

// Global Variables
//Essentials
var	canvas;
var	scene;
var	renderer;
var	camera;
var	material;
var	mesh;
var	controls;
var	depthMaterial;
var	mapTexture;
var	normalTexture;
var	customUniforms;

var	requestAnimationFrame_rvg	=	window.requestAnimationFrame	||
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

////////////// dat-gui //////////////
const gui	=	new dat.GUI();
const debugObject	=	{};

////////////// Loaders //////////////
const textureLoader	= new THREE.TextureLoader();
const gltfLoader	= new GLTFLoader();
var	cubeTextureLoader	=	new THREE.CubeTextureLoader();

var	clock	=	new THREE.Clock();
var	canvasOriginalWidth;
var	canvasOriginalHeight;

const updateAllMaterial	=	()	=>
{
	scene.traverse((child) =>
	{
		if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
		{
			child.material.envMapIntensity	=	5;
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
	canvas	=	document.getElementById("RVG");

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
	var	fullscreen_element	=	document.fullscreenElement			||
								document.webkitFullscreenElement	||
								document.mozFullScreenElement		||
								document.msFullscreenElement		||
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
		'/models/LeePerrySmith/LeePerrySmith.glb',
		(gltf)=>
		{
			mesh					=	gltf.scene.children[0];
			mesh.rotation.y		=	Math.PI * 0.5;
			mesh.material			=	material;
			mesh.customDepthMaterial	=	depthMaterial;
			scene.add(mesh);

			updateAllMaterial();
		}
	);

	const plane	=	new THREE.Mesh(
		new THREE.PlaneBufferGeometry(15, 15, 15),
		new THREE.MeshStandardMaterial()
	);

	plane.rotation.y	=	Math.PI;
	plane.position.y	=	-5;
	plane.position.z	=	7;
	scene.add(plane);

	////////////// Environment Map //////////////
	var	environmentMap	=	cubeTextureLoader.load([
		'/textures/environmentMaps/0/px.jpg',
		'/textures/environmentMaps/0/nx.jpg',
		'/textures/environmentMaps/0/py.jpg',
		'/textures/environmentMaps/0/ny.jpg',
		'/textures/environmentMaps/0/pz.jpg',
		'/textures/environmentMaps/0/nz.jpg',
	]);

	environmentMap.encoding	=	THREE.sRGBEncoding;
	scene.background	=	environmentMap;
	scene.environment	=	environmentMap;

	//////////////// Materials ////////////////
	mapTexture		=	textureLoader.load('/models/LeePerrySmith/color.jpg');
	mapTexture.encoding	=	THREE.sRGBEncoding;
	normalTexture		=	textureLoader.load('/models/LeePerrySmith/normal.jpg');

	material	=	new THREE.MeshStandardMaterial({
		map		:	mapTexture,
		normalMap	:	normalTexture
	});

	depthMaterial	=	new THREE.MeshDepthMaterial({
		depthPacking	:	THREE.RGBADepthPacking
	});
	
	customUniforms	=	{
		uTime	:	{	value	:	0	}
	};

	material.onBeforeCompile = (shader) =>
	{
		shader.uniforms.uTime	=	customUniforms.uTime;
		shader.vertexShader		=	shader.vertexShader.replace(
			'#include <common>',
			`
			#include <common>

			uniform float uTime;

			mat2 get2dRotateMatrix(float _angle)
			{
				return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
			}
			`
		);

		shader.vertexShader = shader.vertexShader.replace(
			'#include <beginnormal_vertex>',
			`
			#include <beginnormal_vertex>

			float angle = (sin(position.y + uTime)) * 0.4;
			mat2 rotateMatrix = get2dRotateMatrix(angle);

			objectNormal.xz = objectNormal.xz * rotateMatrix;
			`
		);

		shader.vertexShader = shader.vertexShader.replace(
			'#include <begin_vertex>',
			`
			#include <begin_vertex>

			transformed.xz = rotateMatrix * transformed.xz;
			`
		);
	};

	depthMaterial.onBeforeCompile = (shader) =>
	{
		shader.uniforms.uTime	=	customUniforms.uTime;
		shader.vertexShader		=	shader.vertexShader.replace(
			'#include <common>',
			`
			#include <common>

			uniform float uTime;

			mat2 get2dRotateMatrix(float _angle)
			{
				return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
			}
			`
		);

		shader.vertexShader = shader.vertexShader.replace(
			'#include <begin_vertex>',
			`
			#include <begin_vertex>

			float angle = (sin(position.y + uTime)) * 0.4;
			mat2 rotateMatrix = get2dRotateMatrix(angle);

			transformed.xz = rotateMatrix * transformed.xz;
			`
		);
	};

	//////////////// Lights ////////////////
	var	directionalLight	=	new THREE.DirectionalLight('#ffffff', 3);
	directionalLight.castShadow		=	true;
	directionalLight.shadow.camera.far	=	15;
	directionalLight.shadow.normalBias	=	0.05;
	directionalLight.shadow.mapSize.set(1024, 1024);
	directionalLight.position.set(0.25, 2, - 2.25);
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
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	}
	else
	{
		canvas.width	=	canvasOriginalWidth;
		canvas.height	=	canvasOriginalHeight;
		renderer.setSize(canvas.width, canvas.height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	}

	renderer.shadowMap.enabled		=	true;
	renderer.shadowMap.type			=	THREE.PCFSoftShadowMap;
	renderer.physicallyCorrectLights	=	true;
	renderer.outputEncoding			=	THREE.sRGBEncoding;
	renderer.toneMapping			=	THREE.CineonToneMapping;
	renderer.shadowMap.type			=	THREE.PCFSoftShadowMap;
	renderer.toneMappingExposure 		=	3;

	// Set Camera
	camera	=	new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.01, 1000);
	camera.position.set(4, 1, -15);
	
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
	customUniforms.uTime.value	=	elapsedTime;

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
