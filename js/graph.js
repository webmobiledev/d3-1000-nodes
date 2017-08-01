//define Angular Module
angular.module('firstApplication', ['ngMaterial'])
  .controller('sliderController', sliderController);

//define controller
function sliderController($scope, $mdSidenav) {

  $scope.enableStandardGraph = true;
  $scope.enableHierarchyGraph = true;
  $scope.degree =  0;             //slider variable
  $scope.pName = [];           //dropdown variable
  $scope.linkCounts = [];      //number of link per each node
  $scope.nodes = [];
  $scope.links = [];
  $scope.selectedName = "All";    //selected id when select dropdown
  $scope.opacity = 0.2;     //opacity value when mouseover
  $scope.enableSelectOver = true;
  $scope.enableSliderOver = true;
  $scope.circleIds = [];
  $scope.ids = [];
  $scope.maxDegree = 0;
  $scope.voice = "";
  $scope.label = "Show";
  $scope.checked = true;
  $scope.firstDisplay = true;
  $scope.radioType = "Agents";
  $scope.zoom = 4;
  $scope.initZoom = 4;
  $scope.optionState = true;

  //voice recognition function
  $scope.recognition = function() {

    $(".btn-record i").attr("class", "fa fa-microphone");
    $(".btn-record i").css("color", "red");
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = function(event) {
      $scope.voice = (event.results[0])[0].transcript;
      $scope.$apply();
      console.log($scope.voice);
    }
    recognition.start();
  }

  $scope.optionPanel = function() {
    if ($scope.optionState) {
      $(".btn-hide-option i").removeClass("fa-angle-double-left");
      $(".btn-hide-option i").addClass("fa-angle-double-right");
      $scope.optionState = false;
      $(".widget").animate({right:"-10px"}, 500);
    } else {
      $(".btn-hide-option i").addClass("fa-angle-double-left");
      $(".btn-hide-option i").removeClass("fa-angle-double-right");
      $scope.optionState = true;
      $(".widget").animate({right:"-24%"}, 500);
    }
  }

  $scope.showLabel = function() {
    if (!$scope.checked) {
      $scope.checked = true;
      $scope.label = "Show";
      $(".label").show();
    } else {
      $scope.checked = false;
      $scope.label = "Hide";
      $(".label").hide();          
    }
    if ($scope.firstDisplay) {
      $scope.$apply();  
    }
    $scope.firstDisplay = false;
  }

  $scope.showStandardGraph = function() {
    $.loadScript('https://d3js.org/d3.v4.min.js', function() {
      if ($scope.enableStandardGraph && $scope.enableSelectOver) {
        d3.selectAll("svg").remove();
        $scope.drawStandardGraph();
        setTimeout($scope.showLabel, 1000);
        $scope.enableStandardGraph = false;
        $scope.enableHierarchyGraph = true;
      } else if ($scope.enableStandardGraph && !$scope.enableSelectOver) {
        $scope.enableSliderOver = true;
        $scope.enableSelectOver = true;          
        $scope.exit_highlight();
        $scope.enableStandardGraph = false;
        $scope.enableHierarchyGraph = true;
      }
    });       
  }

  $scope.showHierarchyGraph = function() {
    $.loadScript('https://d3js.org/d3.v3.min.js', function() {
      if ($scope.enableHierarchyGraph) {
        d3.selectAll("svg").remove();
        $scope.drawHierarchyGraph();
        $scope.enableHierarchyGraph = false;
        $scope.enableStandardGraph = true;
        $scope.enableSelectOver = true;       
      } 
    });    
  }

  $scope.showStandardGraph();

  //dropdown change function
  $scope.dropdownChange = function(){
    var selectedNode = {};
    for(var i = 0 ; i < $scope.nodes.length ; i ++){
      if ($scope.nodes[i].id == $scope.selectedName) {
        selectedNode = $scope.nodes[i];
        break;
      }
    }
    if ($scope.selectedName == "All") {
      $scope.enableSelectOver = true;
      $scope.enableSliderOver = true;
      $scope.exit_highlight();
    } else {
      $scope.enableSelectOver = false;
      $scope.set_highlight(selectedNode);
    }
  }

  //slider change function
  $scope.sliderChange = function(){
    $scope.enableSelectOver = true;
    if ($scope.degree == 0 ) {
      $scope.enableSliderOver = true;
    } else {
      $scope.enableSliderOver = false;
    }
    $scope.ids = [];
    $scope.circleIds = [];
    for(var i = 0 ; i < $scope.linkCounts.length ; i ++){
      if ($scope.linkCounts[i].count >= $scope.degree) {
        $scope.ids.push($scope.linkCounts[i].id);
        $scope.circleIds.push($scope.linkCounts[i].id);
      }
    }
    for(var i = 0 ; i < $scope.links.length ; i ++){
      if ($scope.ids.indexOf($scope.links[i].source.id) >= 0 && $scope.ids.indexOf($scope.links[i].target.id) < 0) {
        $scope.circleIds.push($scope.links[i].target.id);
      }
    }
    $scope.slideShow($scope.ids);
  }

  $scope.drawStandardGraph = function() {
    var width = $(window).width(),
        height = $(window).height();

    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink()
          .id(function(d) { return d.id; })
          .distance(25)  )
        .force("charge", d3.forceManyBody().strength(-120).distanceMax(500))
        .force("links", d3.forceCenter(width / 2, height / 2));

    //get data from json and call drawfunction            
    d3.json("data/BankData_v2.json", function(error, data){
      drawGraph(getGraphData(data));
    });

    //draw function
    function drawGraph(data) {
      var x = [], y = [], radius = 0;
      console.log("No.of Nodes: "+data.nodes.length);
      if (data.nodes.length > 10) {
        radius = 10;
      } if (data.nodes.length > 100) {
        radius = 5;
      } if (data.nodes.length > 1000) {
        radius = 3;
      } if (data.nodes.length > 10000) {
        radius = 2;
      }
      var svg = d3.select("body")
        .append("svg")
        .datum(data)
        .attr("class", "stand-graph")
        .attr("width", width)
        .attr("height", height);

      //create total dragable g  
      var dragG = svg.append("g")
        .attr("transform", "translate(0, 0)")
        .call(d3.drag()
          .on("start", totalDragstarted)
          .on("drag", totalDragged)
          .on("end", totalDragended));

      //define arrow
      var defs = svg.append("defs");
      var arrows = defs.selectAll("marker")
        .data(["end", "end-active"])
        .enter().append("marker")
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0, -5L10, 0L0, 5");
      defs.select("#end").attr("class", "arrow");
      defs.select("#end-active").attr("class", "arrow-active");
  
      //define zoom
      var _zoom = d3.zoom()
        .scaleExtent([1 / 16, 16])
        .on("zoom", function() {
          d3.select("g").attr("transform", d3.event.transform);
        });
      svg.call(_zoom);

      //add line into g
      var link = dragG.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(data.links)
        .enter().append("line")
          .attr("class", "link")
          .attr("id", function(d, i) { return "link" + i; })
          .attr("stroke-width", 1)
          .attr("marker-end", "url(#end)");
      
      var edgepaths = dragG.selectAll(".edgepath")
          .data(data.links)
          .enter()
          .append('path')
          .attr("class", "edgepath")
          .attr("fill-opacity", 0)
          .attr("stroke-opacity", 0)
          .attr("fill", "blue")
          .attr("stroke", "red")
          .attr("id", function(d, i) {
            return "edgepath" + i;
          });

      var edgelabels = dragG.selectAll(".edgelabel")
          .data(data.links)
          .enter()
          .append('text')
          .attr("class", "edgelabel")
          .attr("id", function(d, i){return 'edgelabel'+i})
          .attr("dx", 80)
          .attr("dy", 0)
          .attr("font-size", 10)
          .attr("fill", "#aaa");

      var label = edgelabels.append('textPath')
          .attr("class", "label")
          .attr('xlink:href',function(d,i) {return '#edgepath'+i})
          .style("pointer-events", "none")
          .text(function(d,i){return 'w'+i});

      //add node into g
      var node = dragG.selectAll("g")
        .data(data.nodes)
        .enter().append("g")
        .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

      //add text to node
      var text = node.append("text")
        .attr("class", "text");

      //add circle to node
      var circle = node.append("circle")
        .attr("class", "circle")
        .attr("r", radius)
        .attr("fill", function(d) { return color(d.group); })
        .on("mouseover", function(d){ 
            if ($scope.enableSelectOver) {
              $scope.set_highlight(d);
              d3.select(this).style("cursor", "pointer");
            }
          })
        .on("mouseout", function(d){ 
            if ($scope.enableSelectOver) {
              d3.select(this).style("cursor", "");
              $scope.exit_highlight(d);
            }
          })
        .on("click", function(d){
            $scope.enableSelectOver = false;
            $scope.enableStandardGraph = true;
          });
      //add title to circle
      circle.append("title")
        .text(function(d) { return d.group; });

      //define mouse over function
      var linkedByIndex = {};
      data.links.forEach(function(d) {
          linkedByIndex[d.source + "," + d.target] = 1;
      });

      function isConnected(a, b) {
        return linkedByIndex[a.id + "," + b.id] || linkedByIndex[b.id + "," + a.id] || a.id == b.id;
      }

      $scope.set_highlight = function(d) {
        text.attr("class", function(o) {
          return isConnected(d, o) ? "text-active" : "text";
        })
        circle.attr("class", function(o) {
          if (d.id == o.id) {
            this.setAttribute("stroke", "maroon");
            this.setAttribute("stroke-width", radius + 3);
          } else {
            this.setAttribute("stroke", "#ffffff");
            this.setAttribute("stroke-width", 1.5);
          }
          this.setAttribute("opacity", isConnected(d, o) ? 1 : 0);
          return isConnected(d, o) ? "circle-active" : "circle";
        });
        link.attr("marker-end", function(o) {
          this.setAttribute("opacity", isLinkForNode(d, o) ? $scope.opacity : 0);
          return isLinkForNode(d, o) ? "url(#end-active)" : "url(#end)";
        });
        link.attr("class", function(o) {
          this.setAttribute("opacity", isLinkForNode(d, o) ? $scope.opacity : 0);
          return isLinkForNode(d, o) ? "link-active" : "link";
        });
        label.attr("class", function(o) {
          this.setAttribute("opacity", isLinkForNode(d, o) ? $scope.opacity : 0);
          return isLinkForNode(d, o) ? "label-active" : "label";
        });
      }
      function isLinkForNode(node, link){
        return link.source.id == node.id || link.target.id == node.id;
      }
      $scope.exit_highlight = function(d) {
        if ($scope.enableSliderOver && $scope.enableSelectOver) {
          circle.attr("class", "circle")
            .attr("opacity", 1);
          link.attr("class", "link")
            .attr("opacity", 1);
          link.attr("marker-end", "url(#end)")
            .attr("opacity", 1);
          label.attr("class", "label")
            .attr("opacity", 1);
          text.attr("class", "text");            
        } else if ($scope.enableSelectOver && !$scope.enableSliderOver) {
          $scope.slideShow($scope.ids);
        }
      }

      $scope.slideShow = function(ids) {
        circle.attr("class", function(o) {
          this.setAttribute("opacity", isContained($scope.circleIds, o.id) ? 1 : 0);
          return "circle";
        });
        link.attr("marker-end", function(o) {
          this.setAttribute("opacity", isContained(ids, o.source.id) || isContained(ids, o.target.id) ? 1 : 0);
          return "url(#end)";
        });
        link.attr("class", function(o) {
          this.setAttribute("opacity", isContained(ids, o.source.id) || isContained(ids, o.target.id) ? 1 : 0);
          return "link";
        });
        label.attr("class", function(o) {
          this.setAttribute("opacity", isContained(ids, o.source.id) || isContained(ids, o.target.id) ? 1 : 0);
          return "label";
        });
        text.attr("class", "text");
      }
      function isContained(ids, id) {
        return ids.indexOf(id) >= 0 ? true : false;
      }

      //draw all
      simulation.nodes(data.nodes)
          .on("tick", ticked);
      simulation.force("link")
          .links(data.links);
      function ticked() {
        // text
        //   .attr("x", function(d) { return d.x + 10; })
        //   .attr("y", function(d) { return d.y; })
        //   .attr("font-size", 12)
        //   .text(function(d) { return d.pname; });  
        link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
        circle
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
        // edgepaths.attr('d', function(d) { 
        //   var path='M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y;
        //   return path;
        // });       
        // edgelabels.attr('transform',function(d,i){
        //   if (d.target.x<d.source.x){
        //     bbox = this.getBBox();
        //     rx = bbox.x+bbox.width/2;
        //     ry = bbox.y+bbox.height/2;
        //     return 'rotate(180 '+rx+' '+ry+')';
        //   }
        //   else {
        //     return 'rotate(0)';
        //   }
        // });
      }

      //draggable functions for individual nodes
      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.1).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }
      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
      }

      //draggable functions for total graph
      function totalDragstarted(d) {
        d3.select(this).raise().classed("active", true);
        $(".stand-graph").css("cursor", "pointer");
      }
      function totalDragged(d) {
        d3.select(this).select("rect")
          .attr("x", d.x = d3.event.x)
          .attr("y", d.y = d3.event.y);
        $(".stand-graph").css("cursor", "pointer");
      }
      function totalDragended(d) {
        d3.select(this).classed("active", false);
        $(".stand-graph").css("cursor", "");
      }

      //zoom events when click zoom buttons
      $scope.zoomSlider = function() {
        _zoom.scaleBy(svg, Math.pow(1.5, $scope.zoom - $scope.initZoom));
        $scope.initZoom = $scope.zoom;
      }
    }

    
  }
