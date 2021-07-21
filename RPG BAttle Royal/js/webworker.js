const crypto = require('crypto')
const {publicEncrypt, privateDecrypt } = require('crypto');
var decodepass=""
var decodeiv=""
var name=""
var connection
var ping,ip

function encrypt(text) {
	if(decodepass=="") return

	let cipher = crypto.createCipheriv('aes-128-cbc', decodepass, decodeiv);
	let encrypted = cipher.update(text);

	encrypted = Buffer.concat([encrypted, cipher.final()]);
	encrypted=encrypted.toString('hex') 
	return encrypted;
}
 
const decrypt=function (text){

	try{

	let encryptedText = Buffer.from(text,"hex");
	let decipher = crypto.createDecipheriv('aes-128-cbc', decodepass, decodeiv);
	let decrypted = decipher.update(encryptedText);

	decrypted = Buffer.concat([decrypted, decipher.final()]).toString();
	return decrypted

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
				for (var i = update.length - 1; i >= 0; i--) {
					
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
	}else if(value.startsWith("sendposition") ){
		value=value.split(":")
		value.shift();value=value.join(":")
		connection.send(encrypt(value));
	}else if(value=="close"){
		connection.close()
	}else{
		connection.send(encrypt(value))
	}

};




