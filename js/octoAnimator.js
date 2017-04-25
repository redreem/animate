/**
 * Скрипт анимации css-свойств html-объекта
 * @param params - произвольный объект, им можно перебить параметры по умолчанию
 * @constructor
 */
C_OctoAnimator = function(params)
{

    this.fx = {
        off: true,
        pause: false
    };

    /**
     * массивы анимируемых свойств элементов
     * @type {Array}
     */
    this.elStartCSS = [];
    this.elEndCSS = [];
    this.elDeltaCSS = [];
    this.elState = [];

    this.interval = false;
    this.intervalTime = 30;
    this.intervalStartTime = 0;
    this.intervalBusy = false;
    this.numQueue = 0;
    this.numActive = 0;

    this.css_allow = {
        'left': 'px',
        'top': 'px',
        'width': 'px',
        'height': 'px',
        'fontSize': 'px',
        'minHeight': 'px'
    }

    for (var param in params) {
        this[param] = params[param];
    }
    
}

/**
 * Помещает объект в анимационную очередь и запускает анимацию очереди, если она не запущена
 * @param elId - или DOM-элемент или его id
 * @param p - объект css-свойств с конечным значением после анимации
 * @param duration - длительность анимации
 * @param f - callback-функция по окончании анимации
 */
C_OctoAnimator.prototype.animate = function(elId, p, duration, f) 
{
    this.fx.pause = true;

    var el;
    if (typeof elId == 'string') {
        
      el = document.getElementById(elId);
        
    } else {
        
      el = elId;
      elId=el.id;
        
    }
    
    if (this.elStartCSS[elId] === undefined) {

        this.numQueue++;
        
        this.elStartCSS[elId] = [];
        this.elEndCSS[elId] = [];
        this.elDeltaCSS[elId] = [];
        this.elState[elId] = [];
        
    }
    
    for (var c in p) {

        this.elStartCSS[elId][c] = Number($(el).css(c).replace('px',''));
        this.elEndCSS[elId][c] = Number(p[c]);
        this.elDeltaCSS[elId][c] = this.elEndCSS[elId][c] - this.elStartCSS[elId][c];

    }
    
    if (typeof f == 'function') {
        
        this.elState[elId]['f'] = f;
        
    } else {
        
        this.elState[elId]['f'] = false;
        
    }
    
    this.elState[elId]['stp'] = 0;
    this.elState[elId]['sts'] = duration / this.intervalTime;
    this.elState[elId]['el'] = el;
    this.elState[elId]['act'] = true;
    this.elState[elId]['end'] = false;
    
    this.numActive++;
    
    this.fx.pause = false;
    
    if (this.fx.off) {
    
        this.startAnimate(f);
        
    }
        
}

/**
 * Очищает событие анимации объекта с id = elId
 * @param elId
 */
C_OctoAnimator.prototype.clearQueue = function(elId) 
{
        
    if (this.elState[elId]['act']) {
        
        this.elState[elId]['act'] = false;
        this.numActive--;
        
    }
    
    this.elState[elId]['end'] = true;
    
    this.numQueue--;
    
    if (this.numActive == 0) {
        
        this.clearAll();
        
    }
    
}

/**
 * Функция рассчета следующего шага анимации всей очереди объектов
 */
C_OctoAnimator.prototype.intervalFunc = function() 
{
    
    if ((this.fx.off) || (this.fx.pause) || (this.intervalBusy)) {
        return;
    }
    
    this.intervalBusy = true;

    for (var elId in this.elStartCSS) {
        
        var el = this.elState[elId]['el'];
        
        if (this.elState[elId]['act']) {
            
            this.elState[elId]['stp']++;
            
            if (this.elState[elId]['stp'] >= this.elState[elId]['sts']) {
                
                this.elState[elId]['end'] = true;
                this.elState[elId]['act'] = false;
                
                this.numActive--;
                
            }
            
            var calcParam = 0;
            
            for (var c in this.elStartCSS[elId]) {

                if (!this.elState[elId]['end'] ) {
                    calcParam = this.elStartCSS[elId][c] + (this.elState[elId]['stp'] / this.elState[elId]['sts']) * this.elDeltaCSS[elId][c];
                } else {
                    calcParam = this.elEndCSS[elId][c];
                }

                el.style[c] = Math.floor(calcParam) + this.css_allow[c];


            }
            
            if ((this.elState[elId]['end']) && (this.elState[elId]['f'] !== false)) {
                this.elState[elId]['f']();
            }
        }
    }
        
    if (this.numActive == 0) {
      this.clearAll();
    }
        
    this.intervalBusy = false;    

}

/**
 * Старт рассчета анимации (всей очереди объектов)
 */
C_OctoAnimator.prototype.startAnimate = function()
{
    
    this.fx.off = false;
    
    this.intervalStartTime = new Date().getTime();
    this.curTime = this.intervalStartTime;
    this.calcTime = 0;
    
    this.intervalBusy = false;

    var $this = this;
    this.interval = window.setInterval(function(){
        $this.intervalFunc();
    }, this.intervalTime);
    
}

/**
 * Остановка анимации всех объектов
 */
C_OctoAnimator.prototype.clearAll = function()
{
    
    this.intervalBusy = true;
    
    this.fx.off = true;
    window.clearInterval(this.interval);
    this.interval = false;
    
    this.elStartCSS = [];
    this.elEndCSS = [];
    this.elDeltaCSS = [];
    this.elState = [];
    
    this.numQueue = 0;
    this.numActive = 0;
    
    this.intervalBusy = false;

}

/**
 * Пауза анимации объекта с
 * @param elId - или DOM-элемент или его id
 */
C_OctoAnimator.prototype.pause = function(elId)
{
    
    if (typeof elId == 'string') {

        var el = document.getElementById(elId);

    } else {

        var el = elId;
        elId=el.id;

    }
    
    this.elState[elId]['act'] = false;
    
}

/**
 * Старт с паузы анимации объекта с
 * @param elId - id элемента
 */
C_OctoAnimator.prototype.start = function(elId)
{
    
    this.elState[elId]['act'] = true;
    
}