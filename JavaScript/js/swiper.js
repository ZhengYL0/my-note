/**
 * 轮播组件
 * @param {object} params 配置传参
 * @param {string} params.el 组件节点 class|id|<label>
 * @param {number} params.moveTime 过渡时间（毫秒）默认 300
 * @param {number} params.interval 自动播放间隔（毫秒）默认 3000
 * @param {boolean} params.loop 是否需要回路
 * @param {boolean} params.vertical 是否垂直滚动
 * @param {boolean} params.autoPaly 是否需要自动播放
 * @param {boolean} params.pagination 是否需要底部圆点
 */
function swiper(params) {
    /**
     * 组件节点
     * @type {HTMLElement}
     */
    let node = null;
    /**
     * item列表容器
     * @type {HTMLElement}
     */
    let nodeItem = null;
    /**
     * item节点列表
     * @type {Array<HTMLElement>}
     */
    let nodeItems = [];
    /**
     * 圆点容器
     * @type {HTMLElement}
     */
    let nodePagination = null;
    /**
     * 圆点列表
     * @type {Array<HTMLElement>}
     */
    let nodeNodePaginationItems = [];
    /** 是否需要底部圆点 */
    let pagination = false; 
    /** 是否需要回路 */
    let isLoop = false;
    /** 方向 true = X & Y = false */
    let direction = false; 
    /** 是否需要自动播放 */
    let autoPaly = false; 
    /** 自动播放间隔（毫秒）默认 3000 */
    let interval = 3000; 
    /** 过渡时间（毫秒）默认 300 */
    let moveTime = 300;
    /**
     * css class 命名列表
     * @dec ['滑动列表','滑动item','圆点容器','底部圆点','圆点高亮']
     */
    const classNames = ['.swiper_list', '.swiper_item', '.swiper_pagination', '.swiper_dot', '.swiper_dot_active'];
    
    /** 设置动画 */
    function startAnimation() {
        nodeItem.style.transition = `${moveTime / 1000}s all`;
    }
    
    /** 关闭动画 */
    function stopAnimation() {
        nodeItem.style.transition = '0s all';
    }

    /**
     * 属性样式滑动
     * @param {number} n 移动的距离
     */
    function slideStyle(n) {
        let x = 0, y = 0;
        if (direction) {
            y = n;
        } else {
            x = n;
        }
        nodeItem.style.transform = `translate3d(${x}px, ${y}px, 0px)`;
    }

    /**
     * 触摸开始
     * @param {number} width 滚动容器的宽度
     * @param {number} height 滚动容器的高度
     */
    function onTouch(width, height) {
        /** 触摸开始时间 */
        let startTime = 0; 
        /** 触摸结束时间 */
        let endTime = 0;
        /** 开始的距离 */
        let startDistance = 0;
        /** 结束的距离 */ 
        let endDistance = 0;
        /** 结束距离状态 */
        let endState = 0;
        /** 移动的距离 */
        let moveDistance = 0;
        /** 圆点位置 && 当前 item 索引 */
        let index = 0;
        /** 动画帧计数 */
        let count = 0;
        /** loop 帧计数 */
        let loopCount = 0;
        /** 移动范围 */
        let range = direction ? height : width;
        /** 动画帧 */
        const animationFrame = requestAnimationFrame;
        
        /** 判断最大拖动距离 */
        function touchRange() {
            /** 拖动距离 */
            let _d = 0;
            // 默认这个公式
            _d = moveDistance + (endDistance - startDistance);
            // 判断最大正负值
            if ((endDistance - startDistance) >= range) {
                _d = moveDistance + range;
            } else if ((endDistance - startDistance) <= -range) {
                _d = moveDistance - range;
            }
            // 没有 loop 的时候惯性拖拽
            if (!isLoop) {
                if ((endDistance - startDistance) > 0 && index === 0) {
                    // console.log('到达最初');
                    _d = moveDistance + ((endDistance - startDistance) - ((endDistance - startDistance) * 0.6));
                } else if ((endDistance - startDistance) < 0 && index === nodeItems.length - 1) {
                    // console.log('到达最后');
                    _d = moveDistance + ((endDistance - startDistance) - ((endDistance - startDistance) * 0.6));
                }
            }
            return _d;
        }
        
        /**
         * 判断触摸处理函数 
         * @param {number} _d 移动的距离
         */
        function judgeTouch(_d) {
            //	这里我设置了200毫秒的有效拖拽间隔
            if ((endTime - startTime) < 200) return true;
            // 这里判断方向（正值和负值）
            if (_d < 0) {
                if ((endDistance - startDistance) < (_d / 2)) return true;
                return false;
            } else {
                if ((endDistance - startDistance) > (_d / 2)) return true;
                return false;
            }
        }
 
        /** 返回原来位置 */
        function backLocation() {
            startAnimation();
            slideStyle(moveDistance);
        }
        
        /**
         * 滑动
         * @param {number} _d 滑动的距离
         */
        function slideMove(_d) {
            startAnimation();
            slideStyle(_d);
            loopCount = 0;
            // 判断 loop 时回到第一张或最后一张
            if (isLoop && index < 0) {
                // 我这里是想让滑块过渡完之后再重置位置所以加的延迟 (之前用setTimeout，快速滑动有问题，然后换成 requestAnimationFrame解决了这类问题)
                function loopMoveMin() {
                    loopCount += 1;
                    if (loopCount < moveTime / 1000 * 60) return animationFrame(loopMoveMin);
                    stopAnimation();
                    slideStyle(range * -(nodeItems.length - 3));
                    // 重置一下位置
                    moveDistance = range * -(nodeItems.length - 3);
                }
                loopMoveMin();
                index = nodeItems.length - 3;
            } else if (isLoop && index > nodeItems.length - 3) {
                function loopMoveMax() {
                    loopCount += 1;
                    if (loopCount < moveTime / 1000 * 60) return animationFrame(loopMoveMax);
                    stopAnimation();
                    slideStyle(0);
                    moveDistance = 0;
                }
                loopMoveMax();
                index = 0;
            }
            // console.log(`第${ index+1 }张`);	// 这里可以做滑动结束回调
            if (pagination) {
                nodePagination.querySelector(classNames[4]).className = classNames[3].slice(1);
                nodeNodePaginationItems[index].classList.add(classNames[4].slice(1));
            }
        }

        /** 判断移动 */ 
        function judgeMove() {
            // 判断是否需要执行过渡
            if (endDistance < startDistance) {
                // 往上滑动 or 向左滑动
                if (judgeTouch(-range)) {
                    // 判断有loop的时候不需要执行下面的事件
                    if (!isLoop && moveDistance === (-(nodeItems.length - 1) * range)) return backLocation();
                    index += 1;
                    slideMove(moveDistance - range);
                    moveDistance -= range;
                } else backLocation();
            } else {
                // 往下滑动 or 向右滑动
                if (judgeTouch(range)) {
                    if (!isLoop && moveDistance === 0) return backLocation();
                    index -= 1;
                    slideMove(moveDistance + range);
                    moveDistance += range;
                } else backLocation();
            }
        }
        
        /** 自动播放移动 */
        function autoMove() {
            // 这里判断 loop 的自动播放
            if (isLoop) {
                index += 1;
                slideMove(moveDistance - range);
                moveDistance -= range;
            } else {
                if (index >= nodeItems.length - 1) {
                    index = 0;
                    slideMove(0);
                    moveDistance = 0;
                } else {
                    index += 1;
                    slideMove(moveDistance - range);
                    moveDistance -= range;
                }
            }
        }

        /** 开始自动播放 */
        function startAuto() {
            count += 1;
            if (count < interval / 1000 * 60) return animationFrame(startAuto);
            count = 0;
            autoMove();
            startAuto();
        }

        // 判断是否需要开启自动播放
        if (autoPaly && nodeItems.length > 1) startAuto();

        // 开始触摸
        nodeItem.addEventListener('touchstart', ev => {
            startTime = Date.now(); 
            count = 0;
            loopCount = moveTime / 1000 * 60;
            stopAnimation();
            startDistance = direction ? ev.touches[0].pageY : ev.touches[0].pageX;
        });

        // 触摸移动
        nodeItem.addEventListener('touchmove', ev => {
            ev.preventDefault();
            count = 0;
            endDistance = direction ? ev.touches[0].pageY : ev.touches[0].pageX;
            slideStyle(touchRange());
        });

        // 触摸离开
        nodeItem.addEventListener('touchend', () => {
            endTime = Date.now();
            // 判断是否点击
            if (endState !== endDistance) {
                judgeMove();
            } else {
                backLocation();
            }
            // console.log(`index: ${index}`);	//  这里可以做触摸之后位置回调
            // 更新位置 
            endState = endDistance;
            // 重新打开自动播
            count = 0;
        });
    }
    
    /**
     * 如果要回路的话前后增加元素
     * @param {number} width 滚动容器的宽度
     * @param {number} height 滚动容器的高度
     */
    function outputLoop(width, height) {
        let first = nodeItems[0].cloneNode(true),
            last = nodeItems[nodeItems.length - 1].cloneNode(true);
        nodeItem.insertBefore(last, nodeItems[0]);
        nodeItem.appendChild(first);
        nodeItems.unshift(last);
        nodeItems.push(first);
        if (direction) {
            nodeItem.style.top = `${-height}px`;
        } else {
            nodeItem.style.left = `${-width}px`;
        }
    }

    /**
     * 动态布局
     * @param {number} width 滚动容器的宽度
     * @param {number} height 滚动容器的高度
     */
    function layout(width, height) {
        if (direction) {
            for (let i = 0; i < nodeItems.length; i++) {
                nodeItems[i].style.height = `${height}px`;
            }
        } else {
            nodeItem.style.width = `${width * nodeItems.length}px`;
            for (let i = 0; i < nodeItems.length; i++) {
                nodeItems[i].style.width = `${width}px`;
            }
        }
    }

    /** 输出底部圆点 */
    function outputPagination() {
        let html = '';
        nodePagination = node.querySelector(classNames[2]);
        // 如果没有找到对应节点则创建一个
        if (!nodePagination) {
            nodePagination = document.createElement('div');
            nodePagination.className = classNames[2].slice(1);
            node.appendChild(nodePagination);
        }
        for (let i = 0; i < nodeItems.length; i++) {
            html += `<div class="${classNames[3].slice(1)}"></div>`;
        }
        nodePagination.innerHTML = html;
        nodeNodePaginationItems = [...nodePagination.querySelectorAll(classNames[3])];
        nodePagination.querySelector(classNames[3]).classList.add(classNames[4].slice(1));
    }
    
    /** 动态布局初始化 */
    function format() {
        node = document.querySelector(params.el);
        if (!node) return console.warn('没有可执行的节点！');
        nodeItem = node.querySelector(classNames[0]);
        if (!nodeItem) return console.warn(`缺少"${classNames[0]}"节点！`);
        nodeItems = [...node.querySelectorAll(classNames[1])];
        if (nodeItems.length == 0) return console.warn('滑动节点个数必须大于0！');

        let moveWidth = node.offsetWidth,
            moveHeight = node.offsetHeight;
        if (pagination) outputPagination();
        if (isLoop) outputLoop(moveWidth, moveHeight);
        layout(moveWidth, moveHeight);
        onTouch(moveWidth, moveHeight);
    }
    
    /** 初始化参数 */
    function init() {
        if (typeof params !== 'object') return console.warn('传参有误');
        pagination = params.pagination || false;
        direction = params.vertical || false;
        autoPaly = params.autoPaly || false;
        isLoop = params.loop || false;
        moveTime = params.moveTime || 300;
        interval = params.interval || 3000;
        format();
    }
    init();
}