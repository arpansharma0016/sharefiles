var usr = ""
var iid, con
var st = window.localStorage
var cancelsend = false
var cancelrecieve = false
var whois
var dontsendthefile = false
var extravar = true
var unseenmessages = true

let localstream
let configuration = [{
    iceServers: {
        "urls": ["stun:stun.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
            "stun:stun1.l.google.com:19302"
        ]
    },
}]


function inputfile(typ) {
    if (typ == "all") {
        document.getElementById('fileinput').click()
    } else if (typ == "image") {
        document.getElementById('imageinput').click()
    } else if (typ == "audio") {
        document.getElementById('audioinput').click()
    } else if (typ == "video") {
        document.getElementById('videoinput').click()
    } else if (typ == "doc") {
        document.getElementById('docinput').click()
    }
}

function showlocalstorage() {
    if (st.length == 0) {
        document.getElementById('recentfilestable').innerHTML = `<h2 class="download-text-header">No recent file sharing history</h2>`
        document.getElementById('clearst').innerText = ''
    } else {
        document.getElementById('clearst').innerText = 'Clear'
        document.getElementById('recentfilestable').innerHTML = `
        <div class="files-table-header">
                        <div class="column-header table-cell">Name</div>
                        <div class="column-header table-cell size-cell">Size</div>
                        <div class="column-header table-cell">Last Modified</div>
                        <div class="column-header table-cell">Action</div>
                    </div>
                    `
        for (var i = st.length - 1; i >= 0; i--) {
            item = JSON.parse(st.getItem(`sharedfiles${i}`))
            if (item) {
                act = ''
                if (item.action == "rec") {
                    act = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down-circle" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
                    </svg>
                    `
                } else if (item.action == "sen") {
                    act = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up-circle" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z"/>
                    </svg>
                    `
                }
                document.getElementById('recentfilestable').innerHTML += `
                <div class="files-table-row">
                    <div class="table-cell name-cell">${item.name}</div>
                    <div class="table-cell">${item.size}</div>
                    <div class="table-cell">${item.date}</div>
                    <div class="table-cell action-cell">
                        ${act}
                    </div>
                </div>
                `
            }
        }
    }
}

showlocalstorage()


let lc
let dc

const BYTES_PER_CHUNK = 1200;
var file;
var currentChunk;
let fileReader = new FileReader();

var incomingFileInfo;
var incomingFileData;
var bytesReceived;
var downloadInProgress = false;

function readNextChunk() {
    var start = BYTES_PER_CHUNK * currentChunk;
    var end = Math.min(file.size, start + BYTES_PER_CHUNK);
    fileReader.readAsArrayBuffer(file.slice(start, end));
    fileReader.onload = function() {
        if (document.getElementById('sendprogress')) {
            document.getElementById('sendprogress').setAttribute("style", `width: ${((BYTES_PER_CHUNK * currentChunk) / file.size) * 100}%;`)
        }
        if (usr == "cre") {
            dc.send(fileReader.result);
        } else if (usr == "rec") {
            lc.dc.send(fileReader.result);
        }
        currentChunk++;

        if (BYTES_PER_CHUNK * currentChunk < file.size) {
            if (!cancelsend) {
                if (dontsendthefile) {
                    document.getElementById('myconnarea').innerHTML = `
                    <div class="download-item-line">
                        <div class="download-area" style="display:flex;">
                            <div class="download-item-texts" style="width: 90%;">
                                <p class="download-text-header">Cancelled by the reciever</p>
                                </div>
                        </div>
                        </div>
                    `
                    dontsendthefile = false
                    document.getElementById('fileinput').value = ''
                    document.getElementById('imageinput').value = ''
                    document.getElementById('audioinput').value = ''
                    document.getElementById('videoinput').value = ''
                    document.getElementById('docinput').value = ''
                    restoreallinputs()
                } else {
                    readNextChunk();
                }
            } else {
                document.getElementById('myconnarea').innerHTML = ''
                document.getElementById('fileinput').value = ''
                document.getElementById('imageinput').value = ''
                document.getElementById('audioinput').value = ''
                document.getElementById('videoinput').value = ''
                document.getElementById('docinput').value = ''
                cancelsend = false
                restoreallinputs()
                if (usr == "cre") {
                    dc.send(JSON.stringify({
                        category: 'notification',
                        message: 'not'
                    }))
                } else if (usr == "rec") {
                    lc.dc.send(JSON.stringify({
                        category: 'notification',
                        message: 'not'
                    }))
                }
            }
        } else {
            document.getElementById('myconnarea').innerHTML = ''
            document.getElementById('fileinput').value = ''
            document.getElementById('imageinput').value = ''
            document.getElementById('audioinput').value = ''
            document.getElementById('videoinput').value = ''
            document.getElementById('docinput').value = ''
            ss = getfilesize(file.size)
            var today = new Date();
            var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
            var time = today.getHours() + ":" + today.getMinutes();
            var dateTime = date + ' ' + time;
            st.setItem(`sharedfiles${st.length}`, JSON.stringify({
                'name': file.name,
                'size': ss,
                'date': dateTime,
                'action': "sen"
            }))
            restoreallinputs()
            showlocalstorage()
        }
    };
}


