var request = require('request-promise');
const express = require('express')
const app = express();
var async = require('async');


var resStr='',resArr=[], newStr='',newStr1='',textCharsArray=[], strIndex='';
     



function seacrhFunc(results,passedText){
  


  for(var al=0;al<results.one.text.length;al++){
    //splitting text to chars
    textCharsArray.push((results.one.text).charAt(al).toLowerCase());
    }
    //looping through textCharsArray for matching first char of passed text with any matching char inside whole text as 
    //long as the range after start of char in whole text is equal to passedtext length if it is not we move 
    //to next matching char in whole text
    for(var tu=0;tu<textCharsArray.length;tu++){
      newStr1='';
      //if we find any match for starting char and any char inside whole text we go and check
      //if we continue to search through next chars in whole text we find exact match as long as distance we are looking for is 
      //equal to length of our passed text
      if(textCharsArray[tu] == passedText.charAt(0).toLowerCase())
      {
    
    var lengthOfSubText = passedText.length;
    for (var i=tu;i<tu+lengthOfSubText;i++){
      //here we build a newStr starting at matched char eg:p up to the length of our passed text
      //eg.peter pickl piper
      newStr1 +=  results.one.text.charAt(i).toLowerCase();
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
//defining both funcs with callbacks as parallelFunctions

     var parallelFunctions ={
        /*
         * textToSearch API
         */
        one:function(callback) {
          var url = "https://join.reckon.com/test2/textToSearch";
          request(url, function(err, response, body) {
            // JSON body
            if(err) { console.log(err); callback(true); return; }
            //in addition to async.retry if response status is not 200 retry again
            else if(response.statusCode !=200){
              retry();
              return
            }
            obj = JSON.parse(body);
           
            callback(false, obj);
          });
        },
        /*
         * subTexts API
         */
       two: function(callback) {
          var url = "https://join.reckon.com/test2/subTexts";
          request(url, function(err, response, body) {
            // JSON body
            if(err) { console.log(err); callback(true); return; }
            
            obj = JSON.parse(body);
            callback(false, obj);
          });
        },
      }

      //calling both api s in parallel using async parallel
      var doThemInParallel = function(callback) {
        async.parallel(parallelFunctions, function(err, results) {
            callback(err, results);
        });
    };
      /*
       * using async.retry 
       * Attempts to get a successful response from task no more than times times with interval before returning an error. 
       */
      async.retry({
        times: 1000,
        interval: 1000
      }, doThemInParallel, function(err, results) {
        
          // do something with the result
          results.two.subTexts.forEach(function(element) {
            console.log(element);
            seacrhFunc(results,element.toLowerCase());
            
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
           
            finalObj = { "candidate":"Ali Sarabadani", "text":results.one.text, "results":resArr };
          
            console.log(finalObj);
             res.status(200).json(finalObj);
            
        })
        .catch(function (err) {
            console.log(err);
        })
     });
   
      });


app.listen(9999, () => console.log('Reckon test2 app listening on port 9999'));
