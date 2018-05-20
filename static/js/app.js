/*

<Chan Feng> 2018-05-20 Rutgers Data Science - Interactive Visualizations and Dashboard


TODO:

1) Select box positions
2) Metadata viz
3) Grid lines in bubble chart

*/
url = '/names';
Plotly.d3.json(url, (error, data) => {
   if (error) return console.log(data);
   SELECT = document.getElementById("selDataset");
   data.forEach( sample => SELECT.add( new Option(sample) ));
});

// Store otu_ids so it can be reused
url = '/otu';
OTU_DICT = {};
Plotly.d3.json(url, (error, data) => {
   if (error) return console.log(data);
   data.forEach( (x, i) => OTU_DICT[i+1] = x );
});

sample = 'BB_940';
buildPiePlot(sample, true); // TODO change to SELECT value
buildBubblePlot(sample, true);
buildMetadata(sample, true);
buildGaugePlot(sample, true);

// Init = True, newPlot, otherwise restyle
// TODO: Fix Hover Text and lables.
function buildPiePlot(sample, init) {
    url="/samples/" + sample;

    Plotly.d3.json(url, (error, data) => {
        if (error) return console.log(data);
        labels = data[0]['otu_ids'].slice(0,10);
        values = data[0]['sample_values'].slice(0,10);
        hoverText = [];
        labels.forEach( l => hoverText.push(OTU_DICT[l]));
        var pieData = [{
            labels: labels,
            values: values,
            hovertext: hoverText,
            type: 'pie'
         }];

         var layout = {
            margin: {
                t: 0,
                l: 0,
                r: 0,
                b: 0,
            },
            //height: 400,
            //width: 500,
         }

        if (init) {
            Plotly.newPlot('pie', pieData, layout);
        } else {
            Plotly.restyle('pie', 'values', [values]);
            Plotly.restyle('pie', 'labels', [labels]);
            Plotly.restyle('pie', 'hovertext', [hoverText]);
        }

    });
}

function optionChanged(sample) {
    buildPiePlot(sample, false);
    buildBubblePlot(sample, false);
    buildMetadata(sample, false);
    buildGaugePlot(sample,false);
}

function buildBubblePlot(sample, init) {
    url="/samples/" + sample;

    Plotly.d3.json(url, (error, data) => {
        if (error) return console.log(data);
        x = data[0]['otu_ids'].slice(0,10);
        y = data[0]['sample_values'].slice(0,10);
        hoverText = [];
        x.forEach( l => hoverText.push(OTU_DICT[l]));
        var pieData = [{
            x: x,
            y: y,
            mode: 'markers',
            marker: {
                size: y,
                color: x,
            },
            hovertext: hoverText,
            hoverinfo: 'all',
            type: 'scatter'
         }];

         var layout = {
            margin: {
                t: 0,
                l: 50,
                r: 50,
                b: 0,
            },
            xaxis: {
                showgrid: true,
                gridwidth: 2,
            },
            yaxis: {
                showgrid: true,
                gridwidth: 2,
            },
            height: 400,
            hovermode: 'closest',
         }

        if (init) {
            Plotly.newPlot('bubble', pieData, layout);
        } else {
            Plotly.restyle('bubble', 'x', [x]);
            Plotly.restyle('bubble', 'y', [y]);
            Plotly.restyle('bubble', 'hovertext', [hoverText]);
        }
    });
}

function buildMetadata(sample, init) {
    Plotly.d3.json('/metadata/' + sample, (error, data) => {
        if (error) return console.log(data);
        var text = '';
        for (var key in data)
            text += key + ': ' + data[key] + '<br>';
        document.getElementById('metadata').innerHTML = text;
    });
}

function buildGaugePlot(sample, init) {
    var level; //  = 175;
    url = 'wfreq/' + sample;

    Plotly.d3.json(url, (error, data) => {
        if (error) return console.log(data);
        level = data;

        // Trig to calc meter point
        const MAX = 9;
        const PART = 9;
        const RADIUS = 0.5;
        const FIFTY = 100;

        var degrees = MAX - level;
        var radians = degrees * Math.PI / MAX;
        var x = RADIUS * Math.cos(radians);
        var y = RADIUS * Math.sin(radians);

        // Path: may have to change to create a better triangle
        var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
        var path = mainPath.concat(pathX,space,pathY,pathEnd);

        var data = [{
            type: 'scatter',
            x: [0],
            y:[0],
            marker: {size: 28, color:'850000'},
            showlegend: false,
            name: 'speed',
            text: level,
            hoverinfo: 'none',
         }, {
            values: [FIFTY/PART, FIFTY/PART, FIFTY/PART, FIFTY/PART, FIFTY/PART, FIFTY/PART, FIFTY/PART, FIFTY/PART, FIFTY/PART, FIFTY],
            rotation: 90,
            text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
            textinfo: 'text',
            textposition:'inside',
            marker: {colors:[
                         'rgba(255, 80, 0, .5)', 'rgba(160, 80, 0, .5)', 'rgba(90, 80, 0, .5)',
                         'rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)', 'rgba(170, 202, 42, .5)',
                          'rgba(202, 209, 95, .5)', 'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                         'rgba(255, 255, 255, 0)',
                         ]},
            //labels: ['151-180', '121-150', '91-120', '61-90', '31-60', '0-30', ''],
            hoverinfo: 'none',
            hole: .5,
            type: 'pie',
            showlegend: false,
        }];

        var layout = {
            shapes:[{
                type: 'path',
                path: path,
                fillcolor: '850000',
                line: {
                    color: '850000'
                }
            }],
            title: 'Scrubs per week',
            titlefont: {
                size: 14,
            },
            margin: {
                t: 50,
                l: 20,
                r: 20,
                b: 20,
            },
            //height: 400,
            //width: 500,
            xaxis: {
                zeroline:false,
                showticklabels:false,
                showgrid: false,
                range: [-1, 1]},
            yaxis: {
                zeroline:false,
                showticklabels:false,
                showgrid: false,
                range: [-1, 1]},
        };

        Plotly.newPlot('gauge', data, layout);
    });
}
