import React, { Component } from 'react';
import * as THREE from "three";

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

var	orbitControls;
var	transformControl;
var	objects = [];
var	line;
var	plane;
var	plane_2;

class CanvasHome extends Component {
	//Local variable declaration

	//Code
	constructor(props) {
		super(props);
		this.scene		=	null;
		this.camera		=	null;
		this.renderer		=	null;
		this.cube			=	null;
		this.light		=	null;
		this.frameId		=	null;

		//Variables
		this.model		=	null;
		this.landmark_1	=	null;
		this.landmark_2	=	null;
		this.points		=	[];
		this.raycaster		=	null;
		this.pointer		=	null;
		this.WNDSIZE		=	{ width:0, height: 0};

		this.state	=	{
			showClipping	:	true
		};
	};

	componentDidMount() {
		//Local variable declaration

		//Code
		//Initialize App
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
		//Scene
		this.scene = new THREE.Scene();

		this.WNDSIZE.width	=	this.mount.clientWidth;
		this.WNDSIZE.height	=	this.mount.clientHeight;

		this.renderer	=	new THREE.WebGLRenderer({
			antialias				:	true,
			alpha				:	true,
			preserveDrawingBuffer	:	true
		});

		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setClearColor("#e7e7e7", 1);
		this.renderer.setSize(this.WNDSIZE.width, this.WNDSIZE.height);
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
		this.renderer.setClearColor("lightgrey");
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
		this.camera			=	new THREE.PerspectiveCamera(45 , (this.WNDSIZE.width/this.WNDSIZE.height), 0.1, 1000);
		this.camera.position.z	=	200;
		this.camera.lookAt(this.scene.position);

		orbitControls	=	new OrbitControls(this.camera, this.renderer.domElement);

		transformControl	=	new TransformControls(this.camera, this.renderer.domElement);
		transformControl.setMode('translate');
		transformControl.addEventListener('dragging-changed', function (event) {
			if (line != null) {
				line.visible		=	false;
				plane.visible		=	false;
				plane_2.visible	=	false;
			}
			orbitControls.enabled = !event.value;
		});

		this.scene.add(transformControl);
	};

