try{var AdmZip = require('./plugins/adm-zip.js');

var zip = new AdmZip('./www/map/test.zip'); 
var zipEntries = zip.getEntries(); 


zip.extractAllToAsync('./www/map',true,function(){
    var ncp = require('./libs/ncp.js').ncp;
    ncp.limit = 20;
    var filescopied=0


    ncp("./www/map/img/", "./www/img/",function(){filescopied++});
    ncp("./www/map/audio/", "./www/audio/",function(){filescopied++});

    var checkcopy=setInterval(()=>{

        if(filescopied>1){
            clearInterval(checkcopy)
            self.postMessage("end")
        }

    },33)
})
}
catch(e){
    self.postMessage("error")
}
