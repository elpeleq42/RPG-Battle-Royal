/*:
 * @plugindesc v1.0 - Do not turn the player when moving by input.
 * @author Caethyril
 * @help Terms of use:
 *    Free to use and modify.
 */

(function() {
'use strict';

	let noTurn;

	(function(alias) {
		Game_Player.prototype.executeMove = function(d) {
			noTurn = Input.isControllerConnected();
			alias.call(this, d);
		};
	})(Game_Player.prototype.executeMove);

	(function(alias) {
		Game_Player.prototype.setDirection = function(d) {
			if (!noTurn) alias.call(this, d);
			else noTurn = false;
		};
	})(Game_Player.prototype.setDirection);

})();