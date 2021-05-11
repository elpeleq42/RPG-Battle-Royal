/*:
@author Chaucer
@plugindesc | Scene Stabilizer : Version - 5.5.0 | Stabilizes scenes on scene change.
@help
===============================================================================
 Introduction :
===============================================================================

 This plugin uploads all images required for a scene to the gpu before the
 scene begins. This ensures that the scene is loaded in smoothly, without
 any stuttering or skipped frames. As of version 4.0.0, all skills/items of
 enemy and player characters are scanned before each battle, and are
 preloaded & uploaded before the scene begins to ensure that animations do
 not cause stuttering.

===============================================================================
  Special Thanks :
===============================================================================

  Oscar92player : requesting audio preload.
  Tuomo : Reporting bugs with YEP_Core & YEP_VictoryAftermath.
  Archeia : Reporting issue with Replay BGM function.
  AdamSakuru : requesting the ability to free preloaded assets from memory.
  Eliaquim : requesting the ability to load assets from a custom folder.

===============================================================================
 Requirements :
===============================================================================

---------------------------------------
 None.
---------------------------------------

===============================================================================
 Instructions :
===============================================================================

---------------------------------------
 Preloading Custom Assets :
---------------------------------------

  At this moment, you are only able to preload assets on maps, and in battles,
  you can do so by adding the following to an maps note box, or on actor, and
  enemy note boxes. To preload images, start with the following note tags below
  any preloaded files must be placed between <preaload> and </preload>( where
  "args" is in the template ). Possible arguments are listed below.

  <preload>
    args
  </preload>


  arg : animation ID
  ---------------------------------------
  description : load the animation with "ID" from the database.


  arg : battleback1 FILENAME
  ---------------------------------------
  description : load the battleback1 file with the name of "FILENAME" from the
  "img/battlebacks1/" folder.

  arg : battleback2 FILENAME
  ---------------------------------------
  description : load the battleback2 file with the name of "FILENAME" from the
  "img/battlebacks2/" folder.

  arg : character FILENAME
  ---------------------------------------
  description : load the character file with the name of "FILENAME" from the
  "img/characters/" folder.

  arg : actor FILENAME
  ---------------------------------------
  description : load the actor file with the name of "FILENAME" from the
  "img/actors/" folder.

  arg : enemy FILENAME
  ---------------------------------------
  description : load the enemy file with the name of "FILENAME" from the
  "img/enemies/" folder.

  arg : face FILENAME
  ---------------------------------------
  description : load the face file with the name of "FILENAME" from the
  "img/faces/" folder.

  arg : parallax FILENAME
  ---------------------------------------
  description : load the parallax file with the name of "FILENAME" from the
  "img/parallaxes/" folder.

  arg : picture FILENAME
  ---------------------------------------
  description : load the picture file with the name of "FILENAME" from the
  "img/pictures/" folder.

  arg : sv_actor FILENAME
  ---------------------------------------
  description : load the sv_actor file with the name of "FILENAME" from the
  "img/sv_actors/" folder.

  arg : sv_enemy FILENAME
  ---------------------------------------
  description : load the sv_enemy file with the name of "FILENAME" from the
  "img/sv_enemies/" folder.

  arg : system FILENAME
  ---------------------------------------
  description : load the system file with the name of "FILENAME" from the
  "img/system/" folder.

  arg : tileset FILENAME
  ---------------------------------------
  description : load the tileset file with the name of "FILENAME" from the
  "img/tilesets/" folder.

  arg : title1 FILENAME
  ---------------------------------------
  description : load the title1 file with the name of "FILENAME" from the
  "img/titles1/" folder.

  arg : title2 FILENAME
  ---------------------------------------
  description : load the title2 file with the name of "FILENAME" from the
  "img/titles2/" folder.

  arg : bgm FILENAME
  ---------------------------------------
  description : load the bgm file with the name of "FILENAME" from the
  "audio/bgm/" folder.

  arg : bgs FILENAME
  ---------------------------------------
  description : load the bgs file with the name of "FILENAME" from the
  "audio/bgs/" folder.

  arg : se FILENAME
  ---------------------------------------
  description : load the se file with the name of "FILENAME" from the
  "audio/se/" folder.

  arg : me FILENAME
  ---------------------------------------
  description : load the me file with the name of "FILENAME" from the
  "audio/me/" folder.

  arg : video VIDEONAME.EXT
  ---------------------------------------
  description : load the video file with the name of "VIDEONAME" from the
  "movies/" folder, replace "EXT" with the file extension type, I.E if the
  video file is a webm movie, it'd look something like "test.webm", and if the
  move is a mp4 file, it'd be "test.mp4",



  EXAMPLE :
------------------------------------------------------------------------------
  <preload>
    animation: 5
    animation: all
    parallax: example1
    picture: exampleA
    picture: exampleB
    folder: img/characters/
    folder: audio/se/
    custom: img/custom_folder/ customImage
    video: test-move.webm
  </preload>
------------------------------------------------------------------------------
  details : placing a note tag similar to the one below in a maps note box,
  will preload the assets requested when the player enters a map. If you
  place a note tag like the one below on an actor or enemy however, the
  requested assets will be loaded when the player enters a battle while said
  actors/enemies are participants in the battle.
------------------------------------------------------------------------------

---------------------------------------
 Plugin Commands :
---------------------------------------

  command : clear_character FILENAME
---------------------------------------
  description : clear an asset that's been loaded from the characters folder.

  command : clear_picture FILENAME
---------------------------------------
  description : clear an asset that's been loaded from the pictures folder.

  command : clear_animation FILENAME
---------------------------------------
  description : clear an asset that's been loaded from the animations folder.

  command : clear_face FILENAME
---------------------------------------
  description : clear an asset that's been loaded from the faces folder.

  command : clear_battleback1 FILENAME
---------------------------------------
  description : clear an asset that's been loaded from the battleback1 folder.

  command : clear_battleback2 FILENAME
---------------------------------------
  description : clear an asset that's been loaded from the battleback2 folder.

  command : clear_enemy FILENAME
---------------------------------------
  description : clear an asset that's been loaded from the enemies folder.

  command : clear_actor FILENAME
---------------------------------------
  description : clear an asset that's been loaded from the actor folder.

  command : clear_sv_enemy FILENAME
---------------------------------------
  description : clear an asset that's been loaded from the sv_enemies folder.

  command : clear_sv_actor FILENAME
---------------------------------------
  description : clear an asset that's been loaded from the sv_actor folder.

  command : clear_parallax FILENAME
---------------------------------------
  description : clear an asset that's been loaded from the parallaxes folder.

  command : clear_tileset FILENAME
---------------------------------------
  description : clear an asset that's been loaded from the tilesets folder.

  command : clear_title1 FILENAME
---------------------------------------
  description : clear an asset that's been loaded from the titles1 folder.

  command : clear_title2 FILENAME
---------------------------------------
  description : clear an asset that's been loaded from the titles2 folder.

  command : clear_folder FILEPATH
---------------------------------------
  description : clear any images loaded from the specified file path.
  Example : clear_folder img/characters/


  command : clear_custom_texture FILEPATH FILENAME
---------------------------------------
  description : clear a custom asset that's been loaded from the FILEPATH
  and with the FILENAME specified.
  Example : clear_custom_texture img/custom_folder/ customImage

  command : clear_all_textures
---------------------------------------
  description : clear the entire image cache.

===============================================================================
 Terms Of Use :
===============================================================================

  This Plugin may be used commercially, or non commercially so long as credit
 is given, either in the games credit section, or in a text file alongside
 the game. This plugin may NOT be sold, or Plagiarized. This plugin may
 be extended upon, and shared freely.


===============================================================================
 Version History :
===============================================================================

 ● Version : 1.0.0
 ● Date : 13/01/2018
   ★ Release.

 ● Version : 1.4.0
 ● Date : 17/01/2018
   ★ Added the option to attempt to stabilize animations.

 ● Version : 1.5.0
 ● Date : 17/01/2018
   ★ Upload Animations to GPU before playing.
   ✩ Fixed issue with picture stabilization.

 ● Version : 1.5.1
 ● Date : 17/01/2018
   ✩ Accidentally deleted code to shorten pause time.

 ● Version : 2.0.0
 ● Date : 17/01/2018
   ★ Added preload for BGM and BGS( map/battle/title scene only ).

 ● Version : 2.0.1
 ● Date : 17/01/2018
   ✩ Fixed a bug which can cause the game to freeze.

 ● Version : 2.1.0
 ● Date : 05/03/2018
   ★ Added compatability for YEP_VictoryAftermath( credits to Tuomo L @rmw ).
   ✩ Audio is now unaltered when preload_audio is turned off.

 ● Version : 2.1.1
 ● Date : 08/03/2018
   ✩ AudioManager.playBgm & AudioManager.playBgs are no longer altered.

 ● Version : 2.1.2
 ● Date : 08/03/2018
   ✩ buffer parameters are applied before being played.

 ● Version : 4.0.0
 ● Date : 03/10/2018
   ★ Images are now uploaded to the GPU instead of pausing the scene on start.
   ★ Now able to preload custom assets in map and battle scenes.
   ✩ Audio preloading has been removed for the time being!

 ● Version : 4.1.0
 ● Date : 04/10/2018
   ★ The time taken to upload images to gpu has been drastically reduced.
   ★ Added fallback to prevent game from freezing if scene never stabilizes.
   ✩ removed some unnecessary code.

 ● Version : 4.1.1
 ● Date : 04/10/2018
   ✩ Fixed a bug that caused crash with canvas renderer.

 ● Version : 4.1.2
 ● Date : 04/10/2018
   ✩ Fixed compatability issue with GALV_AnimatedSplashScreens.js.

 ● Version : 4.1.5
 ● Date : 14/10/2018
   ✩ Plugin will now work with plugins that overwrite Scene_Base Initialize.
   ✩ Plugins that add custom sprites to map should no longer be an issue.

 ● Version : 4.1.6
 ● Date : 14/10/2018
   ✩ Fixed issue with animations appearing on screen.

 ● Version : 4.1.7
 ● Date : 15/10/2018
   ✩ Animations that are preloaded should no longer play Audio.

 ● Version : 4.2.0
 ● Date : 24/10/2018
   ★ Added a more stable way to handle scene map.
   ✩ No longer attempts to upload textures without a source.

 ● Version : 4.2.1
 ● Date : 24/10/2018
   ✩ fade no longer happens if transfering map without fade.


 ● Version : 4.2.3
 ● Date : 06/11/2018
   ✩ Fixed a bug which prevented the game from loading non sv enemies.
   ✩ Fixed a bug where images from system folder could not be loaded.
   ✩ added example to documentation on preloading images.
   ✩ Fixed a bug where sv_enemies could not be loaded.
   ✩ removed some useless code from an older version.
   ✩ minor alterations to preload cache handling.

 ● Version : 5.0.0
 ● Date : 06/11/2018
   ★ Code has been cleaned & optimized.
   ★ Ability to load ALL animations has been added.
   ★ Added capability to load an entire folder.
   ★ Re-added audio caching.

 ● Version : 5.1.0
 ● Date : 06/11/2018
   ★ Loading time from menu to map transition has been improved.
   ★ Loading time from battle to map transition has been improved.
   ✩ Fixed the help file so that uploading assets is explained properly.
   ✩ Fixed a bug that prevented uploading custom files with the "preload" tag.

● Version : 5.2.0
● Date : 06/11/2018
  ★ Now uses PIXI.VERSION, instead of RM version to determine upload limit.

● Version : 5.3.0
● Date : 06/11/2018
  ★ Added plugin parameter "Auto Cache Clear".
  ★ Added plugin commands to clear specific resources( see instructions ).
  ✩ Fixed a Incompatability issue with YEP_GridFreeDoodads.
  ✩ Fixed a crash when attempting to preload/upload all animations.
  ✩ Fixed bug which may cause the game to crash if scene terminated early.

● Version : 5.4.0
● Date : 06/11/2018
  ★ Added new note tag to load assets from a custom folder.
  ★ Added plugin command to clear assets loaded from an entire folder.
  ★ Added plugin command to clear assets loaded from custom folder.
  ★ Added plugin command to clear ALL assets.

● Version : 5.4.1
● Date : 06/11/2018
  ✩ Disabled preload folder option for mobile, as it's not able to be done.
  ✩ Fixed issue where plugin did not read encrypted assets.

● Version : 5.4.2
● Date : 06/11/2018
  ✩ Fixed "extensionType" undefined error.

● Version : 5.5.0
● Date : 20/04/2018
  ★ Preloading animations now also preloads all associated sound effects.
  ★ Added the ability to load entire audio folders.
  ★ Added support for pre-loading videos.
  ✩ Fixed error when testing events through database.


===============================================================================
Contact Me :
===============================================================================

 If you have questions, about this plugin, or commissioning me, or have
a bug to report, please feel free to contact me by any of the below
methods.

rmw : https://forums.rpgmakerweb.com/index.php?members/chaucer.44456
patreon : https://www.patreon.com/chaucer91
discord : chaucer#7538
skypeId : chaucer1991
gmail : chaucer91

()()
(^.^)
c(")(")

===============================================================================

 @param Auto Cache Clear
 @desc Automatically clears ALL images from memory upon scene change.
 @default false
 @type boolean

*/

