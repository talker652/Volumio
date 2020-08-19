http = require('http');
http2 = require('http');
fp = require('fs');
fp2 = require('fs'); 
fpwrite = require('fs');
fpexist = require('fs');
fpread = require('fs');
var formidable = require('formidable');
server = http.createServer(function(req, res)
{
    if (req.method == 'POST')
    {
        const child = require('child_process').exec;
		const getSongname = 'mpc current | sudo tee \"mpc.txt\"; mpc | grep -n \"[0-9]*:[0-9]*/[0-9]*:[0-9*]\" | cut -d \' \' -f 5 | sudo tee -a \"mpc.txt\"';
        //mpc | grep -n \"([0-9]*%)\" | cut -d \'(\' -f 2 | cut -d \')\' -f 1
        //mpc | grep -n \"[0-9]*:[0-9]*/[0-9]*:[0-9*]\" | cut -d \' \' -f 5
        const clearEq = 'sudo node /home/volumio/Hvergelmir.js'
        req.on('data', function(data)
        {
            var body = '';
            var name = '';
            var time = '';
            body += data;
            var obj = JSON.parse(body);
            console.log(obj.select);
            console.log('wifi : '+ obj.wifi);
            console.log('password : ' + obj.password);
            var volumenum = 50;
            if(obj.select == 2) {
                child(clearEq, (err, stdout, stderr) => {
                    //console.log(clearEq);
                    console.log('[HVERGELMIR] Refreshing EQ...');
                });
            }
            else if(obj.select == 3){
                console.log('vol up...');
                if(vol+10 > 205){
                    vol = 205
                }
                else {
                    vol = vol + 10;
                }
                console.log('test amixer -c 0 set Digital ' + vol);
                const volumeup = 'amixer -c 0 set Digital ' + vol;
                child(volumeup,(err, stdout, stderr) => {
                    console.log('volume = ' + vol);
                });
                fpwrite.writeFile("/volumio/http/www/volume.json",  String(vol-105), function(err) {
                    console.log('write new volume');
                });
            }
            else if(obj.select == 4){
                console.log('vol down...');
                if(vol-10 < 105){
                    vol = 105
                }
                else {
                    vol = vol - 10;
                }
                const volumedown = 'amixer -c 0 set Digital ' + vol;
                child(volumedown,(err, stdout, stderr) => {
                    console.log('volume = ' + vol);
                });
                fpwrite.writeFile("/volumio/http/www/volume.json",  String(vol-105), function(err) {
                    console.log('write new volume');
                });
            }
            else if(obj.select == 5){
                console.log('vol muse...');
                if(museflag == 1){
                    const volumemuse = 'amixer -c 0 set Digital 95';
                    museflag = 0;
                    child(volumemuse,(err, stdout, stderr) => {
                        console.log('volume = ' + vol);
                    });
                }
                else if(museflag == 0){
                    const volumemuse = 'amixer -c 0 set Digital ' + vol;
                    museflag = 1;
                    child(volumemuse,(err, stdout, stderr) => {
                        console.log('volume = ' + vol);
                    });
                }
            }
            else if(obj.select ==6){
                console.log('select upload...');
                var form = new formidable.IncomingForm();
                form.parse(req, function (err, fields, files) {
                  var oldpath = files.filetoupload.path;
                  var newpath = '/' + files.filetoupload.name;
                  fs.rename(oldpath, newpath, function (err) {
                    if (err) throw err;
                    res.write('File uploaded and moved!');
                    res.end();
                  });
             });
            }
            else if(obj.select == 7) {
                console.log('select wifi...');
                var rm = 'sudo rm /etc/network/interfaces';
                var wifi = obj.wifi;
                var password = obj.password;
                child(rm, (err, stdout, stderr) => {
                    // console.log('remove testfile...');
                    console.log('Write Network File...');
                    var data = "auto lo \niface lo inet loopback\n\nallow-hotplug eth0\niface eth0 inet dhcp\n\nallow-hotplug wlan0\niface wlan0 inet manual\n\nauto wlan1\niface wlan1 inet dhcp\n\twpa-ssid " + wifi + "\n\twpa-psk " + password + "\n\nauto wlan2\niface wlan2 inet dhcp\n\twpa-ssid " + wifi + "\n\twpa-psk " + password;
                    fp2.writeFile('/etc/network/interfaces', data, (err) => { 
                        
                        // In case of a error throw err. 
                        if (err) throw err; 
                    }) 
                    console.log('Write Finish');
                    var down1 = 'sudo ifdown wlan1';
                    var down2 = 'sudo ifdown wlan2';
                    var up1 = 'sudo ifup wlan1';
                    var up2 = 'sudo ifup wlan2';                    
                    child(down1, (err, stdout, stderr) => {}); 
                    child(down2, (err, stdout, stderr) => {}); 
                    setTimeout(function(){
                        child(up1, (err, stdout, stderr) => {}); 
                        child(up2, (err, stdout, stderr) => {
                            console.log('reconnect...');
                        });
                    },2000);
                });
            }
            else if(obj.select == 8) {
                console.log('adjust EQ...');
                var eq_control = obj.mixer_control;
                var eq_playback = obj.playback;
                var new_eq = obj.cur_equalizer;
                const eq_adjust = 'sudo -u mpd amixer -D equal1 cset numid='+(eq_control+1)+' '+String(parseInt(eq_playback) + 50);
                child(eq_adjust, (err, stdout, stderr) => {
                    console.log('eq' + (eq_control+1) + ' = ' + String(parseInt(eq_playback) + 50));
                });
                // fpread.readFile('/volumio/http/www/cur_equalizer.json', function (err, data) {
                //     console.log('readData = ' + data);
                //     data.band1
                // });
                // console.log(JSON.stringify(new_eq));
                fpwrite.writeFile("/volumio/http/www/cur_equalizer.json",  JSON.stringify(new_eq), function(err) {
                    console.log('write new cur_equalizer');
                });

            }
            else if(obj.select == 9){
                console.log('bluetoothctl...');
                var cmd = "bash /home/volumio/autopair.sh";
                child(cmd, (err, stdout, stderr) => {
                    console.log('bluetoothctl finished');
                });
            }
            else if(obj.select == 10){
                console.log('save EQ...')
                var new_eq = obj.cur_equalizer;
                var new_name = obj.name;
                var path = "/volumio/http/www/equalizer/" + String(new_name) + ".json";
                console.log(path);
                console.log(JSON.stringify(new_eq));                
                fpwrite.exists(path, function(exists) {
                    console.log(exists);
                    if(exists == false){
                        fpwrite.appendFile('/volumio/http/www/equal_name', String(new_name)+".json\n", function (err) {
                            if (err)
                                console.log(err);
                            else
                                console.log('append');
                        });
                    }
                });
                fpwrite.writeFile(path,  JSON.stringify(new_eq), function(err) {
                    console.log('write new cur_equalizer');
                });

            }
            else if(obj.select == 11){
                console.log('load new EQ...');
                var new_name = obj.name;
                var loadeq = fp.readFileSync('/volumio/http/www/equalizer/'+new_name, 'utf8');
                console.log(loadeq);
                var eq = JSON.parse(loadeq);
                var cmdString = "";
                var count = 1;
                Object.keys(eq).reduce(function(prev, name) {
                    cmdString+='sudo -u mpd amixer -D equal1 cset numid='+count+' '+(50 + eq[name]*4)+'; ';
                    count++;
                }, 0);
                child(cmdString, (err, stdout, stderr) => {
                    console.log('Load new EQ...');
                    //console.log(cmdString);
                });
                fpwrite.writeFile("/volumio/http/www/cur_equalizer.json",  loadeq, function(err) {
                    console.log('change cur_equalizer');
                });

            }
            else if(obj.select == 12){
                console.log('Delete EQ...');
                var new_name = obj.name;
                var deleq = '/volumio/http/www/equalizer/' + new_name;
                console.log(deleq);
                cmd = "rm " + deleq;
                child(cmd, (err, stdout, stderr) => {
                    console.log('Delete ' + new_name);
                    //console.log(cmdString);
                });
                var readname = fp.readFileSync('/volumio/http/www/equal_name', 'utf8');
                console.log(readname);
                readname1 = readname.replace(new_name+"\n","");
                console.log(readname1);
                fpwrite.writeFile("/volumio/http/www/equal_name",  readname1, function(err) {
                    ;
                });
            }
            else if(obj.select == 13){
                console.log('Reboot Upload...');
                cmd = "sudo node /home/volumio/upload.js";
                child(cmd, (err, stdout, stderr) => {
                    console.log('node upload.js');
                });
            }
            else {
    			child(getSongname, (err, stdout, stderr) => {
                    console.log('[HUGIN] Getting info from Midgard...');
    				//console.log(getSongname);
                    var now = fp.readFileSync('mpc.txt', 'utf8');
                    now = now.split('\n');
                    name += now[0];
                    if(name.length != 0) {
                        name = name.replace(' - ', '-');
                        name = name.replace(/\s+/g, '_');
                        name = name.replace('.mp3', '');
                        name = name.replace('.m4a', '');
                        name = name.replace('.wav', '');
                        name = name.split('/');
                        name = name[name.length-1];
                        console.log('[Now Playing] '+name);
                        time += now[1];
                        console.log('[Time] '+time);
                        var info = {
                            userID : 'zehir',
                            songname : name,
                            playtime : time,
                        }
                        Object.assign(info, obj);
                        var userdata = JSON.stringify(info);
                        var options = {
							hostname: '3.14.26.224',
                            port: 2722,
                            method: 'POST',
                            headers: {'Content-Type': 'text/html',
									  'Access-Control-Allow-Origin': '*'}
                        };
                        var req2 = http2.request(options, function (res2)
                        {
                            var body2 = '';
                            res2.setEncoding('utf8');
                            res2.on('data', function (data2) {
                                body2 += data2;
                                console.log(body2);
                                fpexist.stat('/volumio/http/www/cur_equalizer.json',function(err,stat) {
                                    if(err) {
                                        console.log('no cur_equalizer');
                                        fpwrite.writeFile("/volumio/http/www/cur_equalizer.json",  body2, function(err) {
                                            console.log('write new cur_equalizer');
                                        });
                                    }
                                    else {
                                        fpwrite.writeFile("/volumio/http/www/cur_equalizer.json",  body2, function(err) {
                                            console.log('write cur_equalizer');
                                        });
                                    }
                                });
                                var eq = JSON.parse(body2);
                                var cmdString = "";
                                var count = 1;
                                Object.keys(eq).reduce(function(prev, name) {
                                    cmdString+='sudo -u mpd amixer -D equal1 cset numid='+count+' '+(50 + eq[name]*4)+'; ';
                                    count++;
                                }, 0);
                                child(cmdString, (err, stdout, stderr) => {
                                    console.log('[ODIN] Changing EQ...');
                                    //console.log(cmdString);
                                });
                            });
                        });
                        req2.on('error', function () {
                            console.log('<error> MUNIN flew away =[');
                        });
                        req2.write(userdata);
                        req2.end();
                    }
    			});
            }
        });
        req.on('error', function () {
            console.log('<error> HUGIN flew away =[');
        });
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.writeHead(200, {'Access-Control-Allow-Origin' : '*'});
        res.end("[HUGIN] Received.");
    }
});
const child = require('child_process').exec;
var vol = 165;
port = 6140;
var museflag = 1;
server.listen(port);

