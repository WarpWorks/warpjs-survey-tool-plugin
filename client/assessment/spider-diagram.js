const _ = require('lodash');
const d3 = require('d3');

module.exports = ($, questionnaire) => {
    console.log('questionnaire', questionnaire);
    const width = 932;
    const radius = width / 2;
    const questionnaireChildren = _.map(questionnaire._embedded.categories, (category) => {
        const categoryChildren = _.map(category._embedded.questions, (question) => {
            return {name: question.name};
        });

        return {name: category.name, children: categoryChildren};
    });

    const data = {name: questionnaire.name, children: questionnaireChildren};
    const tree = (data) => {
        const root = d3.hierarchy(data);
        return d3.tree().size([2 * Math.PI, radius]).separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)(root);
    };

    const root1 = tree(data);
    const svg = d3.select('svg.spider');
    const autosize = function(svg) {
        const box = svg.getBBox();
        svg.setAttribute("viewBox", `${box.x} ${box.y} ${box.width} ${box.height}`);
    };

    svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(root1.links())
        .join("path")
        .attr("d", d3.linkRadial()
            .angle(d => d.x)
            .radius(d => d.y));
    const node = svg.append("g")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .selectAll("g")
        .data(root1.descendants().reverse())
        .join("g")
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90})translate(${d.y},0)`);
    node.append("circle")
        .attr("fill", d => d.children ? "#555" : "#999")
        .attr("r", 2.5);
    node.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => (d.x < Math.PI) === !d.children ? 6 : -6)
        .attr("text-anchor", d => (d.x < Math.PI) === !d.children ? "start" : "end")
        .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
        .text(d => d.data.name)
        .clone(true).lower()
        .attr("stroke", "white");

    autosize(svg.node());
};