//=============================================================================
var Imported = Imported || {};
Imported['CHAU SCENESTABILIZER'] = true;
//=============================================================================
var Chaucer = Chaucer || {};
Chaucer.sceneStabilizer = {};
//=============================================================================



( function ( $ ) { //IIFE

 $ = $ || {};

//Create plugin information.
//============================================================================
 var regexp, desc;
 regexp = /Scene Stabilizer : Version - \d+\.\d+\.\d+/;
 for ( var i = 0; i < $plugins.length; i++ ) {
   desc = $plugins[i].description.match( regexp );
   if ( !desc ) continue;
   desc = desc[0];
   $.alias = new Object();
   $.name = desc.split(":")[0].trim();
   $.version = desc.split("-")[1].trim();
   $.params = Parse( $plugins[i].parameters );
   break;
 };

 //--------------------------------------------------------------------------
 function Parse( object )
 { // parse all data in an object
 //--------------------------------------------------------------------------
   try {
     object = JSON.parse( object );
    } catch (e) {
     object = object;
    } finally {
     if ( Array.isArray( object ) ) {
       var l = object.length;
       for ( var i = 0; i < l; i++ ) { object[i] = Parse( object[i] ); };
     } else if ( typeof object === 'object' ) {
       for ( var key in object ) { object[key] = Parse( object[key] ); };
     }
    }
    return object;
 };
//============================================================================

//=============================================================================
// Graphics :
//=============================================================================

//-----------------------------------------------------------------------------
  $.alias.G_playVideo = Graphics.playVideo;
//-----------------------------------------------------------------------------
  Graphics.playVideo = function ( src )
  { // Alias of playVideo
//-----------------------------------------------------------------------------
    if ( this._video.src === src && !this._videoLoading ) {
      this._updateVisibility(true);
      this._video.play();
    } else {
      $.alias.G_playVideo.call( this, src );
    }
  };

//=============================================================================
// AudioManager :
//=============================================================================

//-----------------------------------------------------------------------------
 $.alias.AM_createBuffer = AudioManager.createBuffer;
//-----------------------------------------------------------------------------
 AudioManager.createBuffer = function ( folder, name )
 { // Alias of createBuffer
//-----------------------------------------------------------------------------
   var key = 'audio/' + folder + '/' + name;
   var buffer = SceneManager._scene._audioCache[key];
   return buffer || $.alias.AM_createBuffer.call( this, folder, name );
 };

//=============================================================================
// Game_Interpreter :
//=============================================================================

//-----------------------------------------------------------------------------
  $.alias.GI_p_pluginCommand = Game_Interpreter.prototype.pluginCommand;
//-----------------------------------------------------------------------------
  Game_Interpreter.prototype.pluginCommand = function ( command, args )
  { // Alias of pluginCommand
//-----------------------------------------------------------------------------
    $.alias.GI_p_pluginCommand.call( this, command, args );
    var url = null;
    var filepath = null;
    var imageName = ( args || [] ).join( ' ' ).trim();
    if ( command === 'clear_character' ) url = 'img/characters/' + imageName;
    if ( command === 'clear_picture' ) url = 'img/pictures/' + imageName;
    if ( command === 'clear_animation' ) url = 'img/animations/' + imageName;
    if ( command === 'clear_face' ) url = 'img/faces/' + imageName;
    if ( command === 'clear_battleback1' ) url = 'img/battlebacks1/' + imageName;
    if ( command === 'clear_battleback2' ) url = 'img/battlebacks2/' + imageName;
    if ( command === 'clear_enemy' ) url = 'img/enemies/' + imageName;
    if ( command === 'clear_actor' ) url = 'img/actors/' + imageName;
    if ( command === 'clear_sv_enemy' ) url = 'img/sv_enemies/' + imageName;
    if ( command === 'clear_sv_actor' ) url = 'img/sv_actors/' + imageName;
    if ( command === 'clear_parallax' ) url = 'img/parallaxes/' + imageName;
    if ( command === 'clear_tileset' ) url = 'img/tilesets/' + imageName;
    if ( command === 'clear_title1' ) url = 'img/titles1/' + imageName;
    if ( command === 'clear_title2' ) url = 'img/titles2/' + imageName;
    if ( command === 'clear_all_textures' ) ImageManager.clear();
    if ( command === 'clear_folder' ) filepath = imageName;
    if ( command === 'clear_custom_texture' ) {
      var folder = args.shift();
      var filename = encodeURI( args.join( ' ' ).trim() );
      ImageManager.clearCustomTexture( folder + filename );
    }
    if ( filepath ) ImageManager.clearFolder( filepath );
    if ( url ) ImageManager.clearEntriesWithUrl( url );
  };

//=============================================================================
// Scene_Base :
//=============================================================================

//-----------------------------------------------------------------------------
 $.alias.SB_p_initialize = Scene_Base.prototype.initialize;
//-----------------------------------------------------------------------------
 Scene_Base.prototype.initialize = function ()
 { // Alias of initialize
//-----------------------------------------------------------------------------
   $.alias.SB_p_initialize.call( this );
   this.initializeAudioCache();
   this.initializeUploader();
   this.initializeTicker();
 };

//-----------------------------------------------------------------------------
 $.alias.SB_p_isReady = Scene_Base.prototype.isReady;
//-----------------------------------------------------------------------------
 Scene_Base.prototype.isReady = function ()
 { // Alias of isReady
//-----------------------------------------------------------------------------
   var ready = $.alias.SB_p_isReady.call( this );
   if ( !Graphics._videoLoading )
   if ( this.ignoreUpload() ) {
     return ready;
   } else if ( ready ) {
     if ( !this.isCustomAssetsLoaded() ) return this.preloadAssets();
     if ( !this.isUploaded() ) return this.uploadScene();
   };
   return ready && this.isStable() && this.isAudioReady();
 };

//-----------------------------------------------------------------------------
 $.alias.SB_p_start = Scene_Base.prototype.start;
//-----------------------------------------------------------------------------
 Scene_Base.prototype.start = function ()
 { // Alias of start
//-----------------------------------------------------------------------------
   $.alias.SB_p_start.call( this );
   this.clearAssets();
 };

//-----------------------------------------------------------------------------
 $.alias.SB_p_isActive = Scene_Base.prototype.isActive;
//-----------------------------------------------------------------------------
 Scene_Base.prototype.isActive = function ()
 { // Alias of isActive
//-----------------------------------------------------------------------------
   if ( this._activityDelay > 0 ) {
     this._activityDelay--;
     return false;
   }
   return $.alias.SB_p_isActive.call( this );
 };

//-----------------------------------------------------------------------------
 $.alias.SB_p_terminate = Scene_Base.prototype.terminate;
//-----------------------------------------------------------------------------
 Scene_Base.prototype.terminate = function ()
 { // Alias of terminate
//-----------------------------------------------------------------------------
   $.alias.SB_p_terminate.call( this );
   if ( $.params['Auto Cache Clear'] ) this.clearAllEntries()
   this.stopTicker();
 };

//=============================================================================
// Scene_Map :
//=============================================================================

//-----------------------------------------------------------------------------
 $.alias.SM_p_start = Scene_Map.prototype.start;
//-----------------------------------------------------------------------------
 Scene_Map.prototype.start = function ()
 { // Alias of start
//-----------------------------------------------------------------------------
   $.alias.SM_p_start.call( this );
   this._activityDelay = 12;
 };

//=============================================================================
} )( Chaucer.sceneStabilizer );
//=============================================================================

