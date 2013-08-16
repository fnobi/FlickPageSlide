window.addEventListener('DOMContentLoaded', function () {
    var flickPageSlide = new FlickPageSlide({
        el: document.getElementById('pages'),
        pageGuideEl: document.getElementById('page-guide')
    });

    flickPageSlide.on('swipestart', function () {
        console.log('[swipe start]');
    });

    flickPageSlide.on('swipeend', function () {
        console.log('[swipe end]');
    });

    flickPageSlide.on('changepage', function (pageIndex) {
        console.log('[change page: %s]', pageIndex);
    });
}, false);
