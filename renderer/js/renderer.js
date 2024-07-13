const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

function loadImage(e) {
    const file = e.target.files[0]
    const isImage = isFileImage(file)

    if (!isImage) {
        alertError("Please select an Image")
        return
    }

    // get original dimensions
    const image = new Image()
    image.src = URL.createObjectURL(file)
    image.onload = function () {
        widthInput.value = this.width
        heightInput.value = this.height
    }

    form.style.display = "block"
    filename.innerText = file.name
    outputPath.innerText = path.join(os.homedir(), "Pictures/imageResizer")

}

// check the file is image or not
function isFileImage(file) {
    const acceptedImageTypes = ["image/gif", "image/png", "image/jpg", "image/jpeg"]
    return file && acceptedImageTypes.includes(file["type"])
}

// show error
function alertError(message) {
    Toastify.toast({
        text: message,
        duration: 3000,
        close: false,
        style: {
            background: "red",
            color: "white",
            textAlign: "center"
        }
    })
}

// show message
function alertSuccess(message) {
    Toastify.toast({
        text: message,
        duration: 3000,
        close: false,
        style: {
            background: "green",
            color: "white",
            textAlign: "center"
        }
    })
}

// send image
function sendImage(e) {
    e.preventDefault()

    if (!img.files[0]) {
        alertError("Please upload an Image")
        return
    }

    const width = widthInput.value
    const height = heightInput.value
    const imgPath = img.files[0].path

    if (width === "" || height === "") {
        alertError("Please fill a height and width")
        return
    }

    // send to main using ipcRendere
    ipcRenderer.send("image:resize", {
        imgPath,
        width,
        height
    })
}

ipcRenderer.on("image:done", () => {
    alertSuccess(`Image resized successfully to ${widthInput.value} x ${heightInput.value}`)
})

img.addEventListener("change", loadImage)
form.addEventListener("submit", sendImage)