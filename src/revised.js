function Rev(me) {
    var __root = me.body;
    var __user = me.options.user || 'anonymous';
    var __revised = me.options.revised || false;
    var __revisedVisible = me.options.revisedVisible || false;

    var domUtils = UE.dom.domUtils;

    /**
     * 智能机浏览器版本信息:
     */
    var browser = {
        versions: function () {
            var u = navigator.userAgent, app = navigator.appVersion;
            return {//移动终端浏览器版本信息 
                ie: /(msie\s|trident.*rv:)([\w.]+)/.test(u.toLowerCase()),
                trident: u.indexOf('Trident') > -1, //IE内核
                presto: u.indexOf('Presto') > -1, //opera内核
                webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
                iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
                iPad: u.indexOf('iPad') > -1, //是否iPad  
                webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
                weixin: u.indexOf('MicroMessenger') > -1, //是否微信 
                qq: u.match(/\sQQ/i) == " qq" //是否QQ
            };
        }(),
        language: (navigator.browserLanguage || navigator.language).toLowerCase()
    };

    /**
     * 修补手机浏览器里的一些差异
     */
    var mobile = {
        lastKeydownTime: 0,
        lastCursorAt: null,
        // 苹果手机下，长按删除键会触发fast delete，目前没有好的办法拦截它
        // 只好采用这种变通的方式处理
        saveBackspaceHold: function () {
            if (!browser.versions.iPhone) {
                return false;
            }
            var t = new Date().getTime();
            this.lastKeydownTime = t;
            var sel = me.document.getSelection();
            if (sel && sel.focusNode && sel.isCollapsed) {
                this.lastCursorAt = {
                    focusNode: sel.focusNode,
                    focusNodeValue: sel.focusNode && sel.focusNode.nodeType === 3 ? sel.focusNode.nodeValue : false,
                    focusOffset: sel.focusOffset
                };
                console.log('save', sel.anchorOffset, __toString(sel.anchorNode))
                console.log('save', sel.focusOffset, __toString(sel.focusNode))

            } else {
                this.lastCursorAt = undefined;
            }
        },
        fixBackspaceHold: function () {
            if (!browser.versions.iPhone) {
                return false;
            }
            var sel = me.document.getSelection();
            if (!sel || sel.rangeCount === 0) return false;
            var t = new Date().getTime();
            console.log('t', t - this.lastKeydownTime);
            if (t - this.lastKeydownTime < 150 && this.lastCursorAt) {
                try {
                    console.log(sel.rangeCount)
                    var rng = sel.getRangeAt(0);
                    if (this.lastCursorAt.focusNode && this.lastCursorAt.focusNode.nodeType === 3) {
                        this.lastCursorAt.focusNode.nodeValue = this.lastCursorAt.focusNodeValue;
                    }
                    rng.setStart(this.lastCursorAt.focusNode, this.lastCursorAt.focusOffset);
                    rng.collapse(true);
                    this.fixSelectionRange(sel, rng);
                    console.log('restore', sel.anchorOffset, __toString(sel.anchorNode))
                    console.log('restore', sel.focusOffset, __toString(sel.focusNode))
                    return true;
                }
                catch (e) {
                    console.error('eror', e)
                }
            }
            return false;
        },
        // 手机下，只修改range不起作用，必须重新sel.setRange一次
        fixSelectionRange: function (sel, rng) {
            if (browser.versions.mobile) {
                sel.empty();
                sel.addRange(rng);
            }
        },
        // 手机输入法时，不触发compositionstart和compositionend事件的解决办法
        // ascii字符输入时，走的还是char部分
        fixCompositionNotWork: function () {
            if (browser.versions.mobile) {
                __insert();
                return true;
            }
            return false;
        }
    };


    /**
     * 从UE.utils里摘出来的
     */
    var utils = {
        listToMap: function (list) {
            if (!list) return {};
            list = utils.isArray(list) ? list : list.split(',');
            for (var i = 0, ci, obj = {}; ci = list[i++];) {
                obj[ci.toUpperCase()] = obj[ci] = 1;
            }
            return obj;
        },
        isArray: function (obj) {
            return Object.prototype.toString.apply(obj) == '[object Array]';
        }
    };

    // /**
    //  * 从UE.domUtils里摘出来的
    //  */
    // var domUtils = {
    //     // used
    //     findParentByTagName: function (node, tagNames, includeSelf, excludeFn) {
    //         tagNames = utils.listToMap(utils.isArray(tagNames) ? tagNames : [tagNames]);
    //         return domUtils.findParent(node, function (node) {
    //             return tagNames[node.tagName] && !(excludeFn && excludeFn(node));
    //         }, includeSelf);
    //     },
    //     // not used
    //     findParent: function (node, filterFn, includeSelf) {
    //         if (node && !domUtils.isBody(node)) {
    //             node = includeSelf ? node : node.parentNode;
    //             while (node) {
    //                 if (!filterFn || filterFn(node) || domUtils.isBody(node)) {
    //                     return filterFn && !filterFn(node) && domUtils.isBody(node) ? null : node;
    //                 }
    //                 node = node.parentNode;
    //             }
    //         }
    //         return null;
    //     },
    //     // not used
    //     isBody: function (node) {
    //         return node && node.nodeType == 1 && node.tagName.toLowerCase() == 'body';
    //     },
    //     // used
    //     isSameElement: function (nodeA, nodeB) {
    //         if (nodeA.tagName != nodeB.tagName) {
    //             return false;
    //         }
    //         var thisAttrs = nodeA.attributes,
    //             otherAttrs = nodeB.attributes;
    //         if (!browser.ie && thisAttrs.length != otherAttrs.length) {
    //             return false;
    //         }
    //         var attrA, attrB, al = 0, bl = 0;
    //         for (var i = 0; attrA = thisAttrs[i++];) {
    //             if (attrA.nodeName == 'style') {
    //                 if (attrA.specified) {
    //                     al++;
    //                 }
    //                 if (domUtils.isSameStyle(nodeA, nodeB)) {
    //                     continue;
    //                 } else {
    //                     return false;
    //                 }
    //             }
    //             if (browser.ie) {
    //                 if (attrA.specified) {
    //                     al++;
    //                     attrB = otherAttrs.getNamedItem(attrA.nodeName);
    //                 } else {
    //                     continue;
    //                 }
    //             } else {
    //                 attrB = nodeB.attributes[attrA.nodeName];
    //             }
    //             if (!attrB.specified || attrA.nodeValue != attrB.nodeValue) {
    //                 return false;
    //             }
    //         }
    //         // 有可能attrB的属性包含了attrA的属性之外还有自己的属性
    //         if (browser.ie) {
    //             for (i = 0; attrB = otherAttrs[i++];) {
    //                 if (attrB.specified) {
    //                     bl++;
    //                 }
    //             }
    //             if (al != bl) {
    //                 return false;
    //             }
    //         }
    //         return true;
    //     },
    //     isSameStyle: function (nodeA, nodeB) {
    //         var styleA = nodeA.style.cssText.replace(/( ?; ?)/g, ';').replace(/( ?: ?)/g, ':'),
    //             styleB = nodeB.style.cssText.replace(/( ?; ?)/g, ';').replace(/( ?: ?)/g, ':');
    //         if (browser.opera) {
    //             styleA = nodeA.style;
    //             styleB = nodeB.style;
    //             if (styleA.length != styleB.length)
    //                 return false;
    //             for (var p in styleA) {
    //                 if (/^(\d+|csstext)$/i.test(p)) {
    //                     continue;
    //                 }
    //                 if (styleA[p] != styleB[p]) {
    //                     return false;
    //                 }
    //             }
    //             return true;
    //         }
    //         if (!styleA || !styleB) {
    //             return styleA == styleB;
    //         }
    //         styleA = styleA.split(';');
    //         styleB = styleB.split(';');
    //         if (styleA.length != styleB.length) {
    //             return false;
    //         }
    //         for (var i = 0, ci; ci = styleA[i++];) {
    //             if (styleB.indexOf(ci) == -1) {
    //                 return false;
    //             }
    //         }
    //         return true;
    //     },
    // };


    /**
     * 一些工具函数
     */

    var __isDel = function (node) {
        return node && node.nodeType === 1 && node.tagName === 'DEL' && node;
    };
    var __inDel = function (node) {
        return (node = domUtils.findParentByTagName(node, 'DEL', true));
    };
    var __isIns = function (node) {
        return node && node.nodeType === 1 && node.tagName === 'INS' && node;
    };
    var __inIns = function (node) {
        return (node = domUtils.findParentByTagName(node, 'INS', true));
    };
    var __isClose = function (node) {
        return node.nodeType === 1 && { br: 1, img: 1, hr: 1 }[node.tagName.toLowerCase()];
    };
    var __isEmpty = function (node) {
        if (!node) return false;
        else if (node.nodeType === 3) return node.nodeValue.length === 0;
        else if (node.nodeType === 1) return !node.firstChild || !Array.from(node.childNodes).some(e => !__isEmpty(e));
        else if (node.nodeType === 11) return node.firstChild || !Array.from(node.childNodes).some(e => !__isEmpty(e));
        else return false;
    };
    var __mergeSibling = function (node, ignorePre, ignoreNext) {
        function merge(rtl, start, node) {
            var next, child = node[start];
            if ((next = node[rtl]) && node.nodeType === 3 && next.nodeType === 3) {
                __mergeTextSibling(rtl === 'nextSibling' ? node : next);
                return;
            }
            if ((next = node[rtl]) && next.nodeType == 1 && domUtils.isSameElement(node, next)) {
                while (next.firstChild) {
                    if (start == 'firstChild') {
                        node.insertBefore(next.lastChild, node.firstChild);
                    } else {
                        node.appendChild(next.firstChild);
                    }
                }
                next.parentNode.removeChild(next);
                // merge child
                if (child) merge(rtl, start, child);
            }
        }
        !ignorePre && merge('previousSibling', 'firstChild', node);
        !ignoreNext && merge('nextSibling', 'lastChild', node);
    };
    var __mergeTextSibling = function (node) {
        var next;
        if (node && node.nodeType === 3 && (next = node.nextSibling) && next.nodeType === 3) {
            node.nodeValue += next.nodeValue;
            next.parentNode.removeChild(next);
        }
    };
    var __mergeDelChilds = function (node) {
        var prev = node.firstChild, next;
        while (prev && (next = prev.nextSibling)) {
            if (__isDel(prev) && __isDel(next)
                && prev.getAttribute('cite') === next.getAttribute('cite')
                && prev.getAttribute('datetime') === next.getAttribute('datetime')) {
                while (next.firstChild) {
                    prev.appendChild(next.firstChild);
                }
                next.parentNode.removeChild(next);
            }
            else {
                prev = next;
            }
        }
    };
    var __toString = function (e) {
        if (typeof e === 'object' && e instanceof Array) {
            return `[${e.map(__toString).join(',')}]`;
        }
        return e.nodeType === 3 ? `"${e.nodeValue}"` : e.nodeType === 11 ? Array.from(e.childNodes).reduce((a, e) => {
            return a + __toString(e);
        }, "") : e.outerHTML;
    };
    var __date = function () {
        return new Date().toISOString().substring(0, 16).replace('T', ' ');
    };


    // TODO 修改的通用一点
    var __isPStart = function (node, offset) {
        if (!node) return false;
        if (node.nodeType === 3 && offset > 0) return false;
        if (node === __root) return node.childNodes[offset];
        var p = domUtils.findParentByTagName(node, 'P', true);
        if (node.nodeType === 3) {
            offset = Array.from(node.parentNode.childNodes).indexOf(node);
            node = node.parentNode;
        }
        while (offset === 0 && node !== p) {
            offset = Array.from(node.parentNode.childNodes).indexOf(node);
            node = node.parentNode;
        }
        return node === p && offset === 0 && p;
    };

    var __isPEnd = function (node, offset) {
        if (!node) return false;
        if (node.nodeType === 3 && offset < node.nodeValue.length) return false;
        if (node === __root) return node.childNodes[offset - 1];
        var p = domUtils.findParentByTagName(node, 'P', true);
        if (node.nodeType === 3) {
            offset = Array.from(node.parentNode.childNodes).indexOf(node) + 1;
            node = node.parentNode;
        }
        while (!node.childNodes[offset] && node !== p) {
            offset = Array.from(node.parentNode.childNodes).indexOf(node) + 1;
            node = node.parentNode;
        }
        return node === p && offset === node.childNodes.length && p;
    };

    /**
     * @param
     * 从当前位置拆分两个兄弟节点，一直拆分到tagName指定的父标签（ignoreTagName=true不拆此标签）
     * 返回拆分的后面标签
     */
    var __splitToTag = function (node, offset, tagName, ignoreTagName) {
        if (!node || !tagName) return;
        var tag = domUtils.findParentByTagName(node, tagName, true);
        if (!tag) return;
        var next, child;
        while (node !== (ignoreTagName ? tag : tag.parentNode)) {
            // 在当前节点之前拆
            if (offset === 0) {
                offset = Array.from(node.parentNode.childNodes).indexOf(node);
                node = node.parentNode;
            }
            else {
                // 拆文本节点
                if (node.nodeType === 3) {
                    next = node.splitText(offset);
                    if (next.nodeValue.length <= 0) node.parentNode.removeChild(next);
                } else if (child = node.childNodes[offset]) {
                    next = node.cloneNode(false);
                    node.parentNode.insertBefore(next, node.nextSibling);
                    while (child = node.childNodes[offset]) { next.appendChild(child); }
                }
                offset = Array.from(node.parentNode.childNodes).indexOf(node) + 1;
                node = node.parentNode;
            }
        }
        return node.childNodes[offset];
    };

    /**
     * 有关选区的处理函数
     */
    // TODO 重新整理这个函数，尤其是合并
    var __visitMultiLineFrag = function (frag) {
        return Array.from(frag.childNodes).map(p => {
            // 处理本次被删除的段落里的内容
            Array.from(p.childNodes).forEach(e => {
                // 早前已经删除的内容不用管，不管谁删的
                if (__isDel(e)) {
                    // NOP
                }
                // 如果是自己插入的内容，则直接删除
                else if ((tmp = __isIns(e)) && __user === tmp.getAttribute('cite')) {
                    tmp.parentNode.removeChild(tmp);
                }
                else if (e.nodeType === 1 && e.tagName === 'IMG') {
                    var info = me.document.createElement('ABBR');
                    info.innerText = '[图片已删除]';
                    info.title = '已删除的图片：' + e.src;
                    var del = __createDel();
                    del.appendChild(info);
                    p.insertBefore(del, e);
                    p.removeChild(e);
                }
                // 其他节点全用删除线包括
                else {
                    var del = __createDel();
                    p.insertBefore(del, e);
                    del.appendChild(e);
                }
            });
            // 合并相同人和时间的删除标记
            __mergeDelChilds(p);
            return p;
        });
    };

    var __visitMultiBlockFrag = function (frag) {
        Array.from(frag.childNodes).forEach(e => {
            if (__isDel(e)) {
                __mergeSibling(e, false, true);
            }
            else if ((tmp = __isIns(e)) && __user === tmp.getAttribute('cite')) {
                frag.removeChild(tmp);
            }
            else {
                var del = __createDel();
                frag.insertBefore(del, e);
                del.appendChild(e);
                __mergeSibling(del, false, true);
            }
        });
        return Array.from(frag.childNodes);
    };


    // 当前选区是否跨了多行（或多个 <P>）
    var __isMultiLineSelection = function () {
        var sel = me.document.getSelection();
        if (!sel || sel.rangeCount === 0) return false;
        var rng = sel.getRangeAt(0);
        var frag = rng.cloneContents();

        var bml; // bool multi line
        // 跨行删除，frag里必然都是P， 这是一种判断方式
        bml = Array.from(frag.childNodes).reduce((a, c) => a && c.nodeType === 1 && c.tagName === 'P', true);
        if (!bml) return false;
        // 还可以根据range的端点来判断
        // console.log(rng.startContainer, rng.startOffset, rng.endContainer, rng.endOffset);
        bml = (rng.startContainer === __root && rng.startOffset !== rng.endOffset)
            || ((tmp = domUtils.findParentByTagName(rng.startContainer, 'P')) && tmp !== domUtils.findParentByTagName(rng.endContainer, 'P'));
        return bml;
    };

    // 收缩焦点到最小位置，比如TextNode，BR等
    // 尚未处理非collapsed选区
    var __shrink = function () {
        var sel = me.document.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        var rng = sel.getRangeAt(0);
        if (!rng.collapsed) {
            console.error('非collapsed选区尚不支持收缩');
            return;
        }

        var start = rng.startContainer, offset = rng.startOffset;
        if (start.nodeType === 3 || __isClose(start)) return;

        while (start.nodeType === 1 && start.firstChild) {
            if (offset <= 0) {
                start = start.firstChild;
                offset = 0;
            } else if (offset >= start.childNodes.length) {
                start = start.lastChild;
                offset = start.nodeType === 3 ? start.nodeValue.length : start.childNodes.length;
            } else {
                start = start.childNodes[offset];
                start = 0;
            }
        }
        if (start !== rng.startContainer) {
            rng.setStart(start, offset);
            rng.collapse(true);
            mobile.fixSelectionRange(sel, rng);
        }
    };
    var __shrink = function () {
        var sel = me.document.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        var rng = sel.getRangeAt(0);
        var start = rng.startContainer, startOffset = rng.startOffset;
        while (start.nodeType === 1 && start.firstChild) {
            if (startOffset >= start.childNodes.length) {
                start = start.lastChild;
                startOffset = start.nodeType === 3 ? start.nodeValue.length : start.childNodes.length;
            } else {
                start = start.childNodes[startOffset];
                startOffset = 0;
            }
        }
        if (rng.collapsed) {
            if (start !== rng.startContainer) {
                rng.setStart(start, startOffset);
                rng.collapse(true);
                mobile.fixSelectionRange(sel, rng);
            }
            return;
        }
        var end = rng.endContainer, endOffset = rng.endOffset;
        while (end.nodeType === 1 && end.firstChild) {
            if (endOffset >= end.childNodes.length) {
                end = end.lastChild;
                endOffset = end.nodeType === 3 ? end.nodeValue.length : end.childNodes.length;
            } else if (endOffset === 0 && end.previousSibling) { // TODO
                end = end.previousSibling;
                endOffset = end.nodeType === 3 ? end.nodeValue.length : end.childNodes.length;
            } else if (end.childNodes[endOffset - 1]) {
                end = end.childNodes[endOffset - 1];
                endOffset = end.nodeType === 3 ? end.nodeValue.length : end.childNodes.length;
            } else { // TODO
                end = end.childNodes[endOffset];
                endOffset = 0;
            }
        }
        if (start !== rng.startContainer || end !== rng.endContainer) {
            if (start !== rng.startContainer) rng.setStart(start, startOffset);
            if (end !== rng.endContainer) rng.setEnd(end, endOffset);
            // rng.collapse(true);
            mobile.fixSelectionRange(sel, rng);
        }
    };

    /**
     * 主要实现部分
     */
    // 按键是否形成输入（包含回车和空格）
    var __isCharKeyDown = function (evt) {
        var keyCode = evt.keyCode || evt.which;

        var isChar =
            (keyCode > 47 && keyCode < 58) || // number keys
            keyCode === 32 || keyCode === 13 || // spacebar & return key(s) (if you want to allow carriage returns)
            (keyCode > 64 && keyCode < 91) || // letter keys
            (keyCode > 95 && keyCode < 112) || // numpad keys
            (keyCode > 185 && keyCode < 193) || // ;=,-./` (in order)
            (keyCode > 218 && keyCode < 223);   // [\]' (in order)

        if (isChar) {
            //// character key
            // will delete all selected
            // console.log('character')
        } else {
            //// control key
            // only delete and backspace will delete all selected
            // console.log('control', evt)
        }
        return isChar;
    };

    var __createDel = function () {
        var del = me.document.createElement('DEL');
        del.setAttribute('cite', __user);
        del.setAttribute('datetime', __date());
        return del;
    };

    var __createIns = function (user, datetime) {
        var ins = me.document.createElement('INS');
        ins.setAttribute('cite', user || __user);
        ins.setAttribute('datetime', datetime || __date());
        return ins;
    };

    var __prevent = function (evt) {
        typeof evt.returnValue !== 'cancelBubble' && (evt.cancelBubble = true);
        typeof evt.returnValue !== 'undefined' && (evt.returnValue = false);
        evt.preventDefault && evt.preventDefault();
        evt.stopPropagation && evt.stopPropagation();
    };

    // var __getAncestors = function (node, includeSelf) {
    //     if (!node) return [];
    //     var arr = [], par; while (par = node.parentNode) arr.unshift(par);
    //     if (includeSelf) arr.push(node);
    //     return arr;
    // };

    // var __isBoundaryNode = function (node, dir, boundaryNode) {
    //     var tmp;
    //     while (node !== boundaryNode) {
    //         tmp = node;
    //         node = node.parentNode;
    //         if (tmp !== node[dir]) {
    //             return false;
    //         }
    //     }
    //     return true;
    // };

    var __includeInvisibles = function (sel, rng) {
        // if (document.revisedVisible) return;
        if (__revisedVisible) return;

        var start = rng.startContainer, end = rng.endContainer;
        if (!(start.compareDocumentPosition(__root) & Node.DOCUMENT_POSITION_CONTAINS)) {
            console.warn('selection start is out of editor');
            return;
        }
        if (!(end.compareDocumentPosition(__root) & Node.DOCUMENT_POSITION_CONTAINS)) {
            console.warn('selection end is out of editor');
            return;
        }
        var startOffset = rng.startOffset, startMoved;
        while (startOffset === 0) {
            startOffset = Array.from(start.parentNode.childNodes).indexOf(start);
            start = start.parentNode;
            if (start.nodeType === 1 && start.tagName === 'P') break;
            if (start.nodeType === 1 && start === __root) return;
        }
        if (start.nodeType === 1 && start.tagName === 'P') {
            var prev;
            while ((prev = start.childNodes[startOffset - 1]) && __isDel(prev)) {// && prev !== prev.parentNode.lastChild) {
                startOffset--;
                startMoved = true;
            }
        }
        var endOffset = rng.endOffset, endMoved;
        while (endOffset === (end.nodeType === 3 ? end.nodeValue.length : end.childNodes.length)) {
            endOffset = Array.from(end.parentNode.childNodes).indexOf(end) + 1;
            end = end.parentNode;
            if (end.nodeType === 1 && end.tagName === 'P') break;
            if (end.nodeType === 1 && end === __root) return;
        }
        if (end.nodeType === 1 && end.tagName === 'P') {
            var next, isntDel = false;
            // 当一段里选区后面全部都是del时，浏览器默认不删除他们，至少chrome是这样
            next = end.childNodes[endOffset];
            while (next) {
                if (!__isDel(next)) isntDel = true;
                next = next.nextSibling;
            }
            if (isntDel) {
                while ((next = end.childNodes[endOffset]) && __isDel(next)) {// && next !== next.parentNode.firstChild) {
                    endOffset++;
                    endMoved = true;
                }
            }
        }
        if (startMoved || endMoved) {
            if (startMoved) rng.setStart(start, startOffset);
            if (endMoved) rng.setEnd(end, endOffset);
            __shrink();
            // mobile.fixSelectionRange();
        }
    };

    // TODO 这将是一个不包含undo/redo的实现
    var __delete = function (cursorToStart) {
        var sel = me.document.getSelection();
        if (!sel) {
            console.warn('selection is null');
            return;
        }
        // console.log('anchor', sel.anchorOffset, sel.anchorNode, __toString(sel.anchorNode));
        // console.log('focus', sel.focusOffset, sel.focusNode, __toString(sel.focusNode));
        if (sel.rangeCount === 0) {
            console.warn('selection\'s rangeCount is 0');
            return;
        }
        var rng = sel.getRangeAt(0);
        if (rng.collapsed) return;

        var start = rng.startContainer, end = rng.endContainer, tmp;
        // console.log('before delete\n', rng.startOffset, __toString(start), '\n', rng.endOffset, __toString(end));
        if (typeof cursorToStart === 'undefined') {
            cursorToStart = sel.focusNode === start && sel.focusOffset === rng.startOffset;
        }

        __includeInvisibles(sel, rng);
        rng = sel.getRangeAt(0);
        start = rng.startContainer;
        end = rng.endContainer;
        // console.log('before delete ... include invisible\n', rng.startOffset, __toString(start), '\n', rng.endOffset, __toString(end));
        var frag = rng.cloneContents();
        Array.from(frag.childNodes).forEach((e, i) => {
            // console.log(`frag[${i}]`, __toString(e));
        });

        var mline = __isMultiLineSelection(), mblock = (start !== end);
        // 跨行删除
        if (mline) {
            // TODO 如果删除的是跨行符，需要考虑
            // 1. backward时，如果这一行的开头是新插入的文字，则合并这行到上一行
            // 2. forward时，如果下一行的开头是新插入的文字，则将下一行合并到这一行尾
            if (__isEmpty(frag.firstChild) && __isEmpty(frag.lastChild)) {
                frag.removeChild(frag.lastChild);
                frag.removeChild(frag.firstChild);
            }
            if (frag.childNodes.length === 0) {
                // if (frag.childNodes.length === 2 && __isEmpty(frag.firstChild) && __isEmpty(frag.lastChild)) {
                // 删除空行
                console.info('delete a line seperator');
                rng.collapse(cursorToStart);
                mobile.fixSelectionRange(sel, rng);
                return;
            }

            // 保存删除前的状态
            var delFromPHead = __isPStart(start, rng.startOffset), delToPTail = __isPEnd(end, rng.endOffset);
            var delFromPTail = __isPEnd(start, rng.startOffset), delToPHead = __isPStart(end, rng.endOffset);

            // console.log('delFromPHead', delFromPHead, 'delFromPTail', delFromPTail, 'delToPHead', delToPHead, 'delToPTail', delToPTail);

            // 删除
            me.document.execCommand('delete', false, null);
            rng = sel.getRangeAt(0);
            start = rng.startContainer;
            end = rng.endContainer;
            // console.log('after delete\n', rng.startOffset, __toString(start), '\n', rng.endOffset, __toString(end));

            // 插入<p><del></p>
            // 1. 从某行首开始删的，插入在此行之前
            // 2. 从某行中开始删的，先拆此行，然后插入在后行之前
            var dps = __visitMultiLineFrag(frag); // deleted p lines
            var pnext = delFromPHead || __splitToTag(start, rng.startOffset, 'P');
            Array.from(dps).reverse().forEach(p => pnext = __root.insertBefore(p, pnext));

            // 整理焦点
            if (cursorToStart) {
                // 从行首开始删的，焦点落在第一个<p><del></p>行首，否则落在所有<p><del></p>的前一行尾
                delFromPHead ? rng.setStart(start = dps[0], 0) : rng.setStart(start = dps[0].previousSibling, start.childNodes.length)
            } else {
                // 焦点落在最后一个<p><del></p>的行尾即可
                rng.setStart(start = dps[dps.length - 1], start.childNodes.length)
            }
            rng.collapse(true);
            mobile.fixSelectionRange(sel, rng);
            __shrink();
            rng = sel.getRangeAt(0);
            start = rng.startContainer;
            end = rng.endContainer;
            // console.log('after shrink\n', rng.startOffset, __toString(start), '\n', rng.endOffset, __toString(end));

            // 合并第一<p><del></p>行，往前
            if (!delFromPHead && !delFromPTail) {
                __mergeSibling(dps[0].previousSibling, true, false);
            }
            // 合并最后<p><del></p>行，往后
            if (!delToPTail && !delToPHead) {
                __mergeSibling(dps[dps.length - 1], true, false);
            }
            // 删除最后一个空行<p><br></p>
            if (delFromPHead && delToPTail) {
                delFromPHead.parentNode.removeChild(delFromPHead);
            }

        }
        // 行内多节点删除
        else if (mblock) {
            // 删除
            me.document.execCommand('delete', false, null);
            rng = sel.getRangeAt(0);
            start = rng.startContainer;
            end = rng.endContainer;
            // console.log('after delete\n', rng.startOffset, __toString(start), '\n', rng.endOffset, __toString(end));

            // 插入<del>
            var dbs = __visitMultiBlockFrag(frag); // deleted blocks
            var p = domUtils.findParentByTagName(start, 'P', true);
            if (!p) {
                console.error('some thing wrong!');
                return;
            }
            var bnext;
            if (tmp = __inDel(start)) bnext = __splitToTag(start, rng.startOffset, 'DEL') || tmp.nextSibling;
            else if (tmp = __inIns(start)) bnext = __splitToTag(start, rng.startOffset, 'INS') || tmp.nextSibling;
            // TODO still a text in span in p ??
            else if (start.nodeType === 3) bnext = start.splitText(rng.startOffset);

            else if (start.nodeType === 1 && start.tagName === 'P') {
                bnext = start.childNodes[rng.startOffset], tmp = bnext;
                // TODO remove br
            }
            else {
                console.error('not supported yet!');
                return;
            }
            Array.from(dbs).reverse().forEach(b => bnext = p.insertBefore(b, bnext));

            // 整理焦点
            if (cursorToStart) {
                // 从行首开始删的，焦点落在第一个<p><del></p>行首，否则落在所有<p><del></p>的前一行尾
                // rng.setStart(start = dbs[0], 0);
                if (tmp = dbs[0].previousSibling) rng.setStart(start = tmp, start.nodeType === 3 ? start.nodeValue.length : start.childNodes.length);
                else rng.setStart(dbs[0], 0);
            } else {
                // 焦点落在最后一个<p><del></p>的行尾即可
                rng.setStart(start = dbs[dbs.length - 1], start.nodeType === 3 ? start.nodeValue.length : start.childNodes.length)
            }
            rng.collapse(true);
            mobile.fixSelectionRange(sel, rng);
            __shrink();
            rng = sel.getRangeAt(0);
            start = rng.startContainer;
            end = rng.endContainer;
            // console.log('after shrink\n', rng.startOffset, __toString(start), '\n', rng.endOffset, __toString(end));

            // TODO 合并前后的删除节点
            __mergeSibling(dbs[0], false, true);
            __mergeSibling(dbs[dbs.length - 1], true, false);
        }
        // 行内单节点内的删除
        else {
            if (__inDel(start)) {
                // 仅移动光标，选区闭合
                rng.collapse(cursorToStart);
                mobile.fixSelectionRange(sel, rng);
            }
            else if ((tmp = __inIns(start)) && __user === tmp.getAttribute('cite')) {
                // 仅删除，选区闭合
                me.document.execCommand('delete', false, null);
            }
            else if (tmp = domUtils.findParentByTagName(start, 'P', true)) {
                // 保存信息，删除的是别人的插入
                var ins = __inIns(start), p = tmp;
                // 删除
                me.document.execCommand('delete', false, null);
                rng = sel.getRangeAt(0);
                start = rng.startContainer;
                end = rng.endContainer;
                // 隐藏删除标记时，删除到第一个字的时候会插入一个br，需要清理一下
                // 删成空行的时候也会插入一个br
                if ((tmp = p.firstChild) && tmp.nodeType === 1 && tmp.tagName === 'BR') p.removeChild(p.firstChild);
                // console.log('after delete\n', rng.startOffset, __toString(start), '\n', rng.endOffset, __toString(end));

                var next = __splitToTag(start, rng.startOffset, 'P', true);
                var parent = next ? next.parentNode : p;
                // 插入<del>
                var dbs = __visitMultiBlockFrag(frag); // deleted blocks
                // console.log(__toString(dbs))
                if (ins = ins && ins.cloneNode(false)) {
                    // TODO 这里默认只有一个片段了哦
                    var del = __createDel();
                    ins.appendChild(document.createTextNode(frag.textContent));
                    del.appendChild(ins);
                    dbs = [del];
                }
                Array.from(dbs).reverse().forEach(b => next = parent.insertBefore(b, next));

                // 整理焦点
                if (cursorToStart) {
                    if (tmp = dbs[0].previousSibling) rng.setStart(start = tmp, start.nodeType === 3 ? start.nodeValue.length : start.childNodes.length);
                    else rng.setStart(dbs[0], 0);
                } else {
                    rng.setStart(start = dbs[dbs.length - 1], start.nodeType === 3 ? start.nodeValue.left : start.childNodes.length);
                }
                rng.collapse(true);
                mobile.fixSelectionRange(sel, rng);
                __shrink();

                rng = sel.getRangeAt(0);
                start = rng.startContainer;
                end = rng.endContainer;
                // console.log('after shrink\n', rng.startOffset, __toString(start), '\n', rng.endOffset, __toString(end));

                // 合并前后节点
                // 不出意外的话，片段应该只有一个
                __mergeSibling(dbs[0], false, true);
                __mergeSibling(dbs[dbs.length - 1], true, false);
            } else {
                console.error('element that are not p\'s child, not supported yet!');
            }
        }
    };


    var __deleteBackward = function () {
        var sel = me.document.getSelection(), tmp;
        if (!sel) return;
        if (sel.isCollapsed) {
            sel.modify('extend', 'backward', 'character');
        }
        __delete(true);
    };

    var __deleteForward = function () {
        var sel = me.document.getSelection(), tmp;
        if (!sel) return;
        if (sel.isCollapsed) {
            sel.modify('extend', 'forward', 'character');
        }
        __delete(false);
    };

    var __insert = function () {
        var sel = me.document.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        if (!sel.isCollapsed) __delete();
        var rng = sel.getRangeAt(0), tmp, start = rng.startContainer, end = rng.endContainer;
        // console.log('before insert\n', rng.startOffset, __toString(start), '\n', rng.endOffset, __toString(end));

        // 清理占位符，我们不需要它
        if (domUtils.isFillChar(start)) {
            rng.setStartBefore(start);
            rng.collapse(true);
            domUtils.remove(start);
            mobile.fixSelectionRange(sel, rng);
            rng = sel.getRangeAt(0);
            start = rng.startContainer;
            end = rng.endContainer;
        }

        var now = __date();
        if ((tmp = __inIns(start)) && __user === tmp.getAttribute('cite') && now === tmp.getAttribute('datetime')) {
            // NOP
        }
        else {
            var p = domUtils.findParentByTagName(start, 'P', true);
            var next = start !== p ? __splitToTag(start, rng.startOffset, 'P', true) : start.childNodes[rng.startOffset];
            if (p === start && (tmp = p.childNodes[rng.startOffset]) && tmp.nodeType === 1 && tmp.tagName === 'BR') p.removeChild(tmp);
            var ins = __createIns();
            ins.innerHTML = '\u200B';
            p.insertBefore(ins, next);
            rng.setStart(ins.firstChild, 0);
            rng.setEnd(ins.firstChild, 1);
            // rng.collapse(true);
            mobile.fixSelectionRange(sel, rng);

            rng = sel.getRangeAt(0);
            start = rng.startContainer;
            end = rng.endContainer;
            // console.log('after prepare insert\n', rng.startOffset, __toString(start), '\n', rng.endOffset, __toString(end));
            // TODO 合并前后节点
        }
    };

    var __cancelInsert = function () {
        var sel = me.document.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        var rng = sel.getRangeAt(0), tmp, next;
        var start = rng.startContainer;
        var end = rng.endContainer;

        if ((tmp = __inIns(start)) && __user === tmp.getAttribute('cite') && tmp.textContent === '\u200B') {
            if (next = tmp.previousSibling) rng.setStart(next, next.nodeType === 3 ? next.nodeValue.length : next.childNodes.length);
            else if (next = tmp.nextSibling) rng.setStart(next, 0);
            rng.collapse(true);
            mobile.fixSelectionRange(sel, rng);
            __shrink();
            tmp.parentNode.removeChild(tmp);
        }
    };

    // 拖拽
    var __drag = function (evt) {
        var sel = me.document.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        var rng = sel.getRangeAt(0), start = rng.startContainer, end = rng.endContainer;
        if (evt.type === 'dragstart') {
            var data = evt.dataTransfer;
            data.clearData();
            data.effectAllowed = evt.ctrlKey ? 'copy' : 'move';
            // TODO filter frag or selection
            // TODO 暂只支持纯文本
            var frag = rng.cloneContents();
            data.setData('text/plain', frag.textContent);
        }
        if (evt.type === 'dragend') {
            // console.log('dragend');
            // FIXME 妈蛋，有时候并不会触发dragend
            var frag = rng.cloneContents();
            me.document.execCommand('delete', false, null);
            __insert();
            // TODO 暂只支持纯文本
            me.document.execCommand('insertHtml', false, frag.textContent);
            __prevent(evt);
        }
    };
    var __drop = function (evt) {
        console.log('drop');
        __delete();
    };

    // 剪切和粘贴
    var __cut = function (evt) {
        __delete();
        me.fireEvent('saveScene');
        me.fireEvent('selectionChange');
    };

    // 此方法无效，粘贴已经被UEditor处理了
    // 所以要监听UEditor的结果再处理，往下看
    var __paste = function (evt) {
        __delete();
        __insert();
        __prevent(evt);
        var data = evt.clipboardData;
        var text = data.getData('text/plain');
        var tmp = me.document.createElement('textarea');
        tmp.innerText = text;
        // TODO 暂时先不允许插入多行文本
        // text = tmp.innerHTML.split('<br>').map(s => {
        // 	var ins = __createIns();
        // 	ins.innerText = s;
        // 	s = ins.outerHTML;
        // 	return `<p>${s}</p>`;
        // }).join('');
        // FIXME 妈蛋，insertHTML插入<del><ins>以后容易变成span
        // 改成自己插入节点？？？
        me.document.execCommand('insertHtml', false, text);
        // TODO 只粘贴纯文本，避免XSS攻击
        // console.log(data.getData('text/html'));
    };
    // 用一个空函数覆盖上面的函数，让它不起作用
    var __paste = function (evt) {
        // NOOP
    };
    // 这里才是真正的粘贴处理
    // TODO 多行文本需要处理一下
    var __pastebin = document.createElement('DIV');
    me.addListener('beforepaste', function (cmd, html, root) {
        if (!html || !html.html) return;
        var mline = html.html.startsWith('<p ') || html.html.startsWith('<p>');
        __pastebin.innerHTML = html.html;
        // console.log(html.html);
        html.html = '';

        function toInsert(e) {
            if (__isIns(e)) {
                var ins = __createIns();
                while (e.firstChild) {
                    ins.appendChild(e.firstChild);
                }
                e.replaceWith(ins);
            }
            else if (__isDel(e)) {
                e.parentNode.removeChild(e);
            }
            else {
                var ins = __createIns();
                e.parentNode.insertBefore(ins, e);
                ins.appendChild(e);
            }
        }
        function toPlain(e) {
            if (__isIns(e)) {
                while (e.firstChild) {
                    e.parentNode.insertBefore(e.firstChild, e);
                }
                e.parentNode.removeChild(e);
            }
            else if (__isDel(e)) {
                e.parentNode.removeChild(e);
            }
            else {
                // NOOP
            }
        }

        Array.from(__pastebin.childNodes).forEach(p => {
            if (p.nodeType === 1 && p.tagName === 'P') {
                // TODO reset style
                var tmp = document.createElement('P');
                p.parentNode.insertBefore(tmp, p);
                while (p.firstChild) {
                    tmp.appendChild(p.firstChild);
                }
                p.parentNode.removeChild(p);
                p = tmp;

                Array.from(p.childNodes).forEach(toInsert);
            }
            else {
                toPlain(p);
            }
        });
        __delete();

        if (mline) {
            // TODO split p
            var sel = me.document.getSelection();
            var rng = sel.getRangeAt(0);
            var start = rng.startContainer;
            var p = domUtils.findParentByTagName(start, 'P', true);
            var pnext = __splitToTag(start, rng.startOffset, 'P', false) || p.nextSibling;
            var np = document.createElement('P');
            np.appendChild(document.createElement('BR'));
            __root.insertBefore(np, pnext);
            rng.setStart(np, 0);
            rng.collapse(true);
            // console.log(__pastebin.innerHTML);
            me.document.execCommand('insertHtml', false, __pastebin.innerHTML);
        } else {
            __insert();
            // console.log(__pastebin.innerHTML);
            me.document.execCommand('insertHtml', false, __pastebin.innerHTML);
        }
        __pastebin.innerHTML = '';
    });

    // 输入法
    var __compStart = function (evt) {
        console.log('composition start')
        __delete();
        // 好像没效果？
        // me.fireEvent('saveScene');
        // me.fireEvent('selectionChange');
        // me.fireEvent('contentChange');
        __insert();
    };
    var __compUpdate = function (evt) {
        // NOP
    };
    var __compEnd = function (evt) {
        // 好像浏览器自己会做
        // if (evt.data.length === 0) __cancelInsert();
        console.log('composition end')
        // 这个也没效果
        // if (evt.data.length !== 0) {
        //     me.fireEvent('saveScene');
        //     me.fireEvent('selectionChange');
        //     me.fireEvent('contentChange');
        // }
    };

    // 键盘
    var __keydown = function (evt) {
        var keyCode = evt.keyCode || evt.which;
        console.log(keyCode, __isCharKeyDown(evt), evt)
        // 形成输入
        if (__isCharKeyDown(evt) && !evt.ctrlKey && !evt.altKey) {

            // space
            if (keyCode === 32) {
                // __insert();
                var sel = me.document.getSelection();
                if (!sel || sel.rangeCount === 0) return;
                var rng = sel.getRangeAt(0), start = rng.startContainer, tmp;
                var now = __date();
                if ((tmp = __inIns(start)) && __user === tmp.getAttribute('cite') && now === tmp.getAttribute('datetime')) {
                    // NOP
                    // __prevent(evt);
                    // me.document.execCommand('insertHtml', false, '&#12288;');//'&nbsp;');
                } else {
                    __delete();
                    __insert();
                    // __prevent(evt);
                    // me.document.execCommand('insertHtml', false, '&nbsp;');
                    // TODO 考虑中文占位符，或用来首行缩进
                    // me.document.execCommand('insertHtml', false, '&#12288;');
                }
            }
            // enter
            else if (keyCode === 13) {
                __insert();
            }
            // char
            else {
                me.fireEvent('saveScene');
                __insert();
                __prevent(evt);
                me.document.execCommand('insertHtml', false, evt.key);
                me.fireEvent('selectionChange');
                me.fireEvent('contentChange');
                me.fireEvent('saveScene');
                // __prevent(evt);
                // me.execCommand('insert');
            }
        }
        // backspace
        else if (keyCode === 8) {
            __prevent(evt);
            me.fireEvent('saveScene');
            __deleteBackward();
            me.fireEvent('selectionChange');
            me.fireEvent('contentChange');
            me.fireEvent('saveScene');

            // FIXME 苹果手机加速删除问题，尚未解决，以下方式不可行
            // 会造成文本闪动，而且还是少了一个字
            // mobile.fixBackspaceHold();
            // __deleteBackward();
            // mobile.saveBackspaceHold();
        }
        // delete
        else if (keyCode === 46) {
            __prevent(evt);
            me.fireEvent('saveScene');
            __deleteForward();
            me.fireEvent('selectionChange');
            me.fireEvent('contentChange');
            me.fireEvent('saveScene');
        }
        else {
            if (mobile.fixCompositionNotWork()) {
                // NOOP
            }
            else if (evt.key === 'Process') {
                // maybe 输入法，处理一下特殊符号
                if (['Backslash', 'BracketRight', 'BracketLeft', 'Quote', 'Semicolon', 'Slash', 'Period', 'Comma', 'Equal', 'Minus',
                    'Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Backquote',
                    'Numpad0', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Numpad5', 'Numpad6', 'Numpad7', 'Numpad8', 'Numpad9', 'NumpadDecimal',
                    'NumpadDivide', 'NumpadMultiply', 'NumpadSubtract', 'NumpadAdd'].indexOf(evt.code) >= 0) {
                    me.fireEvent('saveScene');
                    __insert();
                    // me.fireEvent('saveScene');
                } else {
                    console.log(evt.code)
                }
            } else {
                // console.warn('something wrong ??');
            }
        }
    };

    var __setRevised = function (revised) {
        if (me.options.revised) {
            me.body.addEventListener('keydown', __keydown, false);
            me.body.addEventListener('compositionstart', __compStart, false);
            me.body.addEventListener('compositionupdate', __compUpdate, false);
            me.body.addEventListener('compositionend', __compEnd, false);
            me.body.addEventListener('cut', __cut, false);
            me.body.addEventListener('paste', __paste, false);
            me.body.addEventListener('drag', __drag, false);
            me.body.addEventListener('dragstart', __drag, false);
            me.body.addEventListener('dragend', __drag, false);
            me.body.addEventListener('dragover', __drag, false);
            me.body.addEventListener('dragenter', __drag, false);
            me.body.addEventListener('dragleave', __drag, false);
            me.body.addEventListener('drop', __drop, false);
        }
        me.options.revised = revised;
        if (me.options.revised) {
            me.body.addEventListener('keydown', __keydown, false);
            me.body.addEventListener('compositionstart', __compStart, false);
            me.body.addEventListener('compositionupdate', __compUpdate, false);
            me.body.addEventListener('compositionend', __compEnd, false);
            me.body.addEventListener('cut', __cut, false);
            me.body.addEventListener('paste', __paste, false);
            me.body.addEventListener('drag', __drag, false);
            me.body.addEventListener('dragstart', __drag, false);
            me.body.addEventListener('dragend', __drag, false);
            me.body.addEventListener('dragover', __drag, false);
            me.body.addEventListener('dragenter', __drag, false);
            me.body.addEventListener('dragleave', __drag, false);
            me.body.addEventListener('drop', __drop, false);
        }
    };

    var __setUserColors = function (colors) {
        if (!colors || typeof colors !== 'object') return;

        var str = Object.keys(colors).map(user => `
*[cite="${user}"],
*[cite="${user}"] {
    color: ${colors[user]};
}`).join('\n');
        UE.utils.cssRule('revised', str, me.document);
    }

    __setRevised(me.options.revised);
    __setUserColors(me.options.colors);

    // this.keydown = __keydown;
    // // this.insert = __insert;
    // this.compStart = __compStart;
    // this.compEnd = __compEnd;
    this.setRevised = __setRevised;
};

if (typeof module !== 'undefined') {
    module.exports = {
        getInstance: function (me) {
            return new Rev(me);
        }
    };
}