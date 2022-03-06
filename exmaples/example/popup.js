const timeElement = document.getElementById("time")
const nameElement = document.getElementById("name")
const timerElement = document.getElementById("timer")
const currentTime = new Date().toLocaleTimeString()
timeElement.textContent = `The Time is : ${currentTime}`

chrome.action.setBadgeText({
  text: "TIME",
}, () => {
  console.log("Finished setting badge text.")
})
