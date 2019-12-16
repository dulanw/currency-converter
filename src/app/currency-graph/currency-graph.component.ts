import { Component, OnInit, ViewChild, ElementRef, Renderer, Input } from '@angular/core';
import * as cytoscape from 'cytoscape'
import { RateNode } from '../CurrencyTypes';
import * as moment from 'moment'; // <-- for date time stuff

//declare var cytoscape: any;

interface GraphNode
{
  Id: number,
  CurrentY: number,
  TargetY: number
}

@Component({
  selector: 'app-currency-graph',
  templateUrl: './currency-graph.component.html',
  styleUrls: ['./currency-graph.component.css']
})
export class CurrencyGraphComponent implements OnInit {

  @ViewChild('GraphContainer', { static: false }) 
  GraphContainer: ElementRef;
  
  CytoscapeGraph: cytoscape;

  //used for animations
  AnimationInterval: any;
  Nodes: GraphNode[] = [];
  FrameTime: number = 10;

  constructor(private renderer : Renderer) { 
  }

  ngOnInit() {
    this.AnimationUpdate = this.AnimationUpdate.bind(this);
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
            'label': 'data(name)',
            'overlay-opacity': 0
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

      //this returns an invalid date if you don't add 01- as the day
      let DateA = moment("01-" + a.Date, 'DD-MM-YYYY');
      let DateB = moment("01-" + b.Date, 'DD-MM-YYYY');

      if (DateA.isAfter(DateB, 'month'))
      {
        return -1;
      }
      else if (DateA.isBefore(DateB, 'month'))
      {
        return 1;
      }
      else
      {
        return 0;
      }
    });

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
    this.CytoscapeGraph.remove('node');
    let GraphElements: any[] = [];
    let NewNodes: GraphNode[] = [];

    for (let index = 0; index < RateHistory.length; index++)
    {
      let Rate = RateHistory[index].Sum/RateHistory[index].Num;

      //make the nodes take up the full size of the screen
      let PosX = scale(index, RateHistory.length - 1, 0, 0.05, 0.95) * this.CytoscapeGraph.width();
      let PosY = (scale(Rate, MaxY, MinY, 0.05, 0.95) * this.CytoscapeGraph.height());


      //change the animation target location
      //#TODO interp the x position as well
      //creating a new array and adding only the needed amount makes it easier to clean up
      if (index < this.Nodes.length)
      {
        NewNodes.push(this.Nodes[index]);
        NewNodes[index].TargetY = PosY; 
        PosY = NewNodes[index].CurrentY;
      }
      else
      {
        NewNodes.push({Id: index, CurrentY: this.CytoscapeGraph.height() / 2, TargetY: PosY});
        PosY = this.CytoscapeGraph.height() / 2;
      }


      //draw the nodes
      GraphElements.push(
        {
          data: {id: index, name: `${RateHistory[index].Date}, ${Rate.toPrecision(4)}`},
          grabbable: false,
          position: { x: PosX, y: PosY}
        });

      //draw the lines
      if (index > 0)
      {
        GraphElements.push( { data: {source: index - 1, target: index } } );
      }
    }

    this.Nodes = NewNodes;

    //#TODO might have to clear this
    this.CytoscapeGraph.add(GraphElements);
    this.StartAnimationUpdates();
    //console.log(this);
  }

  StartAnimationUpdates()
  {
    this.StopAnimationUpdate();
    this.AnimationInterval = setInterval(this.AnimationUpdate, this.FrameTime);
  }

  StopAnimationUpdate()
  {
    if (this.AnimationInterval)
    {
      clearInterval(this.AnimationInterval);
      this.AnimationInterval = null;
    }
  }

  AnimationUpdate()
  {
    //ue4 style constant interpolation
    let Clamp = (num, min, max) : number =>
    {
      return num <= min ? min : num >= max ? max : num;
    }
    //ue4 style constant interpolation
    let InterpConstantTo = (Current : number, Target : number, DeltaTime : number, InterpSpeed : number) : number =>
    {
      const Dist : number = Target - Current;

      // If distance is too small, just set the desired location
      if( Dist*Dist < Number.MIN_VALUE)
      {
        return Target;
      }

      const Step : number = InterpSpeed * DeltaTime;
      return Current + Clamp(Dist, -Step, Step);
    }

    //let Node = this.Nodes[0];
    //Node.CurrentY = InterpConstantTo(Node.CurrentY, Node.TargetY, this.FrameTime, 0.1);
    //this.CytoscapeGraph.$(`#${Node.Id}`).position('y', Node.CurrentY);

    //console.log(Node.CurrentY, Node.TargetY);

    let StopAnimation = true;
    for (let Node of this.Nodes)
    {
      //let y = this.CytoscapeGraph.$(Node.Id).position('x');
      Node.CurrentY = InterpConstantTo(Node.CurrentY, Node.TargetY, this.FrameTime, 1);

      this.CytoscapeGraph.$(`#${Node.Id}`).position('y', Node.CurrentY);

      if (Node.CurrentY !== Node.TargetY)
      {
        StopAnimation = false;
      }
    }

    if (StopAnimation)
    {
      console.log("Stopped Animation");
      this.StopAnimationUpdate();
    }
  }

}