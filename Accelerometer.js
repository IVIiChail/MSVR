// let sensor;
function readAccelerometer() {
  sensor = new Accelerometer({ frequency: 30 });
  sensor.start();
}
