//variables
window.lastvalueupdate=0
window.currentvalueupdate=0
window.counterids=1
window.weapondelay=0
window.server=function(){}







//fullscreen checker on startup
if(!localStorage.fullscreen){
    localStorage.fullscreen=false
}
if(localStorage.fullscreen=="true"){
    var nw=require('nw.gui');
    var win = nw.Window.get();
    win.enterFullscreen()
}

//changes to MV's functions
Game_Player.prototype.reserveTransfer = function(mapId, x, y, d, fadeType,check) {
    if(check==true || ($gameMap._mapId!=1 && $gameMap._mapId<5 )){
        this._transferring = true;
        if($gameMap._mapId==1 || $gameMap._mapId>4){
            this._newMapId = $gameMap._mapId;
            
        }else{
            this._newMapId = mapId;
        }

        this._newX = x;
        this._newY = y;
        this._newDirection = d;
        this._fadeType = fadeType;

        
    }else{
        worker.postMessage("tpevent:"+x+":"+y+":"+playerid)
    }
};

Game_BattlerBase.prototype.setMp = function(mp) {
    this._mp = mp;
    changeMPBar(mp*100/$gameActors.actor(1).mmp)
    this.refresh();
};

Game_BattlerBase.prototype.setHp = function(hp) {
    this._hp = hp;
    changeHPBar(hp*100/$gameActors.actor(1).mhp)
    this.refresh();
};

Game_Party.prototype.gainGold = function(amount) {
    this._gold = (this._gold + amount).clamp(0, this.maxGold());
    setGoldText(this._gold)
};

//Function to block right click context menu
document.querySelectorAll('*').forEach(function(element){
   element.addEventListener('contextmenu', function(ev) { 
      ev.preventDefault();
      return false;
   });
});

//check if ESC was pressed to open menu
var escmenu=false
var otherchoisesopened=false

//changes "setchoices"
Game_Message.prototype.setChoices = function(choices, defaultType, cancelType) {
    otherchoisesopened=true
    this._choices = choices;
    this._choiceDefaultType = defaultType;
    this._choiceCancelType = cancelType;
};

Game_Message.prototype.onChoice = function(n) {
    if (this._choiceCallback) {
        otherchoisesopened=false
        this._choiceCallback(n);
        this._choiceCallback = null;
    }
};

//deletes any minimap previously saved
var fs=require("fs")
var rmdir = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        rmdir(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};
            
            if (fs.existsSync("./www/minimap")){
            rmdir("./www/minimap/")}

Input.keyMapper = {
    9: 'tab',       // tab
    69: 'ok',       // E
    16: 'shift',    // shift
    17: 'control',  // control
    18: 'control',  // alt
    27: 'escape',   // escape
    33: 'pageup',   // pageup
    34: 'pagedown', // pagedown
    65: 'left',     // left arrow
    87: 'up',       // up arrow
    68: 'right',    // right arrow
    83: 'down',     // down arrow
    45: 'escape',   // insert
    96: 'escape',   // numpad 0
    98: 'down',     // numpad 2
    100: 'left',    // numpad 4
    102: 'right',   // numpad 6
    104: 'up',      // numpad 8
    120: 'debug',    // F9
    13: 'chatsend', // Enter
    89: 'chat',     // Y
    49: 'weapon',   // 1
    50: 'potion',  // 2
    51: 'shield',   // 3
    71: 'drop',// G
    70: 'lantern'// F
};
Input.gamepadMapper = {
    0: 'ok',        // A
    1: 'cancel',    // B
    2: 'shift',     // X
    3: 'menu',      // Y
    4: 'drop',    // LB
    5: 'fire',  // RB
    12: 'up',       // D-pad up
    13: 'down',     // D-pad down
    14: 'left',     // D-pad left
    15: 'right',    // D-pad right
};

Graphics._createModeBox = function() {
    var box = document.createElement('div');
    box.id = 'modeTextBack';
    box.style.position = 'absolute';
    box.style.left = '200px';
    box.style.top = '5px';
    box.style.width = '119px';
    box.style.height = '40px';
    box.style.background = 'rgba(0,0,0,0.2)';
    box.style.zIndex = 9;
    box.style.opacity = 0;



    document.body.appendChild(box);


    this._modeBox = box;
};

