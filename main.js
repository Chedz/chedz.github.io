// import * as THREE from 'https://cdn.skypack.dev/three';
// import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.158.0/three.js"
import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';


let scene, renderer, camera;
globalThis.THREE= THREE;

let sphere;
let matricesColorInterval = [];

let depthAnimationActive = false;
let depthAnimIntervalId;
let animIntervalId;

function initScene(){
    scene = new THREE.Scene();
    globalThis.scene = scene;
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    scene.fog = new THREE.Fog(0x000000, 500, 10000)

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(scene.fog.color)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild( renderer.domElement );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();
    camera.position.z = 5;
}


function addBox(){
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshLambertMaterial( { color: 0x00ff00,  } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
}

function addSphere(radius=1, widthSegments=16, heightSegments=16){
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments )
    const material = new THREE.MeshLambertMaterial( { color: 0x808080, wireframe: true, opacity: 0 } );
    sphere = new THREE.Mesh( geometry, material );
    scene.add( sphere );

}

globalThis.addSphere = addSphere;



let columnCount = 0;
let matrix = [];
let matricesHolder =[];
globalThis.matricesHolder = matricesHolder;

function drawCircle(radius, rowCount, zVal = 0){
    pointsList = [];
    // drawPoint();
    // drawPoint(1,1,1);

    let removeTopIndex;
    let removeBottomIndex;
    let vCount;

    if(rowCount%2){ 
        // console.log("odd")
        vCount = (rowCount+1)*2;
        removeTopIndex = vCount/4;
        removeBottomIndex = ((3*vCount)/4)-1;
    }else{
        // console.log("even")
        vCount = (rowCount*2) + 1;
        removeTopIndex = vCount/4;
        removeBottomIndex = ((3*vCount)/4);
    }

    // vCount = (rowCount+1)*2;

    let angle = 360.0 / vCount;

    let triangleCount = vCount - 2;

    let temp = []; //stores Vec3
    let vertices = [];

    // positions
    for (let i = 0; i < vCount; i++)
    {
        // console.log("drawCircle: "+ radius);
        let currentAngle = angle * i;
        let x = radius * Math.cos((currentAngle * Math.PI) / 180.0); ;
        let y = radius * Math.sin((currentAngle * Math.PI) / 180.0);
        let z = zVal;

        temp.push(new THREE.Vector3(x, y, z));
    }

    for (let i = 0; i < triangleCount; i++)
    {
        vertices.push(temp[0]);
        vertices.push(temp[i + 1]);
        vertices.push(temp[i + 2]);
    }

    // console.log(vertices);

    let cleanedVertices = vertices.filter((value, index, self) =>
        index === self.findIndex((t) => (
            t.x === value.x && t.y === value.y
        ))
    );


    cleanedVertices.splice(removeTopIndex,1);
    cleanedVertices.splice(removeBottomIndex,1);

    let col1 = cleanedVertices.splice(removeTopIndex, removeBottomIndex - removeTopIndex); //this is one side of the circle (not used, since we want one col to be half a circle)
    // console.log(col1)
    // console.log(cleanedVertices);

    // console.log(cleanedVertices);

    for (let index = 0; index < col1.length; index++) {
        drawPoint(col1[index].x, col1[index].y, col1[index].z)
    }

    matrix[columnCount] = pointsList;
    columnCount++;

    // console.log(pointsList.length)

}
function rotateAlongAxis(inputArray, angle){
    for (let index = 0; index < inputArray.length; index++) {
        const element = inputArray[index];
        element.rotateOnWorldAxis(new THREE.Vector3(0,1,0), angle);
    }
}


globalThis.rotateAlongAxis = rotateAlongAxis;

globalThis.drawCircle = drawCircle;

let pointsList =[];
globalThis.pointsList = pointsList;

function drawPoint(x=0, y=0, z=0){
    // console.log('draw');
    let bufferGeom = new THREE.BufferGeometry();
    let bufferMaterial = new THREE.PointsMaterial({ size: 0.05, color: 0x0000ff });

    let point = new THREE.Points(bufferGeom, bufferMaterial);

    scene.add(point);
    pointsList.push(point);
    
    bufferGeom.setAttribute("position", new THREE.Float32BufferAttribute(new THREE.Vector3(x,y,z), 3));
}

function createMatrix(numOfCol=8, numOfRow=12, circleRadius=1,){
    addSphere(circleRadius, numOfCol, numOfRow) //(radius=1, widthSegments=16, heightSegments=16)
    columnCount=0;
    matrix = [];
    for (let index = 0; index < numOfCol; index++) {
        // console.log("create: " + index)
        drawCircle(circleRadius,numOfRow,0); //radius, vCount, zVal = 0
        // if(index > 0) rotateAlongAxis(matrix[index], ((2*Math.PI) / (numOfCol)) * index)
        if(index > 0) rotateAlongAxis(matrix[index], index * ((2*Math.PI)/numOfCol ));

    }
    matricesHolder.push(matrix);
    matricesColorInterval.push(0);
}
globalThis.createMatrix = createMatrix;

