let faceapi;
let detections = [];
let begin = false;

let video;
let canvas;

let classifier;
let modelURL = 'https://teachablemachine.withgoogle.com/models/2jhn_4qDg/';

function preload() {
  console.log('Preloading model...');
  classifier = ml5.imageClassifier(modelURL + 'model.json', () => {
    console.log('Model loaded.');
  });
}

function setup() {
  canvas = createCanvas(640, 360);
  canvas.id("canvas");
  canvas.parent('video-container');

  video = createCapture(VIDEO);
  video.size(640, 360);
  video.parent('video-container');

  const faceOptions = {
    withLandmarks: true,
    withExpressions: true,
    withDescriptors: true,
    minConfidence: 0.5
  };

  faceapi = ml5.faceApi(video, faceOptions, faceReady);
}

function faceReady() {
  console.log('Face API model loaded');
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

function draw() {
  if (!begin) {
    background(0, 155, 255);
    textSize(100);
    fill(255);
    textAlign(CENTER, CENTER);
    text("기다려주세요", width / 2, height / 2);
  } else {
    clear();
    image(video, 0, 0, width, height);

    if (detections.length > 0) {
      for (let i = 0; i < detections.length; i++) {
        let alignedRect = detections[i].alignedRect;
        let x = alignedRect._box._x;
        let y = alignedRect._box._y;
        let boxWidth = alignedRect._box._width;
        let boxHeight = alignedRect._box._height;

        noFill();
        stroke(0, 255, 0);
        strokeWeight(2);
        rect(x, y, boxWidth, boxHeight);

        let faceImage = video.get(x, y, boxWidth, boxHeight);
        classifier.classify(faceImage, gotClassification);
      }
    }
  }
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
    let {
      neutral,
      happy,
      angry,
      sad,
      disgusted,
      surprised,
      fearful
    } = detections[0].expressions;
    begin = true;
    console.log('Expressions detected:', neutral, happy, angry, sad, disgusted, surprised, fearful);

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

function gotClassification(error, results) {
  if (error) {
    console.error(error);
    return;
  }

  document.getElementById('label').innerText = results[0].label;
  document.getElementById('confidence').innerText = nf(results[0].confidence * 100, 2, 2) + '%';

  fill(255, 0, 0);
  noStroke();
  textSize(24);
  text(results[0].label, 10, height - 10);
}