var it = 0

function sendthefile(typ) {
    let fi
    if (typ == 'all') {
        fi = $('#fileinput');
    } else if (typ == 'image') {
        fi = $('#imageinput');
    } else if (typ == 'audio') {
        fi = $('#audioinput');
    } else if (typ == 'video') {
        fi = $('#videoinput');
    } else if (typ == 'doc') {
        fi = $('#docinput');
    }
    file = fi[0].files[0];
    fileReader = new FileReader();
    if (file) {
        currentChunk = 0;
        if (usr == "cre") {
            dc.send(JSON.stringify({
                category: 'file',
                name: file.name,
                size: file.size
            }));
        } else if (usr == "rec") {
            lc.dc.send(JSON.stringify({
                category: 'file',
                name: file.name,
                size: file.size
            }));
        }
        document.getElementById('myconnarea').innerHTML = `
            <div class="download-item-line">
                            <div class="download-area" style="display:flex;">
                                <div class="download-item-texts" style="width: 90%;">
                                    <p class="download-text-header">${file.name}</p>
                                    <p class="download-text-info">${getfilesize(file.size)}</p>
                                    <div class="progress-bar" id="sendpregressbar">
                                        <span class="progress" id="sendprogress"></span>
                                    </div>
                                    </div>
                                    <svg onclick="canceltransfer()" id="cancelsendbutton" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                    </svg>
                            </div>
                            </div>
            `
        whois = 'yes'
        finishallinputs()
        readNextChunk();
    }
}

function startDownload(data) {
    if (typeof data == "string") {
        incomingFileInfo = JSON.parse(data.toString());
        incomingFileData = [];
        bytesReceived = 0;
        downloadInProgress = true;
        document.getElementById('incommingidarea').innerHTML = `
    <div class="download-item-line">
        <div class="download-area">
            <div class="download-item-texts" style="width: 90%;">
                <p class="download-text-header">${incomingFileInfo.name}</p>
                <p class="download-text-info">${getfilesize(incomingFileInfo.size)}</p>
                <div class="progress-bar">
                    <span class="progress" id="incommingid"></span>
                </div>
            </div>
            <svg onclick="canceltransf()" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
        </div>
    </div>
    `
        whois = 'no'
    }
}

function progressDownload(data) {
    bytesReceived += data.byteLength;
    incomingFileData.push(data);
    // console.log('progress: ' + ((bytesReceived / incomingFileInfo.size) * 100).toFixed(2) + '%');
    if (document.getElementById('incommingid')) {
        document.getElementById('incommingid').setAttribute("style", `width: ${((bytesReceived / incomingFileInfo.size) * 100)}%;`)
    }
    if (bytesReceived === incomingFileInfo.size) {
        endDownload();
    }
}

