const crypto = require('crypto')
const {publicEncrypt, privateDecrypt } = require('crypto');
var decodepass=""
var decodeiv=""
var name=""
var connection
var ping,ip
var previousposition=""
var arrayofpositions=[]
var previoustp=""

function encrypt(text) {
	if(decodepass=="") return

	let cipher = crypto.createCipheriv('aes-128-cbc', decodepass, decodeiv);



	return Buffer.concat([cipher.update(text), cipher.final()]).toString('binary') ;
}
 
const decrypt=function (text){

	try{

	let encryptedText = Buffer.from(text,"binary");
	let decipher = crypto.createDecipheriv('aes-128-cbc', decodepass, decodeiv);

	 
	return Buffer.concat([decipher.update(encryptedText), decipher.final()]).toString();

	}
    catch(e){
    	return(text)
    }

}


var { generateKeyPairSync } = require('crypto');
var { publicKey, privateKey } = generateKeyPairSync('rsa', {
modulusLength: 2048,  
publicKeyEncoding: {
type: 'spki',       
format: 'pem'
},
privateKeyEncoding: {
type: 'pkcs8',      
format: 'pem'
}
});

self.onmessage = function(e) {
	value=e.data

	if(value.startsWith("connectto")){
		value=value.split(":")
		if(value.length>2){value.shift();ip=value.slice(0,3).join(":");value=value.slice(3,value.length).join(":")}
		else {value.shift();ip=value[0]}
		connection = new WebSocket(ip)

		connection.onopen = function () {
			self.postMessage("connected")	
			connection.send("pass:"+publicKey+":"+value)
		}

		connection.onmessage=function(e){
			update=e.data
			if(decodepass!==""){
				update=decrypt(update)
			}
			if(update.indexOf("&&")>-1){
				update=update.split("&&")
				for (var i =  0; i <update.length; i++) {
					
					if(update[i].startsWith("password")){
						update[i]=update[i].split(":")
						var pass1=update[i][1]

				        var decryptBuffer = Buffer.from(pass1,"hex");
						decodepass = privateDecrypt(privateKey,decryptBuffer)
						
						pass1=update[i][2]
						decryptBuffer = Buffer.from(pass1,"hex");
						decodeiv = privateDecrypt(privateKey,decryptBuffer)

						

						intervs=setInterval(()=>{
							if(name){
								connection.send(encrypt("name:"+name))
								clearInterval(intervs)
							}
						},33)
						generateKeyPairSync=undefined
						publicKey=undefined
						privateKey=undefined
						decryptm=undefined
						setInterval(()=>{
							connection.send(encrypt("checkping"))
							ping=performance.now()
						},1000)
					}else if(update[i]=="checked"){
						ping=Math.trunc(performance.now()-ping)
						self.postMessage("checked:"+ping)
					}else if(update[i].startsWith("update")){
						for(var u=arrayofpositions.length;u--;){
							if(update[i].split(":")[1]==arrayofpositions[u].split(":")[1]){
								
								arrayofpositions.splice(u,1)
								break
							}
						}
						arrayofpositions.push(update[i])
						self.postMessage(update[i])
					}else if(update[i]=="rejoin"){
						
						connection.close()
						self.postMessage("reconnect;;"+ip)
						self.postMessage("closed")

					}else{
						self.postMessage(update[i])
					}

				}
			}else{
				if(update.startsWith("password")){
					update=update.split(":")
					var pass1=update[1]

			        var decryptBuffer = Buffer.from(pass1,"hex");
					decodepass = privateDecrypt(privateKey,decryptBuffer)
					
					pass1=update[2]
					decryptBuffer = Buffer.from(pass1,"hex");
					decodeiv = privateDecrypt(privateKey,decryptBuffer)

					intervs=setInterval(()=>{
						if(name){
							connection.send(encrypt("name:"+name))
							clearInterval(intervs)
						}
					},33)
					generateKeyPairSync=undefined
					publicKey=undefined
					privateKey=undefined
					decryptm=undefined
					setInterval(()=>{
						connection.send(encrypt("checkping"))
						ping=performance.now()
					},1000)
				}else if(update=="checked"){
					ping=Math.trunc(performance.now()-ping)
					self.postMessage("checked:"+ping)
				}else if(update.startsWith("update")){
					for(var u=arrayofpositions.length;u--;){
						if(update.split(":")[1]==arrayofpositions[u].split(":")[1]){
							arrayofpositions.splice(u,1)
							break
						}
					}
					arrayofpositions.push(update)
					self.postMessage(update)
				}else if(update=="rejoin"){
					connection.close()
					self.postMessage("reconnect;;"+ip)
					self.postMessage("closed")

				}else{
					self.postMessage(update)
				}
			}




			
			
		}

		connection.onclose=function(reason){
				self.postMessage("closed")
		}

	}else if(value.startsWith("name")){
		name=value.split(":");name.shift();name=name.join(":")
	}else if(value.startsWith("sendposition")){
		if(previousposition==value) return
		previousposition=value
		value=value.split(":")
		value.shift();value=value.join(":")
		connection.send(encrypt(value));

	}else if(value=="close"){
		connection.close()
	}else{
		connection.send(encrypt(value))
	}

};




setInterval(()=>{
	for(var i=arrayofpositions.length;i--;){
		self.postMessage(arrayofpositions[i])
	}
},100)