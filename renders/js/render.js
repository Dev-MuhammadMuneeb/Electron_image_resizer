const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightlnput = document.querySelector("#height");
const widthlnput = document.querySelector("#width");

//Load Image
function loadImage(e) {
  const file = e.target.files[0];

  if(!isFileImage(file)) {
    alertError('Please Select an image');
    return;
  }

  //Get original Dimensions
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthlnput.value = this.width;
    heightlnput.value = this.height;
  }

  form.style.display = "block";
  filename.innerText = file.name;
  outputPath.innerText = path.join(os.homedir(), 'imageResizer')
}
//Load Image ends

//Send Image data to main
function sendImage(e){
  e.preventDefault();

  const width = widthlnput.value;
  const height = heightlnput.value;
  const imgPath = img.files[0].path;

  if(!img.files[0]) {
    alertError("Please upload an image");
    return;
  }

  if( width === '' || height === '') {
    alertError('Please fill in a height and width');
    return;
  }

  //send to main using ipcRenderer
  ipcRenderer.send('image:resize', {
    imgPath, width, height
  })
}

//Catch the image: done event
ipcRenderer.on('image:done', () => {
  alertSuccess(`Image Resized to ${widthlnput.value} x ${heightlnput.value}`);
})


//Check file is image
function isFileImage(file) {
  const acceptedImageTypes = ['image/gif', 'image/png', 'image/jpeg'];
  return file && acceptedImageTypes.includes(file['type']);
}

function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'red',
      color: "white",
      textAlign: 'center'
    }
  })
}

function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'green',
      color: "white",
      textAlign: 'center'
    }
  })
}

img.addEventListener('change', loadImage);

form.addEventListener('submit', sendImage);