function endDownload() {
    downloadInProgress = false;
    var blob = new window.Blob(incomingFileData);
    var anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = incomingFileInfo.name;
    anchor.textContent = 'XXXXXXX';

    ss = getfilesize(incomingFileInfo.size)
    var today = new Date();
    var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
    var time = today.getHours() + ":" + today.getMinutes();
    var dateTime = date + ' ' + time;
    st.setItem(`sharedfiles${st.length}`, JSON.stringify({
        'name': incomingFileInfo.name,
        'size': ss,
        'date': dateTime,
        'action': "rec"
    }))

    showlocalstorage()

    if (anchor.click) {
        anchor.click();
    } else {
        var evt = document.createEvent('MouseEvents');
        evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        anchor.dispatchEvent(evt);
    }
    document.getElementById('incommingidarea').innerHTML = '<h2 class="download-text-header">No pending downloads</h2>'
}


function refresh() {
    url = "/create_id"
    closefileinputsection()
    restoreallinputs()
    document.getElementById('incommingidarea').innerHTML = '<h2 class="download-text-header">No pending downloads</h2>'
    document.getElementById('chatmessages').innerHTML = ''
    document.getElementById('myconnarea').innerHTML = `
    <div class="download-item-line">
        <div class="line-header">My Connection ID</div>
        <div class="download-area">
        <span class="spinner" style="margin-top: 1vh; margin-left: 1vw;"></span>
            <div class="download-item-texts" style="display: flex; width: 100%; margin-left: 1vw;">
                <h1 class="download-text-header" id="myconn">Generating Connection ID...</h1>
            </div>
        </div>
    </div>
    `
    $.get(url, function(response) {
        if (response.status == "success") {
            lc = new RTCPeerConnection(configuration)
            usr = ""
            createoffer(response.id)
            iid = response.id
        } else {
            document.getElementById('myconnarea').innerHTML = `
            <div class="download-item-line">
            <div class="line-header">My Connection ID</div>
            <div class="download-area">
                <div class="download-item-icon" id="refreshconn" onclick="refresh()" style="padding-top: 1vh; padding-left: 1vw;">
                    <svg xmlns="http://www.w3.org/2000/svg" style="cursor: pointer;" width="24" height="24" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                      </svg>
                </div>
                <div class="download-item-texts" style="display: flex; width: 100%; margin-left: 1vw;">
                    <h1 class="download-text-header" id="myconn">Something went wrong... Try again </h1>
                </div>
            </div>
        </div>
        `
        }
    })
}

refresh()


function createoffer(id) {
    dc = lc.createDataChannel(`${id}`)
    dc.onmessage = e => {
        if (!cancelrecieve) {
            if (typeof e.data == 'string') {
                dat = JSON.parse(e.data)
                if (dat.category == 'file') {
                    startDownload(e.data);
                } else if (dat.category == 'notification') {
                    if (dat.message == "no") {
                        dontsendthefile = true
                    } else if (dat.message == "not") {
                        document.getElementById('incommingidarea').innerHTML = `
                    <div class="download-item-line">
                        <div class="download-area">
                            <div class="download-item-texts" style="width: 90%;">
                                <p class="download-text-header">Cancelled by the sender</p>
                            </div>
                        </div>
                    </div>
                    `
                        downloadInProgress = false
                        restoreallinputs()
                    }
                } else if (dat.category == "message") {
                    if (dat.type == "typing") {
                        if (typeof interv != 'undefined') {
                            clearInterval(interv)
                        }
                        document.getElementById('typingnotify').innerText = 'typing...'
                        interv = setInterval(() => {
                            document.getElementById('typingnotify').innerText = ''
                        }, 2000)
                    } else if (dat.type == "message") {
                        document.getElementById('chatmessages').innerHTML += `
                    <li>
                        <div class="chat__bubble chat__bubble--you">
                            ${dat.message}
                        </div>
                    </li>
                    `
                        unseenmessages = true
                        unseennotify()
                    }
                }
                updateScroll()
            } else {
                if (downloadInProgress === false) {
                    if (!extravar) {
                        extravar = true
                        progressDownload(e.data);
                    } else {
                        startDownload(e.data);
                    }
                } else {
                    progressDownload(e.data);
                }
            }
        } else {
            document.getElementById('incommingidarea').innerHTML = '<h2 class="download-text-header">No pending downloads</h2>'
            cancelrecieve = false
            downloadInProgress = false
            extravar = false
            restoreallinputs()
            dontsend()
        }
    }
    dc.onopen = e => {
        document.getElementById('myconnarea').innerHTML = ""
        document.getElementById('searchLine').innerHTML = `
        <h2 class="download-text-header">Connected to ${id}</h2>
        <svg onclick="reff()" xmlns="http://www.w3.org/2000/svg" style="cursor: pointer;" width="24" height="24" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
        `
        con = true
        makefileinputsection()
    }
    dc.onclose = e => {
        document.getElementById('searchLine').innerHTML = `
        <input class="search-input" type="text" placeholder="Connection ID" id="connectionid" onkeyup="checkenter(event)">
        <svg onclick="getoffer()" id="addconnection" xmlns="http://www.w3.org/2000/svg" style="cursor: pointer;" width="24" height="24" fill="currentColor" class="bi bi-person-plus" viewBox="0 0 16 16">
            <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
            <path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"/>
          </svg>
          `
        con = false
        refresh()
        closefileinputsection()
    }

    i = 0
    lc.onicecandidate = e => {
        i += 1
        if (i == 1) {
            create(id, JSON.stringify(lc.localDescription))
        }
    }

    lc.createOffer().then(o => lc.setLocalDescription(o))
    usr = "cre"
}


