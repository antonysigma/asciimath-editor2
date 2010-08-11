/*
ASCIIMathMLeditor.js
====================
This file contains JavaScript functions that work with ASCIIMathML.js 
to allow editing of ASCII math notation and conversion to a XHTML+MathML
page. This is a convenient and inexpensive solution for authoring MathML.

Version 2.01 March 1, 2009, (c) Peter Jipsen http://www.chapman.edu/~jipsen
Latest version at http://www.chapman.edu/~jipsen/mathml/ASCIIMathMLeditor.js
If you use it on a webpage, please send the URL to jipsen@chapman.edu

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or (at
your option) any later version.

This program is distributed in the hope that it will be useful, 
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
General Public License (at http://www.gnu.org/copyleft/gpl.html) 
for more details.
*/

var AMkeyspressed = 20;

function initEditor() {
  initSymbols();
  var body = $("body")[0];
  if (checkForMathML) {
    checkForMathML = false;
    var nd = checkMathML();
    if (nd != null) body.prepend(nd);
  }
  
  if(isIE){
xsl = new ActiveXObject("Microsoft.XMLDOM");
xsl.async = false;
xsl.load("pmathmlcss.xsl");
}
  AMdisplay(true,true);
}

function AMnode2string(inNode,indent) {
// thanks to James Frazer for contributing an initial version of this function
   var i, str = "";
   if(inNode.nodeType == 1) {
       var name = inNode[0].nodeName.toLowerCase(); // (IE fix)
       str = "\r" + indent + "<" + name;
       for(i=0; i < inNode.attributes.length; i++)
           if (inNode.attributes[i].nodeValue!="italic" &&
               inNode.attributes[i].nodeValue!="" &&  //stop junk attributes
               inNode.attributes[i].nodeValue!="inherit" && // (mostly IE)
               inNode.attributes[i].nodeValue!=undefined)
               str += " "+inNode.attributes[i][0].nodeName+"="+
                     "\""+inNode.attributes[i].nodeValue+"\"";
       if (name == "math") 
           str += " xmlns=\"http://www.w3.org/1998/Math/MathML\"";
       str += ">";
       for(i=0; i<inNode.childNodes.length; i++)
           str += AMnode2string(inNode.childNodes[i], indent+"  ");
       if (name != "mo" && name != "mi" && name != "mn") str += "\r"+indent;
       str += "</" + name + ">";
   }
   else if(inNode.nodeType == 3) {
       var st = inNode.nodeValue;
       for (i=0; i<st.length; i++)
           if (st.charCodeAt(i)<32 || st.charCodeAt(i)>126)
               str += "&#"+st.charCodeAt(i)+";";
           else if (st.charAt(i)=="<" && indent != "  ") str += "&lt;";
           else if (st.charAt(i)==">" && indent != "  ") str += "&gt;";
           else if (st.charAt(i)=="&" && indent != "  ") str += "&amp;";
           else str += st.charAt(i);
   }
   return str;
} 

function transformMathML(node)
{
var xml = new ActiveXObject("Microsoft.XMLDOM");
xml.async = false;

var outstr = AMnode2string(node,"").slice(22).slice(0,-6);
outstr = '<?xml version="1.0" ?><span xmlns="http://www.w3.org/1999/xhtml" '+
'xmlns:mml="http://www.w3.org/1998/Math/MathML">'+outstr+'<\/span>';
xml.loadXML(outstr);

var html = xml.transformNode(xsl);
node.innerHTML = html;
var scriptObj = node.getElementsByTagName('script');
//just to make sure all scripts are loaded
for(var i=0;i<scriptObj.length;i++)
try {
eval(scriptObj[i].innerHTML);
}catch(e){}

renderQueue.runAll();
}

function AMdisplay(now,transform) {
  if ($("#inputText") == null) return;
    if (AMkeyspressed < 20 && !now) {
 AMkeyspressed++;return;}

$('body').css('cursor','progress');
      var str = $("#inputText").val();
      var outnode = $("#outputNode");
      var newnode = $("<div>").attr('id','outputNode');
      //var newFrag = document.createDocumentFragment();
      outnode.replaceWith(newnode);
      outnode = $("#outputNode");
      var arr = str.split((isIE?"\r\n\r\n":"\n\n"));
      for (var i = 0; i<arr.length; i++){
        var spn = $("<p>").html(arr[i]);
        outnode.append(spn);
      }
	//convert from jquery object to DOM object
	outnode = outnode[0];
	//which is first
      if (!isIE)
LMprocessNode(outnode,true);
      AMprocessNode(outnode,true);
      if(isIE){
       LMprocessNode(outnode,true);
      if(transform) transformMathML(outnode);
       }

      AMkeyspressed = 0;
$('body').css('cursor','default');
}

function AMchangeColumns(n) {
  $("#inputText").attr("cols",n);
}

doubleblankmathdelimiter = true;
/*
function AMsetDoubleBlank() {
  doubleblankmathdelimiter = 
    document.getElementById("doubleblank").checked;
}
*/
function AMviewMathML() {
  AMdisplay(true);
  var str = $('#inputText').val();
  var outnode = $('#outputNode');
  outstr = '<?xml version="1.0"?>\r\<!-- Copy of ASCIIMathML input\r'+
  str.replace(/</g,'&lt;').replace(/>/g,'&gt;')+
'-->\r<?xml-stylesheet type="text/xsl" href="mathml.xsl"?>\r\
<html xmlns="http://www.w3.org/1999/xhtml"\r\
  xmlns:mml="http://www.w3.org/1998/Math/MathML">\r\
<head>\r<title>Untitled</title>\r</head>\r<body>\r'+
outnode.xml()+'<\/body>\r<\/html>\r';
  var newnode = $('<textarea>').attr({"id":"outputNode","rows":"30",
	"cols":$('#inputText').attr("cols")}).text(outstr);  
  outnode.replaceWith(newnode);
}
//Onload
$(function (){

$('button:contains("800x600")').click(function (){AMchangeColumns(45)});
$('button:contains("1024x768")').click(function (){AMchangeColumns(58)});
$('button:contains("1400x1050")').click(function (){AMchangeColumns(61)});
$('button:contains("Update")').click(function (){AMdisplay(true,true)});
$('button:contains("View MathML")').click(function (){AMviewMathML()});
initEditor();
});

