import { useState, useEffect } from 'react';

interface NodeData {
  id: string;
  label: string;
  x: number;
  y: number;
  level: number;
  children?: NodeData[];
}

interface IdeationCanvasProps {
  autoStart?: boolean;
}

export function IdeationCanvas({ autoStart = true }: IdeationCanvasProps) {
  const [visibleNodes, setVisibleNodes] = useState<string[]>([]);
  const [loadingNodes, setLoadingNodes] = useState<string[]>([]);

  const rootNode: NodeData = {
    id: "root",
    label: "Provider Data Validation System",
    x: 180,
    y: 350,
    level: 0,
    children: [
      {
        id: "npi",
        label: "NPI Registry Validation",
        x: 450,
        y: 180,
        level: 1,
        children: [
          { 
            id: "npi-1", 
            label: "Active Status Verification", 
            x: 720, 
            y: 140, 
            level: 2,
            children: [
              { id: "npi-1-1", label: "Check for Deactivation Records", x: 990, y: 120, level: 3 },
              { id: "npi-1-2", label: "Validate Reactivation Dates", x: 990, y: 160, level: 3 }
            ]
          },
          { 
            id: "npi-2", 
            label: "Demographics Data Matching", 
            x: 720, 
            y: 200, 
            level: 2,
            children: [
              { id: "npi-2-1", label: "Verify Name and Credentials", x: 990, y: 200, level: 3 }
            ]
          },
          { 
            id: "npi-3", 
            label: "Taxonomy Code Validation", 
            x: 720, 
            y: 240, 
            level: 2
          }
        ]
      },
      {
        id: "license",
        label: "Medical License Verification",
        x: 450,
        y: 310,
        level: 1,
        children: [
          { 
            id: "license-1", 
            label: "State Medical Board Scraping", 
            x: 720, 
            y: 280, 
            level: 2,
            children: [
              { id: "license-1-1", label: "Multi-State License Query", x: 990, y: 260, level: 3 },
              { id: "license-1-2", label: "Parse and Normalize License Data", x: 990, y: 300, level: 3,
                children: [
                  { id: "license-1-2-1", label: "Extract License Number", x: 1260, y: 290, level: 4 },
                  { id: "license-1-2-2", label: "Verify License Format", x: 1260, y: 330, level: 4 }
                ]
              }
            ]
          },
          { 
            id: "license-2", 
            label: "Expiration Date Monitoring", 
            x: 720, 
            y: 350, 
            level: 2
          },
          { 
            id: "license-3", 
            label: "Disciplinary Action Check", 
            x: 720, 
            y: 390, 
            level: 2
          }
        ]
      },
      {
        id: "contact",
        label: "Contact Information Enrichment",
        x: 450,
        y: 460,
        level: 1,
        children: [
          { 
            id: "contact-1", 
            label: "Phone Number Validation", 
            x: 720, 
            y: 440, 
            level: 2
          },
          { 
            id: "contact-2", 
            label: "Email Address Discovery", 
            x: 720, 
            y: 480, 
            level: 2
          }
        ]
      },
      {
        id: "quality",
        label: "Data Quality Scoring",
        x: 450,
        y: 570,
        level: 1
      }
    ]
  };

  useEffect(() => {
    if (!autoStart) {
      setVisibleNodes([
        "root", "npi", "license", "contact", "quality",
        "npi-1", "npi-2", "npi-3", "npi-1-1", "npi-1-2", "npi-2-1",
        "license-1", "license-2", "license-3", "license-1-1", "license-1-2", "license-1-2-1", "license-1-2-2",
        "contact-1", "contact-2"
      ]);
      return;
    }

    // Step 1: Show root node
    setVisibleNodes(["root"]);

    // Step 2: Show loading skeleton for level 1 nodes
    setTimeout(() => {
      setLoadingNodes(["npi", "license", "contact", "quality"]);
    }, 800);

    // Step 3: Replace skeleton with actual level 1 nodes
    setTimeout(() => {
      setVisibleNodes(["root", "npi", "license", "contact", "quality"]);
      setLoadingNodes([]);
    }, 2200);

    // Step 4: Show loading skeleton for NPI children (level 2)
    setTimeout(() => {
      setLoadingNodes(["npi-1", "npi-2", "npi-3"]);
    }, 2800);

    // Step 5: Show NPI level 2 nodes
    setTimeout(() => {
      setVisibleNodes(prev => [...prev, "npi-1", "npi-2", "npi-3"]);
      setLoadingNodes([]);
    }, 3800);

    // Step 6: Show loading skeleton for NPI level 3 nodes
    setTimeout(() => {
      setLoadingNodes(["npi-1-1", "npi-1-2", "npi-2-1"]);
    }, 4300);

    // Step 7: Show NPI level 3 nodes
    setTimeout(() => {
      setVisibleNodes(prev => [...prev, "npi-1-1", "npi-1-2", "npi-2-1"]);
      setLoadingNodes([]);
    }, 5300);

    // Step 8: Show loading skeleton for License children (level 2)
    setTimeout(() => {
      setLoadingNodes(["license-1", "license-2", "license-3"]);
    }, 5800);

    // Step 9: Show License level 2 nodes
    setTimeout(() => {
      setVisibleNodes(prev => [...prev, "license-1", "license-2", "license-3"]);
      setLoadingNodes([]);
    }, 6800);

    // Step 10: Show loading skeleton for License level 3 nodes
    setTimeout(() => {
      setLoadingNodes(["license-1-1", "license-1-2"]);
    }, 7300);

    // Step 11: Show License level 3 nodes
    setTimeout(() => {
      setVisibleNodes(prev => [...prev, "license-1-1", "license-1-2"]);
      setLoadingNodes([]);
    }, 8300);

    // Step 12: Show loading skeleton for License level 4 nodes
    setTimeout(() => {
      setLoadingNodes(["license-1-2-1", "license-1-2-2"]);
    }, 8800);

    // Step 13: Show License level 4 nodes
    setTimeout(() => {
      setVisibleNodes(prev => [...prev, "license-1-2-1", "license-1-2-2"]);
      setLoadingNodes([]);
    }, 9800);

    // Step 14: Show loading skeleton for Contact children (level 2)
    setTimeout(() => {
      setLoadingNodes(["contact-1", "contact-2"]);
    }, 10300);

    // Step 15: Show Contact level 2 nodes - final step
    setTimeout(() => {
      setVisibleNodes(prev => [...prev, "contact-1", "contact-2"]);
      setLoadingNodes([]);
    }, 11300);
  }, [autoStart]);

  const getAllNodes = (node: NodeData): NodeData[] => {
    let nodes = [node];
    if (node.children) {
      node.children.forEach(child => {
        nodes = [...nodes, ...getAllNodes(child)];
      });
    }
    return nodes;
  };

  const allNodes = getAllNodes(rootNode);
  
  const getConnections = () => {
    const connections: { from: NodeData; to: NodeData }[] = [];
    const traverse = (node: NodeData) => {
      if (node.children) {
        node.children.forEach(child => {
          connections.push({ from: node, to: child });
          traverse(child);
        });
      }
    };
    traverse(rootNode);
    return connections;
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-50 via-white to-cyan-50/20 overflow-auto">
      <div className="relative min-w-[1400px] min-h-[700px] w-full h-full">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: "1400px", minHeight: "700px" }}>
          {getConnections().map((conn, i) => {
            const fromX = conn.from.x + 100;
            const fromY = conn.from.y + 20;
            const toX = conn.to.x;
            const toY = conn.to.y + 20;
            
            const midX = (fromX + toX) / 2;
            const path = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
            
            const isVisible = visibleNodes.includes(conn.to.id);
            
            return (
              <path
                key={i}
                d={path}
                stroke="#94a3b8"
                strokeWidth="1.5"
                fill="none"
                className={`transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-20'}`}
                style={{
                  animationDelay: `${i * 80}ms`
                }}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0" style={{ minWidth: "1400px", minHeight: "700px" }}>
          {allNodes.map((node, i) => {
            const isVisible = visibleNodes.includes(node.id);
            const isLoading = loadingNodes.includes(node.id);
            
            return (
              <div
                key={node.id}
                className={`absolute transition-all duration-300 ${(isVisible || isLoading) ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                style={{
                  left: node.x,
                  top: node.y,
                  animationDelay: `${i * 100}ms`
                }}
              >
                {isLoading ? (
                  <div 
                    className="h-[44px] rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" 
                    style={{
                      width: node.level === 0 ? "260px" : node.level === 1 ? "240px" : node.level === 2 ? "230px" : node.level === 3 ? "250px" : "220px",
                      backgroundSize: "200% 100%"
                    }}
                  />
                ) : (
                  <div
                    className={`bg-white border rounded-lg px-4 py-2.5 shadow-sm cursor-pointer hover:shadow-md transition-all node-appear border-gray-200 ${node.level === 0 && "border-2 font-semibold border-gray-400"}`}
                    style={{
                      minWidth: node.level === 0 ? "260px" : node.level === 1 ? "240px" : node.level === 2 ? "230px" : node.level === 3 ? "250px" : "220px",
                      maxWidth: node.level === 0 ? "260px" : node.level === 1 ? "240px" : node.level === 2 ? "230px" : node.level === 3 ? "250px" : "220px",
                      animation: isVisible ? `nodeAppear 0.5s ease-out ${i * 100}ms both` : 'none'
                    }}
                  >
                    <p className={`text-sm leading-tight text-gray-800 ${node.level === 0 ? "text-base" : "text-xs"}`}>
                      {node.label}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
