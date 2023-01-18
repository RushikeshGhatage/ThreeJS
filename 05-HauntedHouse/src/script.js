import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { DoubleSide } from 'three';
import * as dat from 'dat-gui';

// Global Variables
//Essentials
var	canvas;
var	scene;
var	material;
var	plane;
var	renderer;
var	camera;

var requestAnimationFrame_rvg = window.requestAnimationFrame		||
							window.webkitRequestAnimationFrame	||
							window.mozRequestAnimationFrame	||
							window.oRequestAnimationFrame		||
							window.msRequestAnimationFrame;

//Normal
var bFullscreen	=	false;

const cursor = {
	x	:	0,
	y	:	0
};


////////////// dat-gui //////////////
const gui	=	new dat.GUI();

////////////// Texture //////////////
const textureLoader	=	new THREE.TextureLoader();

const doorColorTexture		=	textureLoader.load('/textures/door/color.jpg');
const doorAlphaTexture		=	textureLoader.load('/textures/door/alpha.jpg');
const doorHeightTexture		=	textureLoader.load('/textures/door/height.jpg');
const doorNormalTexture		=	textureLoader.load('/textures/door/normal.jpg');
const doorMetalnessTexture	=	textureLoader.load('/textures/door/metalness.jpg');
const doorRoughnessTexture	=	textureLoader.load('/textures/door/roughness.jpg');
const doorAmbientOcclusionTexture	=	textureLoader.load('/textures/door/ambientOcclusion.jpg');

const bricksColorTexture		=	textureLoader.load('/textures/bricks/color.jpg');
const bricksNormalTexture	=	textureLoader.load('/textures/bricks/normal.jpg');
const bricksRoughnessTexture	=	textureLoader.load('/textures/bricks/roughness.jpg');
const bricksAmbientOcclusionTexture	=	textureLoader.load('/textures/bricks/ambientOcclusion.jpg');

const grassColorTexture			=	textureLoader.load('/textures/grass/color.jpg');
const grassAmbientOcclusionTexture	=	textureLoader.load('/textures/grass/ambientOcclusion.jpg');
const grassNormalTexture			=	textureLoader.load('/textures/grass/normal.jpg');
const grassRoughnessTexture 		=	textureLoader.load('/textures/grass/roughness.jpg');

grassColorTexture.repeat.set(8, 8);
grassAmbientOcclusionTexture.repeat.set(8, 8);
grassNormalTexture.repeat.set(8, 8);
grassRoughnessTexture.repeat.set(8, 8);

grassColorTexture.wrapS			=	THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapS	=	THREE.RepeatWrapping;
grassNormalTexture.wrapS			=	THREE.RepeatWrapping;
grassRoughnessTexture.wrapS		=	THREE.RepeatWrapping;

grassColorTexture.wrapT			=	THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapT	=	THREE.RepeatWrapping;
grassNormalTexture.wrapT			=	THREE.RepeatWrapping;
grassRoughnessTexture.wrapT		=	THREE.RepeatWrapping;

////////////// Lights //////////////
var ambientLight;
var moonLight;

////////////// Objects //////////////
var walls;
var house;
var roof;
var door;
var bushGeometry;
var bushMaterial;
var barkGeometry;
var barkMaterial;
var graveGeometry;
var graveMaterial;

var controls;

var bush1;
var bush2;
var bark1;
var bark2;

var ghost1;
var ghost2;
var ghost3;
var doorLight;

var clock = new THREE.Clock();
var canvasOriginalWidth;
var canvasOriginalHeight;

