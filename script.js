// create the datTable variable
var dataTable = dc.dataTable("#dc-data-table")


//Load the data and set the markers on the map
d3.tsv("data.tsv", function(data) {
  drawMarkerArea(data);
});

//The markers filter on everything, so the curly brace below closes after everything else.
function drawMarkerArea(data) {
  var groupname = "marker-select";


//set the crossfilter parameters (it loads all the data and then filters in the browser, so it doesn't need to query the dataset each time, which is why it's so fast)
  var xf = crossfilter(data);
  var all = xf.groupAll();

  dc.dataCount("#dc-data-count", groupname)
        .dimension(xf)
        .group(all);

  var byAgency = xf.dimension(function(d) { return d.org; });
  var byAgencyGroup = byAgency.group().reduceCount();

  var bySector = xf.dimension(function(d) { return d.sector; });
  var bySectorGroup = bySector.group().reduceCount();

  var byCountry = xf.dimension(function(d) { return d.country; });
  var byCountryGroup = byCountry.group().reduceCount();

  var byLocation = xf.dimension(function(d) { return d.loc; });
  var byLocationGroup = byLocation.group().reduceCount();

  var activities = xf.dimension(function(d) { return d.geo; });
  var activitiesGroup = activities.group().reduceCount();

  var tableData = crossfilter(data);
  var all = tableData.groupAll();
  var dimension = tableData.dimension(function (d) {
    return d.org;
  });

// Activity Locations; filter by zoom
  dc.leafletMarkerChart("#map .map", groupname)
      .dimension(activities)
      .group(activitiesGroup)
      .width(400)
      .height(390)
      .center([51,0])
      .zoom(5)
      .cluster(true)
      .filterByArea(true)
      .renderPopup(false)
      .popup(function (d, marker) {
        return d.org;
      });
      // .brushOn(true);

//Agency (Who). Change the colour in line 67
var agencyChart = dc.rowChart("#Agency .Agency", groupname)

agencyChart.margins({top: 5, left: 10, right: 10, bottom: 50})
      .width(200)
      .height(400)
      .dimension(byAgency)
      .colors(["cadetblue"])
      .group(byAgencyGroup)
      .title(function (d){
            return d.value;
            })
      .ordering(function(d) { return -d.value; })
      .elasticX(true)
      .xAxis().ticks(2);

//Sector(What). Change the colours in line 84
var sectorChart = dc.rowChart("#Sector .Sector", groupname)

sectorChart.margins({top: 5, left: 10, right: 10, bottom: 50})
      .width(200)
      .height(400)
      .dimension(bySector)
      .group(bySectorGroup)
      .colors([ "#9467bd", "#ff7f0e", "#2ca02c", "#d62728","#7f7f7f","#8c564b", "#bcbd22", "#e377c2", "#1f77b4"])
      .title(function(d){return d.value;})
      .elasticX(true)
      .xAxis().ticks(2);

//Region (Where). Change the colour in line 97
var locationChart = dc.rowChart("#Location .Location", groupname)

locationChart.margins({top: 5, left: 10, right: 10, bottom: 50})
      .width(200)
      .height(400)
      .dimension(byLocation)
      .group(byLocationGroup)
      .colors(["gray"])
      .title(function (d){return d.value;})
      .ordering(function(d) { return -d.value; })
      .elasticX(true)
      .xAxis().ticks(2);

//Data Table. to change the columns change 'd.Agency' to 'd.YourColumnHeader' in lines 110 to 116. Add more, delete columns and so on.
//To change the subheadings to a different category change 'd.Sector' to 'd.YourColumnHeader' in line 120. Or just delete lines 120 to 122 to remove subheadings.
//Ideally we should move to using HXL tags (e.g. #adm2) at some point.
var dataTable = dc.dataTable("#dc-data-table", groupname)

dataTable.dimension(activities)
    .group(function(d){return d.sector;})
    .size(75)
    .columns([
      function(d) {return d.blank;},
      function(d) {return d.org;},
      function(d) {return d.country;},
      function(d) {return d.loc},
      function(d) {return d.indicator;},
      function(d) {return d.targ;},
      function(d) {return d.achieve;}
    ])
    .sortBy(function (d) {
      return d.Sector;
    })
    .order(d3.ascending);

//Reset All button - resets all filters in the crossfilter
$('#reset').on('click', function (){
  dc.filterAll(groupname);
  dc.redrawAll(groupname);
  return false;
})

//Tell the browser to actually create or 'render' all of the above.
dc.renderAll(groupname);

//The axis name on the middle chart. Change the axis label in line 145.
function AddXAxis(chartToUpdate, displayText)
{
    sectorChart.svg()
                .append("text")
                .attr("class", "x-axis-label")
                .attr("text-anchor", "middle")
                .attr("x", chartToUpdate.width()/2)
                .attr("y", chartToUpdate.height()-3.5)
                .text(displayText);
}
AddXAxis(sectorChart, "Number of output indicators");
}
