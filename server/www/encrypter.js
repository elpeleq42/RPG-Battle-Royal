const crypto=require("crypto")
const fs=require("fs")
const { parentPort } = require("worker_threads");

const PF = require('./PathFinding.js');


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

var objects,checkobjs,points

function encryption(value) {
	var buffer = Buffer.from(value[2],"hex")
	var encrypted = crypto.publicEncrypt(value[0], buffer)
	buffer = Buffer.from(value[3],"hex")
	encrypted1 = crypto.publicEncrypt(value[0], buffer)

	parentPort.postMessage({data: encrypted.toString("hex")+":"+ encrypted1.toString("hex") +":"+value[1]});
}


parentPort.on("message",function(msg){
	
	last=msg[msg.length-1]
	if(last!="encrypt"){
		objects=msg[0]
		checkobjs=msg[1]
		points=msg[2]
		nonmovable=msg[3]
		mobAI()
	}else{
		msg.pop()
		encryption(msg)
	}
	
});  



  function mobAI(){
	var temp2
	var tempobj
	for (var ww = objects.length - 1; ww >= 0; ww--) {
		if(!objects[ww]) continue
		if(objects[ww].split(":")[4]=="mob"){

			tempobj=objects[ww].split(":")
			

			var minDistance = 10000;
			var closest,distance;
			for (var a = 0; a < points.length; a++) {
  				distance = (tempobj[1] - points[a].x) * (tempobj[1] - points[a].x) + (tempobj[2] - points[a].y) * (tempobj[2] - points[a].y);
  				if (distance < minDistance) {
    				minDistance = distance;
    				closest = points[a];
  				}
			}
			if(minDistance<49){

				if(tempobj[1]==closest.x && tempobj[2]==closest.y) continue
				
					var arr=[]
					for(var zz=0;zz<17;zz++){
						var arrx=[]
						for(xx=0;xx<17;xx++){
							arrx.push(0)
						}
						arr.push(arrx)
					}
					for(var ii=0;ii<nonmovable.length;ii++){
						if(((tempobj[1] - nonmovable[ii].split(":")[1]) * (tempobj[1] - nonmovable[ii].split(":")[1]) + (tempobj[2] - nonmovable[ii].split(":")[2]) * (tempobj[2] - nonmovable[ii].split(":")[2]))<64){
							arr[(8+(nonmovable[ii].split(":")[2] - tempobj[2]))][(8+(nonmovable[ii].split(":")[1] - tempobj[1]))]=1
						}
					}
					
					closest.x=8-(tempobj[1]-closest.x)
					closest.y=8-(tempobj[2]-closest.y)
					
					astarf(tempobj,arr,closest,ww)

			}else{
				
				temprand=getRandomInt(1,5)
				if(temprand==1){
					parentPort.postMessage({data:"movemob:"+tempobj[0]+":"+(Number(tempobj[1])-1)+":"+tempobj[2]})

					temp2=objects[ww].split(":")
					temp2[1]=Number(temp2[1])-1
					checkobjs.push(0+":"+0+":"+temp2.join(":"))
					parentPort.postMessage({data:"updatecheckobjs:"+checkobjs})
					}
				else if(temprand==2){
					parentPort.postMessage({data:"movemob:"+tempobj[0]+":"+(Number(tempobj[1])+1)+":"+tempobj[2]})

					temp2=objects[ww].split(":")
					temp2[1]=Number(temp2[1])+1
					checkobjs.push(0+":"+0+":"+temp2.join(":"))
					parentPort.postMessage({data:"updatecheckobjs:"+checkobjs})
					}
				else if(temprand==3){
					parentPort.postMessage({data:"movemob:"+tempobj[0]+":"+tempobj[1]+":"+(Number(tempobj[2])-1)})


					temp2=objects[ww].split(":")
					temp2[2]=Number(temp2[2])-1
					checkobjs.push(0+":"+0+":"+temp2.join(":"))
					parentPort.postMessage({data:"updatecheckobjs:"+checkobjs})
					}
				else if(temprand==4){
					parentPort.postMessage({data:"movemob:"+tempobj[0]+":"+tempobj[1]+":"+(Number(tempobj[2])+1)})

					temp2=objects[ww].split(":")
					temp2[2]=Number(temp2[2])+1
					checkobjs.push(0+":"+0+":"+temp2.join(":"))
					parentPort.postMessage({data:"updatecheckobjs:"+checkobjs})
					}
			}
			objects[ww]=objects[ww].split(":")
			objects[ww][4]="mob1"
			objects[ww]=objects[ww].join(":")
			parentPort.postMessage({data:"updateobjects:"+objects[ww]})
			
		}else if(objects[ww].split(":")[4]=="gramps"){
			tempobj=objects[ww].split(":")
			temprand=getRandomInt(1,5)
			if(temprand==1){
				parentPort.postMessage({data:"movemob:"+tempobj[0]+":"+(Number(tempobj[1])-1)+":"+tempobj[2]})

				temp2=objects[ww].split(":")
				temp2[1]=Number(temp2[1])-1
				checkobjs.push(0+":"+0+":"+temp2.join(":"))
				parentPort.postMessage({data:"updatecheckobjs:"+checkobjs})
				}
			else if(temprand==2){
				parentPort.postMessage({data:"movemob:"+tempobj[0]+":"+(Number(tempobj[1])+1)+":"+tempobj[2]})

				temp2=objects[ww].split(":")
				temp2[1]=Number(temp2[1])+1
				checkobjs.push(0+":"+0+":"+temp2.join(":"))
				parentPort.postMessage({data:"updatecheckobjs:"+checkobjs})
				}
			else if(temprand==3){
				parentPort.postMessage({data:"movemob:"+tempobj[0]+":"+tempobj[1]+":"+(Number(tempobj[2])-1)})


				temp2=objects[ww].split(":")
				temp2[2]=Number(temp2[2])-1
				checkobjs.push(0+":"+0+":"+temp2.join(":"))
				parentPort.postMessage({data:"updatecheckobjs:"+checkobjs})
				}
			else if(temprand==4){
				parentPort.postMessage({data:"movemob:"+tempobj[0]+":"+tempobj[1]+":"+(Number(tempobj[2])+1)})

				temp2=objects[ww].split(":")
				temp2[2]=Number(temp2[2])+1
				checkobjs.push(0+":"+0+":"+temp2.join(":"))
				parentPort.postMessage({data:"updatecheckobjs:"+checkobjs})
				}

			objects[ww]=objects[ww].split(":")
			objects[ww][4]="gramps1"
			objects[ww]=objects[ww].join(":")
			parentPort.postMessage({data:"updateobjects:"+objects[ww]})
		}
	}

}