//=============================================================================
// ImageManager :
//=============================================================================

//-----------------------------------------------------------------------------
ImageManager.clearCustomTexture = function ( url )
{ // clear a custom loaded texture.
//-----------------------------------------------------------------------------
  if ( this._imageCache ) {
    var oldCache = ImageManager._imageCache._items;
    this.clear();
    for ( var key in oldCache ) {
      if ( !key.includes( url ) ) {
        this._imageCache.add( key, oldCache[key].bitmap );
      }
    }
  }
};

//-----------------------------------------------------------------------------
ImageManager.clearFolder = function ( filepath )
{ // clear an entire folder from image cache.
//-----------------------------------------------------------------------------
  if ( this._imageCache ) {
    var oldCache = ImageManager._imageCache._items;
    this.clear();
    for ( var key in oldCache ) {
      if ( !key.includes( filepath ) ) {
        this._imageCache.add( key, oldCache[key].bitmap );
      }
    }
  }
};

//-----------------------------------------------------------------------------
ImageManager.clearEntriesWithUrl = function ( url )
{ // find any entries containing the url provided and clear them.
//-----------------------------------------------------------------------------
  var url = encodeURI( url );
  if ( this._imageCache ) {
    var oldCache = ImageManager._imageCache._items;
    this.clear();
    for ( var key in oldCache ) {
      if ( !key.includes( url ) ) {
        this._imageCache.add( key, oldCache[key].bitmap );
      }
    }
  }
};

