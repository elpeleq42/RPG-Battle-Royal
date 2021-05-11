var adminpassword=undefined
var mxplayers=100
var initgold=0
var servportnumb=1000
var servmap="default"
var upspeed=0
var servpass=undefined

maxplayers = function(){

	if(Number(document.getElementById("maxplayers").value)<0) document.getElementById("maxplayers").value=1
	if(Number(document.getElementById("maxplayers").value)>1000) document.getElementById("maxplayers").value=1000
	if(isNaN(Number(document.getElementById("maxplayers").value))) document.getElementById("maxplayers").value=100

	mxplayers=document.getElementById("maxplayers").value
}

serverportnumber = function(){
	if(Number(document.getElementById("serverportnumber").value)<0) document.getElementById("serverportnumber").value=1
	if(Number(document.getElementById("serverportnumber").value)>65535) document.getElementById("serverportnumber").value=65535
	if(isNaN(Number(document.getElementById("serverportnumber").value))) document.getElementById("serverportnumber").value=1000

	servportnumb=document.getElementById("serverportnumber").value
}

function mapselect(map){
document.getElementById("fileselect").style.visibility="hidden"
document.getElementById("mapurl").style.visibility="hidden"
document.getElementById("upspeeddiv").style.visibility="hidden";
if(map=="file"){document.getElementById("upspeeddiv").style.visibility="visible";document.getElementById("formater").innerHTML="<br>";document.getElementById("fileselect").style.visibility="visible"}
if(map=="url") {document.getElementById("mapurl").style.visibility="visible";document.getElementById("formater").innerHTML="";servmap=document.getElementById("mapurl").value}
if(map=="default") servmap="default"
if(map=="free4all") servmap="free4all"
}

function file(){
var fileinput = document.querySelector('input[type=file]');
if(fileinput.value!="") servmap = fileinput.value;
}


