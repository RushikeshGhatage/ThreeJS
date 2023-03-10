import React, { Component } from 'react';
import * as THREE from "three";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

////////////// GLTF //////////////
const dracoLoader	=	new DRACOLoader();
const gltfLoader	=	new GLTFLoader();

class CanvasHome extends Component {
	//Local variable declaration

	//Code
	constructor(props) {
		super(props);
		this.scene		=	null;
		this.camera		=	null;
		this.renderer		=	null;
		this.light		=	null;
		this.orbitControls	=	null;
		this.time			=	null;
		this.frameId		=	null;

		//Variables
		this.wheels			=	[];
		this.bodyMaterial		=	null;
		this.roofMaterial		=	null;
		this.interiorMaterial	=	null;
		this.detailsMaterial	=	null;
		this.glassMaterial		=	null;
		this.shadow		=	null;

		this.grid			=	null;
		this.model		=	null;
		this.raycaster		=	null;
		this.pointer		=	null;
		this.WNDSIZE		=	{ width	:	0, height	:	0};

		this.state	=	{
			bodyColor		:	"#061504",
			roofColor		:	"#5C615C",
			interiorColor	:	"#723C18",
			detailsColor	:	"#020302",
			glassColor 	:	"#ffffff"
		};
	};

	componentDidMount() {
		//Local variable declaration

		//Code
		//Initialize App
		console.clear();
		this.initialize();
	};

	componentDidUpdate() {
		//Local variable declaration

		//Code
		//Resize
		window.addEventListener("resize", this.resizeWindow, false)
	}

	componentWillUnmount() {
		//Local variable declaration

		//Code
		//Stop render loop
		this.stop();
	};

	//Initialize App
	initialize = () => {
		//Local variable declaration
		
		//Code
		//Setup Scene
		this.scene = new THREE.Scene();
		this.scene.environment			=	new RGBELoader().load( './static/venice_sunset_1k.hdr' );
		this.scene.environment.mapping	=	THREE.EquirectangularReflectionMapping;
		this.scene.fog					=	new THREE.Fog( 0x333333, 10, 15 );

		this.WNDSIZE.width	=	this.mount.clientWidth;
		this.WNDSIZE.height	=	this.mount.clientHeight;

		//Setup Renderer
		this.renderer	=	new THREE.WebGLRenderer({
			antialias				:	true,
			alpha				:	true,
			preserveDrawingBuffer	:	true
		});

		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.WNDSIZE.width, this.WNDSIZE.height);
		this.renderer.outputEncoding		=	THREE.sRGBEncoding;
		this.renderer.toneMapping		=	THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure	=	0.85;
		this.mount.appendChild(this.renderer.domElement);

		//Setting up camera
		this.setupCamera();

		//Load Model
		this.loadModel();

		//Setting up light
		this.setupLights();
		
		//Setting up raycaster
		this.setupRaycaster();

		//Draw Geomtries
		this.draw();

		//Draw scene
		this.renderScene();

		//Start Animation
		this.start();

		//Accepts keyboard input
		window.addEventListener('keydown', this.keyDown, false);

		//Handle Resize
		window.addEventListener('click', this.onPointerMove);

		//Warm-up resize call
		window.addEventListener("resize", this.resizeWindow, false);

