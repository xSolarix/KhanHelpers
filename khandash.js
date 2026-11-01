
window.base64ToUint8Array = function(base64) {
  var raw = atob(base64);
  var bytes = new Uint8Array(raw.length);
  for (var i = 0; i < raw.length; i++) {
    bytes[i] = raw.charCodeAt(i);
  }
  return bytes;
};
