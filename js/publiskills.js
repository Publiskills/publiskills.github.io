(function() {

    var bodyEl = document.body,
        openbtn = document.getElementById( 'open-button' ),
        closebtn = document.getElementById( 'menu-closebtn' ),
        overlaymask = document.getElementById( 'overlay-mask' ),
        isOpen = false;

    function init() {
        initEvents();
    }

    function initEvents() {
        openbtn.addEventListener( 'click', toggleMenu );
        closebtn.addEventListener( 'click', toggleIfOpen );
        overlaymask.addEventListener('click', toggleIfOpen );
    }

    function toggleIfOpen(ev) {
        var target = ev.target;
        if( isOpen && target !== openbtn ) {
            toggleMenu();
        }
    }

    function toggleMenu() {
        if( isOpen ) {
            bodyEl.classList.remove('show-menu');
        }
        else {
            bodyEl.classList.add('show-menu');
        }
        isOpen = !isOpen;
    }

    init();

})();