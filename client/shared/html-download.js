module.exports = ($, content, filename, contentType) => {
    const file = new Blob([JSON.stringify(content, null, 2)], { type: contentType || 'application/octet-stream' });
    const url = window.URL.createObjectURL(file);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    setTimeout(
        () => {
            window.URL.revokeObjectURL(url);
        },
        0
    );
};
