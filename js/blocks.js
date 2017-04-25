/**
 * Объект генерирует блоки и анимирует их используя либо jQuery, либо octoAnimator
 * @param containerId string
 * @param params - произвольный объект, им можно перебить параметры по умолчанию
 * @constructor
 */
C_Blocks = function(containerId, params)
{

    this.container = {
        id:containerId
    }

    this.container.el = document.getElementById(this.container.id);
    this.container.w = this.container.el.offsetWidth;
    this.container.h = this.container.el.offsetHeight;

    this.blocksNum = 10;
    this.engineName = {
        JQ: 'jQuery',
        OA: 'octoAnimator'
    }
    this.animationTime = {
        min:300,
        max:8000
    }

    this.animateFunc = animateFunc;
    this.engine = 'OA';

    this.idPrefix = 'b_id';
    this.blockClassName = 'block';
    this.blockPatternId = 'blockPattern';
    this.blockPatternHTML = '';
    this.blockReplaceStr = '{bContent}';
    this.blocksEl = [];

    for (var param in params) {
        this[param] = params[param];
    }

    this.compile(this.blocksNum);
}

/**
 * Генерирует blocksNum блоков и запускает анимацию
 * @param blocksNum
 */
C_Blocks.prototype.compile = function (blocksNum)
{

    this.blocksNum = blocksNum;

    this.blockPatternHTML = document.getElementById(this.blockPatternId).innerHTML;

    var bid = false;

    for (var i = 0; i < this.blocksNum; i++) {

        bid = this.idPrefix + i;
        this.blocksEl[bid] = document.createElement('div');
        this.blocksEl[bid].className = this.blockClassName;
        this.blocksEl[bid].id = bid;

        this.blocksEl[bid].innerHTML = this.blockPatternHTML.replace(this.blockReplaceStr, 'block' + i);

        $(this.blocksEl[bid]).css(this.randomCSS());

        var col = this.RGBtoHex(
            Math.floor(150 + Math.random() * 155),
            Math.floor(150 + Math.random() * 155),
            Math.floor(150 + Math.random() * 155)
        );

        $(this.blocksEl[bid].getElementsByTagName('div')[0]).css({backgroundColor: '#' + col});

        this.container.el.appendChild(this.blocksEl[bid]);

    }

    this.startAnimation(this.engine);
}

/**
 * Старт анимации на текущем движке
 */
C_Blocks.prototype.startAnimation = function ()
{

    document.getElementById('engine').innerHTML = this.engineName[this.engine];

    if (this.engine == 'JQ') {
        document.getElementById('engineType').value = this.engineName['OA'];
    } else {
        document.getElementById('engineType').value = this.engineName['JQ'];
    }

    for (var i = 0; i < this.blocksNum; i++) {

        switch (this.engine) {
            case 'JQ':
                this.delHover(this.idPrefix + i);
                break;
            case 'OA':
                this.setHover(this.idPrefix + i);
                break;
            default:
                break;
        }

        this.animate(this.idPrefix + i, this.engine);

    }

}

/**
 * Старт анимации на движке engine блока с id = bId
 * @param bId
 * @param engine
 * @todo надо реализовать без рекурсии
 */
C_Blocks.prototype.animate = function (bId, engine)
{

    var p = this.randomCSS();
    var t = this.randomTime();
    this.setInfo(bId, p, t);
    var $this = this;

    switch (engine) {
        case 'JQ':
            $('#' + bId).animate(p, t, 'linear', function () {
                $this.animate(bId, engine);
            });
            break;
        case 'OA':
            this.animateFunc.animate(bId, p, t, function () {
                $this.animate(bId, engine);
            });
            break;
    }

}

/**
 * Генерит случайные координаты для блока
 * @returns {{top: number, left: number}}
 */
C_Blocks.prototype.randomCSS = function ()
{
    return {
        top: (Math.round(Math.random() * (this.container.h - 100))),
        left: (Math.round(Math.random() * (this.container.w - 200))),
    }
}

