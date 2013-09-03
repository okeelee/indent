var indent = function(str){
  var tabSize = '  ';
  var loc = 0;
  var depth = 0;
  var carCount = 0;
  var out = "";
  var maxTagLength = 8;
  var afterClosed = true;
  var inlineElements = "b big i small tt abbr acronym cite code dfn em kbd strong samp var a bdo br img map object q script span sub sup button input label select textarea".split(' ');
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
    return str.slice((loc+tagStart),(loc+maxTagLength+tagStart)).split(/\s|\n|\>/).shift();
  }
  str = str.replace(/(\n|\r)\s*\</g,"<").replace(/(\n|\r)/g," ").replace(/\s+\</g,"<").replace(/\s+/g," ");
  while(loc < str.length){
    if(str[loc] == '<'){
      var closingTag = (str[loc+1] == '/');
      var tagStart = closingTag ? 2 : 1;
      var tagName = getElementTag(loc, str);
      var inlineElement = checkTags(tagName, inlineElements);
      carCount++;

      if(closingTag && !inlineElement){
        depth--;
        var tab = '';
        for(var i=0; i < depth; i++){ tab += tabSize; }
        out = out+"\n"+tab;
      }else{
        if(checkTags(tagName, voidElements)){
          voidElement = true;
        }else if(!inlineElement){
          depth++;
        }
      }
      out = out+str[loc];
      afterClosed = false;
    }else if(str[loc] == '>'){
      var selfClosing = (str[loc-1] == '/');
      var newLoc = loc;
      while(!/\</.test(str[newLoc])){
        newLoc--;
      }
      var tagName = getElementTag(newLoc, str);
      var inlineElement = checkTags(tagName, inlineElements);
      carCount--;
      
      if(voidElement){
        voidElement = false;
      }else if(selfClosing){
        depth--;
      }
      if((str[loc+1] == '<' && str[loc+2] == '/') || inlineElement){
        out = out+str[loc];
      }else{
        var tab = '';
        for(var i=0; i < depth; i++){ tab += tabSize; }
        out = out+str[loc]+"\n"+tab;
      }
      afterClosed = true;
    }else{
      if(afterClosed){
        while(/\s/.test(str[loc])){
          loc++;
        }
      }
      out = out+str[loc];
      afterClosed = false;
    }
    loc++;
  }

  return out;
};