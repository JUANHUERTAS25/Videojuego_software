// Manejador de entrada por teclado
(function (global) {
    global.GameInput = {
        keyMap: {
            left: 37,
            right: 39,
            fire: 32
        },

        addListener: function (element, type, expression, bubbling) {
            bubbling = bubbling || false;

            if (window.addEventListener) {
                element.addEventListener(type, expression, bubbling);
            } else if (window.attachEvent) {
                element.attachEvent('on' + type, expression);
            }
        }
    };
})(window);
