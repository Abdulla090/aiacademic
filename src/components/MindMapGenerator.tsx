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
  Node,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, RefreshCw, Download } from 'lucide-react';
import { geminiService, type MindMapNode } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import dagre from 'dagre';
import { LanguageSelection } from './LanguageSelection';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
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
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

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


const CustomNode = ({ data }: { data: { label: string } }) => {
    const colors = [
        '#60a5fa', // blue-400
        '#8b5cf6', // violet-500
        '#ef4444', // red-500
        '#f97316', // orange-500
        '#10b981', // emerald-500
        '#eab308', // yellow-500
        '#06b6d4', // cyan-500
        '#8b5cf6', // purple-500
    ];

    const getColor = (nodeId: string) => {
        let hash = 0;
        for (let i = 0; i < nodeId.length; i++) {
            hash = nodeId.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash % colors.length);
        return colors[index];
    };

    const nodeColor = getColor(data.label);

    const nodeStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        padding: '10px 20px',
        minHeight: '50px',
        minWidth: '100px',
        textAlign: 'center',
        borderRadius: '8px', // Rounded corners for all nodes
        background: nodeColor,
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.3)',
    };

    return (
        <div style={nodeStyle}>
            {data.label}
        </div>
    );
};

const nodeTypes = {
    custom: CustomNode,
};

interface MindMapInternalProps {
  initialNodes: Node[];
  initialEdges: Edge[];
}

const MindMapInternal: React.FC<MindMapInternalProps> = ({ initialNodes, initialEdges }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layoutDirection, setLayoutDirection] = useState('TB');
  const [responseLanguage, setResponseLanguage] = useState('en');

  useEffect(() => {
    if (initialNodes.length > 0) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges, layoutDirection);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
  }, [initialNodes, initialEdges, layoutDirection, setNodes, setEdges]);

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  
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

  const handleLayoutChange = (direction: string) => {
    setLayoutDirection(direction);
  };

  return (
    <div className="h-[70vh] w-full">
       <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Button onClick={toggleFullscreen} variant="outline" size="sm" className="w-full sm:w-auto">
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-medium">Layout</label>
          <div className="grid grid-cols-2 gap-1 sm:gap-2">
            <div
              className={`border-2 p-2 rounded-lg cursor-pointer ${layoutDirection === 'TB' ? 'border-primary' : 'border-border'}`}
              onClick={() => handleLayoutChange('TB')}
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
              className={`border-2 p-2 rounded-lg cursor-pointer ${layoutDirection === 'LR' ? 'border-primary' : 'border-border'}`}
              onClick={() => handleLayoutChange('LR')}
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
         <LanguageSelection
           selectedLanguage={responseLanguage}
           onLanguageChange={setResponseLanguage}
         />
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

interface MindMapGeneratorProps {
  nodes: Node[];
  edges: Edge[];
}

export const MindMapGenerator: React.FC<MindMapGeneratorProps> = ({ nodes, edges }) => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Card className="card-academic">
                <CardHeader>
                    <CardTitle className="sorani-text">Mind Map Generator</CardTitle>
                </CardHeader>
                <CardContent>
                    <ReactFlowProvider>
                        <MindMapInternal initialNodes={nodes} initialEdges={edges} />
                    </ReactFlowProvider>
                </CardContent>
            </Card>
        </div>
    )
}