import { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  addEdge,
  Connection,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, RefreshCw, Download } from 'lucide-react';
import { geminiService, type MindMapNode } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};


const CustomNode = ({ data }: any) => {
    const shapeStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        padding: '10px 20px',
        minHeight: '50px',
        minWidth: '100px',
        textAlign: 'center',
    };

    if (data.shape === 'square') {
        shapeStyle.borderRadius = '0';
        shapeStyle.background = 'linear-gradient(to right, #ef4444, #f87171)';
    } else if (data.shape === 'diamond') {
        shapeStyle.width = '120px';
        shapeStyle.height = '120px';
        shapeStyle.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
        shapeStyle.background = 'linear-gradient(to right, #8b5cf6, #a78bfa)';
    } else { // circle
        shapeStyle.borderRadius = '50%';
        shapeStyle.background = 'linear-gradient(to right, #3b82f6, #60a5fa)';
    }

    return (
        <div style={shapeStyle}>
            {data.label}
        </div>
    );
};

const nodeTypes = {
    custom: CustomNode,
};

const MindMapInternal = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  
  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: 'Error', description: 'Please enter a topic.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const mindMapData = await geminiService.generateMindMap(topic);
      const { nodes: layoutedNodes, edges: layoutedEdges } = transformToFlow(mindMapData);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      toast({ title: 'Success', description: 'Mind map generated.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate mind map.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
    const elem = document.querySelector('.react-flow-wrapper');
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const transformToFlow = (node: MindMapNode, parentId?: string): { nodes: any[], edges: any[] } => {
    const nodesArr: any[] = [];
    const edgesArr: any[] = [];

    const traverse = (n: MindMapNode, pId?: string) => {
      nodesArr.push({
        id: n.id,
        data: { label: n.text, shape: n.shape || 'circle' },
        type: 'custom',
        position: { x: 0, y: 0 } // Position will be calculated by dagre
      });
      if (pId) {
        edgesArr.push({ id: `e${pId}-${n.id}`, source: pId, target: n.id });
      }
      n.children.forEach(child => traverse(child, n.id));
    };

    traverse(node, parentId);
    
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodesArr, edgesArr);

    return { nodes: layoutedNodes, edges: layoutedEdges };
  };


  return (
    <div className="h-[70vh] w-full">
       <div className="flex gap-2 mb-4">
        <Input 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic..."
          className="input-academic"
        />
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? <RefreshCw className="animate-spin" /> : <Brain />}
          Generate
        </Button>
        <Button onClick={toggleFullscreen} variant="outline">
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>
        <div className="space-y-2">
          <label className="text-sm font-medium">Layout</label>
          <div className="grid grid-cols-2 gap-2">
            <div
              className={`border-2 p-2 rounded-lg cursor-pointer ${getLayoutedElements(nodes, edges, 'TB') ? 'border-primary' : 'border-border'}`}
              onClick={() => {
                  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, 'TB');
                  setNodes([...layoutedNodes]);
                  setEdges([...layoutedEdges]);
              }}
            >
              <svg width="100%" height="60" viewBox="0 0 100 60">
                <circle cx="50" cy="10" r="8" fill="#3b82f6" />
                <circle cx="50" cy="30" r="5" fill="#10b981" />
                <line x1="50" y1="10" x2="50" y2="30" stroke="#ccc" />
                 <circle cx="50" cy="50" r="5" fill="#10b981" />
                <line x1="50" y1="30" x2="50" y2="50" stroke="#ccc" />
              </svg>
              <p className="text-center text-xs mt-1">Vertical</p>
            </div>
            <div
              className={`border-2 p-2 rounded-lg cursor-pointer ${getLayoutedElements(nodes, edges, 'LR') ? 'border-primary' : 'border-border'}`}
              onClick={() => {
                  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, 'LR');
                  setNodes([...layoutedNodes]);
                  setEdges([...layoutedEdges]);
              }}
            >
              <svg width="100%" height="60" viewBox="0 0 100 60">
                <circle cx="10" cy="30" r="8" fill="#3b82f6" />
                <circle cx="40" cy="30" r="5" fill="#10b981" />
                <line x1="10" y1="30" x2="40" y2="30" stroke="#ccc" />
                 <circle cx="70" cy="30" r="5" fill="#10b981" />
                <line x1="40" y1="30" x2="70" y2="30" stroke="#ccc" />
              </svg>
              <p className="text-center text-xs mt-1">Horizontal</p>
            </div>
          </div>
        </div>
      </div>
      <div className="react-flow-wrapper h-[70vh] w-full">
        <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        nodeTypes={nodeTypes}
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
      </div>
    </div>
  );
};

export const MindMapGenerator = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Card className="card-academic">
                <CardHeader>
                    <CardTitle className="sorani-text">Mind Map Generator</CardTitle>
                </CardHeader>
                <CardContent>
                    <ReactFlowProvider>
                        <MindMapInternal />
                    </ReactFlowProvider>
                </CardContent>
            </Card>
        </div>
    )
}