function create(id, offer) {
    url = "/create"
    data = { 'id': id, 'offer': offer }
    $.ajax({
        'type': 'post',
        'url': url,
        'data': JSON.stringify(data),
        'success': function(response) {
            if (response.status == "success") {
                document.getElementById('myconnarea').innerHTML = `
                <div class="download-item-line">
                    <div class="line-header">My Connection ID</div>
                    <div class="download-area">
                        <div class="download-item-icon" id="refreshconn" onclick="refresh()" style="padding-top: 1vh; padding-left: 1vw;">
                            <svg xmlns="http://www.w3.org/2000/svg" style="cursor: pointer;" width="24" height="24" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                              </svg>
                        </div>
                        <div class="download-item-texts" style="display: flex; width: 100%; margin-left: 1vw;">
                            <h1 class="download-text-header" id="myconn">${response.id}</h1>
                        </div>
                    </div>
                </div>
                `
                justcheck(response.id)
            } else {
                document.getElementById('myconnarea').innerHTML = `
                <div class="download-item-line">
                <div class="line-header">My Connection ID</div>
                <div class="download-area">
                    <div class="download-item-icon" id="refreshconn" onclick="refresh()" style="padding-top: 1vh; padding-left: 1vw;">
                        <svg xmlns="http://www.w3.org/2000/svg" style="cursor: pointer;" width="24" height="24" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                          </svg>
                    </div>
                    <div class="download-item-texts" style="display: flex; width: 100%; margin-left: 1vw;">
                        <h1 class="download-text-header" id="myconn">Something went wrong... Try again</h1>
                    </div>
                </div>
            </div>
            `
            }
        },
        'error': function(error) {
            console.log(error)
        }
    })
}


function justcheck(id) {
    url = `/check_answer-${id}`
    $.get(url, function(response) {
        if (response.status == "success") {
            if (response.found == "yes") {
                storeanswer(response.answer)
            } else if (response.found == "no") {
                if (!con) {
                    setTimeout(() => {
                        justcheck(id)
                    }, 2000)
                }
            }
        } else {

            document.getElementById('myconnarea').innerHTML = `
            <div class="download-item-line">
            <div class="line-header">My Connection ID</div>
            <div class="download-area">
                <div class="download-item-icon" id="refreshconn" onclick="reff()" style="padding-top: 1vh; padding-left: 1vw;">
                    <svg xmlns="http://www.w3.org/2000/svg" style="cursor: pointer;" width="24" height="24" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                      </svg>
                </div>
                <div class="download-item-texts" style="display: flex; width: 100%; margin-left: 1vw;">
                    <h1 class="download-text-header" id="myconn">Something went wrong... Try again</h1>
                </div>
            </div>
        </div>
        `
        }
    })
}


function storeanswer(answer) {
    lc.setRemoteDescription(JSON.parse(answer))
}



