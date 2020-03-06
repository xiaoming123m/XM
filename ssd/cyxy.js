#彩云小译
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
*/
const appkey = "VCIvwk2g,LzjySbQx";

//是否在没有tf位置的时候仍然弹出通知，默认不弹出,防止过多无用通知。
var isNOtify = false;
const fullstr = /(此 Beta 版本的测试员已满)|(此 Beta 版本目前不接受任何新测试员)/;
const appnamereg = /<title>加入 Beta 版"(.+)" - TestFlight - Apple<\/title>/;
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
                        var reg = /".+"/
                        var item = reg.exec(appname[0]);
                        var name = item[0].replace('"', '').replace('"', '');
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
    }).catch((error) => {
        console.log(error)
    });


}
var obj = JSON.parse($response.body);
 obj={
 "point": {},
 "user": {
  "status": "",
  "point": 168168,
  "audio_used_time": 0,
  "mvp_count": 477,
  "continuous_reading_count": 1,
  "updated_at": 1572729413,
  "doc_trans_block": false,
  "id": "5adb1b2ea4387f000be7ccb3",
  "be_liked_count": 0,
  "daily_comment_count": 0,
  "reading_page_count": 447,
  "type": "registered",
  "email": "",
  "username": "***8888",
  "daily_share_count": 0,
  "translation_count": 553,
  "biz": {
   "xy_vip_expire": 1999999999572020700,
   "platform_name": "caiyun",
   "phone_num": "15735012326",
   "name": "***2326",
   "grade": "积雨云",
   "is_xy_vip": true,
   "last_acted_at": 1569311538.545543,
   "platform_id": "",
   "score": 2000,
   "avatar": "https://images.unsplash.com/photo-1570328738505-305ad03ccc9f?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&dl=lee-luis-CpPbh112yk0-unsplash.jpg",
   "_id": "5adb1b2ea4387f000be7ccb3",
   "is_xy_auto_renewal": false
  },
  "audio_remaining_time": null,
  "daily_sentence_count": 0,
  "created_at": 1524308783,
  "free_download_count": 6,
  "avatar_url": "https://caiyunapp.com/imgs/webtrs/default.png",
  "reading_time_this_week": 45701,
  "_id": "5adb1b2ea4387f000be7ccb3"
 },
 "rc": 0
};
$done({body: JSON.stringify(obj)});
//
