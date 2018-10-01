module.exports = ($, content, filename, contentType) => {
    const file = new Blob([JSON.stringify(content, null, 2)], { type: contentType || 'application/octet-stream' });
    const url = window.URL.createObjectURL(file);

    const a = document.createElement('a');
    a.style = 'display: none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // setTimeout(
    //     () => {
    //         document.body.removeChild(a);
    //         window.URL.revokeObjectURL(url);
    //     },
    //     0
    // );
};
