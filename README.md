FlickPageSlide
======

iOS like paging.

## install

### from bower
```
bower install FlickPageSlide
```

### from github
```
git clone git://github.com/fnobi/FlickPageSlide.git
```

## usage

### html

```html
<div id="page-wrapper">
<div id="pages">
<section id="page-sample-1" class="page">
ほげほげ
<!-- /.page --></section>
<section id="page-sample-2" class="page">
もげもげ
<!-- /.page --></section>
<!-- /#pages --></div>
<!-- /#page-wrapper --></div>

<div id="page-guide">
<!-- /#page-guide --></div>
```

### javascript

```javascript
window.addEventListener('DOMContentLoaded', function () {
    new FlickPageSlide({
        el: document.getElementById('pages'),
        pageGuideEl: document.getElementById('page-guide')
    });
}, false);
```
