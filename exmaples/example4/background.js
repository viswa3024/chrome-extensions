console.log("Hello from the background script!!!")
console.log(this)

let time = 0

setInterval(() => {
  time += 1
  console.log(time)
}, 1000)

chrome.alarms.create({
  periodInMinutes: 1 / 60,
})

// chrome.alarms.onAlarm.addListener((alarm) => {
//   console.log(alarm)
// })


chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.storage.local.get(["timer", "isRunning"], (res) => {
    const time = res.timer ?? 0
    const isRunning = res.isRunning ?? true
    if (!isRunning) {
      return
    }
    chrome.storage.local.set({
      timer: time + 1,
    })
    chrome.action.setBadgeText({
      text: `${time + 1}`
    })
  })
})
