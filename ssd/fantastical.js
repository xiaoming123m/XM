/*
    本作品用于QuantumultX和Surge之间js执行方法的转换
    您只需书写其中任一软件的js,然后在您的js最【前面】追加上此段js即可
    无需担心影响执行问题,具体原理是将QX和Surge的方法转换为互相可调用的方法
    尚未测试是否支持import的方式进行使用,因此暂未export
    如有问题或您有更好的改进方案,请前往 https://github.com/sazs34/TaskConfig/issues 提交内容,或直接进行pull request
    您也可直接在tg中联系@wechatu
*/
// #region 固定头部
let isQuantumultX = $task !== undefined; //判断当前运行环境是否是qx
let isSurge = $httpClient !== undefined; //判断当前运行环境是否是surge
// http请求
var $task = isQuantumultX ? $task : {};
var $httpClient = isSurge ? $httpClient : {};
// cookie读写
var $prefs = isQuantumultX ? $prefs : {};
var $persistentStore = isSurge ? $persistentStore : {};
// 消息通知
var $notify = isQuantumultX ? $notify : {};
var $notification = isSurge ? $notification : {};
// #endregion 固定头部

// #region 网络请求专用转换
if (isQuantumultX) {
    var errorInfo = {
        error: ''
    };
    $httpClient = {
        get: (url, cb) => {
            var urlObj;
            if (typeof (url) == 'string') {
                urlObj = {
                    url: url
                }
            } else {
                urlObj = url;
            }
            $task.fetch(urlObj).then(response => {
                cb(undefined, response, response.body)
            }, reason => {
                errorInfo.error = reason.error;
                cb(errorInfo, response, '')
            })
        },
        post: (url, cb) => {
            var urlObj;
            if (typeof (url) == 'string') {
                urlObj = {
                    url: url
                }
            } else {
                urlObj = url;
            }
            url.method = 'POST';
            $task.fetch(urlObj).then(response => {
                cb(undefined, response, response.body)
            }, reason => {
                errorInfo.error = reason.error;
                cb(errorInfo, response, '')
            })
        }
    }
}
if (isSurge) {
    $task = {
        fetch: url => {
            //为了兼容qx中fetch的写法,所以永不reject
            return new Promise((resolve, reject) => {
                if (url.method == 'POST') {
                    $httpClient.post(url, (error, response, data) => {
                        response.body = data;
                        resolve(response, {
                            error: error
                        });
                    })
                } else {
                    $httpClient.get(url, (error, response, data) => {
                        response.body = data;
                        resolve(response, {
                            error: error
                        });
                    })
                }
            })

        }
    }
}
// #endregion 网络请求专用转换

// #region cookie操作
if (isQuantumultX) {
    $persistentStore = {
        read: key => {
            return $prefs.valueForKey(key);
        },
        write: (val, key) => {
            return $prefs.setValueForKey(val, key);
        }
    }
}
if (isSurge) {
    $prefs = {
        valueForKey: key => {
            return $persistentStore.read(key);
        },
        setValueForKey: (val, key) => {
            return $persistentStore.write(val, key);
        }
    }
}
// #endregion

// #region 消息通知
if (isQuantumultX) {
    $notification = {
        post: (title, subTitle, detail) => {
            $notify(title, subTitle, detail);
        }
    }
}
if (isSurge) {
    $notify = function (title, subTitle, detail) {
        $notification.post(title, subTitle, detail);
    }
}
/**
 * 
 * 写入要监测的公测tf appkey，当有空位的时候会弹出通知。
 * 建议task时间间隔小点。
 */

const title = 'testfilght';
const url = "https://testflight.apple.com/join/";

/**
 * 填入要监测的appkey。从testfligt地址获取。
 * 例如"VCIvwk2g,wArXdacJ,2vnRvOTX,LzjySbQx,IdFRwmNy,qDkBu2ur,4Qt2lIm5,ZzqOu8tX,ftCqFe6D,fy7LvHVA,QKqitFwc"
/*
Quantumult X https://testflight.apple.com/join/VCIvwk2g
Thor https://testflight.apple.com/join/wArXdacJ
Thor https://testflight.apple.com/join/2vnRvOTX
Anubis https://testflight.apple.com/join/LzjySbQx
Kitsunebi https://testflight.apple.com/join/IdFRwmNy
Working Copy - Git client https://testflight.apple.com/join/ZzqOu8tX
Pythonista 3 https://testflight.apple.com/join/qDkBu2ur
HTTP Catcher https://testflight.apple.com/join/4Qt2lIm5
Thor HTTP Sniffer/Capture https://testflight.apple.com/join/ftCqFe6D
The App List https://testflight.apple.com/join/oV5HiCSz
LastPass https://testflight.apple.com/join/fy7LvHVA
1.1.1.1: Faster Internet https://testflight.apple.com/join/QKqitFwc
Alook: Faster Internet https://testflight.apple.com/join/I4MFSZp1
网易邮箱pro https://testflight.apple.com/join/2NH4aiKd
*/  
*/
const appkey = "23LA2tmX,VCIvwk2g,wArXdacJ,2vnRvOTX,qDkBu2ur,4Qt2lIm5,ftCqFe6D,fy7LvHVA,QKqitFwc,I4MFSZp1,2NH4aiKd";

