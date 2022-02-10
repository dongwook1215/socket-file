var SelectedFile;
var fileReader;
var Name;
var FilesData = new Map();
window.addEventListener("load", Ready);

function Ready(){
    if(window.File && window.FileReader){
        document.getElementById('UploadButton').addEventListener('click', function (){
            // StartUpload(socket)
        });
        document.getElementById('FileBox').addEventListener('change', FileChosen);
        document.getElementById('download').addEventListener('click',function (){
            // StartDownload(socket)
        })
    }else{
        document.getElementById('UploadArea').innerHTML = "지원되지 않는 브라우저입니다. 브라우저를 업데이트하거나 IE나 Chrome을 사용하세요.";
    }
}
// function Ready(){
//     var socket = io()
//     if(window.File && window.FileReader){
//         document.getElementById('UploadButton').addEventListener('click', function (){
//             StartUpload(socket)
//         });
//         document.getElementById('FileBox').addEventListener('change', FileChosen);
//         document.getElementById('download').addEventListener('click',function (){
//             StartDownload(socket)
//         })
//     }else{
//         document.getElementById('UploadArea').innerHTML = "지원되지 않는 브라우저입니다. 브라우저를 업데이트하거나 IE나 Chrome을 사용하세요.";
//     }
//
//     //explorer에서는 readAsBinaryString을 지원하지 않음 따라서 아래 prototype을 변경하는 코드가 필요
//     if (!FileReader.prototype.readAsBinaryString) {
//         FileReader.prototype.readAsBinaryString = function (fileData) {
//             let binary = "";
//             let pt = this;
//             let reader = new FileReader();
//             reader.onload = function (e) {
//                 let bytes = new Uint8Array(reader.result);
//                 let length = bytes.byteLength;
//                 for (let i = 0; i < length; i++) {
//                     binary += String.fromCharCode(bytes[i]);
//                 }
//                 //pt.result - readonly so assign binary
//                 pt.content = binary;
//                 pt.onload();
//             }
//             reader.readAsArrayBuffer(fileData);
//         }
//     }
//
//     socket.on('MoreData', function (data){
//         UpdateBar(data.Percent);
//         if(data.Percent < 100){
//             let Place = data.Place * 524288;
//             let NewFile = '';
//             if(SelectedFile.webkitSlice){
//                 NewFile = SelectedFile.webkitSlice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
//             } else{
//                 NewFile = SelectedFile.slice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
//             }
//             console.log(NewFile);
//             fileReader.readAsArrayBuffer(NewFile);
//         }
//     });
//     socket.on('MoreDownload', function (data){
//         let original_data
//         if(FilesData.has(data.Name)){
//             original_data = FilesData.get(data.Name);
//         }
//         appendBuffer(original_data,data.Data).then(uint8array => {
//             data.Data =[];
//             FilesData.set(data.Name, uint8array);
//             console.log(FilesData);
//             if(data.Place === data.Size){
//                 console.log('finished');
//                 // downloadFile(data)
//             }else{
//                 socket.emit('Download',data)
//             }
//         })
//
//         // FilesData.has(data.Name) ? FilesData.set(data.Name, [...FilesData.get(data.Name),data.Data]) : FilesData.set(data.Name, [data.Data])
//         // data.Data =[];
//         // console.log(data.Place);
//         // if(data.Place === data.Size){
//         //     downloadFile(data)
//         // }else{
//         //     socket.emit('Download',data)
//         // }
//
//         // if(FilesData.has(data.Name)){
//         //     appendBuffer(FilesData.get(data.Name), data.Data).then(arrayBuffer => {
//         //         FilesData.set(data.Name, arrayBuffer)
//         //         data.Data =[];
//         //         console.log(FilesData);
//         //         if(data.Place === data.Size){
//         //             downloadFile(data)
//         //         }else{
//         //             socket.emit('Download',data)
//         //         }
//         //     })
//         // }else{
//         //     FilesData.set(data.Name, data.Data)
//         //     data.Data =[];
//         //     console.log(FilesData);
//         //     if(data.Place === data.Size){
//         //         downloadFile(data)
//         //     }else{
//         //         socket.emit('Download',data)
//         //     }
//         // }
//     })
// }

function FileChosen(event) {
    var socket = io();

    SelectedFile = event.target.files[0];
    document.getElementById('NameBox').value = SelectedFile.name;

    var size = 0;
    var stream = ss.createStream();
    ss(socket).emit('uploading', stream,{name: SelectedFile.name})
    var blobStream = ss.createBlobReadStream(SelectedFile);

    blobStream.on('data', function(chunk) {
        console.log(chunk)
        size += chunk.length;
        console.log(Math.floor(size / SelectedFile.size * 100) + '%');
        // -> e.g. '42%'
    });

    blobStream.pipe(stream);
}

// function StartUpload(socket){
//     if(document.getElementById('FileBox').value != "") {
//         fileReader = new FileReader();
//         Name = document.getElementById('NameBox').value;
//         var Content = "<span id='NameArea'>Uploading " + SelectedFile.name + " as " + Name + "</span>";
//         Content += "<span id='Uploaded'> - <span id='MB'>0</span>/" + Math.round(SelectedFile.size / 1048576) + "MB</span>";
//         document.getElementById('UploadArea').innerHTML = Content;
//         fileReader.onload = function(event){
//             if(!event){
//                 var data = fileReader.content;
//             }else{
//                 var data = event.target.result;
//             }
//             socket.emit('Upload', { 'Name' : Name, 'Data': data });
//         }
//         socket.emit('Start', { 'Name' : Name, 'Size' : SelectedFile.size });
//     }else{
//         alert("Please Select A File");
//     }
// }
//
// function UpdateBar(percent){
//     document.getElementById('percent').innerHTML = (Math.round(percent*100)/100) + '%';
//     let MBDone = Math.round(((percent/100.0) * SelectedFile.size) / 1048576);
//     document.getElementById('MB').innerHTML = String(MBDone);
// }
//
// function StartDownload(socket){
//     socket.emit('Download',{'Name': '5g.mov', 'Place': 0 , 'Size': 476 , 'Data': []})
// }
//
// function downloadFile(data){
//     const blob = new Blob(FilesData.get(data.Name), {type: 'text/plain'})
//     const url = window.URL.createObjectURL(blob)
//     const a = document.createElement("a")
//     a.href = url
//     a.download = `${data.Name}`
//     a.click()
//     a.remove()
//     window.URL.revokeObjectURL(url);
//     FilesData.delete(data.Name);
// }
//
// function appendBuffer(buffer1, buffer2) {
//     return new Promise(resolve => {
//         let tmp;
//         if(buffer1){
//             tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
//             console.log(tmp);
//             tmp.set(new Uint8Array(buffer1), 0);
//             tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
//         }else{
//             tmp = new Uint8Array(buffer2.byteLength);
//             tmp.set(new Uint8Array(buffer2), 0);
//         }
//         resolve(tmp);
//     })
// };
