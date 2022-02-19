var SelectedFile;
var fileReader;
var Name;
var FilesData = new Map();
window.addEventListener("load", Ready);

function Ready(){

    var socket = io();
    if(window.File && window.FileReader){
        document.getElementById('UploadButton').addEventListener('click', function (){
            StartUpload(socket)
        });
        document.getElementById('FileBox').addEventListener('change', function (event){
            FileChosen(event)
        });
        document.getElementById('download').addEventListener('click',function (){
            StartDownload(socket)
        })
    }else{
        document.getElementById('UploadArea').innerHTML = "지원되지 않는 브라우저입니다. 브라우저를 업데이트하거나 IE나 Chrome을 사용하세요.";
    }

    socket.on('MoreDownload', async function (data){
        const blob = new Blob([data.Data], {type: 'application/octert-stream'})

        if(FilesData.has(data.Name)){
            //처음이 아닌 경우
            // console.log(FilesData.get(data.Name));
            FilesData.set(data.Name, [...FilesData.get(data.Name),getURLtoBlob(window.URL.createObjectURL(blob))]);
            if(data.End > data.Final){
                Promise.all(FilesData.get(data.Name)).then(async result => {
                    document.getElementById('download_percent').innerText = '100%';
                    var zip = new JSZip();
                    let newblob = new Blob(result, {type: 'video/mp4'});
                    // let file = new File([newblob],`${data.Name}`,{type: 'video/mp4'})


                    zip.file(`fold/${data.Name}`,newblob);
                    zip.generateAsync({
                        type:"blob",
                        compression: "DEFLATE",
                        streamFiles: true},
                        function updateCallback(metadata) {
                            document.getElementById('zip_percent').innerText = "압축: " + metadata.percent.toFixed(2) + " %"
                            // if(metadata.currentFile) {
                            //     console.log("current file = " + metadata.currentFile);
                            // }
                    }).then(function (blob){
                        console.log(blob)
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a")
                        a.href = url
                        a.download = `folder.zip`
                        a.click()
                        a.remove()
                        window.URL.revokeObjectURL(url);
                        delete FilesData[data.Name];
                    })

                    // const url = window.URL.createObjectURL(newblob);
                    // const a = document.createElement("a")
                    // a.href = url
                    // a.download = `${data.Name}`
                    // document.getElementById('download_percent').innerText = '100%';
                    // a.click()
                    // a.remove()
                    // window.URL.revokeObjectURL(url);
                    // // downloadFile(data)
                    // delete FilesData[data.Name];
                })
            }else{
                data.Data=''
                document.getElementById('download_percent').innerText = Math.floor(data.Start / data.Final * 100) + '%';
                socket.emit('Download',data);
            }
        }else{
            //처음 데이터를 가져왔을 경우
            FilesData.set(data.Name, [getURLtoBlob(window.URL.createObjectURL(blob))]);

            if(data.End > data.Final){
                console.log('finished');
                // downloadFile(data)
                delete FilesData[data.Name];
            }else{
                data.Data='';
                document.getElementById('download_percent').innerText = Math.floor(data.Start / data.Final * 100) + '%';
                socket.emit('Download',data);
            }
        }
    })
}

async function FileChosen(event) {
    SelectedFile = event.target.files[0];
    console.log(SelectedFile)
    document.getElementById('NameBox').value = SelectedFile.name;

    // const massiveFileBuf = await fetch('/aMassiveFile').then(
    //     res => res.arrayBuffer()
    // );
    // const massiveFile = new Uint8Array(massiveFileBuf);
    //
    // const zipped = fflate.zipSync({
    //     // Directories can be nested structures, as in an actual filesystem
    //     'dir1': {
    //         'nested': {
    //             // You can use Unicode in filenames
    //             '你好.txt': fflate.strToU8('Hey there!')
    //         },
    //         // You can also manually write out a directory path
    //         'other/tmp.txt': SelectedFile
    //     },
    //
    // }, {
    //     // These options are the defaults for all files, but file-specific
    //     // options take precedence.
    //     level: 1,
    //     // Obfuscate last modified time by default
    //     mtime: new Date()
    // });
    // console.log(zipped)
}

function StartDownload(socket){
    socket.emit('Download',{'Name': '700mb.mp4', 'Start': 0 , 'End': 1, 'Final': 74 })
}

function StartUpload(socket){
    var size = 0;
    var stream = ss.createStream();
    ss(socket).emit('uploading', stream,{name: SelectedFile.name ,size: SelectedFile.size})
    var blobStream = ss.createBlobReadStream(SelectedFile);

    blobStream.on('data', function(chunk) {
        console.log(chunk)
        size += chunk.length;
        // console.log(Math.floor(size / SelectedFile.size * 100) + '%');
        // -> e.g. '42%'
        document.getElementById('percent').innerText = Math.floor(size / SelectedFile.size * 100) + '%';
    });

    blobStream.pipe(stream);
}

function getURLtoBlob(url){
    return new Promise(async resolve => {
        await fetch(url).then(async r => {
            let blob = await r.blob();
            window.URL.revokeObjectURL(url);
            resolve(blob);
        })
    })
}

function UpdateBar(percent){
    document.getElementById('percent').innerHTML = (Math.round(percent*100)/100) + '%';
    let MBDone = Math.round(((percent/100.0) * SelectedFile.size) / 1048576);
    document.getElementById('MB').innerHTML = String(MBDone);
}
