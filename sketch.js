let faceapi;
let detections = [];

let video;
let canvas;

function setup() {
  const canvasElement = document.getElementById('canvas');
  canvas = createCanvas(640, 360); // 고정된 크기 설정
  canvas.id("canvas");
  canvas.parent('video-container'); // 캔버스를 비디오 컨테이너에 추가

  video = createCapture(VIDEO); // 비디오 오브젝트 생성
  video.id("video");
  video.size(640, 360); // 고정된 크기 설정
  video.parent('video-container'); // 비디오를 비디오 컨테이너에 추가

  const faceOptions = {
    withLandmarks: true,
    withExpressions: true,
    withDescriptors: true,
    minConfidence: 0.5
  };

  faceapi = ml5.faceApi(video, faceOptions, faceReady); // 모델 초기화
}

function faceReady() {
  faceapi.detect(gotFaces); // 얼굴 인식 시작
}

function gotFaces(error, result) {
  if (error) {
    console.log(error);
    return;
  }

  detections = result;

  clear(); // 투명한 배경 그리기
  drawBoxs(detections); // 얼굴 주위 상자 그리기
  drawLandmarks(detections); // 얼굴 랜드마크 그리기
  drawExpressions(detections); // 얼굴 표정 그리기

  faceapi.detect(gotFaces); // 얼굴 인식 반복 호출
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
