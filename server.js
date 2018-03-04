var request = require('request-promise');
const express = require('express')
const app = express();
var async = require('async');


var resStr='',resArr=[], newStr='',newStr1='',textCharsArray=[], strIndex='';
     



function checkIfDivisible(results,passedText){
  


  for(var al=0;al<results[0].text.length;al++){
    //exploding text to chars
    textCharsArray.push((results[0].text).charAt(al).toLowerCase());
    }
    //looping through exploded array for maching first char of passed text with any maching char inside whole text as 
    //long as the range after start of char in whole text is equal to passedtext length if it is not we move 
    //to next matching char in whole text
    for(var tu=0;tu<textCharsArray.length;tu++){
      newStr1='';
      //if we find any match for starting char and any char inside whole text we go and check
      //if we continue to search through next chars in whole text we find exact match as long as distance we are looking for is 
      //equal to length of our passed text
      if(textCharsArray[tu] == passedText.charAt(0).toLowerCase())
      {
    // console.log(tu+'char is:'+textCharsArray[tu])
    
    // var startChar = results[1].subTexts[zx].charAt(0);
    var lengthOfSubText = passedText.length;
    for (var i=tu;i<tu+lengthOfSubText;i++){
      //here we build a newStr starting at matched char eg:p up to the length of our passed text
      //eg.peter pickl piper
      newStr1 +=  results[0].text.charAt(i).toLowerCase();
      var targetSecond = passedText.toLowerCase();
         if (newStr1==targetSecond)
            {
                //generating result string
                if(strIndex){
                strIndex+=',';
            }
          
           strIndex += (i-lengthOfSubText+2).toString();
     
       newStr1='';
       
         }
       }
      }
    }
    }

 app.post('/', (req, res) => {
  const options = {
    method: 'POST',
    uri: ' https://join.reckon.com/test2/submitResults',
    body: req.body,
    json: true,
    headers: {
        'Content-Type': 'application/json'
        
    }
}
//using async parallel to run both funcs with callbacks 
//and store in results arr
      async.parallel([
        /*
         * range API
         */
        function(callback) {
          var url = "https://join.reckon.com/test2/textToSearch";
          request(url, function(err, response, body) {
            // JSON body
            if(err) { console.log(err); callback(true); return; }
            obj = JSON.parse(body);
            // t1=obj;
            callback(false, obj);
          });
        },
        /*
         * divisor API
         */
        function(callback) {
          var url = "https://join.reckon.com/test2/subTexts";
          request(url, function(err, response, body) {
            // JSON body
            if(err) { console.log(err); callback(true); return; }
            obj = JSON.parse(body);
          //  t2=obj;
            callback(false, obj);
          });
        },
      ],
      /*
       * calling checkIfDivisible as logic and sending resStr as response 
       */
      function(err, results) {
        if(err) { console.log(err); res.send(500,"Server Error"); return; }
         
        
          results[1].subTexts.forEach(function(element) {
            console.log(element);
            checkIfDivisible(results,element.toLowerCase());
            
            if(strIndex)
            {
             resArr.push({'subtext': element,'result':strIndex});
             strIndex = '';
            }else{
              //hndleing non found Text
              resArr.push({'subtext': element,'result':'<No Output>'});
            }
          });
          console.log('results array : '+JSON.stringify(resArr));
          request(options).then(function (resArr){
           
            myObj = { "candidate":"Ali Sarabadani", "text":results[0].text, "results":resArr };
          
            console.log(myObj);
             res.status(200).myObj;
            
        })
        .catch(function (err) {
            console.log(err);
        })
      }
      );
 })

app.listen(9999, () => console.log('Reckon test2 app listening on port 9999'));