/**
 * Случайное время анимации
 * @returns {number}
 */
C_Blocks.prototype.randomTime = function ()
{
    return Math.round(this.animationTime.min + Math.random() * (this.animationTime.max - this.animationTime.min));
}

/**
 * Выставляет информацию об анимации в блок
 * @param id - id блока
 * @param p - позция
 * @param t - время
 */
C_Blocks.prototype.setInfo = function (id, p, t)
{
    var el = document.getElementById(id).getElementsByTagName('div')[1];
    el.innerHTML = 'id: ' + id + '<br>time: ' + t +
        '<br>L: ' + Math.floor($('#' + id).css('left').replace('px', '')) + ' -> ' + p.left +
        '<br>T: ' + Math.floor($('#' + id).css('top').replace('px', '')) + ' -> ' + p.top;
}

/**
 * Переключение анимации между движками
 */
C_Blocks.prototype.toggleEngine = function ()
{
    switch (this.engine) {
        case 'JQ':
            $.fx.off = true;
            for (var i = 0; i < this.blocksNum; i++) {
                $('#' + this.idPrefix + i).stop(true);
                $('#' + this.idPrefix + i).clearQueue();
            }
            this.animateFunc.clearAll();
            this.animateFunc.fx.off = true;
            this.engine = 'OA';
            break;
        case 'OA':
            this.animateFunc.clearAll();
            $.fx.off = false;
            this.engine = 'JQ';
            break;
        default:
            break;
    }
    this.startAnimation();
    document.getElementById('engineType').value = this.engineName[this.engine];
}

/**
 * Рестарт анимации
 */
C_Blocks.prototype.reStart = function ()
{

    var num = parseInt(document.getElementById('numBlocks').value);

    if (num < 1 || num >= 1500 || isNaN(num)) {
        num = 10;
    }

    document.getElementById('numBlocks').value = num;

    this.animateFunc.clearAll();
    $.fx.off = false;

    for (var i = 0; i < this.blocksNum; i++) {
        $('#' + this.idPrefix + i).stop(true);
        $('#' + this.idPrefix + i).clearQueue();
    }

    this.container.el.innerHTML = '&nbsp';

    this.compile(num);
    this.startAnimation();
}

/**
 * Пауза в анимации блока на octoAnimator при наведении курсора
 * @param id
 */
C_Blocks.prototype.setHover = function (id)
{

    var el = document.getElementById(id);
    var $this = this;
    el.onmouseover = function () {
        $this.animateFunc.pause(id);
        $('#' + id).css({zIndex: 10000, opacity: 1});
    }

    el.onmouseout = function () {
        $('#' + id).css({width: 'auto', height: 'auto'});
        $this.animateFunc.start(id);
    }

}

/**
 * Удаление обработки наведения мыши на блок
 * @param id
 */
C_Blocks.prototype.delHover = function (id)
{
    var el = document.getElementById(id);

    el.onmouseover = function () {
    };
    el.onmouseout = function () {
    };

}

/**
 * Переводит 3 числа в строку, состоящую из шестнадцатиричных представлений исходных чисел
 * @param R
 * @param G
 * @param B
 * @returns {*}
 * @constructor
 */
C_Blocks.prototype.RGBtoHex = function(R, G, B)
{

    return this.toHex(R) + this.toHex(G) + this.toHex(B);

}

/**
 * Переводит числов в шестнадцатеричное представление, отсекая окном 0..255
 * @param N
 * @returns {*}
 */
C_Blocks.prototype.toHex = function(N)
{

    if (N == null) {
        return '00';
    }

    N = parseInt(N);
    if (N == 0 || isNaN(N)) {
        return '00';
    }
    N=Math.max(0,N);
    N=Math.min(N,255);
    N = Math.round(N);

    var hexDigits = '0123456789ABCDEF';

    var fistDigit = hexDigits.charAt((N - N % 16) / 16);
    var secondDigit = hexDigits.charAt(N % 16);

    return fistDigit + secondDigit;

}