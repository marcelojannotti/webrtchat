function chatClient (element) {
  var ansConn,offerDescr,offerCand,answerDescr,answerCand,channel,oChat;
  oChat=this;
  this.started = false;
  ansConn = new RTCPeerConnection();
  ansConn.ondatachannel = function (event) {
    channel = event.channel;
    channel.onmessage = function (event) {
      if (element) element.innerHTML += '['+new Date(Date.now()).toLocaleDateString('pt-BR')+'] '+event.data;
      else console.log('['+new Date(Date.now()).toLocaleDateString('pt-BR')+'] '+event.data);
    };
  };
  
  ansConn.onicecandidate = function (e) {
    if (e && e.candidate) {    
      answerCand = e.candidate;
      let elcopy=document.createElement('input'); elcopy.style='opacity:1';
      elcopy.value = oChat.connStr; document.body.appendChild(elcopy);
      elcopy.focus(); elcopy.select(); document.execCommand('copy');
      elcopy.parentNode.removeChild(elcopy);
      console.log('You client code is:\n'+oChat.connStr);
    }
  };
  
  this.connect = function() {
    try {
      this.connStr = prompt('Inform a Server code');
      ansConn.setRemoteDescription(new RTCSessionDescription(offerDescr));
      ansConn.addIceCandidate(offerCand);

      ansConn.createAnswer().then(function(answer) {
        answerDescr = answer;
        return ansConn.setLocalDescription(answer);
      });
    } catch (e) { this.disconnect(); return this.started = false ;}
    return this.started = true;
  };
  
  this.disconnect = function () {
    channel.close();
    ansConn.close();
    return this.started = true;//(ansConn.getState() != 'closed');
  };
  
  Object.defineProperty(this,'connStr',{
    get: function() {
      return btoa(JSON.stringify({handshake:[{type: answerDescr.type,sdp: btoa(answerDescr.sdp)},{candidate: btoa(answerCand.candidate),sdpMid: (answerCand.sdpMid?answerCand.sdpMid:"0"),sdpMLineIndex: (answerCand.sdpMLineIndex?answerCand.sdpMLineIndex:0)}]}));
    },
    set: function (newValue) {
      try {
        newValue = JSON.parse(atob(newValue));
        newValue.handshake[0].sdp = atob(newValue.handshake[0].sdp);
        newValue.handshake[1].candidate = atob(newValue.handshake[1].candidate);
        offerDescr = newValue.handshake[0];
        offerCand = newValue.handshake[1];
      } catch(e) {throw('Connection string invalid.')}
    },
    enumerable: true
  });
  
  Object.defineProperty(this,'server',{value: false,writeble: false});
  
  this.send = function(text) {
    text = text+'\n';
    channel.send(text);
    if (element) element.innerHTML += '['+new Date(Date.now()).toLocaleDateString('pt-BR')+'] '+text;
    else console.log('['+new Date(Date.now()).toLocaleDateString('pt-BR')+'] '+text);
  };

};

