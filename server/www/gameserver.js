try{

	if(typeof require('nw.gui') !== "undefined"){
		process.chdir("./www/");
	
	}}catch(e){}
	
	var mxplayers,adminpassword,servportnumb,initgold,upspeed,servpass,servmap
	
	//Server configs://////////////////////////////////
	const maxnumberofplayers=mxplayers || 100		// Up to 1000
	const admpassword=adminpassword || undefined   //
	const serverPort=servportnumb || 1000  		  //
	const initialgold=initgold || 0    			 //
	const upspeedmap=upspeed || 0	  			//
	var serverpass=servpass || undefined	   //
	var map=servmap	|| "default"			  // default, free4all, a link or full file path
	const tickrate=30            			 // Between 1 and 1000
	const maxafktime=120                    // Above 0
	/////////////////////////////////////////
	
	
	
	
	//////////////////////////////////////////////
	const ws = require("./lib/index.js")
	const crypt = require('crypto')
	const fs   = require('fs')
	var nonmovable = []
	var playercounter= new Uint8Array(1001).fill(0)
	var playernames = new Array(1001).fill("")
	var giveID=0
	var disconnectthis
	var string
	var numberofplayers=0
	var serverfull=false
	var playersalive=0
	var serverlock=false
	var checkendgame
	var highestid=0
	var objectcounter=0
	var objects=[]
	var checkobjs=[]
	var temp
	var timelapse=undefined
	var arrbuffer=undefined
	var tobeuploaded=[]
	var banlist=[]
	var reseting=false
	
	
	
	if(map!=="default" && map!=="free4all" && !(map.indexOf("http")==0)){
		var file = process.argv[2],
		map = fs.readFileSync(servmap);
		if(upspeedmap!=0){
	

	
			breakup=Math.ceil(map.length/(102400*upspeedmap))
			forsize=Math.ceil(map.length/breakup)
			arrbuffer=new Array(breakup)
			for(var i=0;i<breakup;i++){
				arrbuffer[i]=Buffer.allocUnsafe(forsize)
				map.copy(arrbuffer[i],0,i*forsize,(i+1)*forsize)
				arrbuffer[i]=arrbuffer[i]
			}
			map="filecustom"
	
	
		}else{
			buffer=map.toString('binary')
			map="filecustom"
			
		}
	}
	servmap=undefined
	
		function map_upload_process(tobindex,time){
			var tempslice
			var serverconnections=server.connections
			if(tobeuploaded[tobindex]==undefined && tobeuploaded.length>0){
				tobindex=0
				
				for(var u=0;u<serverconnections.length;u++){
				if(serverconnections[u].tempID==tobeuploaded[tobindex][0]){
					if(tobeuploaded.length>=5){
						serverconnections[u]._sendText(Buffer.concat(arrbuffer[tobeuploaded[tobindex][1]]).toString("binary"))
						tobeuploaded[tobindex][1]=tobeuploaded[tobindex][1]+1
					}else{
						tempslice=arrbuffer.slice(tobeuploaded[tobindex][1],tobeuploaded[tobindex][1]+Math.round(5/tobeuploaded.length))
						if(tempslice.length===0){
							tobeuploaded[tobindex][1]=breakup
						}else{
							serverconnections[u]._sendText(Buffer.concat(tempslice).toString("binary"))
							tobeuploaded[tobindex][1]=tobeuploaded[tobindex][1]+Math.round(5/tobeuploaded.length)
						}
						
					}
					
					if(tobeuploaded[tobindex][1]==breakup){
						tobeuploaded.splice(tobindex,1);
						serverconnections[u]._sendText("finished");
						serverconnections[u].close()
					}
					if(tobeuploaded.length>0){ 
						if(tobeuploaded.length>=5){
							mapupload(tobindex++,100)
						}else{
							mapupload(tobindex++,Math.ceil(500/tobeuploaded.length))
						}
					}
					break
					return
				}
			}
			tobeuploaded.splice(tobindex,1)
				
			}else if(tobeuploaded.length==0){
				return
			}
			for(var u=0;u<serverconnections.length;u++){
				if(serverconnections[u].tempID==tobeuploaded[tobindex][0]){
					if(tobeuploaded.length>=5){
						serverconnections[u]._sendText(Buffer.concat(arrbuffer[tobeuploaded[tobindex][1]]).toString("binary"))
						tobeuploaded[tobindex][1]=tobeuploaded[tobindex][1]+1
					}else{
						tempslice=arrbuffer.slice(tobeuploaded[tobindex][1],tobeuploaded[tobindex][1]+Math.round(5/tobeuploaded.length))
						if(tempslice.length===0){
							tobeuploaded[tobindex][1]=breakup
						}else{
							serverconnections[u]._sendText(Buffer.concat(tempslice).toString("binary"))
							tobeuploaded[tobindex][1]=tobeuploaded[tobindex][1]+Math.round(5/tobeuploaded.length)
						}
						
					}
					
					if(tobeuploaded[tobindex][1]==breakup){
						tobeuploaded.splice(tobindex,1);
						serverconnections[u]._sendText("finished");
						serverconnections[u].close()
					}
					if(tobeuploaded.length>0){ 
						if(tobeuploaded.length>=5){
							mapupload(tobindex++,100)
						}else{
							mapupload(tobindex++,Math.ceil(500/tobeuploaded.length))
						}
					}
					break
					return
				}
			}
			tobeuploaded.splice(tobindex,1)
			
		}
	
	
	function mapupload(tobindex,time){
		
		setTimeout(map_upload_process,time,tobindex,time)
	
	}
	
	//////////////////////////////////////////////
	
	var { Worker } = require('worker_threads');
	
		
		function worker_handler_func(e){
			var msg=e.data
			if(msg.indexOf("movemob")==0){
				if(reseting==true) return
				broadcast(msg)
			}else if(msg.indexOf("updateobjects")==0){
				if(reseting==true) return
				msg=msg.split(":");msg.shift();
				for (var i = objects.length - 1; i >= 0; i--) {
					if(objects[i] && objects[i].split(":")[0]==msg[0]){
						objects[i]=msg.join(":")
						break
					}
				}
			}else if(msg.indexOf("updatecheckobjs")==0){
				if(reseting==true) return
				msg=msg.split(":");msg.shift();msg=msg.join(":").split(",");msg=msg.filter(item=>item)
				if(msg.length>0) checkobjs=msg
	
			}else{
				msg=msg.split(":")
				var i=msg.slice(msg.length-1,msg.length).join(":")
				msg = msg.slice(0,msg.length-1).join(":")
	
				server.connections[i]._sendText("password:"+msg)
				server.connections[i]._sendText("id:"+server.connections[i].playerid)
			}
	
		}
		worker = new Worker("./encrypter.js");
		worker.on('message', worker_handler_func);
	
	
	
	
	function server_func (connection) {
		for(var i=banlist.length,con=connection.headers.origin.split("//")[1];i--;){
			if(con==banlist[i][1]){ 
				connection.close()
				return
			}
		}
		function cancel_binary(){
			connection.close()
		}
		connection.on("binary", cancel_binary)
	
	
	if(numberofplayers>=maxnumberofplayers){
				connection._sendText("serverfull")
				connection.close()
				return
			}
	
		connection.playerid = null
		connection.playername = null
		connection.playerdecode = null
		connection.admin=false
		connection.muted=false
		connection.alive=true
		connection.x=undefined
		connection.y=undefined
		connection.playerip=undefined
		connection.msgcounter=0
		connection.todo=[]
		connection.afkcount=0
		if(serverpass!==undefined){
			connection.sentpass=false
		}
	
	
	function on_text (str) {
			
			
			connection.postMessage++
			if(connection.postMessage>50) connection.close()
	
			if(str=='undefined'){
				return
			}else if(connection.playerdecode!==null){
				var decipher = crypt.createDecipheriv('aes-128-cbc', connection.playerdecode, connection.playeriv);
				var decrypted = Buffer.concat([decipher.update(Buffer.from(str,"hex")), decipher.final()]).toString();
				str1=decrypted
			}else{
				if(connection.postMessage>5) connection.close()
				str1=str
			}
			if(str1.indexOf("&&")>-1){
				str1=str1.replace(/&&/g,"")
			}
			
			if(str==="ping"){
				if(serverpass!==undefined){
					connection._sendText("totalplayers:"+numberofplayers+"/"+maxnumberofplayers+":locked")
				}else{
					connection._sendText("totalplayers:"+numberofplayers+"/"+maxnumberofplayers)
				}
				connection.close()
	
			}
			else if(str==="map?"){
				if(connection.sentpass==false){
					connection._sendText("pass?")
					return
				}
	
				if(arrbuffer!=undefined){
					connection.tempID=getRandomInt(0,9999999)
					tobeuploaded.push([connection.tempID,0])
					if(tobeuploaded.length==1) mapupload(0,500)
	
				}else if(map!="filecustom"){
					connection._sendText(map)
				}else{
					connection._sendText(buffer)
					connection._sendText("finished")
				}
				 
				
			}else if(str==serverpass){
				if(arrbuffer!=undefined){
					connection.tempID=getRandomInt(0,9999999)
					tobeuploaded.push([connection.tempID,0])
					
					if(tobeuploaded.length==1) mapupload(0,500)
	
				}else if(map!="filecustom"){
					connection._sendText(map)
				}else{
					connection._sendText(buffer)
					connection._sendText("finished")
				}
			}
	
			else if(str1==="checkping"){
				connection._sendText("checked")
			}
	
			else if (connection.playerid === null && numberofplayers<maxnumberofplayers) {
				if(!(str1.indexOf("pass")==0) ||( (str1.split(":").length<2 && serverpass!==undefined) || (str1.split(":")[2]!=serverpass && serverpass!==undefined))){
					connection.close()
					return
				}
				str1=str1.split(":")
				str1.shift()
				connection.sentpass=true
				str1=str1[0]
	
				connection.playerdecode=crypt.randomBytes(16)
				connection.playeriv=crypt.randomBytes(16)
	
				worker.postMessage([str1,(server.connections.length-1),connection.playerdecode.toString("hex"),connection.playeriv.toString("hex"),"encrypt"]);
	
				for(var i=1;i<=(maxnumberofplayers+1);i++){
					if(playercounter[i]===0){
						giveID=i
						playercounter[i]=1
						break
					}
				}
				connection.playerid = giveID
				
			}else if(str1.indexOf("name")==0 ){
				if(connection.playername!=null){
					connection.msgcounter+=5
					return
				}
				str1=str1.split(":")
					var name=str1[1]
					for(var i=banlist.length,con=str1[2];i--;){
						if(con==banlist[i][0]){ 
							connection.close()
							return
						}
					}
					connection.playerip=str1[2]
					for(var zz=0;zz<playernames.length;zz++){
						if(playernames[zz]===name){
						name=name+(zz+1)
						}
					}
	
					connection.playername=name
					
	
				playernames[connection.playerid]=name
	
				numberofplayers++
	
				playersalive++
	
				highestid++
				for(var u=1;u<highestid;u++){
					connection.todo.push("spawn:"+(1000+u)+":"+playernames[u])
					
				}
				for(var o=1;o<highestid;o++){
					if(playercounter[o]===0){
						broadcast("dead:"+o)
					}
				}	
				
				for(var i=0;i<objects.length;i++){
					objects=objects.filter(Boolean)
					temp=objects[i];temp=temp.toString().split(":")
					connection.todo.push("build:"+temp[1]+":"+temp[2]+":"+temp[3]+":"+temp[0]+":"+str1[4]+":"+str1[5])
					
				}
	
				broadcast("spawn:"+(1000+connection.playerid)+":"+connection.playername)
				
				broadcast("chat::"+name+" has joined.")
				
				broadcast("eventid:"+connection.playerid)
				connection.todo.push("receivegold:"+initialgold)
				if(numberofplayers>1 && serverlock===false && map=="default" ){
					begingame()
				}
				if(numberofplayers>1 && map=="free4all"){
					begingamefree4all()
				}
				if(serverlock===true && map==="default"){
					connection.todo.push("roundstarted")
					connection.alive=false
				}else if(map==="default"){
					connection.todo.push("message:Waiting for players.\\|\\^")
				}
	
			}
			else if(str1.indexOf("arrow")==0){
				var str2=str1.split(":")
				if(Math.abs(str2[1]-connection.x)>2 || Math.abs(str2[2]-connection.y)>2) {connection.close();return}
				broadcast(str1)
			}
			else if(str1.indexOf("build")==0){
				connection.msgcounter+=5
				str1=str1.split(":")
				if(str1[1]==1){
					broadcast("build:"+connection.x+':'+(Number(connection.y)+1)+":"+str1[2]+":"+objectcounter+":"+str1[3]+":"+str1[4])
						objects[objectcounter]=objectcounter+":"+connection.x+":"+(Number(connection.y)+1)+":"+str1[2]+":"+str1[3]+":"+str1[4]
						objectcounter++
				}else if(str1[1]==2){
					broadcast("build:"+(Number(connection.x)-1)+':'+connection.y+":"+str1[2]+":"+objectcounter+":"+str1[3]+":"+str1[4])
						objects[objectcounter]=objectcounter+":"+(Number(connection.x)-1)+":"+connection.y+":"+str1[2]+":"+str1[3]+":"+str1[4]
						objectcounter++
				}else if(str1[1]==3){
					broadcast("build:"+(Number(connection.x)+1)+':'+connection.y+":"+str1[2]+":"+objectcounter+":"+str1[3]+":"+str1[4])
						objects[objectcounter]=objectcounter+":"+(Number(connection.x)+1)+":"+connection.y+":"+str1[2]+":"+str1[3]+":"+str1[4]
						objectcounter++
				}else if(str1[1]==4){
					broadcast("build:"+connection.x+':'+(Number(connection.y)-1)+":"+str1[2]+":"+objectcounter+":"+str1[3]+":"+str1[4])
						objects[objectcounter]=objectcounter+":"+connection.x+":"+(Number(connection.y)-1)+":"+str1[2]+":"+str1[3]+":"+str1[4]
						objectcounter++
				}
			}
			else if(str1.indexOf("tpevent")==0){
				if(str1.split(":")[1]=='NaN' || str1.split(":")[2]=='NaN') return
				connection.msgcounter+=5
				broadcast(str1)
				connection.x=str1.split(":")[1]
				connection.y=str1.split(":")[2]
			}
			else if(str1.indexOf("animation")==0 || str1.indexOf("rotation")==0 || str1.indexOf("selfswitch")==0 || str1.indexOf("opened")==0){
				broadcast(str1)
			}
	
			else if(str1.indexOf("magic")==0){
				connection.msgcounter+=5
				var str2=str1.split(":")
				if(Math.abs(str2[1]-connection.x)>2 || Math.abs(str2[2]-connection.y)>2) {connection.close();return}
				broadcast(str1)
			}
			else if(str1.indexOf("chest")==0){
				connection.msgcounter+=5
				broadcast(str1+":"+objectcounter)
				str11=str1.split(":")
				objects[objectcounter]=objectcounter+":"+str11[2]+":"+str11[3]+":"+str11[1]
				objectcounter++
			}
			else if(str1.indexOf("flashlight")==0){
				if((connection.playerid+1000)!=str1.split(":")[1]){connection.close();return}
				broadcast(str1)
			}
	
			else if(str1.indexOf("destroy")==0){
				connection.msgcounter+=5
				objects=objects.filter(Boolean)
				for(var i=0;i<objects.length;i++){
					temp=objects[i];temp=temp.split(":")
					if(temp[0]==str1.split(":")[1] && temp[1]==str1.split(":")[2] && temp[2]==str1.split(":")[3]){
						objects.splice(i, 1);
						broadcast(str1)
	
						for(var u=0;u<nonmovable.length;u++){
							if(nonmovable[u].split(":")[0]==str1.split(":")[1]) nonmovable.splice(u,1)
							break
						}
						break;
					}	
				}
	
			}
			else if(str1.indexOf("damage")==0){
				connection.msgcounter+=5
				var str2=str1.split(":")
				if(Math.abs(str2[2]-connection.x)>2 || Math.abs(str2[3]-connection.y)>2) {connection.close();return}
				broadcast(str1)
			}
			else if(str1.indexOf("dead")==0){
				connection.msgcounter+=5
				if(str1.split(":")[1]!=connection.playerid) {connection.close();return}
				createobject(connection.x,connection.y,22)
				broadcast(str1)
				broadcast("chat::"+connection.playername+" has died.")
	
				if(map=="default"){
					playersalive--
					broadcast("chat::"+playersalive+" players left.")
					for(var i=0;i<server.connections.length;i++){
						if(Number(server.connections[i].playerid)==Number(str1.split(":")[1])){
							server.connections[i].alive=false
							break
						}
					}
				}else if(map=="free4all"){
					setTimeout((a,b,c)=>{
						if(c){
							for(var i=0;i<server.connections.length;i++){
								if(server.connections[i].playerid==(a-1000)){
									var possibleX=[11,21,31,40,48,40,44,58,69,60,52,58,68,12,74,8,8,12,3,21,26,26,37,44,39,37,57]
									var possibleY=[8,6,8,9,15,29,36,43,19,9,59,68,62,65,75,29,36,43,45,45,39,25,45,42,53,63,28]
									var arindex=Math.floor(Math.random() * possibleY.length)
									
	
									broadcast("spawn:"+a+":"+b)
									broadcast("tpevent:"+possibleX[arindex]+":"+possibleY[arindex]+":"+a)
									broadcast("selfswitch:"+a+"A:false")
									server.connections[i].x=possibleX[arindex]
									server.connections[i].y=possibleY[arindex]
	
									break
								}
							}
							
						}
					},2000,(connection.playerid+1000),connection.playername,connection)
					
				}
			}
			else if(str1.indexOf("through")==0){
				broadcast(str1)
			}
			else if(str1.indexOf("sendgold")==0){
				var idtosend=str1.split(":")
				idtosend=Number(idtosend[1])-1000
				for(var i=0;i<server.connections.length;i++){
					if(Number(server.connections[i].playerid)==idtosend){
						if(str1.endsWith("player")){
							server.connections[i]._sendText("receivegold:"+getRandomInt(30,51)+":player")
						}else{
							server.connections[i]._sendText("receivegold:"+getRandomInt(30,51))
						}
						break
					}
				}
				
			}
			else if(str1.indexOf("confirmed")==0){
				if(reseting==true) return
				str1=str1.split(":")
	
				for (var i = checkobjs.length - 1; i >= 0; i--) {
					var tempobj1=checkobjs[i].split(":")
	
					if(tempobj1[2]==str1[1] && tempobj1[3]==str1[2] && tempobj1[4]==str1[3]){
						tempobj1[0]=Number(tempobj1[0])+1
						if(tempobj1[0]==3 || tempobj1[0]>=Math.round(numberofplayers/2)){
							for (var o = objects.length - 1; o >= 0; o--) {
								if(!objects[o]) continue
								var tempobj2=objects[o].split(":")
								if(tempobj1[2]==tempobj2[0]){
	
									tempobj1.shift();tempobj1.shift()
									if(tempobj1[4]=="mob1"){tempobj1[4]="mob"}
										else if(tempobj2[4]=="gramps1"){tempobj1[4]="gramps"}
									for(var u=0;u<nonmovable.length;u++){
										if(nonmovable[u].split(":")[1]==tempobj1[1] && nonmovable[u].split(":")[2]==tempobj1[2]){ 
											nonmovable.splice(u,1)
										}
									}
									objects[o]=tempobj1.join(":")
									checkobjs[i]=""
									
									break
								}
							}
						}else{
							checkobjs[i]=tempobj1
						}
						break
					}
				}
				checkobjs=checkobjs.filter(item => item)
				
				
			}else if(str1.indexOf("denied")==0){
				if(reseting==true) return
				str1=str1.split(":")
	
				for (var i = checkobjs.length - 1; i >= 0; i--) {
					var tempobj1=checkobjs[i].split(":")
	
					if(tempobj1[2]==str1[1] && tempobj1[3]==str1[2] && tempobj1[4]==str1[3]){
						tempobj1[1]=Number(tempobj1[1])+1
						if(tempobj1[1]==3 || tempobj1[1]>=Math.round(numberofplayers/2)){
							checkobjs[i]=""
							for(var o = objects.length - 1; o >= 0; o--){
								if(!objects[o]) continue
								var tempobj2=objects[o].split(":")
								if(tempobj1[2]==tempobj2[0]){
									if(tempobj2[4]=="mob1"){tempobj2[4]="mob"}
										else if(tempobj2[4]=="gramps1"){tempobj2[4]="gramps"}
									objects[o]=tempobj2.join(":")
									checkobjs[i]=""
									broadcast("tpmob:"+tempobj2[0]+":"+tempobj2[1]+":"+tempobj2[2])
									nonmovable.push((objectcounter*2000)+":"+str1[2]+":"+str1[3])
												
									break
								}
							}
						}else{
							checkobjs[i]=tempobj1
						}
						break
					}
				}
				checkobjs=checkobjs.filter(item => item)
				
			}
			else if(str1.indexOf("chat:")==0){
				connection.afkcount=0
				connection.msgcounter+=5
				var str2=str1.split(":")
				str2=str2.splice(1,str2.length)
				str2=str2.join(":")
				if(str2.indexOf("/adm")==0){
					str2=str2.split(" ").splice(1,str2.length).join(" ")
					if(admpassword!==undefined && str2==admpassword){
						connection.adm=true
						connection.todo.push("chat::You're now admin!")
					}
				}
				else if(str2.indexOf("/list")==0){
					server.connections.forEach(function (connectionn) {
						if(connectionn.playerid!==null && connectionn.playername!==null){
							connection.todo.push("chat::>ID:"+connectionn.playerid+", name:"+connectionn.playername)
						}
	
					})
				}
				else if(str2.indexOf("/kick")==0 && connection.adm===true){
					str2=str2.split(" ")
					server.connections.forEach(function (connectionn) {
	
						if(connectionn.playerid==str2[1]){
							broadcast("chat::>"+connectionn.playername+" has been kicked.")
							connectionn.close()
						}
					})
				}
				else if(str2.indexOf("/ban")==0 && connection.adm===true){
					str2=str2.split(" ")
					server.connections.forEach(function (connectionn) {
	
					if(connectionn.playerid==str2[1]){
						broadcast("chat::>"+connectionn.playername+" has been banned.")
						connectionn.close()
						banlist.push([connectionn.playerip,connectionn.headers.origin.split("//")[1]])
					}
					})
				}else if(str2.indexOf("/closeserver")==0 && connection.adm===true){
					str2=str2.split(" ")
					server.connections.forEach(function (connectionn) {
						connectionn.sentpass=true
					})
					serverpass=str2[1]
					connection.todo.push("chat::>Server is now password closed.")
				}else if(str2.indexOf("/openserver")==0 && connection.adm===true){
					serverpass=undefined
					connection.todo.push("chat::>Server is now open to everyone.")
				}else if(str2==="/begin" && connection.adm===true){
					if(map=="default") begingame()
					if(map=="free4all") begingamefree4all()
				}else if(str2.indexOf("/mute")==0 && connection.adm===true){
					str2=str2.split(" ")
					
					server.connections.forEach(function (connectionn) {
					if(String(connectionn.playerid)===String(str2[1]))
					{
	
						connectionn.todo.push("chat::You have been muted for "+str2[2]+" seconds.")
						connection.todo.push("chat::>Player id "+str2[1]+" has been muted for "+str2[2]+" seconds.")
						connectionn.muted=true
						str2[2]=Number(str2[2])*1000
						eval(`setTimeout(()=>{
								
							server.connections.forEach(function (connectionn) {
	
							if(String(connectionn.playerid)===String(`+str2[1]+`))
							{
								connectionn.muted=false
							}
							})
	
						},`+Number(str2[2])+`)`)
					}
					})
				}
				else if(connection.muted!==true && connection.playerid!==null && (str2.indexOf("/")==0)==false){
					broadcast("chat:"+connection.playername+":"+str2)
				}
	
			}
			else if(serverpass!==undefined && connection.sentpass!=false ){
				if(connection.x!=str1.split(":")[0] || connection.y!=str1.split(":")[1]) connection.afkcount=0
				connection.x=str1.split(":")[0]
				connection.y=str1.split(":")[1]
				broadcast("update:"+connection.playerid+":"+str1)
			}else if(serverpass===undefined ){
				if(connection.x!=str1.split(":")[0] || connection.y!=str1.split(":")[1]) connection.afkcount=0
				connection.x=str1.split(":")[0]
				connection.y=str1.split(":")[1]
				broadcast("update:"+connection.playerid+":"+str1)
			}
			if(on_message){
				on_message(str1,connection)
			}
					 
	
		}
	
	
		connection.on("text", on_text)
	
	function close_connection(){
		if(connection.playername!==null){
			broadcast("chat::"+connection.playername+" has left.")
			var lasthighestid=highestid
			for(var a=0;a<=lasthighestid;a++){
				if(playercounter[a]===1){
					highestid=a
				}
			}
			playernames[connection.playerid]=""
			numberofplayers--
			if(connection.alive==true){
				playersalive--
			}
			disconnectthis=Number(connection.playerid)
			playercounter[disconnectthis]=0
			broadcast("dead:"+connection.playerid)
			if(playersalive<1 && numberofplayers<1){
				serverlock=false
			}
	
		}
	
	
	
	}
	
	
	connection.on("close", close_connection)
	
	function error_connection(errObj){
		if(on_close){
			on_close(connection,errObj)
		}
	}
	
	connection.on("error",error_connection)
	
	
	
	}
	
	var server = ws.createServer(server_func).listen(serverPort) 
	
	
	
	if(fs.existsSync("./custom.js")){
		eval(fs.readFileSync("./custom.js",{encoding:"utf8"}))
	}
	
	if(on_start){
		on_start()
	}
	
	setInterval(()=>{
		for (var i = server.connections.length - 1; i >= 0; i--) {
			server.connections[i].msgcounter=0
		}
	},1000)
	
	
	function action_per_tick(){
		if(on_tick){
			on_tick()
		}
		var allcons=server.connections
		for(var z=allcons.length;z--;){
			if(allcons[z].todo.length>0){
					var cipher=crypt.createCipheriv('aes-128-cbc',allcons[z].playerdecode , allcons[z].playeriv)
					var text=cipher.update(allcons[z].todo.join("&&"))
					
					var encrypted = Buffer.concat([text, cipher.final()]);
					allcons[z]._sendText(encrypted.toString('hex'))
					allcons[z].todo=[]
			}
		}
	}
	setInterval(action_per_tick,1000/tickrate)
	
	
	function broadcast(str) {
		for(var z=server.connections.length;z--;){
			if(server.connections[z].playerdecode!==null){
				server.connections[z].todo.push(str)
			}
		}
	}
	
	function getRandomInt(min, max) {
	  min = Math.ceil(min);
	  max = Math.floor(max);
	  return Math.floor(Math.random() * (max - min)) + min;
	}
	
	function createobject(x,y,objid,extra,tp,playerid){
		if(!extra) extra=""
		if(!tp) tp=""
		if(!playerid) playerid=""
		broadcast("build:"+x+":"+y+":"+objid+":"+objectcounter+":"+extra+":"+tp+":"+playerid)
		objects.push(objectcounter+":"+x+":"+y+":"+objid+":"+extra+":"+tp+":"+playerid)
		objectcounter++
	}
	
	setInterval(()=>{
		if(reseting==true) return
		var points=[]
		for(var i=0;i<server.connections.length;i++){
			points.push({x:server.connections[i].x,y:server.connections[i].y})
		}
	
		var uniqueArray = [];
		for (var i = nonmovable.length - 1; i >= 0; i--) {
			if(uniqueArray.indexOf(nonmovable[i]) === -1) {
				uniqueArray.push(nonmovable[i]);
			}
		}
	
		worker.postMessage([objects,checkobjs,points,uniqueArray])
		nonmovable=uniqueArray
	},250)
	
	begingame=function(){
		reseting=false
		if(timelapse==undefined){
			var light=100
			var modifier=-1
			timelapse=setInterval(()=>{
				if(light===99){
					modifier=-1
				}else if(light===24){
					modifier=1
				}
				light=light+modifier
				broadcast("server:timelapse:"+light)
			},1500)
		}
		objects=[]
		checkobjs=[]
		nonmovable=[]
		for(var i=0;i<server.connections.length;i++){
			server.connections[i].alive=true
		}
	
		if(checkendgame){
			clearInterval(checkendgame)
		}
	
	
	
		broadcast("reset")
		broadcast("receivegold:"+initialgold)
		for(var u=1;u<highestid;u++){
			broadcast("eventid:"+u)
			if(playercounter[u]===0){
				broadcast("dead:"+u)
			}
		}
		broadcast("gamewillbegin")
		setTimeout(()=>{
	
	
	
			if(getRandomInt(1,4)>1){createobject(15,29,getRandomInt(4,11))}
			if(getRandomInt(1,4)>1){createobject(22,20,getRandomInt(4,11))}
			if(getRandomInt(1,4)>1){createobject(24,11,getRandomInt(4,11))}
			if(getRandomInt(1,4)>1){createobject(22,42,getRandomInt(4,11))}
			if(getRandomInt(1,4)>1){createobject(59,10,getRandomInt(4,11))}
			if(getRandomInt(1,4)>1){createobject(49,26,getRandomInt(4,11))}
			if(getRandomInt(1,4)>1){createobject(41,33,getRandomInt(4,11))}
			if(getRandomInt(1,4)>1){createobject(63,31,getRandomInt(4,11))}
			if(getRandomInt(1,4)>1){createobject(61,43,getRandomInt(4,11))}
			if(getRandomInt(1,4)>1){createobject(71,51,getRandomInt(4,11))}
			if(getRandomInt(1,4)>1){createobject(56,68,getRandomInt(4,11))}
			if(getRandomInt(1,4)>1){createobject(20,78,getRandomInt(4,11))}
			if(getRandomInt(1,4)>1){createobject(47,79,getRandomInt(4,11))}
			if(getRandomInt(1,4)>1){createobject(79,58,getRandomInt(4,11))}
			if(getRandomInt(1,4)>1){createobject(86,41,getRandomInt(4,11))}
			if(getRandomInt(1,4)>1){createobject(99,23,getRandomInt(4,11))}
			if(getRandomInt(1,4)>1){createobject(52,97,getRandomInt(4,11))}
			if(getRandomInt(1,4)>1){createobject(41,39,getRandomInt(4,11))}
			if(getRandomInt(1,4)>1){createobject(75,15,getRandomInt(4,11))}
			if(getRandomInt(1,4)>1){createobject(68,41,getRandomInt(4,11))}
			createobject(70,43,19,"gramps")
	
			spawnmobs=setTimeout(()=>{
				if(getRandomInt(1,3)>1){createobject(52,34,18,"mob")}
				if(getRandomInt(1,3)>1){createobject(67,41,18,"mob")}
				if(getRandomInt(1,3)>1){createobject(19,78,18,"mob")}
				if(getRandomInt(1,3)>1){createobject(48,79,18,"mob")}
				if(getRandomInt(1,3)>1){createobject(98,24,18,"mob")}
				if(getRandomInt(1,3)>1){createobject(71,52,18,"mob")}
				if(getRandomInt(1,3)>1){createobject(23,42,18,"mob")}
				if(getRandomInt(1,3)>1){createobject(41,34,18,"mob")}
				if(getRandomInt(1,3)>1){createobject(78,59,18,"mob")}
				if(getRandomInt(1,3)>1){createobject(15,28,18,"mob")}
				if(getRandomInt(1,3)>1){createobject(41,38,18,"mob")}
			},8000)
	
	
	
			broadcast("begin")
			serverlock=true
			checkendgame=setInterval(()=>{
				if(playersalive<2){
	
					reseting=true
					clearTimeout(spawnmobs)
					playersalive=numberofplayers
					broadcast("reset")
					broadcast("receivegold:"+initialgold)
					for(var u=1;u<=highestid;u++){
						broadcast("eventid:"+u)
						if(playercounter[u]===0){
								broadcast("dead:"+u)
							}
					}
	
					clearInterval(checkendgame)
					serverlock=false
					if(numberofplayers>1 && map==="default"){
						begingame()
					}
	
				}
			},1001)
		},3000)
	}
	
	setInterval(()=>{
		for (var i = server.connections.length - 1; i >= 0; i--) {
			server.connections[i].afkcount++
			if(server.connections[i].afkcount>maxafktime){
				server.connections[i].close()
			}
		}
	},1000)
	
	function begingamefree4all(){
	
		reseting=false
		if(timelapse==undefined){
			var light=100
			var modifier=-1
			timelapse=setInterval(()=>{
				if(light===99){
					modifier=-1
				}else if(light===24){
					modifier=1
				}
				light=light+modifier
				broadcast("server:timelapse:"+light)
				
			},1500)
		}
	
		
	
		var chestspawner=setInterval(()=>{
			var possibleX=[12,22,32,41,49,39,43,59,70,61,53,59,69,13,78,9,9,13,4,22,27,27,36,45,40,38,58]
			var possibleY=[7,5,7,8,14,28,35,42,18,8,58,6,61,64,76,28,35,42,44,44,38,24,44,41,52,62,27]

	
			var possibleresult=getRandomInt(1,27)
			
	
			if(getRandomInt(1,4)>2){
				createobject(possibleX[possibleresult],possibleY[possibleresult],getRandomInt(4,11))
			}
			
			
			
			
		},1000)
	
		objects=[]
		checkobjs=[]
		nonmovable=[]
		for(var i=0;i<server.connections.length;i++){
			server.connections[i].alive=true
		}
	
		if(checkendgame){
			clearInterval(checkendgame)
			clearInterval(chestspawner)
		}
	
	
	
		broadcast("reset")
		for(var u=1;u<highestid;u++){
			broadcast("eventid:"+u)
			if(playercounter[u]===0){
				broadcast("dead:"+u)
			}
		}
		broadcast("gamewillbegin")
		setTimeout(broadcast("begin"),3000)
	
	}
	
	console.log("Server running!")
	
	
	
	
	