		//Clear color
		this.renderer.setClearColor(0x333333);
	};
	
	//Accepts keyboard input
	keyDown = (event) =>
	{
		//Local variable declaration

		//Code
		switch(event.keyCode)
		{
			case 70:	//F or f
				break;

			case 72:	//H or h
				break;

			default:
				break;
		}
	};
	
	//Setting up camera
	setupCamera = () => {
		//Local variable declaration

		//Code
		//Setup Camera
		this.camera		=	new THREE.PerspectiveCamera(40 , (this.WNDSIZE.width/this.WNDSIZE.height), 0.1, 1000);
		this.camera.position.set(4.25, 1.4, -4.5);

		//Orbit Control
		this.orbitControls	=	new OrbitControls(this.camera, this.renderer.domElement);
		this.orbitControls.enableDamping	=	true;
		this.orbitControls.minDistance	=	4;
		this.orbitControls.maxDistance	=	9;
		this.orbitControls.target.set(0, 0.5, 0);
	};

	//Load Model
	loadModel = () => {
		//Local variable declaration

		//Code
		this.bodyMaterial		=	new 	THREE.MeshStandardMaterial({
			color	:	0x061504,
			metalness	:	0.75,
			roughness	:	0.1
		});

		this.roofMaterial		=	new 	THREE.MeshStandardMaterial({
			color	:	0x5C615C,
			metalness	:	0.0,
			roughness	:	1.0
		});

		this.interiorMaterial	=	new 	THREE.MeshStandardMaterial({
			color	:	0x723C18,
			metalness	:	0.2,
			roughness	:	0.75
		});

		this.detailsMaterial	=	new THREE.MeshStandardMaterial({
			color	:	0x020302,
			metalness	:	0.1,
			roughness	:	0.75,
		});

		this.glassMaterial	=	new THREE.MeshPhysicalMaterial({
			color		:	0xffffff,
			metalness		:	0.2,
			roughness		:	0.1,
			transmission	:	1.0,
			transparent	:	1.0
		});

		//Shadow
		this.shadow	=	new THREE.TextureLoader().load( './static/ferrari_ao.png' );

		dracoLoader.setDecoderPath('./draco/');
		gltfLoader.setDRACOLoader(dracoLoader);
		
		// GLTF LOADER
		this.model = gltfLoader.load(
			'./static/vintage_car.glb',
			(gltf) => {
				const carModel	=	gltf.scene.children[ 0 ];

				//Body Material
				carModel.getObjectByName('Object001_body01_0').material	=	this.bodyMaterial;
				carModel.getObjectByName('DoorL_body01_0').material		=	this.bodyMaterial;
				carModel.getObjectByName('DoorR_body01_0').material		=	this.bodyMaterial;

				//Roof Material
				carModel.getObjectByName('roof_roof01_0').material		=	this.roofMaterial;

				//Interior Material
				carModel.getObjectByName('interior_intr01_0').material		=	this.interiorMaterial;

				//Details Material
				carModel.getObjectByName( 'Body_body01_0' ).material		=	this.detailsMaterial;

				//Glass Material
				carModel.getObjectByName( 'wingshild_Glass_0' ).material	=	this.glassMaterial;
				carModel.getObjectByName( 'rearGlass_Glass_0' ).material	=	this.glassMaterial;
				carModel.getObjectByName( 'LightsR_lights01_0' ).material	=	this.glassMaterial;
				carModel.getObjectByName( 'LightsL_lights01_0' ).material	=	this.glassMaterial;

				this.wheels.push(
					carModel.getObjectByName( 'FrontWheelR_frwheel01_0' ),
					carModel.getObjectByName( 'FrontWheelL_frwheel01_0' ),
					carModel.getObjectByName( 'RearWheelR_rwheel01_0' ),
					carModel.getObjectByName( 'RearWheelL_rwheel01_0' )
				);

				// shadow
				const mesh	=	new THREE.Mesh(
					new THREE.PlaneGeometry( 0.655 * 4, 1.3 * 4 ),
					new THREE.MeshBasicMaterial( {
						map			:	this.shadow,
						blending		:	THREE.MultiplyBlending,
						toneMapped	:	false,
						transparent	:	true
					})
				);

				mesh.scale.set(38,50,40);
				mesh.renderOrder = 2;
				carModel.add( mesh );

				this.scene.add( carModel );
			},
			(xhr) => {

			},
			(error) => {
				console.log("Error : ", error);
			}
		);
		
	};

	//Setting up lights
	setupLights = () => {
		//Local variable declaration

		//Code
		//Setup Ambient Light
		this.light = new THREE.AmbientLight(0xffffff, 0.5);
		this.scene.add(this.light);
	};	

	//Setting up raycaster
	setupRaycaster = () => {
		//Local variable declaration

		//Code
		this.raycaster = new THREE.Raycaster();
		this.pointer = new THREE.Vector2();
	};

	//Draw Geometries in scene
	draw = () => {
		//Local variable declaration

		//Code
		//Setup Grid
		this.grid						=	new THREE.GridHelper( 20, 40, 0xffffff, 0xffffff );
		this.grid.material.opacity		=	0.2;
		this.grid.material.depthWrite		=	false;
		this.grid.material.transparent	=	true;
		this.scene.add( this.grid );
	};

	//Start Animation
	start = () => {
		//Local variable declaration

		//Code
		//if already initalized then leave it be
		if(!this.frameId) {
			this.frameId = requestAnimationFrame(this.update);
		}
	};

	//Stop render loop
	stop = () => {
		//Local variable declaration

		//Code
		cancelAnimationFrame(this.frameId);
	};

	//Resize
	resizeWindow = (event) => {
		//Local variable declaration
		const container = this.renderer.domElement.parentNode;

		//Code
		if( container ) {
			const width	=	container.offsetWidth;
			const height	=	container.offsetHeight;
	
			this.renderer.setSize( width, height );
	
			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();
		}
	};

	//Game-loop
	update = () => {
		//Local variable declaration

		//Code
		this.time = - performance.now() / 1000;

		//Rotate Wheels
		for ( let i = 0; i < this.wheels.length; i ++ ) {
			this.wheels[ i ].rotation.x = -(this.time * Math.PI * 2);
		}

		//Move Grid
		this.grid.position.z = -(this.time) % 1;

		this.orbitControls.update();
		this.renderScene();

		this.frameId = window.requestAnimationFrame(this.update);
	};

	//Handle onInput Body Material
	handleBodyMaterial = (event) => {
		//Local variable declaration

		//Code
		this.bodyMaterial.color.set( event.target.value );
		this.setState({
			bodyColor		:	event.target.value
		});
	};

	//Handle onInput Roof Material
	handleRoofMaterial = (event) => {
		//Local variable declaration

		//Code
		this.roofMaterial.color.set( event.target.value );
		this.setState({
			roofColor		:	event.target.value
		});
	};

	//Handle onInput Interior Material
	handleInteriorMaterial = (event) => {
		//Local variable declaration

		//Code
		this.interiorMaterial.color.set( event.target.value );
		this.setState({
			interiorColor		:	event.target.value
		});
	};

	//Handle onIput Details Material
	handleDetailsMaterial = (event) => {
		//Local variable declaration

		//Code
		this.detailsMaterial.color.set( event.target.value );
		this.setState({
			detailsColor	:	event.target.value
		});
	};

	//Handle onIput Glass Material
	handleGlassMaterial = (event) => {
		//Local variable declaration

		//Code
		this.glassMaterial.color.set( event.target.value );
		this.setState({
			glassColor	:	event.target.value
		});
	};

	//Handle onPointer event
	onPointerMove = (event) => {
		//Local variable declaration

		//Code
		
	};

	//Draw scene
	renderScene = () => {
		//Local variable declaration

		//Code
		let { renderer, scene, camera, } = this;
		if(renderer) {
			renderer.render(scene, camera);
		}
	};

	render() {
		return (
			<div className='mainDiv'>
				{/* Canvas */}
				<div className="canvasContainer" >
					<div ref={ref => (this.mount = ref)}
						className="canvasContainer__maincanvas"
						id		=	'mainC'
						style	=	{
							{
								height	:	"100vh"
							}
						}/>
				</div>

				{/* Menu */}
				<div className="leftDiv">

					{/* Header */}
					<h1 id="mainlabel">Object Viewer</h1>
					
					{/* Input Option */}
					<div className='inputOpt'>
						<input
							id		=	"body-color"
							type		=	"color"
							value	=	{this.state.bodyColor}
							style	=	{
								{
									height	:	"25px",
									width	:	"35px",
									cursor	:	"pointer"
								}
							}
							onInput={(event) => {
								this.handleBodyMaterial(event);
							}}/>

						{/* Label */}
						<label><b>Body</b></label>
					</div>

					{/* Input Option */}
					<div className='inputOpt'>
						<input
							id		=	"roof-color"
							type		=	"color"
							value	=	{this.state.roofColor}
							style	=	{
								{
									height	:	"25px",
									width	:	"35px",
									cursor	:	"pointer"
								}
							}
							onInput={(event) => {
								this.handleRoofMaterial(event);
							}}/>

						{/* Label */}
						<label><b>Roof</b></label>
					</div>

					{/* Input Option */}
					<div className='inputOpt'>
						<input
							id		=	"interior-color"
							type		=	"color"
							value	=	{this.state.interiorColor}
							style	=	{
								{
									height	:	"25px",
									width	:	"35px",
									cursor	:	"pointer"
								}
							}
							onInput={(event) => {
								this.handleInteriorMaterial(event);
							}}/>

						{/* Label */}
						<label><b>Interior</b></label>
					</div>
			
					{/* Input Option */}
					<div className='inputOpt'>
						<input
							id		=	"details-color"
							type		=	"color"
							value	=	{this.state.detailsColor}
							style	=	{
								{
									height	:	"25px",
									width	:	"35px",
									cursor	:	"pointer"
								}
							}
							onInput={(event) => {
								this.handleDetailsMaterial(event);
							}}/>

						{/* Label */}
						<label><b>Details</b></label>
					</div>

					{/* Input Option */}
					<div className='inputOpt'>
						<input
							id		=	"glass-color"
							type		=	"color"
							value	=	{this.state.glassColor}
							style	=	{
								{
									height	:	"25px",
									width	:	"35px",
									cursor	:	"pointer"
								}
							}
							onInput={(event) => {
								this.handleGlassMaterial(event);
							}}/>

						{/* Label */}
						<label><b>Glass</b></label>
					</div>
				</div>
			</div>
		)
	};
}

export default CanvasHome;