var FlickPageSlide = function (opts) {
    opts = opts || {};

    this.el = opts.el || document.createElement('div');

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
        // pageWidth = el.offsetWidth / pageCount;
        pageWidth = el.offsetWidth;

    el.parentNode.style.overflow = 'hidden';

    el.style.position = 'relative';
    el.style.overflow = 'hidden';
    el.style.width = (100 * pageCount) + '%';

    [].slice.call(el.children).forEach(function (page) {
        page.style.float = 'left';
        page.style.width = (100 / pageCount) + '%';
        page.style.margin = '0';
    });

    this.pageCount = pageCount;
    this.pageWidth = pageWidth;

    // re-calc snapTo and offset
    this.offset = this.snapTo = this.pageIndex * pageWidth;
    this.updateOffset();
};

FlickPageSlide.prototype.initPageGuide = function (opts) {
    var el = this.el,
        pageCount = el.children.length;

    var pageGuideEl = opts.pageGuideEl || (
        opts.pageGuideId
            ? document.getElementById(opts.pageGuideId)
            : document.createElement('div')
    );

    var guide;
    for (var i = 0; i < pageCount; i++) {
        guide = document.createElement('a');
        pageGuideEl.appendChild(guide);
    };

    this.pageGuideEl = pageGuideEl;
};

FlickPageSlide.prototype.initListener = function () {
    var self = this,
        el = this.el,
        prev = 0,
        steps = 0,
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

        self.startSwipe(touch);
    });

    el.addEventListener('touchmove', function (e) {
        e.preventDefault();

        var touch = e.touches[0];
        if (!touch) {
            return;
        }

        self.processSwipe(touch);

    }, false);

    el.addEventListener('touchend', function () {
        self.endSwipe();
    });


    // mouse events
    var grip = false;
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
        grip = false;
        self.endSwipe();
    });

    el.addEventListener('mouseout', function () {
        grip = false;
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

FlickPageSlide.prototype.endSwipe = function () {
    var pageWidth = this.pageWidth,
        pageCount = this.pageCount,
        speed = (this.offset - this.offsetCache) / this.steps,
        triggerSpeed = 20;

    var pageIndex;
    if (speed > triggerSpeed) {
        pageIndex = Math.ceil(this.offset / pageWidth);
    } else if (speed < -triggerSpeed) {
        pageIndex = Math.floor(this.offset / pageWidth);
    } else {
        pageIndex = Math.round(this.offset / pageWidth);
    }

    if (pageIndex > 0) { pageIndex = 0; }
    if (pageIndex <= -pageCount) { pageIndex = -(pageCount - 1); }

    this.setPageGuide(-pageIndex);

    this.pageIndex = pageIndex;
    this.snapTo = pageIndex * pageWidth;

    this.startSnap();
};

FlickPageSlide.prototype.endSnap = function () {
    clearInterval(this.snapLoop);
};

FlickPageSlide.prototype.updateOffset = function () {
    var translate = 'translate(' + this.offset + 'px, 0px)';
    this.el.style['-webkit-transform'] = translate;
};

FlickPageSlide.prototype.setPageGuide = function (index) {
    var pageGuideEl = this.pageGuideEl,
        length = pageGuideEl.children.length;

    for (var i = 0; i < length; i++) {
        pageGuideEl.children[i].className = null;
    }

    if (index < length) {
        pageGuideEl.children[index].className = 'active';
    }
};