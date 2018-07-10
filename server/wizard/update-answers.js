// const debug = require('debug')('W2:plugin:imagemap-editor:server/root/get-current-data');
// const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
// const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');
// const createImageResource = require('./create-image-resource');

module.exports = (req, res) => {
    // const {domain, type, id} = req.params;

    // const warpCore = req.app.get(constants.appKeys.warpCore);

    // const pluginConfig = req.app.get(constants.appKeys.pluginConfig);
    // const Persistence = require(pluginConfig.persistence.module);
    // const persistence = new Persistence(pluginConfig.persistence.host, domain);
    const halResource = {
        _links: {
            self: {href: "/ipt/123"}
        },
        name: "IIoT System Assessment Tool (ISAT)",
        id: 123,
        content: "Questionnaire content",
        link: `${RoutesInfo.expand('W2:plugin:ipt:assets', {})}/${constants.assets.css}`,
        _embedded: {
            categories: [
                {
                    _links: {
                        self: {
                            href: "/ipt/123/category/1234"
                        }
                    },
                    name: "OT: Field-based assets/devices and interactions",
                    id: 1234,
                    content: "Category content",
                    isRepeatable: true,
                    _embedded: {
                        questions: [
                            {
                                _links: {
                                    self: {
                                        href: "/ipt/123/category/1234/question/12345"
                                    }
                                },
                                name: "General",
                                id: 12345,
                                content: "Question content"
                            },
                            {
                                _links: {
                                    self: {
                                        href: "/ipt/123/category/1234/question/123451"
                                    }
                                },
                                name: "Number of Assets supported by version 1.0",
                                id: 123451,
                                content: "Question content",
                                _embedded: {
                                    options: [
                                        {
                                            _links: {
                                                self: {
                                                    href: "/ipt/123/category/1234/question/123451/option/1234541"
                                                }
                                            },
                                            name: "100s",
                                            id: 1234541,
                                            value: 1
                                        },
                                        {
                                            _links: {
                                                self: {
                                                    href: "/ipt/123/category/1234/question/123451/option/1234542"
                                                }
                                            },
                                            name: "10.000s",
                                            id: 1234542,
                                            value: 2
                                        },
                                        {
                                            _links: {
                                                self: {
                                                    href: "/ipt/123/category/1234/question/123451/option/1234543"
                                                }
                                            },
                                            name: "100.000s",
                                            id: 1234543,
                                            value: 3
                                        },
                                        {
                                            _links: {
                                                self: {
                                                    href: "/ipt/123/category/1234/question/123451/option/1234544"
                                                }
                                            },
                                            name: "Millions",
                                            id: 1234544,
                                            value: 4
                                        }
                                    ]
                                }
                            },
                            {
                                _links: {
                                    self: {
                                        href: "/ipt/123/category/1234/question/12347"
                                    }
                                },
                                name: "Value of individual Asset",
                                id: 12347,
                                content: "Question content",
                                _embedded: {
                                    options: [
                                        {
                                            _links: {
                                                self: {
                                                    href: "/ipt/123/category/1234/question/12347/option/1234561"
                                                }
                                            },
                                            name: "< 100€",
                                            id: 123456,
                                            value: 1
                                        },
                                        {
                                            _links: {
                                                self: {
                                                    href: "/ipt/123/category/1234/question/12347/option/1234562"
                                                }
                                            },
                                            name: "< 1.000€",
                                            id: 123456,
                                            value: 2
                                        },
                                        {
                                            _links: {
                                                self: {
                                                    href: "/ipt/123/category/1234/question/12347/option/1234563"
                                                }
                                            },
                                            name: "< 100.000€",
                                            id: 123456,
                                            value: 3
                                        },
                                        {
                                            _links: {
                                                self: {
                                                    href: "/ipt/123/category/1234/question/12347/option/1234564"
                                                }
                                            },
                                            name: ">= 100.000€",
                                            id: 123456,
                                            value: 4
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    _links: {
                        self: {
                            href: "/ipt/123/category/1235"
                        }
                    },
                    name: "IT: Enterprise Services & Backend",
                    id: 1235,
                    content: "Category content",
                    _embedded: {
                        questions: [
                            {
                                _links: {
                                    self: {
                                        href: "/ipt/123/category/1235/question/123450"
                                    }
                                },
                                name: "Field Dataflow",
                                id: 123450,
                                content: "Question content"
                            },
                            {
                                _links: {
                                    self: {
                                        href: "/ipt/123/category/1235/question/123459"
                                    }
                                },
                                name: "Scale: expected local data flows (per asset)",
                                id: 123459,
                                content: "Question content",
                                _embedded: {
                                    options: [
                                        {
                                            _links: {
                                                self: {
                                                    href: "/ipt/123/category/1235/question/123459/option/12345417"
                                                }
                                            },
                                            name: "<1,000 data objects",
                                            id: 12345417,
                                            value: 1
                                        },
                                        {
                                            _links: {
                                                self: {
                                                    href: "/ipt/123/category/1235/question/123459/option/12345428"
                                                }
                                            },
                                            name: "<10,000 data objects",
                                            id: 12345428,
                                            value: 2
                                        },
                                        {
                                            _links: {
                                                self: {
                                                    href: "/ipt/123/category/1235/question/123459/option/12345439"
                                                }
                                            },
                                            name: "<100,000 data objects",
                                            id: 12345439,
                                            value: 3
                                        },
                                        {
                                            _links: {
                                                self: {
                                                    href: "/ipt/123/category/1235/question/123459/option/12345440"
                                                }
                                            },
                                            name: "Millions",
                                            id: 12345440,
                                            value: 4
                                        }
                                    ]
                                }
                            },
                            {
                                _links: {
                                    self: {
                                        href: "/ipt/123/category/1234/question/123451"
                                    }
                                },
                                name: "Data volume / throughput per asset",
                                id: 123452,
                                content: "Question content",
                                _embedded: {
                                    options: [
                                        {
                                            _links: {
                                                self: {
                                                    href: "/ipt/123/category/1235/question/123452/option/12345611"
                                                }
                                            },
                                            name: "Minimal flow, up to 1Mbit/sec",
                                            id: 12345611,
                                            value: 1
                                        },
                                        {
                                            _links: {
                                                self: {
                                                    href: "/ipt/123/category/1235/question/123452/option/12345612"
                                                }
                                            },
                                            name: "Regular flow, up to 10 Mbit/sec",
                                            id: 12345612,
                                            value: 2
                                        },
                                        {
                                            _links: {
                                                self: {
                                                    href: "/ipt/123/category/1235/question/123452/option/12345613"
                                                }
                                            },
                                            name: "Substantial flow, up to 100 Mbit/sec",
                                            id: 12345613,
                                            value: 3
                                        },
                                        {
                                            _links: {
                                                self: {
                                                    href: "/ipt/123/category/1235/question/123452/option/12345614"
                                                }
                                            },
                                            name: "High volume flow, more than 100 Mbit/sec",
                                            id: 12345614,
                                            value: 4
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        }
    };
    return res.status(200)
        .header('Content-Type', constants.HAL_CONTENT_TYPE)
        .send(JSON.stringify(halResource));

    // return Promise.resolve()
    //     .then(() => warpCore.getDomainByName(domain))
    //     .then((schema) => schema.getEntityByName(type))
    //     .then((entity) => Promise.resolve()
    //         .then(() => warpjsUtils.createResource(req, {
    //             domain,
    //             type,
    //             id,
    //             docLevel: req.body.warpjsDocLevel
    //         }))
    //         .then((resource) => Promise.resolve()

    //             // For the css
    //             .then(() => resource.link('css', `${RoutesInfo.expand('W2:plugin:imagemap-editor:assets', {})}/${constants.assets.css}`))

    //             .then(() => entity.getInstance(persistence, id))
    //             .then((instance) => Promise.resolve()
    //                 .then(() => warpjsUtils.docLevel.getData(persistence, entity, instance, req.body.warpjsDocLevel))
    //                 .then((docLevelData) => createImageResource(persistence, docLevelData.model, docLevelData.instance, req.body.warpjsDocLevel))
    //                 .then((imageResource) => resource.embed('images', imageResource))
    //             )
    //             .then(() => warpjsUtils.sendHal(req, res, resource, RoutesInfo))
    //         )
    //     )
    //     .catch((err) => {
    //         console.error("server/root/get-current-data: err:", err);
    //         throw err;
    //     })
    //     .finally(() => persistence.close())
    // ;
};
