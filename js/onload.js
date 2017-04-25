$(document).ready(function(){

    /**
     * Экземпляр анимационного движка
     * @type {C_OctoAnimator}
     */
    animateFunc = new C_OctoAnimator();

    /**
     * Экземпляр генератора и менеджера анимации блоков
     * @type {C_Blocks}
     */
    var blocks = new C_Blocks(
        'blocks',
        {
            blocksNum:10,
            animateFunc:animateFunc
        }
    );

    /**
     * Событие для кнопки переключения типа анимаций
     */
    $('#engineType').bind('click', function(){
        blocks.toggleEngine();
    });

    /**
     * Событие для рестарта анимации после ввода количества блоков
     */
    $('#numBlocks').bind('blur', function(){
        blocks.reStart();
    });


});