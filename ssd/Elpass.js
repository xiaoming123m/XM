{
  "rules" : [
    {
      "action" : "body",
      "matchField" : "",
      "field" : "",
      "value" : "{\"license\":{\"policy\":\"eyJkZXZpY2VJRCI6IjQzQjkzN0NENzVFRiIsImRidXVpZCI6IjRmMDJmMmIwLTY4N2YtMTFlYS05M2Y0LTdkYTBhYjNlOTA0OSIsInBvbGljeUV4cGlyYXRpb25EYXRlIjoxNTg1NzY2NjU4LCJzdWJzY3JpcHRpb25FbmREYXRlIjoxNjE4Njg1Mjg0LCJub3ciOjE1ODQ0NzA2NTgsImV4cGlyZWQiOmZhbHNlLCJyZXZva2VkIjpmYWxzZX0=\",\"sign\":\"QkN1Xh3WNK3FWKHfftLzmTjRLEbH1TNQXgaauB6WUc3a3\\\/qIV7zfy+AeMHztzHDriSSPKOpcLQ7pHu95FNtEDQ==\"}}",
      "matchValue" : ".+",
      "destiontion" : "request",
      "isRegex" : true
    }
  ],
  "enabled" : true,
  "isReadOnly" : false,
  "name" : "ohh",
  "locations" : [
    {
      "method" : "POST",
      "scheme" : "https",
      "enabled" : true,
      "port" : 443,
      "query" : "",
      "host" : "api.elpass.app",
      "path" : "\/device\/*"
    }
  ],
  "description" : ""
}