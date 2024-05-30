let sensor;
let timeStamp;
let deltaRotationMatrix;
let x, y, z, alpha = 0, beta = 0, gamma = 0;
const EPSILON = 0.001
const MS2S = 1.0 / 1000.0;
let started = false
function readGyroscope() {

  timeStamp = Date.now();

  // let message = document.getElementById('message')
  // message.innerText = 'Reading...'
  sensor = new Gyroscope({ frequency: 30 });
  sensor.addEventListener('reading', e => {
    x = sensor.x
    y = sensor.y
    z = sensor.z
    draw()
    // gyroToMat()
    // message.innerText = `${x},${y},${z}`
  });
  sensor.start();
  started = true
  // draw()
}
function gyroToMat() {
  let message = document.getElementById('message')
  if (x != null) {
    let dT = (Date.now() - timeStamp) * MS2S

    let omegaMagnitude = Math.sqrt(x * x, y * y, z * z);
    if (omegaMagnitude > EPSILON) {
      alpha += x * dT
      beta += y * dT
      gamma += z * dT
      alpha = Math.min(Math.max(alpha, -Math.PI * 0.25), Math.PI * 0.25)
      beta = Math.min(Math.max(beta, -Math.PI * 0.25), Math.PI * 0.25)
      gamma = Math.min(Math.max(gamma, -Math.PI * 0.25), Math.PI * 0.25)
      // if (omegaMagnitude > EPSILON) {
      //   x /= omegaMagnitude
      //   y /= omegaMagnitude
      //   z /= omegaMagnitude
      // }
      // let thetaOverTwo = omegaMagnitude * dT / 2.0;
      // let sinThetaOverTwo = Math.sin(thetaOverTwo);
      // let cosThetaOverTwo = Math.cos(thetaOverTwo);
      let deltaRotationVector = [];
      // deltaRotationVector.push(sinThetaOverTwo * x);
      deltaRotationVector.push(alpha);
      deltaRotationVector.push(beta);
      deltaRotationVector.push(gamma);
      // deltaRotationVector.push(sinThetaOverTwo * y);
      // deltaRotationVector.push(sinThetaOverTwo * z);
      // deltaRotationVector.push(cosThetaOverTwo);
      deltaRotationMatrix = getRotationMatrixFromVector(deltaRotationVector)
      message.innerText = deltaRotationMatrix
      // window.alert(deltaRotationMatrix)
      timeStamp = Date.now();
    }
    // window.requestAnimationFrame(gyroToMat)
  }
}
function getRotationMatrixFromVector(rotationVector) {
  const q1 = rotationVector[0];
  const q2 = rotationVector[1];
  const q3 = rotationVector[2];
  let q0;

  if (rotationVector.length >= 4) {
    q0 = rotationVector[3];
  } else {
    q0 = 1 - q1 * q1 - q2 * q2 - q3 * q3;
    q0 = q0 > 0 ? Math.sqrt(q0) : 0;
  }
  const sq_q1 = 2 * q1 * q1;
  const sq_q2 = 2 * q2 * q2;
  const sq_q3 = 2 * q3 * q3;
  const q1_q2 = 2 * q1 * q2;
  const q3_q0 = 2 * q3 * q0;
  const q1_q3 = 2 * q1 * q3;
  const q2_q0 = 2 * q2 * q0;
  const q2_q3 = 2 * q2 * q3;
  const q1_q0 = 2 * q1 * q0;
  let R = [];
  R.push(1 - sq_q2 - sq_q3);
  R.push(q1_q2 - q3_q0);
  R.push(q1_q3 + q2_q0);
  R.push(0.0);
  R.push(q1_q2 + q3_q0);
  R.push(1 - sq_q1 - sq_q3);
  R.push(q2_q3 - q1_q0);
  R.push(0.0);
  R.push(q1_q3 - q2_q0);
  R.push(q2_q3 + q1_q0);
  R.push(1 - sq_q1 - sq_q2);
  R.push(0.0);
  R.push(0.0);
  R.push(0.0);
  R.push(0.0);
  R.push(1.0);
  return R;
}