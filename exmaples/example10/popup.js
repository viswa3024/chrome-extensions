const timeElement = document.getElementById("time")
const nameElement = document.getElementById("name")
const timerElement = document.getElementById("timer")
const currentTime = new Date().toLocaleTimeString()
timeElement.textContent = `The Time is : ${currentTime}`
var local_stream = null;

// chrome.action.setBadgeText({
//   text: "TIME",
// }, () => {
//   console.log("Finished setting badge text.")
// })


function updateTimeElements() {
  chrome.storage.local.get(["timer"], (res) => {
    const time = res.timer ?? 0
    timerElement.textContent = `The timer is at: ${time} seconds`
  })
  const currentTime = new Date().toLocaleTimeString()
  timeElement.textContent = `The time is: ${currentTime}`
}

updateTimeElements()
setInterval(updateTimeElements, 1000)


chrome.storage.sync.get(["name"], (res) => {
  const name = res.name ?? "???"
  nameElement.textContent = `Your name is: ${name}`
})


const startBtn = document.getElementById("start")
const stopBtn = document.getElementById("stop")
const resetBtn = document.getElementById("reset")
const screenshotBtn = document.getElementById("screenshot")
const desktopCaptureBtn = document.getElementById("desktopCapture")




startBtn.addEventListener("click", () => {
  chrome.storage.local.set({
    isRunning: true,
  })
})

stopBtn.addEventListener("click", () => {
  chrome.storage.local.set({
    isRunning: false,
  })
})

resetBtn.addEventListener("click", () => {
  chrome.storage.local.set({
    timer: 0,
    isRunning: false,
  })
})


async  function saveScreenshot(imageSrc) {
  const image = await fetch(imageSrc)
  const imageBlog = await image.blob()
  const imageURL = URL.createObjectURL(imageBlog)

  const link = document.createElement('a')
  link.href = imageURL
  link.download = 'image_saved_1'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

screenshotBtn.addEventListener("click", () => {
   console.log("button clicked")

   chrome.tabs.captureVisibleTab(null, {
    format : "png",
    quality : 100
}, function(data) {
    screenshot.data = data;

    console.log("data =====",data)
    saveScreenshot(data)
});
})

let track, canvas
desktopCaptureBtn.addEventListener("click", () => {
  chrome.desktopCapture.chooseDesktopMedia(["screen", "window", "tab"], onAccessApproved);
})


function onAccessApproved(desktop_id) {
  if (!desktop_id) {
      console.log('Desktop Capture access rejected.');
      return;
  }
  console.log("Desktop sharing started.. desktop_id:" + desktop_id);

  let track, canvas
  navigator.mediaDevices.getUserMedia({
    audio: false,
      video: {
          mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: desktop_id,
              minWidth: 1280,
              maxWidth: 1280,
              minHeight: 720,
              maxHeight: 720
          },
      }
  }).then((stream) => {
      track = stream.getVideoTracks()[0]
      const imageCapture = new ImageCapture(track)
      return imageCapture.grabFrame()
  }).then((bitmap) => {
      track.stop()
      canvas = document.createElement('canvas');
      canvas.width = bitmap.width; //if not set, the width will default to 200px
      canvas.height = bitmap.height;//if not set, the height will default to 200px
      let context = canvas.getContext('2d');
      context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height)
      return canvas.toDataURL();
  }).then((data) => {

    console.log("data",data)
    saveScreenshot(data)
     
      canvas.remove()
  }).catch((err) => {
      console.log("Could not take screenshot")
  })
}



// function onAccessApproved(desktop_id) {
//   if (!desktop_id) {
//       console.log('Desktop Capture access rejected.');
//       return;
//   }
//   console.log("Desktop sharing started.. desktop_id:" + desktop_id);

//   navigator.webkitGetUserMedia({
//       audio: false,
//       video: {
//           mandatory: {
//               chromeMediaSource: 'desktop',
//               chromeMediaSourceId: desktop_id,
//               minWidth: 400,
//               maxWidth: 400,
//               minHeight: 400,
//               maxHeight: 400
//           }
//       }
//   }, gotStream, getUserMediaError);

//   function gotStream(stream) {

//     track = stream.getVideoTracks()[0]
//     const imageCapture = new ImageCapture(track)


//       console.log("stream",stream)
//       console.log("track",track)
//       console.log("imageCapture",imageCapture)
  

//   };


//   function getUserMediaError(e) {
//     console.log('getUserMediaError: ' + JSON.stringify(e, null, '---'));
//   }
// }




console.log(this)