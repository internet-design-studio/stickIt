/*
    VERSION 0.1.3
 */
/*
Пример вызова
 var stick = $(".stick-element").stickIt({
     wrapperClass: "stick-wrapper",
     offsetTop: 106, - отступ сверху, относительно window
     offsetBottom: $("#footer").outerHeight() // - отступ снизу, относительно документа, а не window.
                                              // при прокрутки вниз элемент отлипнет и начент скроллится,
                                              // когда до конца прокрутки страницы
                                              // останется заданное количество пикселей
    // или отступы задаются через выражение
    offsetTop: function(){
        return value;
     },
    offsetBottom: function(){
         return value;
     }
 });

 stick.turnOff(); - отключить залипание
 stick.turnOn(); - включить залипание
 stick.update() - вызываем метод после изменения высоты itemObject
 stick.update({
    offsetTop: 136,
    offsetBottom: 200
 }) - вызываем метод c новыми параметрами отступов.
*/

(function( $ ) {
    $.fn.stickIt = function(options) {
        if(this.length == 0) {
            return this;
        }

        var itemObject = this,
            offsetTop = options.offsetTop || 0,
            offsetBottom = options.offsetBottom || 0,
            wrapperClass = options.wrapperClass || "stick-wrapper",
            itemObjectHeight = itemObject.outerHeight(),
            $w = $(window),
            $d = $(document),
            $wHeight = $w.height(),
            positionDefault = itemObject.css("position"),
            startOffseTop = itemObject.offset().top, 			// отступ от itemObject до верха документа
            itemObjectStateFixed, 								// "top" or "bottom" or "";
            step,
            prevScroll,
            diff = 0,                                           // невидимая часть itemObject, которая выходит за зону видимости
            diffInvers = 0,                                     // та часть itemObject, которой не хватает чтобы он уложился точно в область видимости
            bottomOff = $d.height() - $wHeight - offsetBottom;

        // INIT
        initStick();

        // FUNCTIONS
        /**
         *  Инициализация плагина
         *  Обернуть itemObject,(<div></div>) установить высоту обертке, проскроллировать страницу,
         *  повесить обработчики.
         */
        function initStick() {
            var rememberTopOffset = $w.scrollTop();
            $w.scrollTop(0);

            if(!itemObject.parent("." + wrapperClass).length) {
                itemObject.wrap("<div class='" + wrapperClass +"'></div>");
                itemObject.parent("." + wrapperClass).css("position", "relative");
            }

            itemObject.parent("." + wrapperClass).height(itemObject.outerHeight(true));
            itemObject.width(itemObject.parent("." + wrapperClass).width());

            smartFix();
            recalculate();

            $w.scrollTop(rememberTopOffset);
        }
        // HANDLERS
        $w.on("resize.stick", function() {
            setTimeout(function(){
                recalculate(smartFix);
            }, 300)
        }).on("scroll.stick", function() {
            smartFix();
        });


        /**
         *  Перерасчет основных параметров, полезен при update, resize.
         */
        function recalculate(callback) {
            if(itemObject.parent("." + wrapperClass).length) {
                startOffseTop = itemObject.parent("." + wrapperClass).offset().top;
                $wHeight = $w.height();
                itemObject.parent("." + wrapperClass).height(itemObject.outerHeight(true));
                itemObjectHeight = itemObject.outerHeight();
                itemObject.width(itemObject.parent("." + wrapperClass).width());

                offsetTop = options.offsetTop || 0;
                offsetBottom = options.offsetBottom || 0;

                if(typeof offsetTop == "function") {
                    offsetTop = offsetTop();
                }
                if(typeof offsetBottom == "function") {
                    offsetBottom = offsetBottom();
                }
                bottomOff = $d.height() - $wHeight - offsetBottom;
            }
            if(callback) {
                callback();
            }
        }

        /**
         * Задает поведение фиксируемого блока, в зависимости от пользовательских параметров и
         * направления скролла
         */
        function smartFix() {
            if(!itemObject.parent("." + wrapperClass).length) {
                return false;
            }
            var wScroll = $w.scrollTop(),
                currentTop = parseInt(itemObject.css("top"));

            if(itemObject.css("position") == "fixed") {
                itemObject.css({
                    marginLeft: -$w.scrollLeft()
                });
            }

            // Определяем направление скролла
            step = wScroll - prevScroll;
            if (step >= 0) {
                // СКРОЛЛИМ ВНИЗ
                scrollToBottom(wScroll, currentTop);
            } else {
                // СКРОЛЛИМ ВВЕРХ
                scrollToTop(wScroll, currentTop, diff);
            }
            prevScroll = wScroll;
        }

        /**
         * Задает поведение блока при скроллировании вниз
         * @param wScroll {number} на сколько пикселей прокрутили страницу
         * @param currentTop {number} свой собственный itemObject.css("top") объекта
         *
         */
        function scrollToBottom (wScroll, currentTop) {
            if(itemObject.css("position") == "static") {
                // если itemObject высота больше области видимости - устанавливаем параметр diff,
                // diff > 0 - itemObject будет зафиксирован по своей нижней границе
                // diff = 0 - itemObject будет зафиксирован по своей верхней границе
                if(itemObjectHeight > $wHeight - offsetTop) {
                    diff = itemObjectHeight - ($wHeight - offsetTop);
                }

                // фиксируем элемент, по верхней границе, если он меньше зоны видимости
                // или по нижней границе, если больше зоны видимости
                if(wScroll > startOffseTop - offsetTop + diff ) {
                    itemObject.css({
                        position: "fixed",
                        top: offsetTop - diff,
                        marginLeft: -$w.scrollLeft()
                    });
                    if(diff > 0) {
                        itemObjectStateFixed = "bottom";
                    } else {
                        itemObjectStateFixed = "top";
                    }
                } else {
                    itemObject.css({
                        position: positionDefault,
                        marginLeft: 0
                    });
                    itemObjectStateFixed = "";
                }
            }

            if(itemObject.css("position") == "absolute") {
                if(currentTop + itemObject.parent("." + wrapperClass).offset().top + itemObjectHeight < wScroll + $wHeight) {

                    if(itemObjectHeight > $wHeight - offsetTop) {
                        diff = itemObjectHeight - ($wHeight - offsetTop);
                    }

                    if(wScroll > startOffseTop - offsetTop + diff ) {
                        itemObject.css({
                            position: "fixed",
                            top: offsetTop - diff,
                            marginLeft: -$w.scrollLeft()
                        });
                        if(diff > 0) {
                            itemObjectStateFixed = "bottom";
                        } else {
                            itemObjectStateFixed = "top";
                        }
                    } else {
                        itemObject.css({
                            position: positionDefault,
                            marginLeft: 0
                        });
                        itemObjectStateFixed = "";
                    }
                }
            }

            if(itemObject.css("position") == "fixed" && itemObjectStateFixed == "top" && itemObjectHeight > $wHeight - offsetTop ) {
                // Если itemObject зафиксирован сверху и есть куда прокручивать вниз
                // Переключаем его на absolute
                itemObject.css({
                    position: "absolute",
                    top: wScroll + offsetTop  - itemObject.parent("." + wrapperClass).offset().top,
                    marginLeft: 0
                });
                itemObjectStateFixed = "";
            }

            footerCorrection(wScroll, currentTop);
        }

        /**
         // ОТЛИПАНИЕ ПРИ ДОСТИЖЕНИИ НИЖНЕГО ЗНАЧЕНИЯ
         // Нижняя гранца itemObject достигла низа и должна сместиться вверх на значение offsetBottom,
         // offsetBottom = 0, блок itemObject прилип  к нижней границе window.
         // offsetBottom = 100, блок itemObject прилипк нижней границе window - 100, и при скролле вниз,
         // прокручивался бы еще 100 пикселей
         *
         * @param wScroll {number} - на сколько прокручено окно
         */
        function footerCorrection(wScroll) {
            diffInvers = 0;
            if(itemObjectHeight < $wHeight - offsetTop) {
                diffInvers = ($wHeight - offsetTop) - itemObjectHeight;
            }
            if(bottomOff + diffInvers < wScroll && itemObjectHeight + offsetTop + offsetBottom > $wHeight) {
                var bottomDiff = 0;

                if(itemObjectHeight + offsetTop < $wHeight) {
                    bottomDiff = $wHeight - itemObjectHeight - offsetTop;
                }
                itemObject.css({
                    position: "absolute",
                    top: $d.height() - offsetBottom - itemObjectHeight - itemObject.parent("." + wrapperClass).offset().top - bottomDiff + diffInvers,
                    marginLeft: 0
                });
                itemObjectStateFixed = "";
            }
        }

        /**
         * Задает поведение блока при скроллировании вверх
         * @param wScroll {number} на сколько пикселей прокрутили страницу
         * @param currentTop {number} свой собственный itemObject.css("top") объекта
         *
         */
        function scrollToTop (wScroll, currentTop) {
            if(itemObject.css("position") == "fixed" && itemObjectStateFixed == "bottom") {
                // переключаемся c fixed на absolute, объект визульно находится в том же месте
                itemObject.css({
                    position: "absolute",
                    top: wScroll + $wHeight - itemObjectHeight - itemObject.parent("." + wrapperClass).offset().top, //
                    marginLeft: 0
                });
            }

            // если скроллим вверх, объект прилеплен (fixed) верхней частью
            if(itemObject.css("position") == "fixed" && itemObjectStateFixed == "top") {

                // если дошли до самого верха страницы, отлепляем объект  переключаем fixed на static
                if($(this).scrollTop() < startOffseTop - offsetTop) {
                    itemObject.css({
                        position: positionDefault,
                        marginLeft: 0
                    });
                    itemObjectStateFixed = "";
                }
            }

            if(itemObject.css("position") == "absolute" || (itemObject.css("position") == "fixed") && wScroll < offsetTop) {
                if(currentTop + itemObject.parent("." + wrapperClass).offset().top > wScroll + offsetTop ) {

                    // скроллим снизу вверх и достигли верхушки itemObject - переключаемся abs на fixed
                    diff = 0;
                    itemObject.css({
                        position: "fixed",
                        top: offsetTop - diff,
                        marginLeft: -$w.scrollLeft()
                    });
                    itemObjectStateFixed = "top";
                }

                if($(this).scrollTop() < startOffseTop - offsetTop) {
                    itemObject.css({
                        position: positionDefault,
                        marginLeft: 0
                    });
                    itemObjectStateFixed = "";
                }
            }
        }

        /**
         *  Вернуть html в состояние до вызова плагина, убрать обработчики
         */
        function turnOff() {
            itemObject.removeAttr("style");
            if(itemObject.parent().hasClass(wrapperClass )) {
                itemObject.unwrap();
            }
            if($("."+wrapperClass).length == 0) {
                $w.off(".stick");
            }
        }

        /**
         *  Включить плагин (если он был выключен)
         */
        function turnOn() {
            initStick();
        }

        /**
         * Определить имеет ли блок обертку, созданную плагином
         * @returns {boolean}
         */
        function isTurnOn() {
            if(itemObject.parent().hasClass(wrapperClass)) {
                return true;
            } else {
                return false;
            }
        }


        // OPEN API
        itemObject.update = function(updateSettings) {
            if(!updateSettings) updateSettings = {};
            offsetTop = updateSettings.offsetTop || offsetTop;
            offsetBottom = updateSettings.offsetBottom || offsetBottom;
            wrapperClass = updateSettings.wrapperClass || "stick-wrapper";

            turnOn();

        };
        itemObject.turnOn = turnOn;
        itemObject.turnOff = turnOff;
        itemObject.isTurnOn = isTurnOn;

        return this;
    }
})(jQuery);