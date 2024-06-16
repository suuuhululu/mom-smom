let faceapi;
let detections = [];
let classifier;
let video;
let canvas;
let label = "";

let imageModelURL = 'https://teachablemachine.withgoogle.com/models/2jhn_4qDg/model.json';

// Load the model first
function preload() {
  classifier = ml5.imageClassifier(imageModelURL);
}

function setup() {
  const canvasElement = document.getElementById('canvas');
  canvas = createCanvas(640, 360);
  canvas.id("canvas");
  canvas.parent('video-container');

  video = createCapture(VIDEO);
  video.id("video");
  video.size(640, 360);
  video.hide(); // 비디오 숨김
  video.parent('video-container');

  const faceOptions = {
    withLandmarks: true,
    withExpressions: true,
    withDescriptors: false,
    minConfidence: 0.5
  };

  faceapi = ml5.faceApi(video, faceOptions, faceReady);
  classifyVideo();
}

function draw() {
  background(0);
  image(video, 0, 0, width, height); // 비디오 프레임을 캔버스에 그림
  drawBoxs(detections);
  drawLandmarks(detections);
  drawExpressions(detections);
  textSize(16);
  textAlign(CENTER);
  fill(255);
  text(label, width / 2, height - 4);
}

// Get a prediction for the current video frame
function classifyVideo() {
  classifier.classify(video, gotResult);
}

// When we get a result
function gotResult(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  label = results[0].label;
  classifyVideo();
}

function faceReady() {
  faceapi.detect(gotFaces);
}

function gotFaces(error, result) {
  if (error) {
    console.log(error);
    return;
  }
  detections = result;
  faceapi.detect(gotFaces);
}

function drawBoxs(detections) {
  if (detections.length > 0) {
    for (let f = 0; f < detections.length; f++) {
      let { _x, _y, _width, _height } = detections[f].alignedRect._box;
      stroke(44, 169, 225);
      strokeWeight(1);
      noFill();
      rect(_x, _y, _width, _height);
    }
  }
}

function drawLandmarks(detections) {
  if (detections.length > 0) {
    for (let f = 0; f < detections.length; f++) {
      let points = detections[f].landmarks.positions;
      for (let i = 0; i < points.length; i++) {
        stroke(44, 169, 225);
        strokeWeight(3);
        point(points[i]._x, points[i]._y);
      }
    }
  }
}

function drawExpressions(detections) {
  if (detections.length > 0 && detections[0].expressions) {
    let { neutral, happy, angry, sad, disgusted, surprised, fearful } = detections[0].expressions;
    document.getElementById('neutral').innerText = nf(neutral * 100, 2, 2) + "%";
    document.getElementById('happiness').innerText = nf(happy * 100, 2, 2) + "%";
    document.getElementById('anger').innerText = nf(angry * 100, 2, 2) + "%";
    document.getElementById('sad').innerText = nf(sad * 100, 2, 2) + "%";
    document.getElementById('disgusted').innerText = nf(disgusted * 100, 2, 2) + "%";
    document.getElementById('surprised').innerText = nf(surprised * 100, 2, 2) + "%";
    document.getElementById('fear').innerText = nf(fearful * 100, 2, 2) + "%";
  } else {
    document.getElementById('neutral').innerText = "";
    document.getElementById('happiness').innerText = "";
    document.getElementById('anger').innerText = "";
    document.getElementById('sad').innerText = "";
    document.getElementById('disgusted').innerText = "";
    document.getElementById('surprised').innerText = "";
    document.getElementById('fear').innerText = "";
  }
}
