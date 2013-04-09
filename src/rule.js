cubism_contextPrototype.rule = function() {
  var context = this,
      metric = cubism_identity;

  function rule(selection) {
    var id = ++cubism_id;

    var line = selection.append("div")
        .datum({id: id})
        .attr("class", "line")
        .call(cubism_ruleStyle);

    var message = selection.append("span")
        .attr("class", "message")
        .style("position", "absolute");

    var markers = {};

    selection.each(function(d, i) {
      var that = this,
          id = ++cubism_id,
          metric_ = typeof metric === "function" ? metric.call(that, d, i) : metric;

      if (!metric_) return;

      function change(start, stop) {
        var values = [];

        markers = {};
        for (var i = 0, n = context.size(); i < n; ++i) {
          var event = metric_.valueAt(i);
          if (event) {
            values.push({i: i});
            markers[i] = event;
          }
        }

        var lines = selection.selectAll(".metric").data(values);
        lines.exit().remove();
        lines.enter().append("div")
            .attr("class", "metric line")
            .text(function(d) {return d.event;})
            .call(cubism_ruleStyle);
        lines.style("left", cubism_ruleLeft);

      }

      context.on("change.rule-" + id, change);
      metric_.on("change.rule-" + id, change);
    });

    context.on("focus.rule-" + id, function(i) {
      message.text(markers[i] || "");
      line.datum().i = i;
      line.style("display", i == null ? "none" : null)
          .style("left", i == null ? null : cubism_ruleLeft);
    });
  }

  rule.remove = function(selection) {

    selection.selectAll(".line")
        .each(remove)
        .remove();

    function remove(d) {
      context.on("focus.rule-" + d.id, null);
    }
  };

  rule.metric = function(_) {
    if (!arguments.length) return metric;
    metric = _;
    return rule;
  };

  return rule;
};

function cubism_ruleStyle(line) {
  line
      .style("position", "absolute")
      .style("top", 0)
      .style("bottom", 0)
      .style("width", "1px")
      .style("pointer-events", "none");
}

function cubism_ruleLeft(d) {
  return d.i + "px";
}
