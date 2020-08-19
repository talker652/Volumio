var os = require('os');
fpwrite = require('fs');
var ifname_tmp;
var connect;

setInterval(function(){
    connect = 0;
    ifname_tmp = "";
    var ifaces = os.networkInterfaces();
    Object.keys(ifaces).forEach(function (ifname) {
        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
            //127.0.0.1
            return;
            }
            if(ifname != "wlan0" && ifname != ifname_tmp){
                console.log(ifname, iface.address);
                fpwrite.writeFile("/volumio/http/www/ipaddress.txt",  iface.address, function(err) {
                });
                ifname_tmp = ifname;
                connect = 1;
            }
        });
    });
    if(connect != 1){
        console.log("No Wifi...");
        fpwrite.writeFile("/volumio/http/www/ipaddress.txt",  "No Wifi...", function(err) {
        });
    }
},3000);