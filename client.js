function chatClient (element) {
  var ansConn,offerDescr,offerCand,answerDescr,answerCand,channel;
  this.started = false;
  ansConn = new RTCPeerConnection();
  ansConn.ondatachannel = function (event) {
    channel = event.channel;
    channel.onmessage = function (event) {
      if (element) element.innerHTML += '['+Date.now().toLocaleDateString('pt-BR')+'] '+event.data;
      else console.log('['+Date.now().toLocaleDateString('pt-BR')+'] '+event.data);
    };
  };
  
  ansConn.onicecandidate = function (e) {
    if (e && e.candidate) {
      answerCand = e.candidate;
      let elcopy=document.createElement('input'); elcopy.style='opacity:1';
      elcopy.value = oChat.connStr; document.body.appendChild(elcopy);
      elcopy.focus(); elcopy.select(); document.execCommand('copy');
      elcopy.parentNode.removeChild(elcopy);
      alert('You client code is:\n'+this.connStr);
    }
  };
  
  this.connect = function() {
    try {
      this.connStr = prompt('Inform a Server code');
      ansConn.addIceCandidate(offerCand);
      ansConn.setRemoteDescription(new RTCSessionDescription(offerDescr));

      ansConn.createAnswer().then(function(answer) {
        answerDescr = answer;
        return ansConn.setLocalDescription(answer);
      });
      alert('You client code is:\n'+this.connStr);
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
      return btoa(JSON.stringify({handshake:[answerDescr,answerCand]}));
    },
    set: function (newValue) {
      try {
        newValue = JSON.parse(atob(newValue));
        offerDescr = newValue.handshake[0];
        offerCand = newValue.handshake[1];
      } catch(e) {throw('Connection string invalid.')}
    },
    enumerable: true
  });
  
  Object.defineProperty(this,'server',{value: false,writeble: false});
  
  this.send = function(text) { channel.send(text); };
};