function storeoffer(id, offer) {
    i = 0
    lc.onicecandidate = e => {
        i += 1
        if (i == 1) {
            answer(id, JSON.stringify(lc.localDescription))
        }
    }
    lc.ondatachannel = e => {
        lc.dc = e.channel
        lc.dc.onmessage = e => {
            if (!cancelrecieve) {
                if (typeof e.data == 'string') {
                    dat = JSON.parse(e.data)
                    if (dat.category == 'file') {
                        startDownload(e.data);
                    } else if (dat.category == 'notification') {
                        if (dat.message == "no") {
                            dontsendthefile = true
                        } else if (dat.message == "not") {
                            document.getElementById('incommingidarea').innerHTML = `
                            <div class="download-item-line">
                                <div class="download-area">
                                    <div class="download-item-texts" style="width: 90%;">
                                        <p class="download-text-header">Cancelled by the sender</p>
                                    </div>
                                </div>
                            </div>
                            `
                            downloadInProgress = false
                            restoreallinputs()
                        }
                    } else if (dat.category == "message") {
                        if (dat.type == "typing") {
                            if (typeof interv != 'undefined') {
                                clearInterval(interv)
                            }
                            document.getElementById('typingnotify').innerText = 'typing...'
                            interv = setInterval(() => {
                                document.getElementById('typingnotify').innerText = ''
                            }, 2000)
                        } else if (dat.type == "message") {
                            document.getElementById('chatmessages').innerHTML += `
                            <li>
                                <div class="chat__bubble chat__bubble--you">
                                    ${dat.message}
                                </div>
                            </li>
                            `
                            unseenmessages = true
                            unseennotify()
                        }
                    }
                    updateScroll()
                } else {
                    if (downloadInProgress === false) {
                        if (!extravar) {
                            extravar = true
                            progressDownload(e.data);
                        } else {
                            startDownload(e.data);
                        }
                    } else {
                        progressDownload(e.data);
                    }
                }
            } else {
                document.getElementById('incommingidarea').innerHTML = '<h2 class="download-text-header">No pending downloads</h2>'
                cancelrecieve = false
                downloadInProgress = false
                restoreallinputs()
                extravar = false
                dontsend()
            }
        }
        lc.dc.onopen = e => {
            document.getElementById('myconnarea').innerHTML = ""
            document.getElementById('searchLine').innerHTML = `
            <h2 class="download-text-header">Connected to ${id}</h2>
            <svg onclick="reff()" xmlns="http://www.w3.org/2000/svg" style="cursor: pointer;" width="24" height="24" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
            `
            con = true
            makefileinputsection()
        }
        lc.dc.onclose = e => {
            document.getElementById('searchLine').innerHTML = `
            <input class="search-input" type="text" placeholder="Connection ID" id="connectionid" onkeyup="checkenter(event)">
            <svg onclick="getoffer()" id="addconnection" xmlns="http://www.w3.org/2000/svg" style="cursor: pointer;" width="24" height="24" fill="currentColor" class="bi bi-person-plus" viewBox="0 0 16 16">
                <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                <path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"/>
              </svg>
              `
            con = false
            refresh()
            closefileinputsection()
        }
    }
    lc.setRemoteDescription(JSON.parse(offer))
    lc.createAnswer().then(a => lc.setLocalDescription(a))
    usr = "rec"
}


function getoffer() {
    idd = document.getElementById('connectionid').value.trim()
    if (idd != "" && idd != iid) {
        document.getElementById('searchLine').innerHTML = `
        <h2 class="download-text-header">Connecting to ${idd}</h2>
        <span class="spinner"></span>
        `
        url = `/get_offer-${idd}`
        $.get(url, function(response) {
            if (response.status == "success") {
                storeoffer(response.id, response.offer)
            } else if (response.status == "fail") {
                document.getElementById('searchLine').innerHTML = `
                <input class="search-input" type="text" placeholder="Connection ID" id="connectionid" onkeyup="checkenter(event)">
                <svg onclick="getoffer()" xmlns="http://www.w3.org/2000/svg" style="cursor: pointer;" width="24" height="24" fill="currentColor" class="bi bi-person-plus" viewBox="0 0 16 16">
                    <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                    <path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"/>
                  </svg>
                  `
            }
        })
    }
}



