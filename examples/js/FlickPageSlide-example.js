window.addEventListener('DOMContentLoaded', function () {
    var flickPageSlide = new FlickPageSlide({
        el: document.getElementById('pages'),
        pageGuideEl: document.getElementById('page-guide')
    });

    flickPageSlide.on('changepage', function (pageIndex) {
        console.log('[change page: %s]', pageIndex);
    });
}, false);
