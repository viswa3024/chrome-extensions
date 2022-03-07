const timeElement = document.getElementById("time")
const nameElement = document.getElementById("name")
const timerElement = document.getElementById("timer")
const currentTime = new Date().toLocaleTimeString()
timeElement.textContent = `The Time is : ${currentTime}`

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


chrome.tabs.create({ url: chrome.runtime.getURL("localpage.html") });


// chrome.desktopCapture.chooseDesktopMedia(["screen", "window"], function(id) {


//   if (!id) {
//       return;
//   }


  // navigator.webkitGetUserMedia({
  //     audio:false,
  //     video: { mandatory: { chromeMediaSource: "desktop", chromeMediaSourceId: id } }
  // }, function(stream) {
  //     port.postMessage({stream: stream});
  // }, function() {
  //     port.postMessage({stream: null});
  // });
// });




})





console.log(this)