	//Load Model
	loadModel = () => {
		//Local variable declaration
		const loader	=	new STLLoader();

		//Code
		this.model	=	loader.load('./Right_Femur.stl', ( geometry ) => {
			const material	=	new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 } );
			const mesh	=	new THREE.Mesh( geometry, material );

			mesh.position.set( 23, 225, 30);
			mesh.rotation.set( (Math.PI / 2), 0, 0);
			mesh.scale.set( 0.25, 0.25, 0.25 );

			mesh.castShadow	=	true;
			mesh.receiveShadow	=	true;

			mesh.name = "Right_Femur_Bone";

			objects.push(mesh);

			this.scene.add( mesh );
		});
	};

	//Setting up lights
	setupLights = () => {
		//Local variable declaration

		//Code
		this.light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
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
		const geometry_L1		=	new THREE.SphereGeometry( 1.5, 32, 32);
		const material_L1		=	new THREE.MeshBasicMaterial( {side:THREE.DoubleSide,color: "black" } );
		const geometry_L2		=	new THREE.SphereGeometry( 1.5, 32, 32);
		const material_L2		=	new THREE.MeshBasicMaterial( { color: "black" } );

		//Code
		//LANDMARK (1)
		this.landmark_1		=	new THREE.Mesh(geometry_L1, material_L1);
		this.landmark_1.name	=	"FemurCentre";
		this.landmark_1.visible	=	false;
		this.landmark_1.position.set(8.585607669920712, 43.21490955754631, 8.962819120251702);
		objects.push(this.landmark_1);
		this.scene.add(this.landmark_1);

		//LANDMARK (2)
		this.landmark_2		=	new THREE.Mesh(geometry_L2, material_L2);
		this.landmark_2.visible	=	false;
		this.landmark_2.name	=	"HipCentre";
		this.landmark_2.position.set(2.991354017700779, -58.887325093719596, 10.099648066655112);
		objects.push(this.landmark_2);
		this.scene.add(this.landmark_2);
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
			const width = container.offsetWidth;
			const height = container.offsetHeight;
	
			this.renderer.setSize( width, height );
	
			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();
		}
	};

	//Game-loop
	update = () => {
		//Local variable declaration

		//Code
		orbitControls.update();
		this.renderScene();

		this.frameId = window.requestAnimationFrame(this.update);
	};

	//Handle onClick Femur button
	handleFemCentre = (event) => {
		//Local variable declaration

		//Code
		this.landmark_1.visible	=	true;
		this.landmark_1.material.color.set('black');
		
		transformControl.attach(this.landmark_1);
		if (this.landmark_2.visible === true) {
			this.landmark_1.material.color.set('black');
			this.landmark_2.material.color.set('darkgrey');
		}
	};

	//Handle onClick Hip button
	handleHipCentre = () => {
		//Local variable declaration

		//Code
		this.landmark_2.visible	=	true;
		this.landmark_2.material.color.set('black');

		transformControl.attach(this.landmark_2);

		if (this.landmark_1.visible === true) {
			this.landmark_1.material.color.set('darkgrey');
			this.landmark_2.material.color.set('black');
		}
	};

	//Handle onClick Update button
	handleUpdateBtn = () => {
		//Local variable declaration
		let geometryLine, materialLine;
		let geometryPlane, materialPlane;
		let geometryPlane2, materialPlane2;

		//Code
		console.log("Check : ", line);
		if (line != null) {
			line.visible		=	false;
			plane.visible		=	false;
			plane_2.visible	=	false;
		}

		this.landmark_1.visible	=	true;
		this.landmark_2.visible	=	true;
		this.landmark_1.material.color.set('black');
		this.landmark_2.material.color.set('black');

		transformControl.detach(this.landmark_1);
		transformControl.detach(this.landmark_2);

		this.points.push(this.landmark_1.position);
		this.points.push(this.landmark_2.position);

		geometryLine	=	new THREE.BufferGeometry().setFromPoints( this.points );
		materialLine	=	new THREE.LineBasicMaterial( { color: 0x0000ff } );

		line			=	new THREE.Line( geometryLine, materialLine );
		line.visible	=	true;
		this.scene.add(line);

		geometryPlane	=	new THREE.PlaneGeometry( 50, 50 );
		materialPlane =	new THREE.MeshBasicMaterial( {color: 'grey', side: THREE.DoubleSide} );

		plane = new THREE.Mesh( geometryPlane, materialPlane );
		plane.position.x	=	this.points[1].x;
		plane.position.y	=	this.points[1].y;
		plane.position.z	=	this.points[1].z;

		// plane.position.x	=	(this.points[1].x + this.points[0].x) / test;
		// plane.position.y	=	(this.points[1].y + this.points[0].y) / test;
		// plane.position.z	=	(this.points[1].z + this.points[0].z) / test;

		plane.visible	=	true;
		plane.lookAt(this.points[0]);
		this.scene.add( plane );

		geometryPlane2	= new THREE.PlaneGeometry( 50, 50 );
		materialPlane2	= new THREE.MeshBasicMaterial( {color: 'darkgrey', side: THREE.DoubleSide} );

		plane_2 = new THREE.Mesh( geometryPlane2, materialPlane2 );
		plane_2.position.x	=	(this.points[1].x);
		plane_2.position.y	=	(this.points[1].y);
		plane_2.position.z	=	(this.points[1].z);

		plane_2.translateOnAxis(new THREE.Vector3(0, 2, 0), 1.5);

		plane_2.visible  = true;
		plane_2.lookAt(this.points[0]);
		this.scene.add(plane_2);
	};

	//Handle onPointer event
	onPointerMove = (event) => {
		//Local variable declaration

		//Code
		this.pointer.x	=	(event.clientX / window.innerWidth) * 2 - 1;
		this.pointer.y	=	-(event.clientY / window.innerHeight) * 2 + 1;

		// update the picking ray with the camera and pointer position
		this.raycaster.setFromCamera(this.pointer, this.camera);

		// calculate objects intersecting the picking ray
		const intersects	=	this.raycaster.intersectObjects(objects	,true);

		if(intersects.length > 0 ){
			// console.log("Ray : ", intersects[0].object.name);
			if (intersects[0].object?.name === "FemurCentre") {
				this.handleFemCentre();
			}
			else if (intersects[0].object?.name === "HipCentre") {
				this.handleHipCentre();
			}
		}
		else{
			// 	transformControl.detach(this.landmark_1);
			// 	transformControl.detach(this.landmark_2);
		}
	};

	//Handle onClick Show/Hide button
	handleShowBtn = () => {
		//Local variable declaration

		//Code
		if (this.state.showClipping === true) {
			if(plane){
				var globalPlane	=	new THREE.Plane( new THREE.Vector3( 0, 1,0 ), this.distanceVector((new THREE.Vector3(0,0,0)),(this.landmark_2.position)));
				this.renderer.clippingPlanes = [ globalPlane ];
			}
		}
		else{
			this.renderer.clippingPlanes.pop();
		}
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

	//Function to calculate distance between two 3D points
	distanceVector = ( v1, v2 )=>{
		//Local variable declaration

		//Code
		v1	=	new THREE.Vector3(0,0,0);
		var dx	=	v1.x - v2.x;
		var dy	=	v1.y - v2.y;
		var dz	=	v1.z - v2.z;

		return Math.sqrt( dx * dx + dy * dy + dz * dz );
	};

	render() {
		return (
			<div className='mainDiv'>
				{/* Canvas */}
				<div className="canvasContainer" >
					<div ref={ref => (this.mount = ref)}
						className="canvasContainer__maincanvas"
						id='mainC'
						style={{height:"100vh"}}/>
				</div>

				{/* Menu */}
				<div className="leftDiv">

					{/* Header */}
					<h1 id="mainlabel">STL File Viewer</h1>
					
					{/* Radio Buttons */}
					<div className='radioOpt'>
						<input
							type="radio"
							id="femCentre_id"
							name="fav_language"
							className="femCentre"
							value="fem"
							style={{height:"14px", width:"14px", cursor: "pointer"}}
							onClick={()=> {
								this.handleFemCentre();
						}}/>

						{/* Label */}
						<label><b>Femur Centre</b></label><br></br>
					</div>
			
					{/* Radio Buttons */}
					<div className='radioOpt'>
						<input
							type="radio"
							id="hipCentre_id"
							name="fav_language"
							className="hipCentre"
							value="hip"
							style={{height:"14px", width:"14px", cursor: "pointer"}}
							onClick={()=> {
								this.handleHipCentre();
						}}/>

						{/* Label */}
						<label><b>Hip Centre</b></label><br></br>
					</div>

					{/* Button Containers */}
					<div className='btn_container'>

						{/* Update Button */}
						<button id="update_btn_id"
							className="update_btn btn"
							style={{cursor: "pointer"}}
							onClick={()=> {
								this.handleUpdateBtn();
							}}>
							Update	
						</button>

						{/* Show / Hide Button */}
						<button className="show_btn btn"
						style={{cursor: "pointer"}}
						onClick={()=> {
							this.setState({
								showClipping : !this.state.showClipping
							})
							this.handleShowBtn();
						}}>
						Show / Hide</button>
					</div> 
				</div>
			</div>
		)
	};
}

export default CanvasHome;