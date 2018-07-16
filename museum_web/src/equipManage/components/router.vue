<template id="router_template">

    <div id="tree-container" style="min-height: 1000px;">

    </div>

</template>

<script type="text/javascript">
    Vue.component('router-info', {
        template: '#router_template',
        props: [],
        data: function () {
            return {
                height: 1000,
            };
        },
        methods: {
            init: function (equip) {
                console.log(equip);

                var me = this;

                var i = 0,
                    duration = 750,
                    root;
                var width = $('.info-right').width() - 40, height = $('.info-left').height();
                if (height < 1000) {
                    height = 1000;
                }
                console.log(width, height);
                var tree = d3.layout.tree()
                    .size([height, width]);

                var diagonal = d3.svg.diagonal()
                    .projection(function (d) {
                        return [d.y, d.x];
                    });//设置连线点的变换器

                var svg = d3.select("#tree-container").append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr("transform", "translate(40,0)");

                $.get(API('/env/equipments/topologic/topo_tree') + '?sensor_no=' + equip.equip_no.slice(-11), function (flare) {
                    if (flare.error) {
                        me.$Message.error(flare.error);
                        return;
                    }
                    root = flare;
                    root.x0 = 0;
                    root.y0 = 0;

                    console.log(root);

                    function collapse(d) {
                        if (d.children) {
                            d._children = d.children;
                            if (_.isArray(d._children)) {
                                d._children.forEach(collapse);
                            }
                            // d.children = null;
                        }
                    }

                    root.children.forEach(collapse);
                    update(root);

                    function update(source) {
                        var nodes = tree.nodes(root).reverse(),
                            links = tree.links(nodes);

                        nodes.forEach(function (d) {
                            d.y = d.depth * 180;
                        });
                        // Update the nodes…
                        var node = svg.selectAll("g.node")
                            .data(nodes, function (d) {
                                return d.id || (d.id = ++i);
                            });

                        // Enter any new nodes at the parent's previous position.
                        var nodeEnter = node.enter().append("g")
                            .attr("class", "node")
                            .attr("transform", function (d) {
                                return "translate(" + source.y0 + "," + source.x0 + ")";
                            })
                            .on("click", click);

                        nodeEnter.append("circle")
                            .attr("r", 1e-6)
                            .style("fill", function (d) {
                                return d._children ? "lightsteelblue" : "#fff";
                            });

                        nodeEnter.append("text")
                            .attr("x", function (d) {
                                return d.children || d._children ? -10 : 10;
                            })
                            .attr("dy", ".35em")
                            .attr("text-anchor", function (d) {
                                return d.children || d._children ? "end" : "start";
                            })
                            .text(function (d) {
                                return d.name;
                            })
                            .style("fill-opacity", 1e-6);

                        // Transition nodes to their new position.
                        var nodeUpdate = node.transition()
                            .duration(duration)
                            .attr("transform", function (d) {
                                return "translate(" + d.y + "," + d.x + ")";
                            });

                        nodeUpdate.select("circle")
                            .attr("r", 4.5)
                            .style("fill", function (d) {
                                return d._children ? "lightsteelblue" : "#fff";
                            });

                        nodeUpdate.select("text")
                            .style("fill-opacity", 1);

                        // Transition exiting nodes to the parent's new position.
                        var nodeExit = node.exit().transition()
                            .duration(duration)
                            .attr("transform", function (d) {
                                return "translate(" + source.y + "," + source.x + ")";
                            })
                            .remove();

                        nodeExit.select("circle")
                            .attr("r", 1e-6);

                        nodeExit.select("text")
                            .style("fill-opacity", 1e-6);

                        // Update the links…
                        var link = svg.selectAll("path.link")
                            .data(links, function (d) {
                                return d.target.id;
                            });

                        // Enter any new links at the parent's previous position.
                        link.enter().insert("path", "g")
                            .attr("class", "link")
                            .attr("d", function (d) {
                                var o = {x: source.x0, y: source.y0};
                                return diagonal({source: o, target: o});
                            });

                        // Transition links to their new position.
                        link.transition()
                            .duration(duration)
                            .attr("d", diagonal);

                        // Transition exiting nodes to the parent's new position.
                        link.exit().transition()
                            .duration(duration)
                            .attr("d", function (d) {
                                var o = {x: source.x, y: source.y};
                                return diagonal({source: o, target: o});
                            })
                            .remove();

                        // Stash the old positions for transition.
                        nodes.forEach(function (d) {
                            d.x0 = d.x;
                            d.y0 = d.y;
                        });

                    }

                    function click(d) {
                        console.log(d);
                        if (d.children) {
                            d._children = d.children;
                            d.children = null;
                        } else {
                            d.children = d._children;
                            d._children = null;
                        }
                        update(d);
                    }

                });


            }
        }
    });
</script>