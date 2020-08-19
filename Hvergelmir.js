const child = require('child_process').exec;
fpwrite = require('fs');
var cmdString = '';
for(i=1; i<=40; i++) {
    cmdString+='sudo -u mpd amixer -D equal1 cset numid='+i+' '+50+'; ';
}
child(cmdString, (err, stdout, stderr) => {
    console.log(cmdString);
});
const ori_equalizer = '{"band1":0.0,"band2":0.0,"band3":0.0,"band4":0.0,"band5":0.0,"band6":0.0,"band7":0.0,"band8":0.0,"band9":0.0,"band10":0.0,"band11":0.0,"band12":0.0,"band13":0.0,"band14":0.0,"band15":0.0,"band16":0.0,"band17":0.0,"band18":0.0,"band19":0.0,"band20":0.0,"band21":0.0,"band22":0.0,"band23":0.0,"band24":0.0,"band25":0.0,"band26":0.0,"band27":0.0,"band28":0.0,"band29":0.0,"band30":0.0,"band31":0.0,"band32":0.0,"band33":0.0,"band34":0.0,"band35":0.0,"band36":0.0,"band37":0.0,"band38":0.0,"band39":0.0,"band40":0.0}';
fpwrite.writeFile("/volumio/http/www/cur_equalizer.json",  ori_equalizer, function(err) {
    console.log('write cur_equalizer');
});
