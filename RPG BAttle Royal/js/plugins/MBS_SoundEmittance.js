//=============================================================================
// MBS - Sound Emittance (v1.2.1)
//-----------------------------------------------------------------------------
// by Masked
//=============================================================================
//-----------------------------------------------------------------------------
// Especificações do plugin (Não Modifique!)
// Plugin Specifications (Do not modify!)
//
/*:
@author Masked

@plugindesc Allows you to set an sound emittance for events with 3d positioning
and distance.
<MBS SEmittance>

@param Use HRTF
@desc Choose whether to use HRTF panning model for the 3D  sound positioning
or not (RPG Maker uses equalpower by default).
@default true

@param 3D Sound
@desc Determines whether to use tridimensional sound positioning or not.
@default true

@help
===========================================================================
Introduction
===========================================================================
Allows you to set an sound emission for an event so that the sound 3D 
position and volume change as the player moves.

===========================================================================
How to use
===========================================================================
To set the sound emittance source file, add a comment like this on the 
event commands:
<s_emittance: folder/file> 

E.g.:
<s_emittance: bgs/Drips>
<s_emittance: se/Bell>

And to set the emittance radius:
<s_e_radius: N>

E.g.:
<s_e_radius: 3>

You can also set the sound volume and pitch by adding the following notes:
<s_e_volume: N>
<s_e_pitch: N>

E.g.:
<s_e_volume: 90>
<s_e_pitch: 50>

The radius is measured in tiles (48x48 px), it's possible to use float 
values. If no radius is given, it will be assumed it's 1.

*/
/*:pt
@author Masked

@plugindesc Permite definir uma emissão de som para eventos com posição e 
distância.
<MBS SEmittance>

@param Use HRTF
@desc Determina quando usar HRTF para o posicionamento 3D do som ou não.
(O RPG Maker usa equalpower por padrão).
@default true

@param 3D Sound
@desc Determina usar posicionamento 3D para o som ou não.
@param true

@help
===========================================================================
Introdução
===========================================================================
Permite que você escolha um efeito sonoro para ser emitido por um evento,
dessa forma conforme o jogador se mover a posição de volume do som se 
alteram de acordo com a distância do evento.

===========================================================================
Como usar
===========================================================================
Para definir uma emissão de som, ponha num comentário do evento:
<s_emittance: folder/file> 

Ex.:
<s_emittance: bgs/Drips>
<s_emittance: se/Bell>

E para definir o raio de alcance do som:
<s_e_radius: N>

Ex.:
<s_e_radius: 3>

Para definir o volume e frequência (pitch) do som:
<s_e_volume: N>
<s_e_pitch: N>

Ex.:
<s_e_volume: 90>
<s_e_pitch: 50>

O raio é medido em tiles, você pode usar valores decimais se quiser, se 
não for definido um raio, ele será 1.
*/

var Imported = Imported || {};
 
var MBS = MBS || {};
MBS.SoundEmittance = {};

"use strict";