const volume = 'amixer -c 0 set Digital 165';
const playaudio = 'aplay /home/volumio/start.wav';
const uploadjs = 'sudo node /home/volumio/upload.js';
const req = 'sudo node /home/volumio/Hvergelmir.js'
const ori_equalizer = '{"band1":0.0,"band2":0.0,"band3":0.0,"band4":0.0,"band5":0.0,"band6":0.0,"band7":0.0,"band8":0.0,"band9":0.0,"band10":0.0,"band11":0.0,"band12":0.0,"band13":0.0,"band14":0.0,"band15":0.0,"band16":0.0,"band17":0.0,"band18":0.0,"band19":0.0,"band20":0.0,"band21":0.0,"band22":0.0,"band23":0.0,"band24":0.0,"band25":0.0,"band26":0.0,"band27":0.0,"band28":0.0,"band29":0.0,"band30":0.0,"band31":0.0,"band32":0.0,"band33":0.0,"band34":0.0,"band35":0.0,"band36":0.0,"band37":0.0,"band38":0.0,"band39":0.0,"band40":0.0}';
const ipaddress = 'sudo node /home/volumio/ipaddress.js'
fpwrite.writeFile("/volumio/http/www/cur_equalizer.json",  ori_equalizer, function(err) {
    console.log('write current equalizer');
});
fpwrite.writeFile("/volumio/http/www/volume.json",  "50", function(err) {
    console.log('initail volume');
});
fpwrite.writeFile("/volumio/http/www/ipaddress.txt",  "No Wifi...", function(err) {
});
child(req,(err, stdout, stderr) => {
    console.log('initail equal1');
});
child(volume,(err, stdout, stderr) => {
    console.log('volume = ' + vol);
});
child(uploadjs,(err, stdout, stderr) => {
    console.log('upload is OK');
});
child(ipaddress,(err, stdout, stderr) => {
    console.log('ipaddress is OK');
});
child(playaudio,(err, stdout, stderr) => {
    console.log('start');
});
console.log('[HUGIN] Listening at Midgard : ' + port);
