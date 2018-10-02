module.exports = ($, placeholder, message, buttons) => {
    const div = $('<div class="survey-tool-load-assessment-popup">');
    div.append($('<div class="survey-tool-load-assessment-popup-message">').text(message));
    if (buttons && buttons.length) {
        const btnGroup = $('<div class="btn-group">');
        buttons.forEach((button) => {
            btnGroup.append($(`<button type="button" class="btn btn-${button.btnClass}" data-survey-tool-action="${button.action}">${button.label}</button>`));
        });
        div.append(btnGroup);
    }

    $('.blue-button-container', placeholder).append(div);
    return div;
};