main()

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
	var fullscreen_element = document.fullscreenElement				||
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

		bFullscreen = true;
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

		bFullscreen =  false;
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
	renderer = new THREE.WebGLRenderer({ canvas	:	canvas });

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

	var fog	=	new THREE.Fog('#262837', 1, 50);
	scene.fog	=	fog;

	// Create Mesh
	material	=	new THREE.MeshStandardMaterial();
	material.side = DoubleSide;

	plane = new THREE.Mesh(
		new THREE.PlaneBufferGeometry(100, 100),
		new THREE.MeshStandardMaterial({ 
			map			:	grassColorTexture,
			aoMap		:	grassAmbientOcclusionTexture,
			normalMap		:	grassNormalTexture,
			roughnessMap	:	grassNormalTexture
		})
	);

	plane.geometry.setAttribute(
		'uv2',
		new THREE.Float32BufferAttribute(plane.geometry.attributes.uv.array, 2)
	);

	scene.add(plane);

	///////////// House /////////////
	house	=	new THREE.Group;
	scene.add(house);

	///////////// Walls /////////////
	walls	=	new THREE.Mesh(
		new THREE.BoxBufferGeometry(4, 2.5, 4),
		new THREE.MeshStandardMaterial({
			map			:	bricksColorTexture,
			aoMap		:	bricksAmbientOcclusionTexture,
			normalMap		:	bricksNormalTexture,
			roughnessMap	:	bricksRoughnessTexture
		})
	);

	walls.geometry.setAttribute(
		'uv2',
		new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
	);

	walls.position.y	=	0.5;
	house.add(walls);

	///////////// Roof /////////////
	roof = new THREE.Mesh(
		new THREE.ConeBufferGeometry(3.5, 2.5, 4),
		new THREE.MeshStandardMaterial({color: '#6D4C41'})
	);

	roof.rotation.y	=	Math.PI * 0.25;
	roof.position.y	=	2.52;
	house.add(roof);

	///////////// Door /////////////
	door	=	new THREE.Mesh(
		new THREE.PlaneBufferGeometry(2, 2, 100, 100),
		new THREE.MeshStandardMaterial({
			map				:	doorColorTexture,
			transparent		:	true,
			alphaMap			:	doorAlphaTexture,
			aoMap			:	doorAmbientOcclusionTexture,
			displacementMap	:	doorHeightTexture,
			displacementScale	:	0.1,
			normalMap			:	doorNormalTexture,
			metalnessMap		:	doorMetalnessTexture,
			roughnessMap		:	doorRoughnessTexture
		})
	);

	door.geometry.setAttribute(
		'uv2',
		new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
	);

	door.position.z	=	2.01;
	house.add(door);

	///////////// Bushes /////////////
	bushGeometry	=	new THREE.SphereBufferGeometry(0.5, 16,16);
	bushMaterial	=	new THREE.MeshStandardMaterial({color	:	'#89c854'});

	bush1	=	new THREE.Mesh(bushGeometry, bushMaterial);
	bush1.position.x	=	1.5;
	bush1.position.y	=	1.5;
	bush1.position.z	=	3;
	bush1.scale.y		=	3;

	bush2	=	new THREE.Mesh(bushGeometry, bushMaterial);
	bush2.position.x	=	-1.5;
	bush2.position.y	=	1.5;
	bush2.position.z	=	3;
	bush2.scale.y		=	3;
	house.add(bush1, bush2);

	///////////// Bark /////////////
	barkGeometry	=	new THREE.CylinderGeometry(0.1,0.1, 2, 10);
	barkMaterial	=	new THREE.MeshStandardMaterial({color	:	'#6D4C41'});
	
	bark1	=	new THREE.Mesh(barkGeometry, barkMaterial);
	bark1.height		=	0.2;
	bark1.position.x	=	1.5;
	bark1.position.y	=	0.2;
	bark1.position.z	=	3;

	bark2	=	new THREE.Mesh(barkGeometry, barkMaterial);
	bark2.height		=	0.2;
	bark2.position.x	=	-1.5;
	bark2.position.y	=	0.2;
	bark2.position.z	=	3;
	house.add(bark1, bark2);

	///////////// Grave /////////////
	var graves	=	new THREE.Group();
	scene.add(graves);

	graveGeometry	=	new THREE.BoxBufferGeometry(0.6, 0.8, 0.2);
	graveMaterial	=	new THREE.MeshStandardMaterial({color: '#b2b6b1'});

	for (let i = 0; i < 300; i++)
	{
		const angle	=	Math.random() * Math.PI * 2;
		const radius	=	5 + Math.random() * 50;
		const x		=	Math.sin(angle) * radius;
		const z		=	Math.cos(angle) * radius;

		const grave	=	new THREE.Mesh(graveGeometry, graveMaterial);
		grave.position.set(x, -0.3, z);
		grave.rotation.y	=	Math.random() - 0.5;
		grave.rotation.z	=	Math.random() - 0.5;
		grave.castShadow = true;
		graves.add(grave);
	};

	/////////// Lights ///////////
	//Ambient Light
	ambientLight	=	new THREE.AmbientLight(0xb9d5ff, 0.12);
	gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001);
	scene.add(ambientLight);

	//Directional Light
	moonLight	=	new THREE.DirectionalLight(0xffffff, 0.12);
	moonLight.position.set(4, 5, -2);
	scene.add(moonLight);

	gui.add(moonLight, 'intensity').min(0).max(1).step(0.001);
	gui.add(moonLight.position, 'x').min(- 5).max(5).step(0.001);
	gui.add(moonLight.position, 'y').min(- 5).max(5).step(0.001);
	gui.add(moonLight.position, 'z').min(- 5).max(5).step(0.001);
	scene.add(moonLight);

	//Door Light
	doorLight	=	new THREE.PointLight('#ff7d46', 1, 7);
	doorLight.position.set(0, 2.2, 2.7);

	house.add(doorLight);

	//Gosts
	ghost1	=	new THREE.PointLight('#ff00ff', 7, 5);
	ghost1.position.z	=	10;
	scene.add(ghost1);

	ghost2	=	new THREE.PointLight('#00ffff', 7, 5);
	scene.add(ghost2);

	ghost3	=	new THREE.PointLight('#ffff00', 7, 5);
	scene.add(ghost3);

	renderer.setClearColor("#262838");

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
	
	renderer.shadowMap.enabled = true;
	
	moonLight.castShadow	=	true;
	doorLight.castShadow	=	true;
	ghost1.castShadow		=	true;
	ghost2.castShadow		=	true;
	ghost3.castShadow		=	true;

	walls.castShadow	=	true;
	bush1.castShadow	=	true;
	bush2.castShadow	=	true;
	bark1.castShadow	=	true;
	bark2.castShadow	=	true;

	plane.receiveShadow	=	true;

	// Set Camera
	camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.01, 1000);
	camera.position.x	=	5.0;
	camera.position.y	=	5.0;
	camera.position.z	=	10.0;
	
	// Add camera to Scene
	scene.add(camera);

	controls = new OrbitControls(camera, canvas);
	controls.enableDamping	=	true;
	controls.rotateSpeed	=	0.75;
};

function display()
{
	// Local Variable Declaration
	const elapsedTime = clock.getElapsedTime();

    // Code
	plane.rotation.x	=	-Math.PI * 0.5;
	plane.position.y	=	-0.65;

	const ghost1Angle	=	elapsedTime;
	ghost1.position.x	=	10 * Math.cos(ghost1Angle);
	ghost1.position.z	=	10 * Math.sin(ghost1Angle);
	ghost1.position.y	=	Math.cos(ghost1Angle * 3);

	const ghost2Angle	=	-elapsedTime;
	ghost2.position.x	=	15 * Math.cos(ghost2Angle);
	ghost2.position.z	=	15 * Math.sin(ghost2Angle);
	ghost2.position.y	=	Math.cos(ghost2Angle * 3);

	const ghost3Angle	=	-elapsedTime * 0.5;
	ghost3.position.x	=	18 * Math.cos(ghost3Angle);
	ghost3.position.z	=	18 * Math.sin(ghost3Angle);
	ghost3.position.y	=	Math.cos(ghost3Angle * 3);

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
    material	=	null;
    scene		=	null;
    canvas	=	null;    
};
