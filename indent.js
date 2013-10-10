// takes a string of html code and tries to tab it properly
// very basic and will break with bad html
// TODO: remove the depth var and just use the tagStack
// TODO: handle single line empty divs as inline - EX: <div class="something"></div>
var indentHtml = function(str){
  var tabSize = 2;
  var loc = 0;
  var depth = 0;
  var tagStack = [];
  var carCount = 0;
  var out = "";
  var inTag = false;
  var lastWasInline = false;
  var inlineElements = "b big i small tt abbr acronym cite code dfn em kbd strong samp var a bdo br img map object q span sub sup button input label textarea r:property".split(' '); // removed from list: select script
  var voidElements = "area base br col command embed hr img input keygen link meta param source track wbr".split(' ');
  var ignoredElements = "script canvas style pre".split(' ');
  var checkIgnored = function(tagStack){
    for (var i = ignoredElements.length - 1; i >= 0; i--) {
      for (var j = tagStack.length - 1; j >= 0; j--) {
        if(ignoredElements[i] == tagStack[j]){
          return true;
        }
      }
    }
    return false;
  };
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

  while(loc < str.length){
    if(str[loc] == '<'){
      carCount++;
      if(carCount < 2){
        var closingTag = (str[loc+1] == '/');
        var tagStart = closingTag ? 2 : 1;
        var tagName = getElementTag(loc+tagStart, str);
        var inlineElement = checkTags(tagName, inlineElements);
        var voidElement = checkTags(tagName, voidElements);

        if(closingTag && tagStack[tagStack.length-1] == tagName){
          var noFormatting = checkIgnored(tagStack);
          tagStack.pop();
        }else{
          tagStack.push(tagName);
          var noFormatting = checkIgnored(tagStack);
        }

        if(!noFormatting){
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
      }
      out = out+str[loc];
      inTag = true;
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

        var noFormatting = checkIgnored(tagStack);

        if(selfClosing && tagStack[tagStack.length-1] == tagName){
          tagStack.pop();
        }

        if(voidElement){
          voidElement = false;
        }else if(selfClosing && !inlineElement && !noFormatting){
          depth--;
        }

        var removedOne = false; 
        while(/\s|\n|\r/.test(str[loc+1])){
          loc++;
          removedOne = true;
        }
        if(inlineElement && removedOne){
          out = out+" ";
        }

        if((str[loc+1] == '<' && str[loc+2] == '/') || inlineElement || noFormatting){
          // do nothing
        }else{
          out = out+"\n"+getTab();
        }
        inTag = false;
      }
    }else{
      if(!checkIgnored(tagStack)){
        var removedOne = false; 
        while(/\s|\n|\r/.test(str[loc])){
          loc++;
          removedOne = true;
        }
        if(removedOne && !(inTag && str[loc] == '>')){
          out = out+" ";
        }
      }
      if(str[loc] && (str[loc] == '<' || str[loc] == '>')){
        loc--; // back it up to catch the '<'
      }else{
        out = out+str[loc];
      }
      // inTag = false;
    }
    loc++;
  }

  return out;
};