#stickIt 0.1.4
## Небольшой jQuery плагин - прилипалка для fixed-блока

## Поддержка браузеров:
* IE7+
* Firefox
* Chrome
* Safari,
* for mobile devices probably not good idea use fixed elements

###Поведение fixed-блока, если его высота больше видимой области(viewport):
* Прокручивается, пока его нижняя граница не достигнет нижней части viewport
* Фиксируется по своей нижней границе
* И отлипает при достижении offsetBottom параметра (опционально)

###Поведение fixed-блока, если высота меньше видимой области(viewport):
* Посто прилипает к верху, как и большинство плагинов.

###License
Released under the MIT license - http://opensource.org/licenses/MIT

##Установка

###Подключить требуемые файлы

```html
<!-- jQuery library -->
<script src="http://code.jquery.com/jquery-1.11.1.min.js"></script>
<!-- StickIt javascript file -->
<script src="StickIt.js"></script>
```

###Создать HTML разметку
**div.stick-container** не является необходимым, служит для задания отступов (margins, paddings).
```html
<div class="stick-container">
	<div id="stick-element">
		put your's html here
	</div>
</div>
```

###Вызвать плагин
```javascript
$(document).ready(function(){
	$('#stick-element').stickIt();
});
```

##Параметры

###Базовые

**wrapperClass** - класс у блока обертки
```
default: 'stick-wrapper'
```

```javascript
var stick = $(".stick-element").stickIt({
	wrapperClass: 'stick-wrapper'
});
```

**offsetTop** - отступ сверху, относительно viewport
```
default: 0
options: integer or function
```

```javascript
var stick = $(".stick-element").stickIt({
	offsetTop: 150
});

var stick = $(".stick-element").stickIt({
	offsetTop: $('header').height()
});

var stick = $(".stick-element").stickIt({
	offsetTop: function() {
		return someChangedValue
	}
}
});
```

**offsetBottom** - отступ снизу, относительно документа, а не window.
при прокрутки вниз элемент отлипнет и начент скроллится,
когда до конца прокрутки страницы
останется заданное количество пикселей
```
default: 0
options: integer or function
```

```javascript
var stick = $(".stick-element").stickIt({
	offsetBottom: 150
});

var stick = $(".stick-element").stickIt({
	offsetBottom: $('footer').height()
});

var stick = $(".stick-element").stickIt({
	offsetTop: function() {
		return someChangedValue
	}
});
```

###Public methods

**turnOff** - отключает действие плагина

```javascript
var stick = $(".stick-element").stickIt();
stick.turnOff();
```

**turnOn** - включает действие плагина, если ранее был выключен

```javascript
var stick = $(".stick-element").stickIt();
stick.turnOn();
```

**update** - полезен, когда изменились размеры блока.

```javascript
var stick = $(".stick-element").stickIt();
$(".stick-element").height(newHeight);
stick.update();
```