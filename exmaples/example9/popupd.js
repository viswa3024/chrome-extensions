const desktopCaptureBtn = document.getElementById("desktopCapture")


desktopCaptureBtn.addEventListener("click", () => {
    console.log("button clicked")
  
  //   chrome.desktopCapture.chooseDesktopMedia([
  //     "screen",
  //     "window",
  //     "tab"
  // ], tab, (streamId) => {
  //     //check whether the user canceled the request or not
  //     if (streamId && streamId.length) {
          
  //     }
  // })
  
  
  
  
  chrome.desktopCapture.chooseDesktopMedia(["screen", "window", "tab"], function(id) {
  
  
    if (!id) {
        return;
    }
  
  
    // navigator.webkitGetUserMedia({
    //     audio:false,
    //     video: { mandatory: { chromeMediaSource: "desktop", chromeMediaSourceId: id } }
    // }, function(stream) {
    //     port.postMessage({stream: stream});
    // }, function() {
    //     port.postMessage({stream: null});
    // });
   });
  
  
  
  
  })