(function ($) {

	var fs = require('fs');

	$.Parameters = $plugins.filter(function(p) {return p.description.contains('<MBS SEmittance>');})[0].parameters;
 	$.Param = $.Param || {};

 	//-----------------------------------------------------------------------------
	// Settings
	//

	$.Param.useHRTF = !!$.Parameters['Use HRTF'].match(/true/i);
	$.Param.use3D   = !!$.Parameters['3D Sound'].match(/true/i);

 	//-----------------------------------------------------------------------------
	// Module Functions
	//

	function audioFilename(filename) {
		var ext = AudioManager.audioFileExt();

		if (fs.existsSync(window.location.pathname.replace(/\/[^/]*$/, '/').substring(1) + filename + ext))
			return filename + ext;
		return filename + '.m4a';
	}


	//-----------------------------------------------------------------------------
	// WebAudio
	//
	// Makes some changes to allow 3D sound positioning

	// Aliases
	var WebAudio_clear_old = WebAudio.prototype.clear;

	// Sets WebAudio 'position' property
	Object.defineProperty(WebAudio.prototype, 'position', {
		get: function() {
			return this._position;
		},
		set: function(value) {
			this._position = value;
			if (this._pannerNode)
	        	this._pannerNode.setPosition((this._position[0] || 0), this._position[2] || 0, (this._position[1] || 0));
		}
	});

	// Setups the initial values for the WebAudio instance
	// > Added initial position
	WebAudio.prototype.clear = function() {
	    WebAudio_clear_old.apply(this, arguments)
	    this._position = [0, 0];
	};

	// Updates the WebAudio instance panner to allow 3d positioning
	// > Changed almost everything here
	WebAudio.prototype._updatePanner = function() {
	    if (this._pannerNode) {
	    	this._pannerNode.distanceModel = 'linear';
	    	if ($.Param.useHRTF)
	    		this._pannerNode.panningModel = 'HRTF';
	    	this._pannerNode.setOrientation(0,0,0);
	    }
	};

	//-----------------------------------------------------------------------------
	// Game_SoundEmittance
	//
	var $gameSoundEmittances = [];
	var $_soundEmittances = [];

	function Game_SoundEmittance() {
		this.initialize.apply(this, arguments);
	}

	Game_SoundEmittance.prototype.initialize = function(filename) {
		if (this._erased==true) return
		this.filename = filename;
		this.volume = 0.9;
		this.pitch = 1;
		this.playing = false;
		this.playParameters = [];
		this.maxDistance = 1;
		this.position = [0, 0];
	}

	Game_SoundEmittance.prototype.play = function() {
		this.playing = true;
		this.playParameters = arguments;
	}

	Game_SoundEmittance.prototype.stop = function() {
		this.playing = false;
		this.playParameters = [];
	}

	//-----------------------------------------------------------------------------
	// Game_Event
	//

	// Aliases
	var Game_Event_update_old = Game_Event.prototype.update;
	var Game_Event_refresh_old = Game_Event.prototype.refresh;
	var Game_Event_setupPage_old = Game_Event.prototype.setupPage;

	// Event page setup
	// > Added call to sound emittance setup
	Game_Event.prototype.setupPage = function() {
	    Game_Event_setupPage_old.apply(this, arguments);
	    this.setupSEmittance();
	};

	// Setups the sound emittance for the event
	Game_Event.prototype.setupSEmittance = function() {
		if (this._sEmittance)
			this._sEmittance.stop();

		if (!this.page()) return;

		var list = this.list();

		var comments = "";
		for (let i = 0; i < list.length; i++) {
			if (list[i].code == 108 || list[i].code == 408) {
				comments += list[i].parameters[0] + "\n";
			}
			
		}
		var filename = (/\s*<\s*s_emittance\s*:\s*(.+)\s*>\s*/i.exec(comments) || [])[1];
		if (filename != undefined)
			this._sEmittance = new Game_SoundEmittance(audioFilename(AudioManager._path + filename));

		var radius = (/\s*<\s*s_e_radius\s*:\s*(\d+(\.\d+)?)\s*>\s*/i.exec(comments) || [])[1];
		this._sEmittanceRadius = radius || 12;

		var volume = (/\s*<\s*s_e_volume\s*:\s*(\d+)\s*>\s*/i.exec(comments) || [])[1];
		if (volume && this._sEmittance)
			this._sEmittance.volume = volume / 100;

		var pitch = (/\s*<\s*s_e_pitch\s*:\s*(\d+)\s*>\s*/i.exec(comments) || [])[1];
		if (pitch && this._sEmittance)
			this._sEmittance.pitch = pitch / 100;
	};

	// Event update process
	// > Added call to sound emittance update
	Game_Event.prototype.update = function() {
	    Game_Event_update_old.apply(this, arguments);
	    if(this._erased==false) this.updateSEmittance();
	};

	// Updates the sound emittance as needed
	Game_Event.prototype.updateSEmittance = function() {
		if (this._sEmittance) {
			if (!this._sEmittance.playing) {
				this._sEmittance.play(true, 0);
				this._sEmittance.maxDistance = this._sEmittanceRadius || 12;
			}
			this._sEmittance.position = [this._realX - $gamePlayer._realX, this._realY - $gamePlayer._realY];
		}
	};

	Game_Event.prototype.refresh = function() {
		Game_Event_refresh_old.apply(this, arguments);
		if(this._erased==false) this.refreshSEmittance();
	}

	// Adds the sound emittance to the playing list
	Game_Event.prototype.refreshSEmittance = function() {
		if (this._sEmittance) {
			for (var i = 0; i < $_soundEmittances.length; i++)
				if ($_soundEmittances[i]._evEmittance == this._sEmittance) return;
			var emittance = new WebAudio(this._sEmittance.filename);
			emittance._evEmittance = this._sEmittance;

			emittance.volume = this._sEmittance.volume;
			emittance.pitch = this._sEmittance.pitch;
			
			$_soundEmittances.push(emittance);
		}
	};

	// Stops the sound emittance
	Game_Event.prototype.stopSEmittance = function() {
		if (this._sEmittance)
			this._sEmittance.stop();
	};

	//-----------------------------------------------------------------------------
	// Game_Map
	//

	var Game_Map_setupEvents = Game_Map.prototype.setupEvents;

	Game_Map.prototype.setupEvents = function() {
		for (let i = 0; i < $_soundEmittances.length; i++) {
			$_soundEmittances[i].stop();
		}
		$_soundEmittances = [];
	    Game_Map_setupEvents.apply(this, arguments);
	};

	//-----------------------------------------------------------------------------
	// Scene_Map
	//
	var Scene_Map_update    = Scene_Map.prototype.update;
	var Scene_Map_start     = Scene_Map.prototype.start;
	var Scene_Map_terminate = Scene_Map.prototype.terminate;

	Scene_Map.prototype.update = function() {
		Scene_Map_update.apply(this, arguments);
		for (let i = 0; i < $_soundEmittances.length; i++) {
			
			if ($.Param.use3D) 
				$_soundEmittances[i].position = $_soundEmittances[i]._evEmittance.position;
			else 
			{
				var dx = $_soundEmittances[i]._evEmittance.position[0], 
					dy = $_soundEmittances[i]._evEmittance.position[1];
				var distance = Math.sqrt(dx*dx + dy*dy);
				$_soundEmittances[i].volume = $_soundEmittances[i]._evEmittance.volume * ($_soundEmittances[i]._evEmittance.maxDistance - distance) / $_soundEmittances[i]._evEmittance.maxDistance;
			}
			if ($_soundEmittances[i].isPlaying()) {
				if (!$_soundEmittances[i]._evEmittance.playing) {
					$_soundEmittances[i].stop();
					$_soundEmittances.splice($_soundEmittances.indexOf($_soundEmittances[i]), 1);
				}
			} else if ($_soundEmittances[i] && $_soundEmittances[i].isReady()) {
				$_soundEmittances[i].play.apply($_soundEmittances[i], $_soundEmittances[i]._evEmittance.playParameters);
				$_soundEmittances[i]._pannerNode.maxDistance = $_soundEmittances[i]._evEmittance.maxDistance;
			}
		}
	}

	Scene_Map.prototype.start = function() {
		Scene_Map_start.apply(this, arguments);
		$gameMap.refresh();
	}

	Scene_Map.prototype.terminate = function() {
		Scene_Map_terminate.apply(this, arguments);
		for(var i=0; i<$_soundEmittances.length;i++){
			$_soundEmittances[i].stop()
		}
		$_soundEmittances = [];
	}

})(MBS.SoundEmittance);

// Registering the plugin
if (Imported["MVCommons"]) {
 	PluginManager.register("MBS_SoundEmittance", 1.2, "Allows you to set an sound emittance for events", {  
     	email: "masked.rpg@gmail.com",
    	name: "Masked", 
 	    website: "N/A"
    }, "2015-07-26");
} else {
	Imported.MBS_SoundEmittance = 1.2;
}
