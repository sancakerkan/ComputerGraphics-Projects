// BackGround is the background image to be changed.
// ForeGround is the foreground image.
// ForeGroundOpacity is the opacity of the foreground image.
// ForeGroundPosition is the The foreground image's location, measured in pixels. It can be negative, and the alignment of the foreground and background's top-left pixels is indicated by (0,0).

function composite(BackGround, ForeGround, ForeGroundOpacity, ForeGroundPosition) {
  var bgData = BackGround.data;
  var fgData = ForeGround.data;
  var width  = BackGround.width;
  var height = BackGround.height;

  for (var y = 0; y < ForeGround.height; y++) {
    for (var x = 0; x < ForeGround.width; x++) {
      
      var bgX = ForeGroundPosition.x + x;
      var bgY = ForeGroundPosition.y + y;
      var bgIndex = (bgY * width + bgX) * 4;
      var fgIndex = (y * ForeGround.width + x) * 4;

      if (bgX >= 0 && bgX < BackGround.width && bgY >= 0 && bgY < BackGround.height) {
        var alpha = fgData[fgIndex + 3] * (ForeGroundOpacity / 255);
        var beta = 1 - alpha;

        bgData[bgIndex] = Math.round(alpha * fgData[fgIndex] + beta * bgData[bgIndex]);
        bgData[bgIndex + 1] = Math.round(alpha * fgData[fgIndex + 1] + beta * bgData[bgIndex + 1]);
        bgData[bgIndex + 2] = Math.round(alpha * fgData[fgIndex + 2] + beta * bgData[bgIndex + 2]);
        bgData[bgIndex + 3] = Math.round(fgData[fgIndex + 3] + beta * bgData[bgIndex + 3]);
      }
    }
  }
}