module.exports = ($, imageMapValues) => {
    const imageMapCoords = imageMapValues.split(',');
    const topLeft = document.createElement('div');
    $(topLeft).addClass('image-map-overlay top-left')
        .css({
            left: '0px',
            top: '0px',
            width: imageMapCoords[0] + 'px',
            height: imageMapCoords[1] + 'px'
        })
        .appendTo($('.image-map-img-container'));

    const topMid = document.createElement('div');
    $(topMid).addClass('image-map-overlay top-mid')
        .css({
            left: imageMapCoords[0] + 'px',
            top: '0px',
            width: (imageMapCoords[2] - imageMapCoords[0]) + 'px',
            height: imageMapCoords[1] + 'px'
        })
        .appendTo($('.image-map-img-container'));

    const topRight = document.createElement('div');
    $(topRight).addClass('image-map-overlay top-right')
        .css({
            left: imageMapCoords[2] + 'px',
            top: '0px',
            width: 'calc(100% - ' + imageMapCoords[2] + 'px)',
            height: imageMapCoords[1] + 'px'
        })
        .appendTo($('.image-map-img-container'));

    const midRight = document.createElement('div');
    $(midRight).addClass('image-map-overlay mid-right')
        .css({
            left: imageMapCoords[2] + 'px',
            top: imageMapCoords[1] + 'px',
            width: 'calc(100% - ' + imageMapCoords[2] + 'px)',
            height: (imageMapCoords[3] - imageMapCoords[1]) + 'px'
        })
        .appendTo($('.image-map-img-container'));

    const midLeft = document.createElement('div');
    $(midLeft).addClass('image-map-overlay mid-left')
        .css({
            left: '0px',
            top: imageMapCoords[1] + 'px',
            width: imageMapCoords[0] + 'px',
            height: (imageMapCoords[3] - imageMapCoords[1]) + 'px'
        })
        .appendTo($('.image-map-img-container'));

    const bottomLeft = document.createElement('div');
    $(bottomLeft).addClass('image-map-overlay bottom-left')
        .css({
            left: '0px',
            top: imageMapCoords[3] + 'px',
            width: imageMapCoords[0] + 'px',
            height: 'calc(100% - ' + imageMapCoords[3] + 'px)'
        })
        .appendTo($('.image-map-img-container'));

    const bottomMid = document.createElement('div');
    $(bottomMid).addClass('image-map-overlay bottom-mid')
        .css({
            left: imageMapCoords[0] + 'px',
            top: imageMapCoords[3] + 'px',
            width: (imageMapCoords[2] - imageMapCoords[0]) + 'px',
            height: 'calc(100% - ' + imageMapCoords[3] + 'px)'
        })
        .appendTo($('.image-map-img-container'));

    const bottomRight = document.createElement('div');
    $(bottomRight).addClass('image-map-overlay bottom-right')
        .css({
            left: imageMapCoords[2] + 'px',
            top: imageMapCoords[3] + 'px',
            width: 'calc(100% - ' + imageMapCoords[2] + 'px)',
            height: 'calc(100% - ' + imageMapCoords[3] + 'px)'
        })
        .appendTo($('.image-map-img-container'));
    const mapBorder = document.createElement('div');
    $(mapBorder).addClass('image-map-border')
        .css({
            left: imageMapCoords[0] + 'px',
            top: imageMapCoords[1] + 'px',
            width: (imageMapCoords[2] - imageMapCoords[0]) + 'px',
            height: (imageMapCoords[3] - imageMapCoords[1]) + 'px'
        })
        .appendTo($('.image-map-img-container'));
};
