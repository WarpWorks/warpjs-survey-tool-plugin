const cloneDeep = require('lodash');
const officegen = require('officegen');
// const path = require('path');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');
// const repoRoot = path.dirname(require.resolve('../../package.json'));
const utils = require('./../utils');

module.exports = async (req, res) => {
    const data = JSON.parse(req.body.data);
    const details = data.details;
    const values = data.values;
    const title = req.body.title;
    const pluginInfo = utils.getPluginInfo(req);
    const domainModel = await req.app.get(constants.appKeys.warpCore).getDomainByName(pluginInfo.domain);
    const config = cloneDeep(pluginInfo.config);
    // TODO: Don't hard code adminConfig
    config.adminConfig = {
        type: "AdminConfiguration",
        id: "5ba9ca96ffe8c80011f1993f"
    };
    const customMessages = await warpjsUtils.server.getCustomMessagesByPrefix(pluginInfo.persistence, config, domainModel, 'Surveytool');

    res.writeHead(200, {
        "Content-Type": "application/vnd.openxmlformats-officedocument.documentml.document",
        'Content-disposition': 'attachment; filename=survey-' + title.split(' ').join('_') + '.docx'
    });

    const docx = officegen({
        type: 'docx',
        orientation: 'portrait',
        pageMargins: { top: 1000, left: 1000, bottom: 1000, right: 1000 }
    });

    docx.on('error', (err) => {
        console.log(err);
    });

    const createText = (string, css) => {
        let customMessage = docx.createP();
        string = string.replace(/&ldquo;|&rdquo;|&lsquo;|&rsquo;/g, '`');
        string = string.replace(/&nbsp;/g, ' ');
        string = string.replace(/&middot;/g, '●');
        const split = string.split("<br />");
        for (var x of split) {
            customMessage.addText(x, css);
            customMessage.addLineBreak();
        }
    };

    if (customMessages && Object.keys(customMessages).length) {
        createText(customMessages.SurveytoolWord1, {font_face: 'Arial', bold: true, font_size: 28});
        createText(customMessages.SurveytoolWord2, {font_face: 'Arial', italic: true, font_size: 11});
        createText(customMessages.SurveytoolWord3, {font_face: 'Arial', color: '3277b3', font_size: 16});
        createText(customMessages.SurveytoolWord4, {font_face: 'Arial', font_size: 11});
        createText(customMessages.SurveytoolWord5, {font_face: 'Arial', color: '3277b3', font_size: 16});
        createText(customMessages.SurveytoolWord6, {font_face: 'Arial', font_size: 11});
        createText(customMessages.SurveytoolWord7, {font_face: 'Arial', color: '3277b3', font_size: 16});
        createText(customMessages.SurveytoolWord8, {font_face: 'Arial', font_size: 11});
        createText(customMessages.SurveytoolWord9, {font_face: 'Arial', color: '3277b3', font_size: 16});
        createText(customMessages.SurveytoolWord10, {font_face: 'Arial', font_size: 11});
        createText(customMessages.SurveytoolWord11, {font_face: 'Arial', color: '3277b3', font_size: 16});
        createText(customMessages.SurveytoolWord12, {font_face: 'Arial', font_size: 11});
        createText(customMessages.SurveytoolWord13, {font_face: 'Arial', color: '3277b3', font_size: 16});
        createText(customMessages.SurveytoolWord14, {font_face: 'Arial', font_size: 11});
        createText(customMessages.SurveytoolWord15, {font_face: 'Arial', color: '3277b3', font_size: 16});
        createText(customMessages.SurveytoolWord16, {font_face: 'Arial', font_size: 11});
        createText(customMessages.SurveytoolWord17, {font_face: 'Arial', color: '3277b3', font_size: 16});
        createText(customMessages.SurveytoolWord18, {font_face: 'Arial', font_size: 11});
        createText(customMessages.SurveytoolWord19, {font_face: 'Arial', color: '3277b3', font_size: 16});
        createText(customMessages.SurveytoolWord20, {font_face: 'Arial', font_size: 11});
    }

    // let logo = docx.createP();
    // logo.addImage(path.resolve(repoRoot, 'assets', 'images', 'IIC-logo.png'), {cy: 40, cx: 98});
    // let mainTitle = docx.createP();
    // mainTitle.addText('IIC Project Explorer', {font_face: 'Arial', bold: true, font_size: 28});
    // let projectTitle = docx.createP();
    // projectTitle.addText(title, {font_face: 'Arial', bold: true, font_size: 26});
    let projectDescription = docx.createP();
    projectDescription.addText('This summary shows how your project is rated in the main IPT categories. For each category, the average score is shown. In general, low score means few problems to be expected, high score means that in this category has a very high level of complexity and potential risks.', {font_face: 'Arial', font_size: 12});

    if (values) {
        let summarySectionTitle = docx.createP();
        summarySectionTitle.addText('Summary Project Assessment', {font_face: 'Arial', bold: true, font_size: 16});
        const tableStyle = {
            tableColWidth: 4261,
            tableSize: 24,
            tableColor: "ada",
            tableAlign: "left",
            tableFontFamily: "Arial"
        };
        values.forEach((value) => {
            const summaryTable = [
                [{
                    val: "●",
                    opts: {
                        b: true,
                        color: "d5f5b3",
                        align: "center",
                        sz: '30',
                        shd: {
                            fill: "d5f5b3",
                            line: "cccccc"
                        }
                    }
                },
                {
                    val: "●",
                    opts: {
                        b: true,
                        color: "f6ffed",
                        align: "center",
                        sz: '30',
                        shd: {
                            fill: "f6ffed",
                            line: "cccccc"
                        }
                    }
                },
                {
                    val: "●",
                    opts: {
                        align: "center",
                        color: "fff9ed",
                        b: true,
                        sz: '30',
                        shd: {
                            fill: "fff9ed",
                            line: "cccccc"
                        }
                    }
                },
                {
                    val: "●",
                    opts: {
                        align: "center",
                        color: "fce3e3",
                        b: true,
                        sz: '30',
                        shd: {
                            fill: "fce3e3",
                            line: "cccccc"
                        }
                    }
                }],
                [{
                    val: "1",
                    opts: {
                        sz: '24',
                        color: "ffffff",
                        align: "center"
                    }
                },
                {
                    val: "2",
                    opts: {
                        sz: '24',
                        color: "ffffff",
                        align: "center"
                    }
                },
                {
                    val: "3",
                    opts: {
                        sz: '24',
                        color: "ffffff",
                        align: "center"
                    }
                },
                {
                    val: "4",
                    opts: {
                        sz: '24',
                        color: "ffffff",
                        align: "center"
                    }
                }]
            ];
            let categoryTitle = docx.createP();
            categoryTitle.addText(value.category, {font_face: 'Arial', bold: true, font_size: 12});
            const roundedAverage = Math.floor(parseInt(value.answerAverage, 10)) - 1;
            summaryTable[0][roundedAverage]['opts']['color'] = '7eba41';
            summaryTable[1][roundedAverage]['opts']['color'] = '000000';
            summaryTable[1][roundedAverage]['val'] = value.answerAverage;
            docx.createTable(summaryTable, tableStyle);
        });
    }

    if (details && details.data) {
        const detailTableStyle = {
            tableColWidth: 4261,
            tableSize: 24,
            tableColor: "ada",
            tableAlign: "left",
            tableFontFamily: "Arial"
        };
        const selectedColors = [
            '7eba41',
            '7eba41',
            'fcb830',
            'de2a2d'
        ];
        let detailSectionTitle = docx.createP();
        detailSectionTitle.addText('Summary Project Assessment', {font_face: 'Arial', bold: true, font_size: 16});

        details.data.forEach((detail) => {
            let categoryTitle = docx.createP();
            categoryTitle.addText(detail.category, {font_face: 'Arial', bold: true, font_size: 18});

            if (detail.comments) {
                let categoryComment = docx.createP();
                categoryComment.addText('Comment: ' + detail.comments, {font_face: 'Arial', font_size: 12});
            }

            detail.iterations.forEach((iteration) => {
                if (iteration.name) {
                    let iterationTitle = docx.createP();
                    iterationTitle.addText(iteration.name, {font_face: 'Arial', bold: true, font_size: 14});
                }

                if (iteration.questions) {
                    iteration.questions.forEach((question) => {
                        if (question.hasOptions) {
                            const detailTable = [
                                [
                                    {
                                        val: "●",
                                        opts: {
                                            b: true,
                                            color: "d5f5b3",
                                            align: "center",
                                            sz: '40',
                                            cellColWidth: 42,
                                            shd: {
                                                fill: "f0f0f0"
                                            }
                                        }
                                    },
                                    {
                                        val: "●",
                                        opts: {
                                            b: true,
                                            color: "f6ffed",
                                            align: "center",
                                            sz: '40',
                                            cellColWidth: 42,
                                            shd: {
                                                fill: "f0f0f0"
                                            }
                                        }
                                    },
                                    {
                                        val: "●",
                                        opts: {
                                            align: "center",
                                            color: "fff9ed",
                                            b: true,
                                            sz: '40',
                                            cellColWidth: 42,
                                            shd: {
                                                fill: "f0f0f0"
                                            }
                                        }
                                    },
                                    {
                                        val: "●",
                                        opts: {
                                            align: "center",
                                            color: "fce3e3",
                                            b: true,
                                            sz: '40',
                                            cellColWidth: 42,
                                            shd: {
                                                fill: "f0f0f0"
                                            }
                                        }
                                    },
                                    {
                                        val: question.name,
                                        opts: {
                                            align: "left",
                                            color: "000000",
                                            sz: '24',
                                            cellColWidth: 4261,
                                            shd: {
                                                fill: "f0f0f0"
                                            }
                                        }
                                    },
                                    {
                                        val: question.option,
                                        opts: {
                                            align: "right",
                                            color: "000000",
                                            sz: '24',
                                            cellColWidth: 4261,
                                            shd: {
                                                fill: "f0f0f0"
                                            }
                                        }
                                    }
                                ]
                            ];
                            if (question.position) {
                                detailTable[0][question.position - 1]['opts']['color'] = selectedColors[question.position - 1];
                            }

                            docx.createTable(detailTable, detailTableStyle);
                            docx.createP();
                        } else {
                            let questionTitle = docx.createP();
                            questionTitle.addText(question.name, {font_face: 'Arial', bold: true, font_size: 12});
                        }

                        if (question.comments) {
                            let questionComment = docx.createP();
                            questionComment.addText('Comment: ' + question.comments, {font_face: 'Arial', font_size: 12});
                        }
                    });
                }
            });
        });
    }

    docx.generate(res);
};
