var FlickPageSlide = function (opts) {
    opts = opts || {};

    this.el = opts.el || document.createElement('div');
    this.triggerSpeed = opts.triggerSpeed || 20;

    this.offset = 0;
    this.pageIndex = 0;

    this.initPages();
    this.initPageGuide(opts);
    this.initListener();
    this.setPageGuide(0);
};
inherits(FlickPageSlide, EventEmitter);

FlickPageSlide.prototype.initPages = function () {
    var el = this.el,
        pageCount = el.children.length,
        pageWidth = el.parentNode.offsetWidth;

    el.parentNode.style.overflow = 'hidden';

    el.style.position = 'relative';
    el.style.overflow = 'hidden';
    el.style.width = (100 * pageCount) + '%';

    [].slice.call(el.children).forEach(function (page) {
        page.style.cssFloat = 'left';
        page.style.width = (100 / pageCount) + '%';
        page.style.margin = '0';
    });

    this.pageCount = pageCount;
    this.pageWidth = pageWidth;

    // re-calc snapTo and offset
    this.offset = this.snapTo = -this.pageIndex * pageWidth;
    this.updateOffset();
};

FlickPageSlide.prototype.initPageGuide = function (opts) {
    var self = this,
        el = this.el,
        pageCount = el.children.length;

    var pageGuideElement = opts.pageGuideElement || (
        opts.pageGuideId
            ? document.getElementById(opts.pageGuideId)
            : document.createElement('ul')
    );

    for (var i = 0; i < pageCount; i++) {
        (function (index) {
            var li = document.createElement('li'),
                guide = document.createElement('a');
            guide.innerHTML = index + 1;
            guide.addEventListener('click', function (e) {
                e.preventDefault();
                self.pageJumpTo(index);
            }, false);

            li.appendChild(guide);
            pageGuideElement.appendChild(li);
        })(i);
    };

    this.pageGuideElement = pageGuideElement;
};

FlickPageSlide.prototype.initListener = function () {
    var self = this,
        el = this.el,
        prev = 0,
        steps = 0,
        grip = false,
        offsetCache;

    window.addEventListener('resize', function (e) {
        self.initPages();
    }, false);

    // touch events
    el.addEventListener('touchstart', function (e) {
        var touch = e.touches[0];
        if (!touch) {
            return;
        }
        grip = true;
        self.startSwipe(touch);
    });

    el.addEventListener('touchmove', function (e) {
        e.preventDefault();

        if (!grip) {
            return;
        }

        var touch = e.touches[0];
        if (!touch) {
            return;
        }

        self.processSwipe(touch);

    }, false);

    el.addEventListener('touchend', function () {
        if (!grip) {
            return;
        }
        grip = false;
        if (self.isTap) {
            return;
        }
        self.endSwipe();
    });


    // mouse events
    el.addEventListener('mousedown', function (e) {
        self.startSwipe(e);
        grip = true;
    });

    el.addEventListener('mousemove', function (e) {
        if (!grip) {
            return;
        }
        e.preventDefault();
        self.processSwipe(e);
    }, false);

    el.addEventListener('mouseup', function () {
        if (!grip) {
            return;
        }
        grip = false;

        if (self.isTap) {
            return;
        }

        self.endSwipe();
    });

    el.addEventListener('mouseout', function () {
        if (!grip) {
            return;
        }

        grip = false;

        if (self.isTap) {
            return;
        }

        self.endSwipe();
    });
};

FlickPageSlide.prototype.startSnap = function () {
    var self = this,
        clock = 25;

    this.endSnap();

    this.snapLoop = setInterval(function () {
        self.offset += (self.snapTo - self.offset) / 2;
        self.updateOffset();
    }, clock);
};

FlickPageSlide.prototype.startSwipe = function (e) {
    this.endSnap();

    this.prev = e.pageX;
    this.offsetCache = this.offset;
    this.steps = 0;

    this.isTap = true;
};

FlickPageSlide.prototype.processSwipe = function (e) {
    var current = e.pageX,
        diff = current - this.prev;

    if (this.isTap) {
        this.isTap = false;
        this.emit('swipestart');
    }

    this.offset += diff;
    this.updateOffset();

    this.prev = current;
    this.steps++;
};

FlickPageSlide.prototype.pageJumpTo = function (pageIndex) {
    this.pageIndex = pageIndex;
    this.snapTo = -pageIndex * this.pageWidth;
    this.setPageGuide(pageIndex);
    this.startSnap();
};

FlickPageSlide.prototype.endSwipe = function () {
    var pageWidth = this.pageWidth,
        pageCount = this.pageCount,
        speed = (this.offset - this.offsetCache) / this.steps,
        triggerSpeed = this.triggerSpeed;

    var pageIndex;
    if (speed > triggerSpeed) {
        pageIndex = -Math.ceil(this.offset / pageWidth);
    } else if (speed < -triggerSpeed) {
        pageIndex = -Math.floor(this.offset / pageWidth);
    } else {
        pageIndex = -Math.round(this.offset / pageWidth);
    }

    if (pageIndex < 0) { pageIndex = 0; }
    if (pageIndex >= pageCount) { pageIndex = pageCount - 1; }

    if (pageIndex * pageWidth != -this.snapTo) {
        this.emit('changepage', pageIndex);
        this.setPageGuide(pageIndex);
    }

    this.pageIndex = pageIndex;
    this.snapTo = -pageIndex * pageWidth;

    this.startSnap();
    this.emit('swipeend');
};

FlickPageSlide.prototype.endSnap = function () {
    clearInterval(this.snapLoop);
};

FlickPageSlide.prototype.updateOffset = function () {
    var translate = 'translate(' + this.offset + 'px, 0px)';
    this.el.style['transform'] = translate;
    this.el.style['-webkit-transform'] = translate;
    this.el.style['-moz-transform'] = translate;
};

FlickPageSlide.prototype.setPageGuide = function (index) {
    var pageGuideElement = this.pageGuideElement,
        links = pageGuideElement.getElementsByTagName('a'),
        length = links.length;

    for (var i = 0; i < length; i++) {
        links[i].className = null;
    }

    if (index < length) {
        links[index].className = 'active';
    }
};