function answer(id, answer) {
    url = "/answer"
    data = { 'id': id, 'answer': answer }
    $.ajax({
        'type': 'post',
        'url': url,
        'data': JSON.stringify(data),
        'success': function(response) {
            if (response.status == "fail") {
                document.getElementById('searchLine').innerHTML = `
                <input class="search-input" type="text" placeholder="Connection ID" id="connectionid">
                <svg onclick="getoffer()" xmlns="http://www.w3.org/2000/svg" style="cursor: pointer;" width="24" height="24" fill="currentColor" class="bi bi-person-plus" viewBox="0 0 16 16">
                    <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                    <path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"/>
                  </svg>
                  `
            }
        },
        'error': function(error) {
            console.log(error)
        }
    })
}

function reff() {
    lc.close()
    refresh()
}

function makefileinputsection() {
    document.getElementById('fileinputsection').innerHTML = `
    <h1 class="section-header">Quick Access</h1>
    <div class="access-links">
        <div class="access-link-wrapper">
            <div class="access-icon" onclick="inputfile('image')">
                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-image">
  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
  <circle cx="8.5" cy="8.5" r="1.5"/>
  <polyline points="21 15 16 10 5 21"/>
</svg>
            </div>
            <span class="access-text">Images</span>
        </div>
        <div class="access-link-wrapper">
            <div class="access-icon" onclick="inputfile('audio')">
                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-music">
  <path d="M9 18V5l12-2v13"/>
  <circle cx="6" cy="18" r="3"/>                   <circle cx="18" cy="16" r="3"/>
</svg>
            </div>
            <span class="access-text">Music</span>
        </div>
        <div class="access-link-wrapper">
            <div class="access-icon" onclick="inputfile('video')">
                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-play">
  <polygon points="5 3 19 12 5 21 5 3"/>
</svg>
            </div>
            <span class="access-text">Video</span>
        </div>
        <div class="access-link-wrapper">
            <div class="access-icon" onclick="inputfile('doc')">
                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-align-left">
  <line x1="17" y1="10" x2="3" y2="10"/>
  <line x1="21" y1="6" x2="3" y2="6"/>
  <line x1="21" y1="14" x2="3" y2="14"/>
  <line x1="17" y1="18" x2="3" y2="18"/>
</svg>
            </div>
            <span class="access-text">Docs</span>
        </div>
        <div class="access-link-wrapper">
            <div class="access-icon" onclick="inputfile('all')">
                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-layers">
  <polygon points="12 2 2 7 12 12 22 7 12 2"/>
  <polyline points="2 17 12 22 22 17"/>
  <polyline points="2 12 12 17 22 12"/>
</svg>
            </div>
            <span class="access-text">All Files</span>
        </div>
        <div class="access-link-wrapper">
        <div class="access-icon" onclick="chatsection()" id="unseenbackground">
            <a class="site-menu-toggle js-menu-toggle d-inline-block" data-toggle="collapse" data-target="#main-navbar" id="unseenchat">
            <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" fill="currentColor" class="bi bi-chat" viewBox="0 0 16 16">
            <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
          </svg>
          </a>
            </div>
            <span class="access-text" id="chatwritten">Chat</span>
        </div>
    </div>
    `
}

function closefileinputsection() {
    document.getElementById('fileinputsection').innerHTML = ''
}

function getfilesize(f) {
    if (f < 1024) {
        return `${f} B`
    } else if (f >= 1024 && (f / 1024) < 1024) {
        return `${(f / 1024).toFixed(1)} KB`
    } else if (f >= 1024 && (f / 1024) > 1024 && ((f / 1024) / 1024) < 1024) {
        return `${((f / 1024) / 1024).toFixed(1)} MB`
    } else if (f >= 1024 && (f / 1024) > 1024 && ((f / 1024) / 1024) > 1024) {
        return `${(((f / 1024) / 1024) / 1024).toFixed(2)} GB`
    } else {
        return '0 B'
    }
}

function clearst() {
    st.clear()
    showlocalstorage()
}

function canceltransf() {
    cancelrecieve = true
}

