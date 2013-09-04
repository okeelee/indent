// takes a string of html code and tries to tab it properly
// very basic and will break with bad html
// TODO: ignore javascript and css (will need to change the replace at the begining)
//   maybe remove line breaks as we step over the html instead of in the begining?
// TODO: handle single line empty divs as inline - EX: <div class="something"></div>
var indentHtml = function(str){
  var tabSize = 2;
  var loc = 0;
  var depth = 0;
  var carCount = 0;
  var out = "";
  var afterClosed = true;
  var lastWasInline = false;
  var inlineElements = "b big i small tt abbr acronym cite code dfn em kbd strong samp var a bdo br img map object q script span sub sup button input label textarea".split(' '); // removed from list: select
  var voidElements = "area base br col command embed hr img input keygen link meta param source track wbr".split(' ');
  var checkTags = function(tag, tags){
    for (var i = tags.length - 1; i >= 0; i--) {
      if(tags[i] == tag){
        return true;
      }
    }
    return false;
  };
  var getElementTag = function(loc, str){
    var tagLoc = loc;
    var tag = '';
    while(!(/\s|\r|\n|\>|\//.test(str[tagLoc]))){
      tag += str[tagLoc];
      tagLoc++;
    }
    return tag;
  }
  var getTab = function(){
    var tab = '';
    for(var i=0; i < depth*tabSize; i++){ tab += ' '; }
    return tab;
  }

  str = str.replace(/(\n|\r)\s*\</g,"<").replace(/(\n|\r)/g," ").replace(/\s+\</g,"<");//.replace(/\s+/g," ");
  while(loc < str.length){
    if(str[loc] == '<'){
      carCount++;
      if(carCount < 2){
        var closingTag = (str[loc+1] == '/');
        var tagStart = closingTag ? 2 : 1;
        var tagName = getElementTag(loc+tagStart, str);
        var inlineElement = checkTags(tagName, inlineElements);
        var voidElement = checkTags(tagName, voidElements);

        if(closingTag && !inlineElement){
          depth--;
          out = out+"\n"+getTab();
        }else if(!voidElement && !inlineElement){
          if(lastWasInline){
            out = out+"\n"+getTab();
          }
          depth++;
        }

        lastWasInline = inlineElement;
      }
      out = out+str[loc];
      afterClosed = false;
    }else if(str[loc] == '>'){
      carCount--;
      out = out+str[loc];

      if(carCount < 1){
        var selfClosing = (str[loc-1] == '/');
        var tagName = getElementTag(function(newLoc,str){
          while(!/\</.test(str[newLoc-1])){
            newLoc--;
          }
          if(str[newLoc]=='/'){
            newLoc++;
          }
          return newLoc;
        }(loc,str), str);
        var inlineElement = checkTags(tagName, inlineElements);
        var voidElement = checkTags(tagName, voidElements);

        if(voidElement){
          voidElement = false;
        }else if(selfClosing){
          depth--;
        }
        if((str[loc+1] == '<' && str[loc+2] == '/') || inlineElement){
          // do nothing
        }else{
          out = out+"\n"+getTab();
        }
        afterClosed = true;
      }
    }else{
      if(afterClosed){
        while(/\s/.test(str[loc])){
          loc++;
        }
      }
      if(str[loc]){
        out = out+str[loc];
      }
      afterClosed = false;
    }
    loc++;
  }

  return out;
};