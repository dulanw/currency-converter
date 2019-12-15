import { Component, OnInit, ViewChild, ElementRef, Renderer, Input } from '@angular/core';
import * as cytoscape from 'cytoscape'
import { RateNode } from '../CurrencyTypes';
import * as moment from 'moment'; // <-- for date time stuff

//declare var cytoscape: any;

@Component({
  selector: 'app-currency-graph',
  templateUrl: './currency-graph.component.html',
  styleUrls: ['./currency-graph.component.css']
})
export class CurrencyGraphComponent implements OnInit {

  @ViewChild('GraphContainer', { static: false }) 
  GraphContainer: ElementRef;
  
  CytoscapeGraph: cytoscape;

  constructor(private renderer : Renderer) { 
  }

  ngOnInit() {
  }

  ngAfterViewInit()
  {
    
    this.CytoscapeGraph = cytoscape({
      container: this.GraphContainer.nativeElement,
      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            'label': 'data(id)',
            'overlay-opacity': 0,
            'resize': 'none'
          }
        },
    
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle'
          }
        }
      ],
      layout: {
        name: 'preset'
      },
      zoomingEnabled: false,
      userZoomingEnabled: false,
      panningEnabled: false,
      //autolock: true,
      autoungrabify: true,
      autounselectify: true,
      boxSelectionEnabled: false,
    });

    //cy.nodes().ungrabify();
    //cy.zoomingEnabled(false);
  }

  //call refresh graph with the rate nodes
  RefreshGraph(RateHistory: RateNode[])
  {
    //let normalise = (val, max, min) => { return (val - min) / (max - min); }
    const scale = (num, in_min, in_max, out_min, out_max) => {
      return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    //sort it, no need to create another function since it needs to be done here once
    RateHistory.sort((a:RateNode, b:RateNode):number => {
      if (moment(a.Date,'MM-YYYY').isAfter(moment(b.Date, 'MM-YYYY'), 'day'))
      {
        return 1;
      }
      else
      {
        return 0;
      }
    });


    let GraphElements = [];

    //setting the y axis range, should the first point would be half way in the axis. unlikely that the currency rate would double over a 12 month period
    let MinY = Number.POSITIVE_INFINITY;
    let MaxY = Number.NEGATIVE_INFINITY;
    if (RateHistory.length > 0)
    { 
      for (let i = 0; i < RateHistory.length; i++) 
      {
        let TempRate = parseFloat((RateHistory[i].Sum/RateHistory[i].Num).toPrecision(4));
        if (TempRate < MinY) 
        {
          MinY = TempRate;
        }

        if (TempRate > MaxY)
        {
          MaxY = TempRate;
        }
      }
      
      //incase of rounding errors that cause the
      MinY *= 0.995;
      MaxY *= 1.005;
    }

    //#TODO instead of completely removing the nodes, change the
    this.CytoscapeGraph.remove('node')
    for (let i = 0; i < RateHistory.length; i++)
    {
      let Rate = RateHistory[i].Sum/RateHistory[i].Num;

      console.log(Rate);
      //make the nodes take up the full size of the screen
      let PosX = scale(i, RateHistory.length - 1, 0, 0.05, 0.95) * this.CytoscapeGraph.width();
      let PosY = this.CytoscapeGraph.height() - (scale(Rate, MaxY, MinY, 0.05, 0.95) * this.CytoscapeGraph.height());
      GraphElements.push(
        {
          data: {id: RateHistory[i].Date},
          grabbable: false,
          position: { x: PosX, y: PosY},
          label: RateHistory[i].Date + '1'
        });

      if (i > 0)
      {
        GraphElements.push( { data: {source: RateHistory[i - 1].Date, target: RateHistory[i].Date } } );
      }
    }

    //#TODO might have to clear this
    this.CytoscapeGraph.add(GraphElements);
  }
}

// list of graph elements to start with
        // { // node a
        //   data: { id: 'a' },
        //   grabbable: false,
        //   position: { x: 0, y: 0 }
        // },
        // { // node b
        //   data: { id: 'b'},
        //   grabbable: false,
        //   position: { x: 0, y: 0 }
        // },
        // { // node b
        //   data: { id: 'c' },
        //   grabbable: false,
        //   position: { x: 0, y: 0 }
        // },
        // { // edge ab 
        //   data: { id: 'ab', source: 'a', target: 'b' }
        // }