astarf=function(tempobj,arr,closest,ww){

	var grid = new PF.Grid(arr);
	var finder = new PF.BiAStarFinder({
    allowDiagonal: false,
    dontCrossCorners: true
	});
	var path = finder.findPath(8, 8, Number(closest.x), Number(closest.y), grid);
	if (!path) {
			var temprand=getRandomInt(1,5)
				if(temprand==1){
					parentPort.postMessage({data:"movemob:"+tempobj[0]+":"+(Number(tempobj[1])-1)+":"+tempobj[2]})

					temp2=objects[ww].split(":")
					temp2[1]=Number(temp2[1])-1
					checkobjs.push(0+":"+0+":"+temp2.join(":"))
					parentPort.postMessage({data:"updatecheckobjs:"+checkobjs})
					}
				else if(temprand==2){
					parentPort.postMessage({data:"movemob:"+tempobj[0]+":"+(Number(tempobj[1])+1)+":"+tempobj[2]})

					temp2=objects[ww].split(":")
					temp2[1]=Number(temp2[1])+1
					checkobjs.push(0+":"+0+":"+temp2.join(":"))
					parentPort.postMessage({data:"updatecheckobjs:"+checkobjs})
					}
				else if(temprand==3){
					parentPort.postMessage({data:"movemob:"+tempobj[0]+":"+tempobj[1]+":"+(Number(tempobj[2])-1)})

					temp2=objects[ww].split(":")
					temp2[2]=Number(temp2[2])-1
					checkobjs.push(0+":"+0+":"+temp2.join(":"))
					parentPort.postMessage({data:"updatecheckobjs:"+checkobjs})
					}
				else if(temprand==4){
					parentPort.postMessage({data:"movemob:"+tempobj[0]+":"+tempobj[1]+":"+(Number(tempobj[2])+1)})

					temp2=objects[ww].split(":")
					temp2[2]=Number(temp2[2])+1
					checkobjs.push(0+":"+0+":"+temp2.join(":"))
					parentPort.postMessage({data:"updatecheckobjs:"+checkobjs})
					}
		} else {
			parentPort.postMessage({data:"movemob:"+tempobj[0]+":"+(Number(tempobj[1])-(8-Number(path[1][0])))+":"+(Number(tempobj[2])-(8-Number(path[1][1])))})


			temp2=objects[ww].split(":")
			temp2[1]=(Number(tempobj[1])-(8-Number(path[1][0])))
			temp2[2]=(Number(tempobj[2])-(8-Number(path[1][1])))
			checkobjs.push(0+":"+0+":"+temp2.join(":"))
			parentPort.postMessage({data:"updatecheckobjs:"+checkobjs})
		}
}