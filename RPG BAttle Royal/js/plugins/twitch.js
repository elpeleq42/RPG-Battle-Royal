$starttwitch=function(){
	document.getElementById("playerindicator").style.visibility="hidden"
	var keyconfig_alias = Scene_Map.prototype.updateScene;
	Scene_Map.prototype.updateScene = function() {
	keyconfig_alias.call(this);

	if(Input.isTriggered('menu') || Input.isTriggered('escape')){
		
		if((SceneManager._scene instanceof Scene_Options)===false &&(SceneManager._scene instanceof Scene_Menu)===false){
			$gameTemp.reserveCommonEvent(11,true);

		}

	}

	}
	window.viewerlist=["BigBadCreature"]
	window.timeforinvasion=60
	window.healtimer=0;
	window.move=0
	window.questions=0
	window.thelab=0
	window.yes=0
	window.boss=0
	window.no=0
	window.kong=0

	const tmi = require('./js/plugins/tmi.js');

	const client = new tmi.Client({
		connection: { reconnect: true },
		channels: [ localStorage.twitchname ]
	});
	
	client.connect().catch($errortwitch);
	
	
	
	
	
	
	$gameMessage.add("Welcome "+localStorage.twitchname+". \\|\\.\\^")
	
	var sprite
	function countdown(){
		SceneManager._scene.removeChild(sprite)
		var bitmap = new Bitmap(200, 45); 
		bitmap.outlineWidth = 4;
		bitmap.fontSize=28;
		if(timeforinvasion>0) bitmap.drawText(`Next invasion: `+timeforinvasion+`s`,0,0,200,40,"center");
		else {
			bitmap.drawText(`!invade available`,0,0,200,40,"center");
		}
		sprite = new Sprite(bitmap);


		sprite.z=20;
		sprite.setFrame(0,0,Graphics.boxWidth, Graphics.boxHeight);
		SceneManager._scene.addChild(sprite);

		sprite.x=1070
		sprite.y=300
		
		if(timeforinvasion>0){
			setTimeout(countdown, 1000);
			timeforinvasion--
		}else{
			setTimeout(countdown, 200)
		}
		
	}
	countdown(timeforinvasion)
	
	setTimeout($randomevent,getRandomInt(60000,90000))
	setInterval(() => {
		$gameMessage.add("Oh no, monsters are invading\\|\\|\\.\\^")
		timeforinvasion=60
		Yanfly.SpawnEventAt(2,44, 0, 9, true, viewerlist[getRandomInt(0,viewerlist.length-1)])
		Yanfly.SpawnEventAt(2,44, 25, 5, true, viewerlist[getRandomInt(0,viewerlist.length-1)])
		Yanfly.SpawnEventAt(2,44, 14, 24, true, viewerlist[getRandomInt(0,viewerlist.length-1)])
		Yanfly.SpawnEventAt(2,44, 34, 17, true, viewerlist[getRandomInt(0,viewerlist.length-1)])

		$gameMap.event(1000+lastspawnedabove100).HP=7
	},getRandomInt(120000,125000) );

	client.on('cheer', (channel, userstate, message) => {
		const username = userstate['display-name'];
		const bits = userstate.bits;
		if(bits<100) return
	  
		Yanfly.SpawnEventAt(2,44, 0, 9, true, username)
		$gameMap.event(1000+lastspawnedabove100).HP=7
	});
	
	client.on('message', (channel, tags, message, self) => {
		
		if(!viewerlist.includes(`${tags['display-name']}`)) viewerlist.push(`${tags['display-name']}`)

		if($timetochooserandomevent==true){
			if(message.toLowerCase()=="!move"){
				move++
			}else if(message.toLowerCase()=="!boss"){
				boss++
			}else if(message.toLowerCase()=="!escape"){
				thelab++
			}else if(message.toLowerCase()=="!questions"){
				questions++
			}else if(message.toLowerCase()=="!kong"){
				kong++
			}
		}
		if((message.toLowerCase()=="heal" || message.toLowerCase()=="!heal") && healtimer==0){
			healtimer=30
			$gameParty.members()[0].gainHp(50)
			setTimeout(() => {
				healtimer=0
			}, 30000);
		}
		if($timetochooserandomevent==false && timeforinvasion<1){
			if(message.toLowerCase()=="!invade"){
				timeforinvasion=60
				Yanfly.SpawnEventAt(2,44, 0, 9, true, `${tags['display-name']}`)
				$gameMap.event(1000+lastspawnedabove100).HP=7
				
			} 
		}
		if(message.toLowerCase()=="!yes" || message.toLowerCase()=="yes"){
			yes++
		}else if(message.toLowerCase()=="!no" || message.toLowerCase()=="no"){
			no++
		}

		if(localStorage.hidechat=="false"){var chat = document.getElementById('txtarea');
		var msg = document.createElement('div');
		var user = document.createElement('span');
		var chatText = document.createElement('span');
		user.style.color = "#c92cac";
		chatText.style.color = "#000000";
		chatText.style.textShadow = "-1px 0 rgba(230, 230, 230, 0.25), 0 1px rgba(230, 230, 230, 0.25), 1px 0 rgba(230, 230, 230, 0.25), 0 -1px rgba(230, 230, 230, 0.25)";
		user.style.textShadow = "-1px 0 rgba(230, 230, 230, 0.25), 0 1px rgba(230, 230, 230, 0.25), 1px 0 rgba(230, 230, 230, 0.25), 0 -1px rgba(230, 230, 230, 0.25)";
		if(message!==""){
			user.textContent = tags.username;
			if(localStorage.texttospeech=="true"){
				var msgg = new SpeechSynthesisUtterance();
				msgg.lang = 'en-US'
				msgg.text = tags.username+" has said:"+ message
				window.speechSynthesis.speak(msgg);
			}		
		}
		else{
		user.textContent=""
		}
		user.whiteSpace='pre-wrap'
		chatText.whiteSpace='pre-wrap'
		user.style.wordWrap='break-word'
		chatText.style.wordWrap='break-word'
		chatText.textContent = changechat(message)

		if (msg){
		msg.appendChild(user);
		msg.appendChild(chatText);

		}
		chatHistory.push([user, chatText]);
		if (chat) {
		chat.appendChild(msg);
		chat.scrollTop = chat.scrollHeight;
		}}

	});

}