//=============================================================================
// Scene_Base :
//=============================================================================

//-----------------------------------------------------------------------------
Scene_Base.prototype.initializeAudioCache = function ()
{ // create a new audio cache for the scene.
//-----------------------------------------------------------------------------
 this._audioCache = {};
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.initializeUploader = function ()
{ // create a new uploader for the scene.
//-----------------------------------------------------------------------------
 if ( Graphics.isWebGL() ) {
   this._uploader = new PIXI.prepare.webgl( Graphics._renderer );
 } else {
   this._uploader = new PIXI.prepare.canvas( Graphics._renderer );
 }
 this._uploader.status = 'waiting';
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.compareVersion = function ( version, requirement )
{ // compare the version.
//-----------------------------------------------------------------------------
 var meetsRequirements = true;
 var version =  version.split( '.' ).map( Number );
 var requirement =  requirement.split( '.' ).map( Number );
 for (var i = 0; i < 3; i++) {
   if ( version[i] < requirement[i] ) meetsRequirements = false;
 }
 return meetsRequirements;
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.removeNonTextures = function ()
{ // remove any PIXI.Graphics, or non-textured sprites.
//-----------------------------------------------------------------------------
 if ( !Graphics.isWebGL() ) {
   this._uploader.queue = this._uploader.queue.filter( function( texture ) {
     return !!texture.source
   } );
 }
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.setUploadSize = function ()
{ // set the amount of files that should be uploaded per frame.
//-----------------------------------------------------------------------------
 if ( this.compareVersion( PIXI.VERSION, '4.2.0' ) ) {
   this._uploader.limiter.maxItemsPerFrame = this._uploader.queue.length;
 } else {
   if ( Graphics.isWebGL() ) {
     PIXI.prepare.webgl.UPLOADS_PER_FRAME = this._uploader.queue.length;
   } else {
     PIXI.prepare.canvas.UPLOADS_PER_FRAME = this._uploader.queue.length;
   }
 }
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.initializeTicker = function ()
{ // create a ticker for the scene.
//-----------------------------------------------------------------------------
 this._stabilizer = new PIXI.ticker.Ticker();
 this._lastDeltaTime = 0;
 this._deltaTime = 0;
 this._elapsedMS = 0;
 this._stabilizer.add( this.updateDelta.bind( this ) );
 this._stabilizer.start();
 this._averageMS = [0];
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.updateDelta = function ( delta )
{ // update the delta time and last delta time.
//-----------------------------------------------------------------------------
 this._deltaTime = delta;
 this._averageMS.push( this._stabilizer.elapsedMS - this._elapsedMS );
 if ( this._averageMS.length > 60 ) this._averageMS.shift();
 this._elapsedMS = this._stabilizer.elapsedMS;
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.averageLatency = function ()
{ // return the amount of latency on average.
//-----------------------------------------------------------------------------
 var size = this._averageMS.length;
 var total = this._averageMS.reduce( function( t, n ) { return t + n } );
 return Math.abs( total / size );
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.uploadScene = function ()
{ // upload scene to the gpu.
//-----------------------------------------------------------------------------
 if ( this._uploader.status = 'waiting' ) {
   this._uploader.status = 'pending';
   this._uploader.add( this );
   this.removeNonTextures();
   this.setUploadSize();
   this._uploader.upload( this.finishUpload.bind( this ) );
   this._uploader.tick();
 }
 return false;
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.finishUpload = function ()
{ // tell the scene it's finished uploading.
//-----------------------------------------------------------------------------
 this._uploader.status = 'complete';
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.ignoreUpload = function ()
{ // if the scene has already been uploaded, ignore the upload sequence.
//-----------------------------------------------------------------------------
 return false;
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.isCustomAssetsLoaded = function ()
{ // return if the custom assets have been created.
//-----------------------------------------------------------------------------
 return !!this._customAssets
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.isUploaded = function ()
{ // return if the scene is ready.
//-----------------------------------------------------------------------------
 return this._uploader.status === 'complete';
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.isAudioReady = function ()
{ // check if audio is ready to be used.
//-----------------------------------------------------------------------------
 var audioReady = true;
 for ( var key in this._audioCache ) {
   if ( this._audioCache.hasOwnProperty( key ) ) {
     if ( !this._audioCache[key].isReady() ) {
       audioReady = false;
       break;
     }
   }
 }
 return audioReady;
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.isStable = function ()
{ // check if the current scene is stable.
//-----------------------------------------------------------------------------
 return this.isUploaded() && this.averageLatency() < 1;
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadAssets = function ()
{ // preload custom assets.
//-----------------------------------------------------------------------------
 this._customAssets = [];
 return false;
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.clearAssets = function ()
{ // remove assets from the screen.
//-----------------------------------------------------------------------------
 if ( this._customAssets ) {
   var assets = this._customAssets;
   var length = assets.length;
   for (var i = 0; i < length; i++) {
     assets[i].parent.removeChild( assets[i] );
   };
 }
 this._customAssets = [];
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.stopTicker = function ()
{ // stop the ticker from running.
//-----------------------------------------------------------------------------
 this._stabilizer.stop();
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadFolder = function ( folder )
{ // load a specific folder.
//-----------------------------------------------------------------------------
 if ( StorageManager.isLocalMode() ) {
  this.preloadLocalFolder( folder );
 }
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadLocalFolder = function ( folder )
{ // preload a folder from a local directory.
//-----------------------------------------------------------------------------
  var path = require( 'path' );
  var base = path.dirname( process.mainModule.filename );
  var fs = require( 'fs' );
  var dir = path.join( base, folder );
  var assets = fs.readdirSync( dir );
  var key = this.getKeyWordFromFolder( folder );
  var length = assets.length;
  var encryptedAudio = Decrypter.hasEncryptedAudio;
  var encryyptedImages = Decrypter.hasEncryptedImages;
  for (var i = 0; i < length; i++) {
      var file = assets[i].replace( encryptedAudio ? '.rpgmvo' : '.ogg', '' );
      var file = file.replace( encryptedAudio ? '.rpgmvm' : '.m4a', '' );
      var file = file.replace( encryyptedImages ? '.rpgmvp' : '.png', '' );
      this.preloadAsset( key + ':' + file );
  }
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.getKeyWordFromFolder = function ( folder )
{ // return keyword from folder.
//-----------------------------------------------------------------------------
 var type = folder.split( '/' )[0];
 var keyword = folder.split( '/' )[1];
 if ( type === 'audio' ) {
   return this.getAudioKeyword( keyword );
 } else if ( type === 'img' ) {
   return this.getImageKeyWord( keyword );
 }
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.getAudioKeyword = function ( keyword )
{ // return audio keyword from value provided.
//-----------------------------------------------------------------------------
 return keyword.trim();
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.getImageKeyWord = function ( keyword )
{ // return keyword for image path.
//-----------------------------------------------------------------------------
 if ( keyword === 'characters' ) return 'character';
 if ( keyword === 'pictures' ) return 'picture';
 if ( keyword === 'animations' ) return 'animation';
 if ( keyword === 'faces' ) return 'face';
 if ( keyword === 'battlebacks1' ) return 'battleback1';
 if ( keyword === 'battlebacks2' ) return 'battleback2';
 if ( keyword === 'enemies' ) return 'enemy';
 if ( keyword === 'actors' ) return 'actor';
 if ( keyword === 'sv_enemies' ) return 'sv_enemy';
 if ( keyword === 'sv_actors' ) return 'sv_actor';
 if ( keyword === 'parallaxes' ) return 'parallax';
 if ( keyword === 'tilesets' ) return 'tileset';
 if ( keyword === 'titles1' ) return 'title1';
 if ( keyword === 'titles2' ) return 'title2';
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadAsset = function ( asset )
{ // preload asset.
//-----------------------------------------------------------------------------
 var data = asset.split( ':' );
 data[0] = data[0].trim();
 data[1] = data[1].trim();
 if ( data[0] === 'custom' ) this.preloadCustom( data[1] );
 if ( data[0] === 'battleback1' ) this.preloadBattleback1( data[1] );
 if ( data[0] === 'battleback2' ) this.preloadBattleback2( data[1] );
 if ( data[0] === 'animation' ) this.preloadAnimation( data[1] );
 if ( data[0] === 'character' ) this.preloadCharacter( data[1] );
 if ( data[0] === 'parallax' ) this.preloadParallax( data[1] );
 if ( data[0] === 'sv_actor' ) this.preloadSvActor( data[1] );
 if ( data[0] === 'sv_enemy' ) this.preloadSvEnemy( data[1] );
 if ( data[0] === 'tilesets' ) this.preloadTileset( data[1] );
 if ( data[0] === 'picture' ) this.preloadPicture( data[1] );
 if ( data[0] === 'system' ) this.preloadSystem( data[1] );
 if ( data[0] === 'title1' ) this.preloadTitle1( data[1] );
 if ( data[0] === 'title2' ) this.preloadTitle2( data[1] );
 if ( data[0] === 'folder' ) this.preloadFolder( data[1] );
 if ( data[0] === 'actor' ) this.preloadActor( data[1] );
 if ( data[0] === 'enemy' ) this.preloadEnemy( data[1] );
 if ( data[0] === 'face' ) this.preloadFace( data[1] );
 if ( data[0] === 'bgm' ) this.preloadBgm( data[1] );
 if ( data[0] === 'bgs' ) this.preloadBgs( data[1] );
 if ( data[0] === 'se' ) this.preloadSe( data[1] );
 if ( data[0] === 'me' ) this.preloadMe( data[1] );
 if ( data[0] === 'video' ) this.preloadVideo( data[1] );
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadCustom = function ( data )
{ // preload a custom asset.
//-----------------------------------------------------------------------------
  data = data.split( ' ' );
  var folder = data.shift();
  var filename = data.join( ' ' ).trim();
  var bitmap = ImageManager.loadBitmap( folder, filename, 0, true );
  var asset = new Sprite( bitmap );
  asset.anchor.set( 1, 1 );
  this.addChild( asset );
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadBattleback1 = function ( filename )
{ // description.
//-----------------------------------------------------------------------------
 var asset = new Sprite( ImageManager.loadBattleback1( filename ) );
 this._customAssets.push( asset );
 asset.anchor.set( 1, 1 );
 this.addChild( asset );
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadBattleback2 = function ( filename )
{ // description.
//-----------------------------------------------------------------------------

 var asset = new Sprite( ImageManager.loadBattleback2( filename ) );
 this._customAssets.push( asset );
 asset.anchor.set( 1, 1 );
 this.addChild( asset );
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadAnimation = function ( animationId )
{ // preload animation textures.
//-----------------------------------------------------------------------------
 if ( animationId === 'all' ) return this.preloadAllAnimations();
 var animation = $dataAnimations[Number( animationId )];
 var file1 = animation.animation1Name;
 var file2 = animation.animation2Name;
 var hue1 = animation.animation1Hue;
 var hue2 = animation.animation2Hue;
 var asset1 = new Sprite( ImageManager.loadAnimation( file1, hue1 ) );
 var asset2 = new Sprite( ImageManager.loadAnimation( file2, hue2 ) );
 this._customAssets.push( asset1 );
 this._customAssets.push( asset2 );
 asset1.anchor.set( 1, 1 );
 asset2.anchor.set( 1, 1 );
 this.addChild( asset1 );
 this.addChild( asset2 );
 animation.timings.forEach( function( timing ) {
   if ( timing.se ) this.preloadSe( timing.se.name );
 }, this );
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadAllAnimations = function ()
{ // preload all animations.
//-----------------------------------------------------------------------------
 var animations = $dataAnimations;
 var length = animations.length;
 for (var i = 1; i < length; i++) {
   if ( $dataAnimations[i] ) this.preloadAnimation( i );
 }
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadCharacter = function ( filename )
{ // description.
//-----------------------------------------------------------------------------
 var asset = new Sprite( ImageManager.loadCharacter( filename ) );
 this._customAssets.push( asset );
 asset.anchor.set( 1, 1 );
 this.addChild( asset );
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadParallax = function ( filename )
{ // description.
//-----------------------------------------------------------------------------
 var asset = new Sprite( ImageManager.loadParallax( filename ) );
 this._customAssets.push( asset );
 asset.anchor.set( 1, 1 );
 this.addChild( asset );
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadSvActor = function ( filename )
{ // description.
//-----------------------------------------------------------------------------
 var asset = new Sprite( ImageManager.loadSvActor( filename ) );
 this._customAssets.push( asset );
 asset.anchor.set( 1, 1 );
 this.addChild( asset );
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadSvEnemy = function ( filename )
{ // preload sv enemy texture.
//-----------------------------------------------------------------------------
 var asset = new Sprite( ImageManager.loadSvEnemy( filename ) );
 this._customAssets.push( asset );
 asset.anchor.set( 1, 1 );
 this.addChild( asset );
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadTileset = function ( filename )
{ // preload a tileset texture.
//-----------------------------------------------------------------------------
 var asset = new Sprite( ImageManager.loadTileset( filename ) );
 this._customAssets.push( asset );
 asset.anchor.set( 1, 1 );
 this.addChild( asset );
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadPicture = function ( filename )
{ // preload a tileset texture.
//-----------------------------------------------------------------------------
 var asset = new Sprite( ImageManager.loadPicture( filename ) );
 this._customAssets.push( asset );
 asset.anchor.set( 1, 1 );
 this.addChild( asset );
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadSystem = function ( filename )
{ // preload a tileset texture.
//-----------------------------------------------------------------------------
 var asset = new Sprite( ImageManager.loadSystem( filename ) );
 this._customAssets.push( asset );
 asset.anchor.set( 1, 1 );
 this.addChild( asset );
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadTitle1 = function ( filename )
{ // preload title image.
//-----------------------------------------------------------------------------
 var asset = new Sprite( ImageManager.loadTitle1( filename ) );
 this._customAssets.push( asset );
 asset.anchor.set( 1, 1 );
 this.addChild( asset );
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadTitle2 = function ( filename )
{ // preload title image.
//-----------------------------------------------------------------------------
 var asset = new Sprite( ImageManager.loadTitle2( filename ) );
 this._customAssets.push( asset );
 asset.anchor.set( 1, 1 );
 this.addChild( asset );
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadActor = function ( filename )
{ // description.
//-----------------------------------------------------------------------------
 var asset = new Sprite( ImageManager.loadActor( filename ) );
 this._customAssets.push( asset );
 asset.anchor.set( 1, 1 );
 this.addChild( asset );
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadEnemy = function ( filename )
{ // description.
//-----------------------------------------------------------------------------
 var asset = new Sprite( ImageManager.loadEnemy( filename ) );
 this._customAssets.push( asset );
 asset.anchor.set( 1, 1 );
 this.addChild( asset );
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadFace = function ( filename )
{ // preload a face.
//-----------------------------------------------------------------------------
 var asset = new Sprite( ImageManager.loadFace( filename ) );
 this._customAssets.push( asset );
 asset.anchor.set( 1, 1 );
 this.addChild( asset );
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadBgm = function ( bgmName )
{ // preload bgm a bgm.
//-----------------------------------------------------------------------------
 var buffer = AudioManager.createBuffer( 'bgm', bgmName );
 this._audioCache['audio/bgm/' + bgmName] = buffer;
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadBgs = function ( bgsName )
{ // preload bgs a bgm.
//-----------------------------------------------------------------------------
 var buffer = AudioManager.createBuffer( 'bgs', bgsName );
 this._audioCache['audio/bgs/' + bgsName] = buffer;
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadSe = function ( seName )
{ // preload me a bgm.
//-----------------------------------------------------------------------------
 var buffer = AudioManager.createBuffer( 'se', seName );
 this._audioCache['audio/se/' + seName] = buffer;
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadMe = function ( meName )
{ // preload se a bgm.
//-----------------------------------------------------------------------------
 var buffer = AudioManager.createBuffer( 'me', meName );
 this._audioCache['audio/me/' + meName] = buffer;
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.preloadVideo = function ( src )
{ // preload a video.
//-----------------------------------------------------------------------------
   Graphics._video.src = 'movies/' + src;
   Graphics._video.onloadeddata =  function() {
     Graphics._videoLoading = false;
   }
   Graphics._videoLoading = true;
};

//-----------------------------------------------------------------------------
Scene_Base.prototype.clearAllEntries = function ()
{ // clear all entries.
//-----------------------------------------------------------------------------
  ImageManager.clear();
};

//=============================================================================
// Scene_Title :
//=============================================================================

//-----------------------------------------------------------------------------
Scene_Title.prototype.preloadAssets = function ()
{ // preload assets for title screen.
//-----------------------------------------------------------------------------
 Scene_Base.prototype.preloadAssets.call( this );
 if ( $dataSystem.titleBgm.name ) this.preloadBgm( $dataSystem.titleBgm.name );
};

//=============================================================================
// Scene_Map :
//=============================================================================

//-----------------------------------------------------------------------------
Scene_Map.prototype.ignoreUpload = function ()
{ // return if the scene is already loaded into memory.
//-----------------------------------------------------------------------------
 if ( SceneManager.isPreviousScene( Scene_Menu ) ) return true;
 if ( SceneManager.isPreviousScene( Scene_Battle ) ) return true;
 return Scene_Base.prototype.ignoreUpload.call( this );
};

//-----------------------------------------------------------------------------
Scene_Map.prototype.preloadAssets = function ()
{ // preload custom assets.
//-----------------------------------------------------------------------------
 Scene_Base.prototype.preloadAssets.call( this );
 var processing = false;
 var notes = '';
 if ( $dataMap.note ) notes = $dataMap.note.split( '\n' );
 var length = notes.length;
 for (var i = 0; i < length; i++) {
   var note = notes[i].trim();
   if ( note === '</preload>' ) break;
   if ( processing ) this.preloadAsset( notes[i] );
   if ( note === '<preload>' ) processing = true;
 }
 if ( $dataMap.bgm && $dataMap.bgm.name ) this.preloadBgm( $dataMap.bgm.name );
 if ( $dataMap.bgs && $dataMap.bgs.name ) this.preloadBgs( $dataMap.bgs.name );
};

//=============================================================================
// Scene_Battle :
//=============================================================================

//-----------------------------------------------------------------------------
Scene_Battle.prototype.preloadAssets = function ()
{ // preload custom assets.
//-----------------------------------------------------------------------------
 Scene_Base.prototype.preloadAssets.call( this );
 var members = BattleManager.allBattleMembers()
 var length = members.length;
 for (var i = 0; i < length; i++) {
   var member = members[i];
   if ( member.isActor() ) this.preloadActorAssets( member );
   if ( member.isEnemy() ) this.preloadEnemyAssets( member );
 }
 if ( $gameSystem.battleBgm().name ) {
   this.preloadBgm( $gameSystem.battleBgm().name );
 }
 if ( $gameSystem.victoryMe().name ) {
   this.preloadMe( $gameSystem.victoryMe().name );
 }
 if ( $gameSystem.defeatMe().name ) {
   this.preloadMe( $gameSystem.defeatMe().name );
 }
};

//-----------------------------------------------------------------------------
Scene_Battle.prototype.preloadActorAssets = function ( actor )
{ // preload any assets related to an actor.
//-----------------------------------------------------------------------------
 var processing = false;
 var notes = actor.actor().note.split( '\n' );
 var length = notes.length;
 for (var i = 0; i < length; i++) {
   var note = notes[i].trim();
   if ( note === '</preload>' ) break;
   if ( processing ) this.preloadAsset( notes[i] );
   if ( note === '<preload>' ) processing = true;
 }
};

//-----------------------------------------------------------------------------
Scene_Battle.prototype.preloadEnemyAssets = function ( enemy )
{ // preload any assets related to an actor.
//-----------------------------------------------------------------------------
 var processing = false;
 var notes = enemy.enemy().note.split( '\n' );
 var length = notes.length;
 for (var i = 0; i < length; i++) {
   var note = notes[i].trim();
   if ( note === '</preload>' ) break;
   if ( processing ) this.preloadAsset( notes[i] );
   if ( note === '<preload>' ) processing = true;
 }
};