$scope.drawHierarchyGraph = function () {
      var width = $(window).width(),
          height = $(window).height(),
          radius = 6;

      var fill = d3.scale.category20();

      var force = d3.layout.force()
          .charge(-120)
          .linkDistance(30)
          .size([width, height]);

      var svg = d3.select("body").append("svg")
          .attr("class", "hierarchy")
          .attr("width", width)
          .attr("height", height);

      d3.json("data/graph.json", function(error, json) {
        if (error) throw error;

        var link = svg.selectAll("line")
            .data(json.links)
          .enter().append("line");

        var node = svg.selectAll("circle")
            .data(json.nodes)
          .enter().append("circle")
            .attr("r", radius - .75)
            .style("fill", function(d) { return fill(d.group); })
            .style("stroke", function(d) { return d3.rgb(fill(d.group)).darker(); })
            .call(force.drag);

        force
            .nodes(json.nodes)
            .links(json.links)
            .on("tick", tick)
            .start();

        function tick(e) {
          var k = 6 * e.alpha;

          // Push sources up and targets down to form a weak tree.
          link
              .each(function(d) { d.source.y -= k, d.target.y += k; })
              .attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });

          node
              .attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; });

        }
      });
    }
  //function that get useful data from json data 
  function getGraphData(data) {
    for(var i = 0 ; i < data.results[0].data.length ; i ++)
    {
      if(data.results[0].data[i].graph)
      {
        for(var j = 0 ; j < 2 ; j ++)
        {
          var flag = false;
          for(var k = 0 ; k < $scope.nodes.length ; k ++)
          {
            if ($scope.nodes[k].id == data.results[0].data[i].graph.nodes[j].id) {
              flag = true;
              break;
            }
          }
          if (!flag) {
            var name = '';
            if (data.results[0].data[i].graph.nodes[j].labels[0] == "RNODE") {
              name = data.results[0].data[i].graph.nodes[j].properties.rName;
            } else if (data.results[0].data[i].graph.nodes[j].labels[0] == "ANODE") {
              name = data.results[0].data[i].graph.nodes[j].properties.aName;
            }
            $scope.nodes.push({"id": data.results[0].data[i].graph.nodes[j].id, "group":data.results[0].data[i].graph.nodes[j].labels[0], "pname": name});
            $scope.pName.push({"id": data.results[0].data[i].graph.nodes[j].id, "pname": name});
          }
        }
        $scope.links.push({"source": data.results[0].data[i].graph.relationships[0].startNode, "target": data.results[0].data[i].graph.relationships[0].endNode, "value": data.results[0].data[i].graph.relationships[0].type});
      }
    }

    //remove node that has no any child node
    for(var i = 0 ; i < $scope.pName.length ; i ++){
      var count = 0;
      for(var j = 0 ; j < $scope.links.length ; j ++){
        if ($scope.pName[i].id == $scope.links[j].source){
          count ++;
        }
      }
      $scope.linkCounts.push({id: $scope.pName[i].id, count: count});
    }
    var pnameTemp = [];
    for(var i = 0 ; i < $scope.pName.length ; i ++){
      var flag = true;
      for(var j = 0 ; j < $scope.linkCounts.length ; j ++){
        if (Object.values($scope.linkCounts[j])[1] == 0 && Object.values($scope.linkCounts[j])[0] == $scope.pName[i].id) {
          flag = false;
          break;
        }
      }
      if (flag) {
        pnameTemp.push($scope.pName[i]);
      }
    }

    $scope.pName = [];
    $scope.pName.push({"id": "All", "pname": "All"});
    for(var i = 0 ; i < pnameTemp.length ; i ++){
      $scope.pName.push(pnameTemp[i]);
    }
    var name = '';
    if (data.results[0].data[0].graph.nodes[0].labels[0] == "RNODE") {
      name = data.results[0].data[0].graph.nodes[0].properties.rName;
    } else if (data.results[0].data[0].graph.nodes[0].labels[0] == "ANODE") {
      name = data.results[0].data[0].graph.nodes[0].properties.aName;
    }
    $scope.nodes.push({"id": data.results[0].data[0].graph.nodes[0].id, "group":data.results[0].data[0].graph.nodes[0].labels[0], "pname":name});
    $scope.maxDegree = Math.sqrt($scope.nodes.length);
    $scope.$apply();
    return {"nodes": $scope.nodes, "links": $scope.links};
  }
}