$errortwitch=function(err){
	if(!err) err=""
	$gameMessage.add("There was an error connecting to your twitch.\n"+err)
	setTimeout(()=>{location.reload()},1500)
}
var randomevent
function $randomevent(){
	function question(which,thecounter){
		if(!thecounter) thecounter=1
		yes=0
		no=0
		AudioManager.playSe({ name: "elevator-music", volume: 30, pitch: 90, pan: 0 } );
		$gameTimer.start(540)
		if(which==1){
			$gameMessage.add("Does chat think you're smart?\\|\\|\\|\\|\\.\\^")
		}else if(which==2){
			$gameMessage.add("Does chat agree you've been cringe?\\|\\|\\|\\|\\.\\^")
		}else if(which==3){
			$gameMessage.add("Does chat agree you rage a lot?\\|\\|\\|\\|\\.\\^")
		}else if(which==4){
			$gameMessage.add("Does chat think you're good at games?\\|\\|\\|\\|\\.\\^")
		}else if(which==5){
			$gameMessage.add("Does chat think you're a pervert?\\|\\|\\|\\|\\.\\^")
		}else if(which==6){
			$gameMessage.add("Is chat scared of horror games?\\|\\|\\|\\|\\.\\^")
		}else if(which==7){
			$gameMessage.add("Are e-sports fun?\\|\\|\\|\\|\\.\\^")
		}else if(which==8){
			$gameMessage.add("Does chat like math?\\|\\|\\|\\|\\.\\^")
		}else if(which==9){
			$gameMessage.add("Does chat speak multiple languages?\\|\\|\\|\\|\\.\\^")
		}else if(which==10){
			$gameMessage.add("Are competitive games fun?\\|\\|\\|\\|\\.\\^")
		}else if(which==11){
			$gameMessage.add("Is chat into anime?\\|\\|\\|\\|\\.\\^")
		}else if(which==12){
			$gameMessage.add("Are there more furries than non-furries in chat?\\|\\|\\|\\|\\.\\^")
		}else if(which==13){
			$gameMessage.add("Are there more weebs than furries in chat?\\|\\|\\|\\|\\.\\^")
		}else if(which==14){
			$gameMessage.add("Is there more PC gamers than console gamers in chat?\\|\\|\\|\\|\\.\\^")
		}else if(which==15){
			$gameMessage.add("Is twitch better than youtube?\\|\\|\\|\\|\\.\\^")
		}else if(which==16){
			$gameMessage.add("Are indie games better than AAA?\\|\\|\\|\\|\\.\\^")
		}else if(which==17){
			$gameMessage.add("Is gambling fun?\\|\\|\\|\\|\\.\\^")
		}else if(which==18){
			$gameMessage.add("Does chat like puzzle games?\\|\\|\\|\\|\\.\\^")
		}else if(which==19){
			$gameMessage.add("Does chat like adult games?\\|\\|\\|\\|\\.\\^")
		}
		

		setTimeout(()=>{
			AudioManager.stopSe();
			if($gamePlayer._x<55 && yes>no){
				AudioManager.playSe({ name: "Applause1", volume: 30, pitch: 90, pan: 0 } );
				$gameParty.gainGold(getRandomInt(100,200));
				$gameMessage.add("Correct!\\|\\.\\^")
				setTimeout(()=>{$gamePlayer.locate(55,51);},2000)
			}else if($gamePlayer._x>55 && no>yes){
				AudioManager.playSe({ name: "Applause1", volume: 30, pitch: 90, pan: 0 } );
				$gameParty.gainGold(getRandomInt(100,200));
				$gameMessage.add("Correct!\\|\\.\\^")
				setTimeout(()=>{$gamePlayer.locate(55,51);},2000)
			}else{
				AudioManager.playSe({ name: "Damage3", volume: 30, pitch: 90, pan: 0 } );
				$gameParty.members()[0].gainHp(-20)
				$gameMessage.add("Wrong!\\|\\.\\^")
				setTimeout(()=>{$gamePlayer.locate(55,51);},2000)
			}
		},8000)


		if(thecounter<5){
			var tthecounter=thecounter+1
			setTimeout(question,11000,getRandomInt(1,20),tthecounter)
		}else{
			setTimeout(()=>{
				$gameMessage.add("Congrats! You seem to know chat very well\\|\\|\\|\\.\\^")
				setTimeout($randomevent,getRandomInt(60000,90000))
				setTimeout(() => {
					$gamePlayer.locate(24,16);
					AudioManager.playBgs( { name: "just-relax-11157", volume: 30, pitch: 100, pan: 0 } );
				}, 3000);
			},11000)
		}
	}
	
	$timetochooserandomevent=true
	$gameMessage.add("Random event time! :D\\|\\| \n Time for chat to choose one:\n !move !boss !escape !kong !questions\\|\\|\\|\\|\\|\\|\\|\\^")
	
	setTimeout(()=>{
		$timetochooserandomevent=false
		var arr=[-1,move,thelab,questions,boss,kong]
		arr=arr.indexOf(Math.max(...arr));
		if(arr!=0){
			randomevent=arr
		}else{
			randomevent=getRandomInt(1,6)
		}
		move=0
		questions=0
		thelab=0
		boss=0
		kong=0

		
		if(randomevent==1){
			$gameMessage.add("Move or die\\|\\|\\^")
			setTimeout(() => {
				$gamePlayer.locate(59,12);
				setTimeout(()=>{
					runaway=setInterval(()=>{
						Yanfly.SpawnEventAt1(2, 42, $gamePlayer._x, $gamePlayer._y, true, "","")
					},500)
					setTimeout(()=>{
						clearTimeout(runaway)
						$gamePlayer.locate(24,16);
						$gameParty.gainGold(getRandomInt(200,300));
						$gameMessage.add("Congrats! You survived!\\|\\|\\This time..|\\ \\^")
						setTimeout($randomevent,getRandomInt(60000,90000))
					},20000)
				},1500)
			}, 2000);
		}else if(randomevent==2){
			$gameMessage.add("Find the exit within 60s\\|\\|\\^")
			setTimeout(()=>{
				AudioManager.playBgs( { name: "caves-of-dawn-10376", volume: 30, pitch: 100, pan: 0 } );
				$gameMap._interpreter.pluginCommand("AmbientLight", [ "0","0" ]);
				$gameMap._interpreter.pluginCommand("PlayerLantern", [ "flashlight" ]);
				
				document.getElementById('minimap').style.visibility="hidden"
				document.getElementById('playerindicator').style.visibility="hidden"

				if(getRandomInt(1,4)<3){
					$gamePlayer.locate(4,42);
				}else{
					$gamePlayer.locate(9,54);
				}
				$gameTimer.start(3600)
				window.lab=setTimeout(()=>{
					AudioManager.playSe({ name: "Damage3", volume: 30, pitch: 90, pan: 0 } );
					$gameParty.members()[0].gainHp(-100)
					$gameMessage.add("You died\\|\\|\\^")
				},60000)

			},2000)
		}else if(randomevent==3){
			
			$gameMessage.add("Lets see if you know your chat\\|\\|\\^")
			setTimeout(()=>{
				$gamePlayer.locate(55,51);
				
				setTimeout(()=>{
					AudioManager.fadeOutBgs(1);
					question(getRandomInt(1,20),1)
				},1000)

			},3000)
		}else if(randomevent==4){
			
			$gameMessage.add("Boss survival!\\|\\|\\^")
			setTimeout(()=>{
				Yanfly.SpawnEventAt(2,45, 97, 8, true, `BigBadBoss`)
				
				
				
				
				$gamePlayer.locate(97,14);
				AudioManager.fadeOutBgs(1);
				AudioManager.playSe({ name: "chasing-victory-main-9448", volume: 30, pitch: 90, pan: 0 } );
				$gameTimer.start(2400)
				
			},3000)
		}else if(randomevent==5){
			
			$gameMessage.add("Touch the boss!\\|\\|\\^")
			setTimeout(()=>{
				Yanfly.SpawnEventAt(2,47, 85, 45, true, `Kong`)
				
				
				window.waitchecker=setTimeout((a)=>{
					$gameMessage.add("You survived!\\|\\|\\^")
					$gameMap.eraseEvent(a)
					$gamePlayer.locate(24,16);
					AudioManager.fadeOutBgs(1);
					clearInterval(kongcheck)
					AudioManager.playBgs( { name: "just-relax-11157", volume: 30, pitch: 100, pan: 0 } );
					setTimeout($randomevent,getRandomInt(60000,90000))
				},40000,$gameMap._events.length-1)
				
				$gamePlayer.locate(104,57);
				AudioManager.playSe({ name: "chasing-victory-main-9448", volume: 30, pitch: 90, pan: 0 } );
				$gameTimer.start(2400)
				
			},3000)
		}

		
	},11000)
	
}
$timetochooserandomevent=false


