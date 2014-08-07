function PaginatorResult(){this.pagesBounds=[]}function compareRects(d,c){return d.top-c.top}function compareRects2(d,c){return d.bottom-c.bottom}function addNodeRectsToRects_(a,c,i,b){for(var g=0;g<a.length;g++){var d=a[g];var e=getZoomedClientRects(d,i);for(var h=0;h<e.length;h++){var f=e[h];if(b!=0){f.inset(0,b)}c.push(f)}}}function Paginator(a,b){this.chapter=a;this.textZoom=b;this.chapterBoundingRect=getZoomedBoundingClientRect(this.chapter.element,this.textZoom);this.result=new PaginatorResult();this.currentTop=Math.floor(this.chapterBoundingRect.top);this.viewHeight=viewport.height;this.maxBottom=this.currentTop+this.viewHeight;this.debugContext=(system.verifyPaginationON)?new DebugContext():null;this.gapsColumn=new GapsColumn(Math.floor(2*this.viewHeight),this.debugContext);this.gapsColumn.repositionAt(this.currentTop)}Paginator.prototype.getRects_=function(){var d=[];var g=this.chapterBoundingRect;var f=this.getTextRects_();for(var c=0;c<f.length;c++){d.push(f[c])}var e=this.chapter.element.getElementsByTagName("IMG");addNodeRectsToRects_(e,d,1,0);var a=this.chapter.element.getElementsByTagName("VIDEO");addNodeRectsToRects_(a,d,1,-1);var b=this.chapter.element.getElementsByTagName("AUDIO");addNodeRectsToRects_(b,d,1,-1);addNodeRectsToRects_(this.chapter.element.getElementsByTagName("embed"),d,1,0);addNodeRectsToRects_(this.chapter.element.getElementsByTagName("iframe"),d,1,0);addNodeRectsToRects_(this.chapter.element.getElementsByTagName("object"),d,1,0);addNodeRectsToRects_(this.chapter.element.getElementsByTagName("svg"),d,this.textZoom,0);return[d,g]};Paginator.prototype.getTextRects_=function(){var g=[];var a=document.createNodeIterator(this.chapter.element,NodeFilter.SHOW_TEXT,null,false);var f;while((f=a.nextNode())){if(!is_all_ws(f)){var c=f.parentNode;if(c.childNodes.length>1){window.bridge.e("getTextRects_():  parent with "+c.childNodes.length+" children, did you forget to run processTextElements_()?")}var b=getZoomedClientRects(c,this.textZoom);for(var e=0,d;d=b[e];e++){g.push(d)}}}a.detach();return g};Paginator.prototype.paginate=function(){var a=new Stopwatch(system.profilingON);var b=this.getRects_();var o=b[0];var m=b[1];var h=a.getElapsedMillis();if(system.profilingON){var p=a.getElapsedMillis()-h;this.result.timing="| getrects |"+h+"| sort |"+p}this.pageIndex=0;var d=true;var f=true;if(d){o.sort(compareRects)}else{o.sort(compareRects2)}var k=0;var l=0;var i=0;this.maxBottom=this.currentTop+this.viewHeight;for(var n=0;n<o.length;n++){var j=o[n];if(!d){f=false;if(j.top>=this.currentTop&&j.bottom<=this.maxBottom){i=(j.bottom>k)?j.bottom:k;if(j.bottom>k){k=j.bottom}if(j.top>l){l=j.top}}else{if(j.top>=this.currentTop&&j.bottom>this.maxBottom){this.result.pagesBounds.push(new PageBounds(this.currentTop,i));this.currentTop=j.top>l?j.top:l;this.maxBottom=this.currentTop+this.viewHeight;this.notifyPaginator_(this.pageIndex);this.pageIndex++}else{if(j.height>this.viewHeight){this.result.pagesBounds.push(new PageBounds(this.currentTop,this.currentTop+this.viewHeight));this.currentTop=this.currentTop+this.viewHeight;this.maxBottom=this.currentTop+this.viewHeight;this.notifyPaginator_(this.pageIndex);this.pageIndex++}else{if(j.top>=this.maxBottom){this.result.pagesBounds.push(new PageBounds(this.currentTop,i));this.currentTop=j.top>l?j.top:l;this.maxBottom=this.currentTop+this.viewHeight;this.notifyPaginator_(this.pageIndex);this.pageIndex++}}}}}else{if(j.height>this.viewHeight){var g=((j.top==m.top)&&(Math.abs(j.left-m.left)<=1)&&(j.bottom==m.bottom));if(!g){window.bridge.e("chapter.paginate() ignoring big rect: "+jsonRectFromRect(j));if(system.drawElementRectanglesON){drawOutline(j,"orange",2)}}}else{if(j.top<this.maxBottom){this.gapsColumn.markGapsInRect(j)}else{while(j.top>=this.maxBottom){f=this.makePageBreak_(j)}this.gapsColumn.markGapsInRect(j)}}}}while(f){f=this.makePageBreak_(null)}var e=Math.floor(this.chapterBoundingRect.bottom);if(this.currentTop<e||m.height==0){if(d){this.addPagesUptoY_(e)}else{this.result.pagesBounds.push(new PageBounds(this.currentTop,e>0?e:(this.currentTop+this.viewHeight)));this.notifyPaginator_(this.pageIndex);this.pageIndex++}}else{var c=this.result.pagesBounds.length;if((c<=0)||(e<this.result.pagesBounds[c-1].top)){window.bridge.e("chapter.paginate() something is very wrong with this chapter rect: "+jsonRectFromRect(j))}else{this.result.pagesBounds[c-1].bottom=e}}if(this.debugContext){this.debugContext.validateBreaks(this.result.pagesBounds)}return this.result};Paginator.prototype.addPagesUptoY_=function(b){while(this.currentTop<b){var a=(b>this.maxBottom)?this.maxBottom:b;this.result.pagesBounds.push(new PageBounds(this.currentTop,a));this.notifyPaginator_(this.pageIndex);this.pageIndex++;this.gapsColumn.repositionAt(a);this.currentTop=a;this.maxBottom=this.currentTop+this.viewHeight}};Paginator.prototype.notifyPaginator_=function(b){return;if(b>1){var a="";var d=this.result.pagesBounds[this.result.pagesBounds.length-1];var c=jsCoordinateToJava(d.top);var e=jsCoordinateToJava(d.bottom);if(!isInt(c)||!isInt(e)){c=Math.floor(c);e=Math.floor(e)}a+=c+","+e;bridge.onPaginationReady(this.chapter.index,b,a)}else{if(b==1){var a="";var d=this.result.pagesBounds[0];var c=jsCoordinateToJava(d.top);var e=jsCoordinateToJava(d.bottom);if(!isInt(d.top)||!isInt(d.bottom)){c=Math.floor(c);e=Math.floor(e)}a+=c+","+e;a+=",";var d=this.result.pagesBounds[this.result.pagesBounds.length-1];var c=jsCoordinateToJava(d.top);var e=jsCoordinateToJava(d.bottom);if(!isInt(c)||!isInt(e)){c=Math.floor(c);e=Math.floor(e)}a+=c+","+e;bridge.onPaginationReady(this.chapter.index,b,a)}}};Paginator.prototype.makePageBreak_=function(c){var e=true;var a=this.maxBottom-1;var d=this.gapsColumn.searchBackwards(a,GapsValue.ZERO,GapsSearchMode.EQUAL);if(d<0){d=this.gapsColumn.searchBackwards(a,2,GapsSearchMode.GREATER_EQ);window.bridge.e("Could not find a true break. nextPageIndex: "+this.result.pagesBounds.length)}if(d<0){window.bridge.e("Could not find where to cut. nextPageIndex: "+this.result.pagesBounds.length);d=a}d+=1;var b=this.gapsColumn.searchForward(d,GapsValue.ONE,GapsSearchMode.GREATER_EQ);if(b<0){if(c!=null){b=Math.floor(c.top)}else{e=false;b=d}}this.result.pagesBounds.push(new PageBounds(this.currentTop,d));if(e){this.notifyPaginator_(this.pageIndex)}this.pageIndex++;this.gapsColumn.repositionAt(b);this.currentTop=b;this.maxBottom=this.currentTop+this.viewHeight;return e};function DebugContext(){this.pixels=[]}DebugContext.prototype.paintRect=function(c){var d=Math.floor(c.top);var a=Math.floor(c.bottom);if(d<0||a<d){window.bridge.e("DebugContext::paintRect invalid rect top: "+d+" bottom: "+a)}else{for(var b=d;b<a;b++){this.pixels[b]=1}}};DebugContext.prototype.findPageBackwards=function(e,d,a){for(var c=e;c>=0;c--){var b=a[c];if((b.top<=d)&&(d<=b.bottom)){return c}}return -1};DebugContext.prototype.findPageForward=function(e,d,a){for(var c=e;c<a.length;c++){var b=a[c];if((b.top<=d)&&(d<=b.bottom)){return c}}return -1};DebugContext.prototype.validateBreaks=function(b){var e=0;var c=[];for(var d=0;d<this.pixels.length;d++){if(this.pixels[d]==1){var a=-1;if(d<b[e].top){a=this.findPageBackwards(e-1,d,b)}else{if(d>b[e].bottom){a=this.findPageForward(e+1,d,b)}else{a=e}}if(a<0){c.push(d)}else{e=a}}}if(c.length>0){window.bridge.e("DebugContext::validateBreaks found orphan pixels: "+c)}else{window.bridge.d("DebugContext::validateBreaks chapter looks valid")}};function GapsColumn(a,b){this.gaps=new Array(a);this.setGaps_(0,this.gaps.length,GapsValue.ZERO,GapsFillMode.SET);this.offset=0;this.debugContext=b}var GapsFillMode={SET:0,ADD:1};var GapsSearchMode={EQUAL:0,GREATER_EQ:1};var GapsValue={ZERO:0,ONE:1};GapsColumn.prototype.markGapsInRect=function(c){if(c.left<-1){window.bridge.e("markGapsInRect : rect.left < -1")}if(c.height>0){var d=Math.floor(c.top);var b=Math.floor(c.bottom);var a=b-d;var e=Math.max(1,a-1);var f=d-this.offset;this.setGaps_(f,e,GapsValue.ONE,GapsFillMode.ADD)}if(this.debugContext){this.debugContext.paintRect(c)}if(system.drawElementRectanglesON){drawOutline(c,"green",1)}};GapsColumn.prototype.setGaps_=function(f,b,c,e){if(f<0){window.bridge.e("setGaps_ invalid start: "+f);f=0}var d=f+b;if(d>this.gaps.length){window.bridge.e("setGaps_ invalid bounds start: "+f+" offset: "+this.offset+" count: "+b+" gaps.length: "+this.gaps.length);d=this.gaps.length}if(e==GapsFillMode.ADD){for(var a=f;a<d;a++){this.gaps[a]+=c}}else{if(e==GapsFillMode.SET){for(var a=f;a<d;a++){this.gaps[a]=c}}else{window.bridge.e("setGaps_ invalid mode: "+e)}}};GapsColumn.prototype.repositionAt=function(b){var d=b-this.offset;if(d==0){return}if(0<d&&d<this.gaps.length){for(var c=d;c<this.gaps.length;c++){this.gaps[c-d]=this.gaps[c];this.gaps[c]=GapsValue.ZERO}var a=this.gaps.length-d;this.setGaps_(a,this.gaps.length-a,GapsValue.ZERO,GapsFillMode.SET)}else{this.setGaps_(0,this.gaps.length,GapsValue.ZERO,GapsFillMode.SET)}this.offset=b};GapsColumn.prototype.searchBackwards=function(c,e,d){var b=c-this.offset;if(b<0||b>=this.gaps.length){window.bridge.e("findFromEnd invalid maxHeight: "+c);return c}else{if(d==GapsSearchMode.GREATER_EQ){for(var a=b;a>=0;a--){if(this.gaps[a]>=e){return(a+this.offset)}}}else{if(d==GapsSearchMode.EQUAL){for(var a=b;a>=0;a--){if(this.gaps[a]==e){return(a+this.offset)}}}else{window.bridge.e("searchBackwards invalid searchMode: "+d)}}}return -1};GapsColumn.prototype.searchForward=function(a,e,d){var c=a-this.offset;if(c<0||c>=this.gaps.length){window.bridge.e("findFromStart invalid startHeight: "+a);return a}else{if(d==GapsSearchMode.GREATER_EQ){for(var b=c;b<this.gaps.length;b++){if(this.gaps[b]>=e){return(b+this.offset)}}}else{if(d==GapsSearchMode.EQUAL){for(var b=c;b<this.gaps.length;b++){if(this.gaps[b]==e){return(b+this.offset)}}}else{window.bridge.e("searchBackwards invalid searchMode: "+d)}}}return -1};