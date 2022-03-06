console.log("Hello from the background script!!!")

// TODO: background script
chrome.runtime.onInstalled.addListener(() => {
  // TODO: on installed function
});


chrome.runtime.onMessage.addListener((msg, sender, sendMessage) => {
  console.log(msg)
  console.log(sender)
  sendMessage("From the backbroung script!!!")
})