SceneManager.initGraphics = function() {
    var type = this.preferableRendererType();
    Graphics.initialize(this._screenWidth, this._screenHeight, type);
    Graphics.boxWidth = this._boxWidth;
    Graphics.boxHeight = this._boxHeight;
    if (Utils.isOptionValid('showfps')) {
        Graphics.showFps();
    }
    if (type === 'webgl') {
        this.checkWebGL();
    }
};


SceneManager.onError = function(e) {

};



function resetimgandaudio(){
    var ncp = require('./js/libs/ncp.js').ncp;
    var fs=require("fs")
    var rmdir = function(path) {
      if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
          var curPath = path + "/" + file;
          if(fs.lstatSync(curPath).isDirectory()) { // recurse
            rmdir(curPath);
          } else { // delete file
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(path);
      }
    };


    if(!fs.existsSync("./www/backup/img")){
        if(!fs.existsSync("./www/backup/")) fs.mkdirSync("./www/backup");
        fs.mkdirSync("./www/backup/audio");
        fs.mkdirSync("./www/backup/img");
        ncp("./www/img/", "./www/backup/img/",function(){});
        ncp("./www/audio/", "./www/backup/audio/",function(){});
    }else{
        if (fs.existsSync("./www/img")) {
            rmdir("./www/img");
            fs.mkdirSync("./www/img");
        }else{
          fs.mkdirSync("./www/img")
        }
        ncp("./www/backup/img/", "./www/img/", function (err) {})

        if (fs.existsSync("./www/audio")) {
            rmdir("./www/audio");
            fs.mkdirSync("./www/audio");
        }else{
            fs.mkdirSync("./www/audio")
        }
        ncp("./www/backup/audio/", "./www/audio/", function (err) {})
    }

}



// Common Event
Game_Interpreter.prototype.command117 = function() {
    var commonEvent = $dataCommonEvents[this._params[0]];
    if (commonEvent) {
        var eventId = this.isOnCurrentMap() ? this._eventId : 0;
        this.setupChild(commonEvent.list, eventId);
        if($gameMap._mapId===5){
            $gameTemp.reserveCommonEvent(eventId)
    }
    else{
        this.setupChild(commonEvent.list, eventId);
    }
    }
    return true;
};

window.playerdead=false


setInterval(()=>{
    if(Math.abs(TouchInput._x-$gamePlayer.screenX())>Math.abs(TouchInput._y-$gamePlayer.screenY())){
        if($gamePlayer.screenX()>TouchInput._x>0){
          
            $gamePlayer.setDirection(4)
        }else{
            
            $gamePlayer.setDirection(6)
        }
    }else{
        if($gamePlayer.screenY()<TouchInput._y>0){
            
            $gamePlayer.setDirection(2)
        }else{
            
            $gamePlayer.setDirection(8)
        }
    }
},33)


Game_Temp.prototype.setDestination = function(x, y) {
    return;
    this._destinationX = x;
    this._destinationY = y;
};


Game_Actor.prototype.basicFloorDamage = function() {
    return 10;
};

SceneManager.catchException = function(e) {

};

SceneManager.onKeyDown = function(event) {
    if (!event.ctrlKey && !event.altKey) {
        switch (event.keyCode) {
        case 116:   // F5
            if(typeof worker!="undefined"){
                worker.postMessage("close")
            }else{
                location.reload();
            }
            break;
        case 119:   // F8
            if (Utils.isNwjs() && Utils.isOptionValid('test')) {
                require('nw.gui').Window.get().showDevTools();
            }
            break;
        }
    }
};



Sprite_Timer.prototype.updatePosition = function() {
    this.x = (Graphics.width - this.bitmap.width)/2 
    this.y = 0;
};


//////////avoid gameover when HP=0///////

Scene_Map.prototype.updateScene = function() {

    if (!SceneManager.isSceneChanging()) {
        this.updateTransferPlayer();
    }
    if (!SceneManager.isSceneChanging()) {
        this.updateEncounter();
    }
    if (!SceneManager.isSceneChanging()) {
        this.updateCallMenu();
    }
    if (!SceneManager.isSceneChanging()) {
        this.updateCallDebug();
    }
};

////////////////////////////////////////

if(!localStorage.texttospeech){
    localStorage.texttospeech=false
}





///////


window.gc()


