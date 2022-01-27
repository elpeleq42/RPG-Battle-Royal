window.chatopen=false
var Imported = Imported || {};
Imported.Online_Chat = true;


(function () {
var Nasty = Nasty || {};
Nasty.chatEnabled = true;
var crypto = require('crypto')
function encrypt(text, password){
var cipher = crypto.createCipher('aes-128-cbc',password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    crypted=String(crypted)
    return crypted;

}
 
function decrypt(text, password){
var decipher = crypto.createDecipher('aes-128-cbc',password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    dec=String(dec)
    return dec;

}
//=============================================================================
// Online Chat
// Version: 1.0.6 - Fix for crashing while in menu
// Version: 1.0.5 - Allows for chat to be retained on map transfer/menu/battle
// Version: 1.0.4 - Add function to enable/disable chat and chat by leader name
//=============================================================================

//=============================================================================
 /*:
 * @plugindesc Online Chat for Neldersons Online Core
 * <Online_Chat>
 * @author Nelderson
 *
 * @param Chat Key Code
 * @desc Key code to toggle the chat on/off (Default F1 - 112)
 * @default 112
 *
 * @param Chat with Username or Character Name
 * @desc 0=Username 1=Character Name (Leader of party)
 * @default 0
 *
 * @param Input Character limit
 * @desc Limit the amount of characters per message
 * @default 80
 *
 * @param Room Name by Map
 * @desc Change the room name by map that you are on?
 * @default false
 *
 * @param Recall Message Limit
 * @desc Recalls this many messages when switching maps/battles/etc
 * @default 20
 *
 * @param Chat Username Color
 * @desc Color of usernames in chat window
 * @default #c92cac
 *
 * @param Chat Text Color
 * @desc Color of chat text in chat window
 * @default #000000
 *
 * @param Chat Text Window Width
 * @desc Chat Window width
 * @default 800
 *
 * @param Chat Text Window Height
 * @desc Chat Window Height
 * @default 500
 *
 * @param Chat Text Window Offset X
 * @desc Offset X Poisition of Chat Text Window from CENTER
 * @default 0
 *
 * @param Chat Text Window Offset Y
 * @desc Offset Y Poisition of Chat Text Window from CENTER
 * @default 0
 *
 * @param Chat Text Font
 * @desc Font for Chat Text (Defaults to game default)
 * @default
 *
 * @param Chat Text Font Size
 * @desc Font size for Chat Text
 * @default 15
 *
 * @param Chat Text Background Color
 * @desc Background color and transparency for Chat Window
 * @default rgba(255,255,255,0.7)
 *
 * @param Chat Text Background Picture
 * @desc Background Pic from img/pictures folder instead of Background Color
 * @default
 *
 * @param Chat Input Window Width
 * @desc Chat Input Window width
 * @default 600
 *
 * @param Chat Input Window Height
 * @desc Chat Input Window Height
 * @default 40
 *
 * @param Chat Input Window Offset X
 * @desc Offset X Poisition of Chat Input Window from CENTER
 * @default 0
 *
 * @param Chat Input Window Offset Y
 * @desc Offset Y Poisition of Chat Input Window from CENTER
 * @default 564
 *
 * @param Input Text Font
 * @desc Font for Input Text (Defaults to game default)
 * @default
 *
 * @param Input Text Font Size
 * @desc Font size for Input Text
 * @default 15
 *
 * @param Input Text Background Color
 * @desc Background color and transparency for Input Window
 * @default rgba(255,255,255,0.7)
 *
 * @param Input Text Background Picture
 * @desc Background Pic from img/pictures folder instead of Background Color
 * @default
 *
 * @help
 * ============================================================================
 * Introduction and Instructions
 * ============================================================================
 * This plugin allows you to chat with other players.
 *
 * There are two ways to access the chat windows.  Either by plugin
 * command or the Key Code from the parameters(Default F1).
 *
 * The only thing that is overwritten are the defaults for the SPACEBAR
 * and Z key within the Input Keymapper so that they will not interfere
 * with typing in the chat input window
 *
 * =====================
 * ===Plugin Commands===
 * =====================
 *
 * ToggleChat - Turns Chat Windows On/Off
 * SendChatMessage - Sends the message in the chat input window.
 * EnableChat - Enables chat to be opened
 * DisableChat - Disables chat to be opened
 *
 */
 //=============================================================================
 var socket = null;
window.chatHistory = [];
 Nasty.Parameters = $plugins.filter(function(p)
   { return p.description.contains('<Online_Chat>');})[0].parameters;

  //Chat text window
  var textWinWidth = Nasty.Parameters['Chat Text Window Width'];
  var textWinHeight = Nasty.Parameters['Chat Text Window Height'];
  var textWinOffsetX = Nasty.Parameters['Chat Text Window Offset X'];
  var textWinOffsetY = Nasty.Parameters['Chat Text Window Offset Y'];
  var textWinFont = Nasty.Parameters['Chat Text Font'];
  var textWinFontSize = Nasty.Parameters['Chat Text Font Size'];
  var textWinBack = Nasty.Parameters['Chat Text Background Color'];
  var textWinBackPic = Nasty.Parameters['Chat Text Background Picture'];

  //Chat input window
  var inputWinWidth = Nasty.Parameters['Chat Input Window Width'];
  var inputWinHeight = Nasty.Parameters['Chat Input Window Height'];
  var inputWinOffsetX = Nasty.Parameters['Chat Input Window Offset X'];
  var inputWinOffsetY = Nasty.Parameters['Chat Input Window Offset Y'];
  var inputWinFont = Nasty.Parameters['Input Text Font'];
  var inputWinFontSize = Nasty.Parameters['Input Text Font Size'];
  var inputWinBack = Nasty.Parameters['Input Text Background Color'];
  var inputWinBackPic = Nasty.Parameters['Input Text Background Picture'];
  var inputCharLimit = Nasty.Parameters['Input Character limit'];

  var chatKeyCode = Nasty.Parameters['Chat Key Code'];
  var chatUserColor = Nasty.Parameters['Chat Username Color'];
  var chatTextColor = Nasty.Parameters['Chat Text Color'];
  var roomMapNameFlag = Nasty.Parameters['Room Name by Map'];
  var NetPlayerChatNameType = Number(Nasty.Parameters['Chat with Username or Character Name']);
  var recallMessageLimit = Number(Nasty.Parameters['Recall Message Limit']);

  var networkName = '';



//=============================================================================
//  GAME CHAT code
//=============================================================================

  var OnlineChat_createDisplayObj_Scene_Map = Scene_Map.prototype.createDisplayObjects;
  Scene_Map.prototype.createDisplayObjects = function() {
    OnlineChat_createDisplayObj_Scene_Map.call(this);
    this.createChatDOMElements();
    this.appendChatHistory();
  };

  Scene_Map.prototype.appendChatHistory = function(){
  var diff = chatHistory.length - recallMessageLimit;
  if (diff>0) chatHistory.splice(0,diff);
  var chat = document.getElementById('txtarea');
    for (var i=0;i<chatHistory.length;i++){
      var message = document.createElement('div');
      message.appendChild(chatHistory[i][0]);
      message.appendChild(chatHistory[i][1]);
      chat.appendChild(message);
      
    }
  };

   Scene_Map.prototype.createChatDOMElements = function(){
     //Chat Bar for Inputing messages
     this.chatinput = document.createElement('INPUT');
     this.chatinput.id = 'chatInput';
     this.chatinput.maxLength = inputCharLimit;
     this.chatinput.style.fontSize = inputWinFont + 'px';
     this.chatinput.style.fontStyle = inputWinFont;
     this.chatinput.style.color = '#ffffff';
     this.chatinput.style.fontStyle = '';
     this.chatinput.style.position = 'absolute';
     this.chatinput.style.textIndent = '15px';
     this.chatinput.style.zIndex = 100;
     this.chatinput.placeholder = 'Insert Text Here';
     this.chatinput.style.color = '#000000';
     this.chatinput.style.border = 'none';
     this.chatinput.style.visibility = 'hidden';
     if (inputWinBackPic===''){
       this.chatinput.style.background = inputWinBack;
     }else{
       this.chatinput.style.backgroundImage = "url('img/pictures/"+inputWinBackPic+".png')";
     }
     //Chat Message area
     this.txtarea = document.createElement('div');
     this.txtarea.id = 'txtarea';
     this.txtarea.style.padding = '15px';
     this.txtarea.style.fontSize = textWinFontSize + 'px';
     this.txtarea.style.fontStyle = textWinFont;
     this.txtarea.style.position = 'absolute';
     this.txtarea.style.overflowY = 'hidden';
     this.txtarea.style.width = textWinWidth + 'px';
     this.txtarea.style.height = textWinHeight + 'px';
     this.txtarea.style.textShadow = "-1px 0 #e6e6e6, 0 1px #e6e6e6, 1px 0 #e6e6e6, 0 -1px #e6e6e6;";
     this.txtarea.style.zIndex = 99;
     this.txtarea.style.visibility = 'visible';
     if (textWinBackPic===''){
       this.txtarea.style.background = "";
     }else{
       this.txtarea.style.backgroundImage = "url('img/pictures/"+textWinBackPic+".png')";
     }
     //Add and adjust both DOM elements
     document.body.appendChild(this.txtarea);
     document.body.appendChild(this.chatinput);
     //--Mobile fix for input--
     
     //-------------------------
     Graphics._centerElement(this.chatinput);
     Graphics._centerElement(this.txtarea);
     this.chatinput.style.width = inputWinWidth +'px';
     this.chatinput.style.height = inputWinHeight + 'px';
     this.chatinput.style.top = inputWinOffsetY +'px';
     this.chatinput.style.left = inputWinOffsetX +'px';
     this.txtarea.style.left = textWinOffsetX + 'px';
     this.txtarea.style.top = textWinOffsetY + 'px';

     var that = this;
     $("#chatInput").keypress(function(e){
      if (e.which == 13) { //enter
        that.sendChatMessage();
      }
    });
   };

   var Online_Chat_SceneMap_isMenuCalled_alias = Scene_Map.prototype.isMenuCalled;
   Scene_Map.prototype.isMenuCalled = function() {
    if (document.activeElement===document.getElementById('chatInput')) return false;
    return Online_Chat_SceneMap_isMenuCalled_alias.call(this);
   };

   var Online_Chat_SceneMap_ProcessTouch_alias = Scene_Map.prototype.processMapTouch;
   Scene_Map.prototype.processMapTouch = function() {
     if (document.activeElement!==document.getElementById('chatInput')){
       Online_Chat_SceneMap_ProcessTouch_alias.call(this);
     }
   };

   var Chat_Online_sceneMap_updtSceneAlias = Scene_Map.prototype.updateScene;
   Scene_Map.prototype.updateScene = function() {
     Chat_Online_sceneMap_updtSceneAlias.call(this);
       if (!SceneManager.isSceneChanging()) {
           this.updateChat();
       }
   };

   Scene_Map.prototype.updateChat = function(){
     if (document.activeElement===document.getElementById('chatInput')){
       if (Input.isTriggered('chatsend')){
         this.sendChatMessage();
       }
     }
     //Toggle Chat Windows On/Off
     if (Input.isTriggered('chat') && chatopen===false && localStorage.hidechat==false){
       this.toggleChat();
     }
      if ((escpressed===true||Input.isTriggered('chatsend')) && chatopen===true && localStorage.hidechat==false){
      escpressed=false
       this.toggleChat();
       
     }
   };

   Scene_Map.prototype.sendChatMessage = function(){
   networkName=localStorage.myname || "Player"
     var value = document.getElementById('chatInput').value;
     value = value.trim();
     if (value==='') return;
     if(value=="/kill"){
      $gameParty.members().forEach( function(actor) { actor.setHp(1) } );
      return
     }
     //Emit message to server
     worker.postMessage("chat:"+value)
     document.getElementById('chatInput').value = '';
   };

   Scene_Map.prototype.toggleChat = function(){
     if (document.getElementById('chatInput').style.visibility ==='hidden'){
       chatopen=true;
       document.getElementById('txtarea').style.overflowY='scroll'
       document.getElementById('txtarea').style.background = textWinBack;
       document.getElementById('chatInput').style.visibility = 'visible';
       $("#chatInput").focus();
     }else{
       document.getElementById('txtarea').style.visibility = 'visible';
       document.getElementById('txtarea').style.overflowY='hidden'
       document.getElementById('txtarea').style.background = "";
       document.getElementById('chatInput').style.visibility = 'hidden';
       chatopen=false;
     }
   };

   var NastySceneMapChat_Terminate = Scene_Map.prototype.terminate;
   Scene_Map.prototype.terminate = function() {
       NastySceneMapChat_Terminate.call(this);
       document.body.removeChild(this.txtarea);
       document.body.removeChild(this.chatinput);
   };

   var OnlineChat_gamePlayer_canMoveAlias = Game_Player.prototype.canMove;
   Game_Player.prototype.canMove = function() {
     if (document.activeElement===document.getElementById('chatInput')){
       return false;
     }
     return OnlineChat_gamePlayer_canMoveAlias.call(this);
   };

   var Nel_OnlineChat_pluginCommands_alias = Game_Interpreter.prototype.pluginCommand;
   Game_Interpreter.prototype.pluginCommand = function(command, args) {
       Nel_OnlineChat_pluginCommands_alias.call(this, command, args);
     };



})();
var escpressed=false

