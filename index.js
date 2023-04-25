// // When using the Tauri global script (if not using the npm package)
// // Be sure to set `build.withGlobalTauri` in `tauri.conf.json` to true
const invoke = window.__TAURI__.invoke
const path = window.__TAURI__.path
const dialog = window.__TAURI__.dialog
const Command=window.__TAURI__.shell.Command
// import * as walkdir from 'walkdir';
// import * as chrono from 'chrono-node';
// import { EventEmitter } from 'events';
// import events from 'events';

// const emitter = new EventEmitter();

// // Invoke the command
// invoke('extract_jpg_preview', { rawDirFilePath: '/Users/vanshikadhingra/dass/src-tauri/images' })

let inputFolderPath = '';
let outputFolderPath = '';
let newoutput='';
// const folderInput = document.getElementById("folder");
// folderInput.addEventListener("change", (event) => {
//   const folderPath = event.target.value;
//   // const folderrr=folderPath;
//   // inputFolderPath = path.dirname(folderrr);
//   console.log("Folder path:",folderPath);
//   });

document.getElementById('folder').addEventListener('click', () => {
  //invoke('extract_jpg_preview', { rawDirFilePath: '/Users/vanshikadhingra/OneDrive - International Institute of Information Technology/8Mar2023_dass/src-tauri/images' })
  dialog
    .open({
      directory: true, // Set directory to true to allow selecting a folder instead of a file
    })
    .then((result) => {
      // result contains an array of paths that the user has selected
      inputFolderPath=result
      alert("input folder selected")
    })
    .catch((err) => {
      console.error(err);
    });
});

document.getElementById('outFolder').addEventListener('click', () => {
  //invoke('extract_jpg_preview', { rawDirFilePath: '/Users/vanshikadhingra/OneDrive - International Institute of Information Technology/8Mar2023_dass/src-tauri/images' })
  dialog
    .open({
      directory: true, // Set directory to true to allow selecting a folder instead of a file
    })
    .then((result) => {
      // result contains an array of paths that the user has selected
      //newoutput=result+'/'
      outputFolderPath = `${result}/`;
      alert("output folder selected")
    })
    .catch((err) => {
      console.error(err);
    });
});

document.getElementById('compress').addEventListener('click', () => {
  invoke('compress_jpeg', { rawDirFilePath: inputFolderPath,outputFolder: outputFolderPath })
    .then((res) => {
      // alert("compressing photos")
      console.log(res)
    })
    .catch((err) => {
      console.error(err)
    })
});

document.getElementById('previewCompress').addEventListener('click', () => {
  invoke('extract_and_compress_jpg_preview', { rawDirFilePath: inputFolderPath,outputFolder: outputFolderPath })
    .then((res) => {
      alert("compressing after extracting previews")
      console.log(res)
    })
    .catch((err) => {
      console.error(err)
    })
});

// document.getElementById('previewCompress').addEventListener('click', () => {
//   func();
//   invoke('compress_jpeg', { rawDirFilePath: outputFolderPath+"/preview",outputFolder: outputFolderPath+"/output"})
//     .then((res) => {
//       console.log(res)
//     })
//     .catch((err) => {
//       console.error(err)
//     })
//   setTimeout(function() {
//     console.log("Sleep");
//   }, 3000);

// });

// document.getElementById('changeTimestamps').addEventListener('click', () => {
//   const selectedDate = new Date(document.getElementById("date").value);
//   console.log(selectedDate)
//   invoke('change_timestamps', { rawDirFilePath: inputFolderPath })
//     .then((res) => {
//       console.log(res)
//     })
//     .catch((err) => {
//       console.error(err)
//     })
// });

// document.getElementById('changeTimestamps').addEventListener('click', () => {
//   // Create the date input element
//   const dateInput = document.createElement('input');
//   dateInput.type = 'date';
//   dateInput.id = 'timestamps';
//   dateInput.name = 'timestamps';

