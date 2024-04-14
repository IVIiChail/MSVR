function webCam() {
    const webCam = document.createElement('video');
    webCam.setAttribute('autoplay', true);
    navigator.getUserMedia({ video: true, audio: false }, function (stream) {
        webCam.srcObject = stream;
    }, function (e) {
        console.error('Rejected!', e);
    });
    return webCam;
}
function webCamTexture() {
    const webCamTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, webCamTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return webCamTexture;
}