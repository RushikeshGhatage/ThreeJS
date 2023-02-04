# STL (Stereo Lithography) Viewer :mag_right:
## Description
* Following demo is created using **[ThreeJS](https://threejs.org/)** (3D Javascript Library). :heart: and ReactJS :fire:
* [STL](https://en.wikipedia.org/wiki/STL_(file_format)) is a file format commonly used for 3D printing and computer-aided design (CAD)
* Refer **Output.png** file to see output of demo.
#### Created by [Rushikesh Vinod Ghatage](https://www.linkedin.com/in/rushikesh-ghatage-477489222/) :smiley:
## Setup
#### Download [Node.js](https://nodejs.org/en/download/).
#### Run following commands:

* To install dependencies (only the first time)
  ``` bash
  npm install
  ```
* To run the local server at localhost:8080
  ``` bash
  npm start
  ```
* To build for production in the directory
  ``` bash
  npm run build
  ```
## Instructions
* Choose **"Femur Centre"** radio button, One Landmark will be created. You can reposition your Landmark.
* Choose **"Hip Centre"** radio button, Another Landmark will be created. You can reposition your Landmark.
* Click on **"Update"** button, One Line will be create between thode two Landmark.
     And at the bottom of line, Two planes will create which will be perpendicular to its Line.
* Click on **"Show/Hide"** button, Lower part of bone from the last plane will be clipped.