function getPoint(row, column, colorVal){
    let point = matrix[column][row];
    return point;
}
globalThis.getPoint = getPoint;

function animation(matrixIndex){
    let matrixAnimated = matricesHolder[matrixIndex];
    if(matrixAnimated.length==0) return;

    let redVal = 0;
    let blueVal = 0;
    let greenVal = 0;

    let colorInterval = matricesColorInterval[matrixIndex];

    // console.log("matrix index: " + matrixIndex)


    switch (colorInterval) {
        case 0: //red
            redVal = 1;
            blueVal = 0;
            greenVal = 0;

            matricesColorInterval[matrixIndex]++;
            break;

        case 1: //green
            redVal = 0;
            blueVal = 0;
            greenVal = 1;

            matricesColorInterval[matrixIndex]++;
            break;

        case 2: //blue
            redVal = 0;
            blueVal = 1;
            greenVal = 0;

            matricesColorInterval[matrixIndex] = 0;
            break;
    
        default:

            break;
    }

    for (let rowIndex = 0; rowIndex < matrixAnimated[0].length; rowIndex++) {
        // const element = array[index];
        for (let colIndex = 0; colIndex < matrixAnimated.length; colIndex++) {
            // const element = array[index];
            let point = matrixAnimated[colIndex][rowIndex];

            setTimeout(function timer() {
                // console.log("hello world");
                point.material.color.r = redVal;
                point.material.color.g = greenVal;
                point.material.color.b = blueVal;
            }, rowIndex * 100);
           
            
        }
        
    }
}

globalThis.animation = animation;

function depthAnimation(matrixIndex, redValInput=0, greenValInput=0, blueValInput=0){
    // for (let index = 0; index < matricesHolder.length; index++) {
        depthAnimationActive = true;


        const matrix = matricesHolder[matrixIndex]; //get one of the sphere matrix

        for (let indexR = 0; indexR < matrix.length; indexR++) { 
            const element = matrix[indexR];
            for (let index = 0; index < element.length; index++) {

                const point = element[index];

                point.material.color.r = redValInput;
                point.material.color.g = greenValInput;
                point.material.color.b = blueValInput;
                
            }
            
        }

        if (matrixIndex == matricesHolder.length-1) {
            matrixIndex = 0;

            if(redValInput==1){
                redValInput=0;
                greenValInput=1;
                blueValInput=0;
            }
            else if(greenValInput==1){
                redValInput=0;
                greenValInput=0;
                blueValInput=1;
            }
            else if(blueValInput==1){
                redValInput=1;
                greenValInput=0;
                blueValInput=0;
            }
        } else {
            matrixIndex++;
        }

        depthAnimIntervalId = setTimeout(()=>{
            depthAnimation(matrixIndex,redValInput,greenValInput,blueValInput);
        }, 150)
        return;
    // }
}

globalThis.depthAnimation = depthAnimation;


function initLights(){
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.75)

    const distance = 20
    directionalLight.position.set(distance, distance, distance)

    directionalLight.castShadow = true

    directionalLight.shadow.mapSize.width = 1024
    directionalLight.shadow.mapSize.height = 1024

    directionalLight.shadow.camera.left = -distance
    directionalLight.shadow.camera.right = distance
    directionalLight.shadow.camera.top = distance
    directionalLight.shadow.camera.bottom = -distance

    directionalLight.shadow.camera.far = 3 * distance
    directionalLight.shadow.camera.near = distance

    scene.add(directionalLight)
}

function switchAnimation(){
    if(depthAnimationActive){
        depthAnimationActive = false;
        setAllLed();

        if(depthAnimIntervalId !== undefined){
            clearTimeout(depthAnimIntervalId);

            animIntervalId = setInterval(function() {
                animation(0);
                animation(1);
                animation(2);
                animation(3);
                animation(4);
            }, 2000);
        }
    }
    else{
        depthAnimationActive = true;
        setAllLed();

        if(animIntervalId !== undefined){
            clearInterval(animIntervalId);

            depthAnimation(0,1,0,0);
        }
    }

    function setAllLed(){
        matricesHolder.forEach(matrixElement => {
            matrixElement.forEach(elementRow => {
                elementRow.forEach(elementCol => {
                    matricesHolder
                });
            });
        });

        for (let i = 0; i < matricesHolder.length; i++) {
            for (let j = 0; j < matricesHolder[i].length; j++) {
                for (let k = 0; k < matricesHolder[i][j].length; k++) {
                    const element = matricesHolder[i][j][k];
                    element.material.color.r = 0;
                    element.material.color.g = 0;
                    element.material.color.b = 1;
                }
            }
        }
    }
}

globalThis.switchAnimation = switchAnimation;


function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    // point.rotation.y += 0.006;
    // updateCamera();
}


initScene();
initLights();

//hide button if not in use
// document.getElementById('mybutton').style.display = "none";


//creates led matrices
createMatrix(12,12,0.5);
createMatrix(12,12,1);
createMatrix(12,12,1.5);
createMatrix(12,12,2);
createMatrix(12,12,2.5);
//plays depth animaiton
depthAnimation(0,1,0,0);


animate();