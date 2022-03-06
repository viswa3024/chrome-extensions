console.log("Hello from the options page!!!")

const nameInput = document.getElementById("name-input")
const timeInput = document.getElementById("time-input")
const saveBtn = document.getElementById("save-btn")

saveBtn.addEventListener("click", () => {
  const name = nameInput.value
  console.log("name: ", name)
  chrome.storage.sync.set({
    name
  },() => {
    console.log(`Name is set to ${name}`)
  })
})


chrome.storage.sync.get(["name"], (res) => {
  console.log(res)
  nameInput.value = res.name ?? "???"
})

