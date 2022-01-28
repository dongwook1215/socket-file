var SelectedFile;
var fileReader;
var Name;
window.addEventListener("load", Ready);
function Ready(){
    var socket = io()
    if(window.File && window.FileReader){
        document.getElementById('UploadButton').addEventListener('click', function (){
            StartUpload(socket)
        });
        document.getElementById('FileBox').addEventListener('change', FileChosen);
    }else{
        document.getElementById('UploadArea').innerHTML = "지원되지 않는 브라우저입니다. 브라우저를 업데이트하거나 IE나 Chrome을 사용하세요.";
    }

    //explorer에서는 readAsBinaryString을 지원하지 않음 따라서 아래 prototype을 변경하는 코드가 필요
    if (!FileReader.prototype.readAsBinaryString) {
        FileReader.prototype.readAsBinaryString = function (fileData) {
            let binary = "";
            let pt = this;
            let reader = new FileReader();
            reader.onload = function (e) {
                let bytes = new Uint8Array(reader.result);
                let length = bytes.byteLength;
                for (let i = 0; i < length; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                //pt.result - readonly so assign binary
                pt.content = binary;
                pt.onload();
            }
            reader.readAsArrayBuffer(fileData);
        }
    }
    socket.on('MoreData', function (data){
        UpdateBar(data.Percent);
        let Place = data.Place * 524288;
        let NewFile = '';
        if(SelectedFile.webkitSlice)
            NewFile = SelectedFile.webkitSlice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
        else
            NewFile = SelectedFile.slice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
        fileReader.readAsBinaryString(NewFile);
    });
}

function FileChosen(event) {
    SelectedFile = event.target.files[0];
    document.getElementById('NameBox').value = SelectedFile.name;
}

function StartUpload(socket){
    if(document.getElementById('FileBox').value != "") {
        fileReader = new FileReader();
        console.log(SelectedFile.type);
        Name = document.getElementById('NameBox').value;
        var Content = "<span id='NameArea'>Uploading " + SelectedFile.name + " as " + Name + "</span>";
        Content += "<span id='Uploaded'> - <span id='MB'>0</span>/" + Math.round(SelectedFile.size / 1048576) + "MB</span>";
        document.getElementById('UploadArea').innerHTML = Content;
        fileReader.onload = function(event){
            if(!event){
                var data = fileReader.content;
            }else{
                var data = event.target.result;
            }
            socket.emit('Upload', { 'Name' : Name, Data : data });
        }
        socket.emit('Start', { 'Name' : Name, 'Size' : SelectedFile.size });
    }else{
        alert("Please Select A File");
    }
}

function UpdateBar(percent){
    document.getElementById('percent').innerHTML = (Math.round(percent*100)/100) + '%';
    let MBDone = Math.round(((percent/100.0) * SelectedFile.size) / 1048576);
    document.getElementById('MB').innerHTML = String(MBDone);
}