//是否在没有tf位置的时候仍然弹出通知，默认不弹出,防止过多无用通知。
var isNOtify = false;
const fullstr = /(此 Beta 版本的测试员已满)|(此 Beta 版本目前不接受任何新测试员)/;
const appnamereg = /<title>加入 Beta 版“(.+)” - TestFlight - Apple<\/title>/;
var proarray = new Array();
getResult();

function getResult() {
    var upstr = '已有空位，抓紧上车';
    var apps = new Array(); //定义一数组
    apps = appkey.split(","); //字符分割
    var resultstr = false;
    var logdata={};
    for (var i = 0; i < apps.length; i++) {

        var p = new Promise(function (resolve) {
            var lol = {
                url: url + apps[i],
                headers: {
                    'User-Agent': '[{"key":"User-Agent","value":" Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2357.130 Safari/537.36 qblink wegame.exe QBCore/3.70.66.400 QQBrowser/9.0.2524.400","type":"text","enabled":true,"description":""},{"key":"X-Requested-With","value":" XMLHttpRequest","type":"text","enabled":false,"description":""}]',
                },
            };
            $httpClient.get(lol, function (error, response, data) {
                try {
                    appnamereg.test(data);
                    var appname = appnamereg.exec(data);
                    if (!appname != null) {
                        var reg = /“.+”/
                        var item = reg.exec(appname[0]);
                        var name = item[0].replace('“', '').replace('”', '');
                        if (!fullstr.test(data)) {
                            logdata[name]={
                                'has':true,
                                'context':upstr + '👉:' + lol.url + '\n'
                            }
                            resultstr=true;
                        }
                        else{
                            logdata[name]={
                                'has':false,
                                'context':':暂无车位'+'\n'
                            }
                        }
                    }
                    resolve('done');
                }
                catch (errr) {
                    resolve('done');
                }

            });
        });


        proarray[i] = p;
    }
    Promise.all(proarray).then((result) => {
        var hastr='';
        var nostr='';
        for(var name in logdata){
            if(logdata[name].has){
                hastr=hastr+'[' + name + ']'+logdata[name].context;
            }
            else{
                nostr=nostr+'[' + name + ']'+logdata[name].context;
            }
        }
        if (resultstr) {
           
            $notification.post('', '', hastr+nostr);
        }
        else{
            if(isNOtify){
                $notification.post('', '', hastr+nostr);
            }
        }
        console.log(hastr+nostr);
         $done();
    }).catch((error) => {
        console.log(error)
    });


}
/*
^https:\/\/api\.flexibits\.com\/v1\/(auth|account)\/(device|details|appstore-receipt)\/$ url script-response-body fantastical.js
hostname=api.flexibits.com
*/

let url=$request.url;
let obj=JSON.parse($response.body);

if(url.indexOf('device')!=-1){

  obj.status="success";
  obj.subscription={
	  	"autorenew": true,
		"expiration": "2099-12-31T16:49:37Z",
		"expires": "2099-12-31T16:49:37Z"
  };
  obj.scope=["notify", "weather", "keyvalue-watch", "keyvalue-verification", "schedjoules", "scheduling", "account", "keyvalue", "fantastical"];
  
}

if(url.indexOf('details')!=-1){

  obj.subscription={
		"autorenew": true,
		"expiration": "2099-12-31T16:49:37.000000Z",
		"uuid": "f1da7c78-e964-4367-915c-886edc794959",
		"subscription_type": "AppStore",
		"is_expired": false,
		"trial": false
  };
}

if(url.indexOf('appstore-receipt')!=-1){
	
	obj.autorenew=true;
	obj.expiration="2099-12-31T16:49:37.000000Z";
	obj.subscription_type="AppStore";
	obj.is_expired=false;
	obj.trial=false;
}

$done({body:JSON.stringify(obj)});
