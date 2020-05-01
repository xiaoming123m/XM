/*
Quantumult X:
#拍照取字unlock Vip
^http:\/\/pay\.maoqilai\.com\/get_user_info url script-response-body pzqz.js
app下载链接（国区）：https://apps.apple.com/cn/app/%E6%8B%8D%E7%85%A7%E5%8F%96%E5%AD%97-%E5%B0%B1%E6%98%AF%E5%A5%BD%E7%94%A8/id1249414505
MITM=pay.maoqilai.com
*/
var obj = JSON.parse($response.body);
 obj={
  "left_year_count" : 64,
  "head_img_url" : "http://assets.maoqilai.com/mall/assets/img/square_logo_a417627.png",
  "errmsg" : "success",
  "sex" : 0,
  "province" : "",
  "is_user_new_invited" : 0,
  "user_id" : 238566,
  "left_forever_count" : 57,
  "maobi_num" : 1,
  "code" : 0,
  "city" : "",
  "language" : "",
  "paid_service_list" : [
    {
      "service_id" : 7,
      "start_time" : 1588058243,
      "end_time" : 3742787843,
      "service_name" : "连续包月月度VIP会员"
    }
  ],
  "tel" : "13255809882",
  "nickname" : "",
  "country" : "",
  "access_token" : "f60220f84fd04f7ea1f290014046c7e3",
  "is_forever" : false
};
$done({body: JSON.stringify(obj)});
//