function dontsend() {
    if (usr == "cre") {
        dc.send(JSON.stringify({
            category: 'notification',
            message: 'no'
        }))
    } else if (usr == "rec") {
        lc.dc.send(JSON.stringify({
            category: 'notification',
            message: 'no'
        }))
    }
}


function canceltransfer() {
    cancelsend = true
}

function checkenter(e) {
    var key = e.keyCode || e.which;
    if (key == 13) {
        if (document.getElementById('addconnection')) {
            $('#addconnection').click()
        }
    }
}

function chatsection() {
    document.getElementById('modal-container').classList.add('show-modal')
    unseenmessages = false
}

function messagecheckenter(e) {
    var key = e.keyCode || e.which;

    if (key == 13) {
        sendmessage()
    }

    mess = {
        category: 'message',
        type: "typing",
    }
    if (usr == "cre") {
        dc.send(JSON.stringify(mess))
    } else if (usr == "rec") {
        lc.dc.send(JSON.stringify(mess))
    }

}

function sendmessage() {
    message = document.getElementById('message').value.trim()
    if (message != '') {
        message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;')

        mess = {
            category: 'message',
            type: "message",
            message: message,
        }

        document.getElementById('chatmessages').innerHTML += `
        <li>
            <div class="chat__bubble chat__bubble--me">
                ${message}
            </div>
        </li>
        `
        updateScroll()
        document.getElementById('message').value = ''
        if (usr == "cre") {
            dc.send(JSON.stringify(mess))
        } else if (usr == "rec") {
            lc.dc.send(JSON.stringify(mess))
        }
    }
}

function updateScroll() {
    var element = document.getElementById("poiuytrewq");
    element.scrollTop = element.scrollHeight;
}

const closeBtn = document.querySelectorAll('.close-modal')

function closeModal() {
    const modalContainer = document.getElementById('modal-container')
    modalContainer.classList.remove('show-modal')
    unseenmessages = false
    unseennotify()
}
closeBtn.forEach(c => c.addEventListener('click', closeModal))

function unseennotify() {
    if (unseenmessages) {
        if (document.getElementById('unseenchat')) {
            document.getElementById('unseenchat').innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" fill="currentColor" class="bi bi-chat-square-dots" viewBox="0 0 16 16">
            <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2.5a2 2 0 0 0-1.6.8L8 14.333 6.1 11.8a2 2 0 0 0-1.6-.8H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2.5a1 1 0 0 1 .8.4l1.9 2.533a1 1 0 0 0 1.6 0l1.9-2.533a1 1 0 0 1 .8-.4H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
            <path d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
            </svg>
            `
            document.getElementById('chatwritten').innerText = 'Unseen Chats'
            document.getElementById('unseenbackground').setAttribute('style', 'background-color: orange;')
        }
    } else {
        if (document.getElementById('unseenchat')) {
            document.getElementById('unseenchat').innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" fill="currentColor" class="bi bi-chat" viewBox="0 0 16 16">
            <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
          </svg>
          `
            document.getElementById('chatwritten').innerText = 'Chat'
            document.getElementById('unseenbackground').setAttribute('style', 'background-color: #343679;')
        }
    }
}

function finishallinputs() {
    document.getElementById('fileinput').setAttribute('onchange', 'transferalreadyinprogress()')
    document.getElementById('imageinput').setAttribute('onchange', 'transferalreadyinprogress()')
    document.getElementById('videoinput').setAttribute('onchange', 'transferalreadyinprogress()')
    document.getElementById('audioinput').setAttribute('onchange', 'transferalreadyinprogress()')
    document.getElementById('docinput').setAttribute('onchange', 'transferalreadyinprogress()')
}

function restoreallinputs() {
    document.getElementById('fileinput').setAttribute('onchange', "sendthefile('all')")
    document.getElementById('imageinput').setAttribute('onchange', "sendthefile('image')")
    document.getElementById('videoinput').setAttribute('onchange', "sendthefile('video')")
    document.getElementById('audioinput').setAttribute('onchange', "sendthefile('audio')")
    document.getElementById('docinput').setAttribute('onchange', "sendthefile('doc')")
}

function transferalreadyinprogress() {
    alert("File transfer is already in progress!")
}