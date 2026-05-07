$(document).ready(function () {
    $("#startBtn").on("click", startAnimation);
});

/**
 * Запускает анимацию фигур
 * @returns {undefined}
 */
function startAnimation() {
    const $COUNT = $("#count");
    const $SCALE = $("#scale");
    const MAX_COUNT = $COUNT.prop("max");
    const MIN_COUNT = $COUNT.prop("min");
    const MAX_SCALE = $SCALE.prop("max");
    const MIN_SCALE = $SCALE.prop("min");
    let count = parseInt($COUNT.val());
    let scale = parseInt($SCALE.val());
    count = correctInput($COUNT, count, MIN_COUNT, MAX_COUNT, "Количество");
    scale = correctInput($SCALE, scale, MIN_SCALE, MAX_SCALE, "Увеличение");
    $COUNT.val(count);
    $SCALE.val(scale);
    scale = scale / 100;
    const $AREA = $("#animationArea");
    $AREA.empty();
    for (let i = 0; i < count; i++) {
        const $SHAPE = createShape($AREA);
        shapeDirection($SHAPE);
        hoverEffect($SHAPE, scale);
        $AREA.append($SHAPE);
        moveShape($SHAPE, $AREA);
    }
}

/**
 * Проверяет и корректирует значение поля ввода
 * @param {jQuery} $input - поле ввода
 * @param {Number} value - текущее значение
 * @param {Number} min - минимально допустимое значение
 * @param {Number} max - максимально допустимое значение
 * @param {String} label - название параметра для сообщения
 * @returns {Number} - скорректированное значение
 */
function correctInput($input, value, min, max, label) {
    $input.next(".error-message").remove();
    const rawValue = $input.val();
    if (isNaN(value) || value < min) {
        value = min;
        showError($input, value, `${label} должно быть не меньше
        ${min}. Установлено минимальное.`);
        return value;
    }
    if (value > max) {
        value = max;
        showError($input, value, `${label} должно быть не больше
        ${max}. Установлено максимальное.`);
        return value;
    }
    if (rawValue.includes('.') || rawValue.includes(',')) {
        value = Math.floor(value);
        showError($input, value, `${label} должно быть целым числом. Установлено
        ${value}.`);
        return value;
    }
    return value;
}

/**
 * Отображает сообщение об ошибке возле поля ввода
 * @param {jQuery} $input - поле ввода
 * @param {Number} value - новое значение
 * @param {String} message - текст сообщения об ошибке
 * @returns {undefined}
 */
function showError($input, value, message) {
    $input.val(value)
            .addClass("error")
            .after(`<span class="error-message">${message}</span>`);
    setTimeout(() => {
        $input.removeClass('error');
        $input.next(".error-message").remove();
    }, 5000);
}

/**
 * Создает случайную фигуру
 * @param {jQuery} $area - область анимации
 * @returns {jQuery} - созданная фигура
 */
function createShape($area) {
    const SIZE = 40;
    const IS_CIRCLE = Math.random() > 0.5;
    return $('<div class="shape"></div>').css({
        width: SIZE,
        height: SIZE,
        left: randomValue(0, $area.width() - SIZE),
        top: randomValue(0, $area.height() - SIZE),
        backgroundColor: randomColor(),
        borderRadius: IS_CIRCLE ? '50%' : '0'
    });
}

/**
 * Устанавливает случайное направление движения
 * @param {jQuery} $shape - фигура
 * @returns {undefined}
 */
function shapeDirection($shape) {
    const SPEED_COEFF = 3;
    $shape.data({
        dx: randomDirection() * SPEED_COEFF,
        dy: randomDirection() * SPEED_COEFF
    });
}

/**
 * Назначает эффект увелечения фигуры при наведении курсора
 * @param {jQuery} $shape - фигура
 * @param {Number} maxScale - коэффициент увелечения
 * @returns {undefined}
 */
function hoverEffect($shape, maxScale) {
    $shape.data("maxScale", maxScale);
    $shape.hover(
            function () {
                $(this).css("transform", `scale(${maxScale})`);
                $(this).data("hovered", true);
            },
            function () {
                $(this).css("transform", "scale(1)");
                $(this).data("hovered", false);
            }
    );
}

/**
 * Реализует движение фигуры
 * @param {jQuery} $shape - фигура
 * @param {jQuery} $area - область анимации
 * @returns {undefined}
 */
function moveShape($shape, $area) {
    const TIME_INTERVAL = 30;
    const POSITION = newPosition($shape, $area);
    $shape.animate({
        left: POSITION.left,
        top: POSITION.top
    }, TIME_INTERVAL, "linear", () => {
        moveShape($shape, $area);
    });
}

/**
 * Вычисляет новую позицию фигуры
 * @param {jQuery} $shape - фигура
 * @param {jQuery} $area - область анимации
 * @returns {Object} - новые координаты фигуры
 */
function newPosition($shape, $area) {
    let left = parseFloat($shape.css("left"));
    let top = parseFloat($shape.css("top"));
    let dx = $shape.data("dx");
    let dy = $shape.data("dy");
    const SIZE = $shape.outerWidth();
    const MAX_WIDTH = $area.width();
    const MAX_HEIGHT = $area.height();
    let margin = 0;
    if ($shape.data("hovered")) {
        const scale = $shape.data("maxScale");
        margin = (SIZE * scale - SIZE) / 2;
    }
    if (left + dx <= margin || left + dx + SIZE >= MAX_WIDTH - margin) {
        dx = -dx;
    }
    if (top + dy <= margin || top + dy + SIZE >= MAX_HEIGHT - margin) {
        dy = -dy;
    }
    left = Math.min(Math.max(left, margin), MAX_WIDTH - SIZE - margin);
    top = Math.min(Math.max(top, margin), MAX_HEIGHT - SIZE - margin);
    $shape.data({dx, dy});
    return {
        left: left + dx,
        top: top + dy
    };
}

/**
 * Возвращает случайное целое число в заданном диапозоне
 * @param {Number} min - минимальное значение
 * @param {Number} max - максимальное значение
 * @returns {Number} - случайное число
 */
function randomValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Возвращает случайное направление движения
 * @returns {Number} - направление движения
 */
function randomDirection() {
    return Math.random() > 0.5 ? 1 : -1;
}

/**
 * Возвращает случайный цвет фигуры
 * @returns {String} - название цвета
 */
function randomColor() {
    const COLORS = ["red", "blue", "green", "orange", "purple"];
    return COLORS[randomValue(0, COLORS.length - 1)];
}