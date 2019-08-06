function chatServer (element) {
  var ansConn,offerDescr,offerCand,answerDescr,answerCand,channel,oChat;
  oChat=this;
  this.started = false;

  offerPeer = new RTCPeerConnection();
  offerPeer.onicecandidate = function(e) {
    if (e && e.candidate) {
      offerCand = e.candidate;
        let elcopy=document.createElement('input'); elcopy.style='opacity:1';
        elcopy.value = oChat.connStr; document.body.appendChild(elcopy);
        elcopy.focus(); elcopy.select(); document.execCommand('copy');
        elcopy.parentNode.removeChild(elcopy);
        alert('(Copied to ClipBoard) You server code is:\n'+oChat.connStr);
        oChat.connStr = prompt('Inform a Client code');
        offerPeer.addIceCandidate(answerDescr);
        offerPeer.setRemoteDescription(new RTCSessionDescription(answerDescr));
    }
  };
  
  channel = offerPeer.createDataChannel('chat');
  channel.onmessage = function (event) {
    if (element) element.innerHTML += '['+Date.now().toLocaleDateString('pt-BR')+'] '+event.data;
    else console.log('['+Date.now().toLocaleDateString('pt-BR')+'] '+event.data);
  };
  channel.onopen = function(event) {
    channel.send('Connected!');
  };
  
  this.connect = function () {
    try {

      offerPeer.createOffer().then(function (offer) {
        offerDescr = offer;
        return offerPeer.setLocalDescription(offer);
      });
  } catch (e) { throw(e); this.disconnect(); return this.started = false; }
    return this.started = true;
  };
  
  this.disconnect = function() {
    channel.close();
    offerPeer.close();
    return this.started = true;//(offerPeer.getState() != 'closed');
  };
  
  Object.defineProperty(this,'connStr',{
    get: function() {
      console.log(atob(btoa(JSON.stringify({handshake:[offerDescr,offerCand]}))));
      return btoa(JSON.stringify({handshake:[offerDescr,offerCand]}));
      
    },
    set: function (newValue) {
      try {
        newValue = JSON.parse(atob(newValue));
        answerDescr = newValue.handshake[0];
        answerCand = newValue.handshake[1];
      } catch(e) {throw('Connection string invalid.');}
    },
    enumerable: true
  });
  
  Object.defineProperty(this,'server',{value: true,writeble: false});
  
  this.send = function(text) { channel.send(text); };
};