//   // Add event listener to the date input element
//   dateInput.addEventListener('change', () => {
//     const selectedDate = dateInput.value;
//     const final_date=new Date(selectedDate)
//     let givendate=final_date.getFullYear();
//     givendate=givendate+':'
//     console.log(final_date.getMonth())
//     console.log(final_date.get())
//     console.log(givendate)
//     invoke('change_timestamps', { rawDirFilePath: inputFolderPath, givendate })
//     .then((res) => {
//       console.log(res)
//     })
//     .catch((err) => {
//       console.error(err)
//     })
//   });

// const dateInput = document.createElement('input');
// dateInput.type = 'text';
// dateInput.placeholder = 'yyyy:mm:dd:hh:mm:ss';
// dateInput.id = 'timestamps';
// dateInput.name = 'timestamps';

// // Add event listener to the date input element
// dateInput.addEventListener('change', () => {
//   const selectedTimestamps = dateInput.value;
//   const [year, month, day, hour, minute, second] = selectedTimestamps.split(':');
//   const final_date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
//   const givendate = `${year}:${month}:${day}:${hour}:${minute}:${second}`;
//   console.log(givendate)
//   invoke('change_timestamps', { rawDirFilePath: inputFolderPath, givenTime:givendate })
//   .then((res) => {
//     console.log(res)
//   })
//   .catch((err) => {
//     console.error(err)
//   })
// });
const dateInput = document.createElement('input');
dateInput.type = 'text';
dateInput.placeholder = 'yyyy:mm:dd hh:mm:ss';  // Use spaces instead of colons
dateInput.id = 'timestamps';
dateInput.name = 'timestamps';

// Add event listener to the date input element
dateInput.addEventListener('change', () => {
  const selectedTimestamps = dateInput.value.replace(/:/g, ' ');  // Replace colons with spaces
  const [year, month, day, hour, minute, second] = selectedTimestamps.split(' ');
  const final_date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
  const givendate = `${year}:${month}:${day} ${hour}:${minute}:${second}`;
  console.log(givendate)
  invoke('change_timestamps', { rawDirFilePath: inputFolderPath, givenTime:givendate })
  .then((res) => {
    console.log(res)
  })
  .catch((err) => {
    console.error(err)
  })
});


// Add event listener to the changeTimestamps button
document.getElementById('changeTimestamps').addEventListener('click', () => {
  // Append the date input element to the document
  document.body.appendChild(dateInput);
});
//n this version of the code, dateInput is defined before the event listener for the changeTimestamps button. When the button is clicked, the dateInput element is appended to the document, and the change event listener is already in place to handle any changes to the input value.




// document.getElementById('previewCompress').addEventListener('click', () => {
//   invoke('extract_and_compress_jpg_preview', { rawDirFilePath: inputFolderPath,outputFolder: outputFolderPath })
//     .then((res) => {
//       console.log(res)
//     })
//     .catch((err) => {
//       console.error(err)
//     })
// });


document.getElementById('preview').addEventListener('click', () => {
  invoke('extract_jpg_preview', { rawDirFilePath: inputFolderPath,outputFolder: outputFolderPath })
    .then((res) => {
      alert("previews extracted")
      console.log(res)
    })
    .catch((err) => {
      console.error(err)
    })
});

// document.getElementById('preview').addEventListener('click', async () => {
//   console.log(outputFolderPath);
//   const command = Command.sidecar('./exiftool_folder/blib/script/exiftool');
//   const args = ["-a","-b","-W","/Users/vanshikadhingra/output%f","-previewimage","/Users/vanshikadhingra/images/"]
//   const { stdout, stderr } = await command.execute(args, { stdio: ["pipe", "pipe", "pipe"] });
//   const outputElement = document.getElementById('output');
//   outputElement.textContent = `stdout: ${stdout}\nstderr: ${stderr}`;
//   console.log(`stdout: ${stdout}\nstderr: ${stderr}`);
// });
// document.getElementById('preview').addEventListener('click', async () => {  
//   console.log(outputFolderPath);
//   const command = Command.sidecar('./exiftool_folder/blib/script/exiftool',["-a","-b","-W",outputFolderPath,"-previewimage",inputFolderPath]);
//   const outputElement = command.execute()
//   console.log(outputElement)
//   // outputElement.textContent = `stdout: ${stdout}\nstderr: ${stderr}`;
//   // console.log(`stdout: ${stdout}\nstderr: ${stderr}`);
// });

