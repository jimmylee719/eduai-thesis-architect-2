import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ArchitectureNode } from '../types';

interface Props {
  data: ArchitectureNode;
}

const ArchitectureDiagram: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Calculate dynamic dimensions based on data
    const rootHierarchy = d3.hierarchy(data);
    const leaves = rootHierarchy.leaves().length;
    const depth = rootHierarchy.height;

    // Configuration for layout
    const nodeHeight = 50; 
    const layerWidth = 180; 
    const margin = { top: 20, right: 120, bottom: 20, left: 100 };

    const height = Math.max(500, leaves * nodeHeight);
    const width = Math.max(800, (depth + 2) * layerWidth);
    
    // Clear previous svg content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-margin.left, -margin.top, width, height])
      .style("font", "12px sans-serif")
      .style("user-select", "none");

    // Tree Layout
    const treeLayout = d3.tree<ArchitectureNode>()
      .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);
    
    const root = treeLayout(rootHierarchy);

    // Links
    svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(root.links())
      .join("path")
      .attr("d", d3.linkHorizontal<d3.HierarchyLink<ArchitectureNode>, d3.HierarchyPointNode<ArchitectureNode>>()
          .x(d => d.y)
          .y(d => d.x) as any);

    // Nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(root.descendants())
      .join("g")
      .attr("transform", d => `translate(${d.y},${d.x})`);

    // Circles for nodes
    node.append("circle")
      .attr("fill", d => d.children ? "#4f46e5" : "#ec4899") 
      .attr("r", 6)
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // Text labels
    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.children ? -10 : 10)
      .attr("text-anchor", d => d.children ? "end" : "start")
      .text(d => (d.data as ArchitectureNode).name)
      .clone(true).lower()
      .attr("stroke", "white")
      .attr("stroke-width", 3);

    // Center initial view if on mobile and diagram is large
    if (containerRef.current) {
        // Optional: scroll to center vertically
    }

  }, [data]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
         <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">System Architecture Visualization</h3>
         <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">可左右滑動檢視</span>
      </div>
      
      <div 
        ref={containerRef}
        className="w-full overflow-auto border border-slate-200 rounded-xl bg-white shadow-inner p-2 touch-pan-x touch-pan-y"
        style={{ minHeight: '400px' }}
      >
        <svg ref={svgRef} className="block"></svg>
      </div>
    </div>
  );
};

export default ArchitectureDiagram;