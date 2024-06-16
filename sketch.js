let faceapi;
let detections = [];

let video;
let canvas;
let classifier;
let label = 'waiting';

let begin = false;

function preload() {
  classifier = ml5.imageClassifier('my_model/model.json');
}

function setup() {
  const canvasElement = document.getElementById('canvas');
  canvas = createCanvas(640, 360);
  canvas.id("canvas");
  canvas.parent('video-container');

  video = createCapture(VIDEO);
  video.id("video");
  video.size(640, 360);
  video.parent('video-container');

  const faceOptions = {
    withLandmarks: true,
    withExpressions: true,
    withDescriptors: true,
    minConfidence: 0.5
  };

  faceapi = ml5.faceApi(video, faceOptions, faceReady);

  classifyVideo();
}

function draw() {
  background(0, 155, 255);
  textSize(50);
  fill(255);
  textAlign(CENTER, CENTER);
  text("find mom's face", width / 2, height / 2);

  if (begin) {
    clear();
  }

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

  clear();
  drawBoxs(detections);
  drawLandmarks(detections);
  drawExpressions(detections);

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
  if (detections.length > 0) {
    let { neutral, happy, angry, sad, disgusted, surprised, fearful } = detections[0].expressions;
    begin = true;
    document.getElementById('neutral').innerText = nf(neutral * 100, 2, 2) + "%";
    document.getElementById('happiness').innerText = nf(happy * 100, 2, 2) + "%";
    document.getElementById('anger').innerText = nf(angry * 100, 2, 2) + "%";
    document.getElementById('sad').innerText = nf(sad * 100, 2, 2) + "%";
    document.getElementById('disgusted').innerText = nf(disgusted * 100, 2, 2) + "%";
    document.getElementById('surprised').innerText = nf(surprised * 100, 2, 2) + "%";
    document.getElementById('fear').innerText = nf(fearful * 100, 2, 2) + "%";

    if (label === 'mother' && angry > 0.5) {
      document.getElementById('magnolia-image').style.display = 'block';
    } else {
      document.getElementById('magnolia-image').style.display = 'none';
    }
  } else {
    document.getElementById('neutral').innerText = "";
    document.getElementById('happiness').innerText = "";
    document.getElementById('anger').innerText = "";
    document.getElementById('sad').innerText = "";
    document.getElementById('disgusted').innerText = "";
    document.getElementById('surprised').innerText = "";
    document.getElementById('fear').innerText = "";
    document.getElementById('magnolia-image').style.display = 'none';
  }
}

function classifyVideo() {
  classifier.classify(video, gotResults);
}

function gotResults(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  label = results[0].label;
  classifyVideo();
  document.getElementById('label-result').innerText = label;
}
