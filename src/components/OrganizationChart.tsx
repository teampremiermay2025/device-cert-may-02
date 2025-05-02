import React, { useState } from 'react';
import { TreeNode, NodeTransfer } from '../hooks/index';
import { Edit, Trash2, Plus, MoreVertical } from 'lucide-react';

interface OrganizationChartProps {
  data: TreeNode[];
  onClickNode: (node: TreeNode) => void;
  onDragNode?: (transfer: NodeTransfer) => void;
  onAddNode?: (transfer: NodeTransfer) => void;
  onEditNode?: (transfer: NodeTransfer) => void;
  onDeleteNode?: (transfer: { id: string }) => void;
}

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const badgeClass = role.includes('BAN') ? 'BAN' : role;
  return (
    <span className={`role-badge role-badge-${badgeClass}`} title={role}>
      {role.includes('BAN') ? 'BAN' : role}
    </span>
  );
};

const OrganizationChartNode: React.FC<{
  node: TreeNode;
  onClickNode: (node: TreeNode) => void;
  onDragNode?: (transfer: NodeTransfer) => void;
  onAddNode?: (transfer: NodeTransfer) => void;
  onEditNode?: (transfer: NodeTransfer) => void;
  onDeleteNode?: (transfer: { id: string }) => void;
}> = ({ node, onClickNode, onDragNode, onAddNode, onEditNode, onDeleteNode }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isOver, setIsOver] = useState(false);

  const handleDragStart = (e: React.DragEvent, node: TreeNode) => {
    e.dataTransfer.setData('nodeId', node.id);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent, destination: TreeNode) => {
    e.preventDefault();
    setIsOver(false);
    
    const nodeId = e.dataTransfer.getData('nodeId');
    if (nodeId === destination.id) return;
    
    if (onDragNode) {
      const sourceNode = findNodeById(nodeId);
      if (sourceNode) {
        onDragNode({
          node: sourceNode,
          destination: destination
        });
      }
    }
  };

  const findNodeById = (id: string): TreeNode | null => {
    if (node.id === id) return node;
    
    for (const child of node.children) {
      if (child.id === id) return child;
    }
    
    return null;
  };

  const handleDelete = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (onDeleteNode) {
      onDeleteNode({ id: nodeId });
    }
  };

  const handleAdd = (e: React.MouseEvent, destination: TreeNode) => {
    e.stopPropagation();
    
    const newId = `${destination.data.fan || ''}${destination.data.role || 'User'}${Date.now()}`.replace(/\s/g, "");
    const placeholderNode: TreeNode = {
      id: newId,
      data: {
        name: 'Name',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg',
        fan: destination.data.fan,
        fanName: destination.data.fanName,
        organizations: destination.data.organizations,
        role: getUserLabel(destination.data.role || ''),
        index: getIndexForRole(getUserLabel(destination.data.role || '')),
        parent: destination.id,
        profileStatus: 'Placeholder',
        status: 'Placeholder',
        loginId: newId
      },
      children: []
    };
    
    if (onAddNode) {
      onAddNode({
        node: placeholderNode,
        destination: destination
      });
    }
  };

  const getUserLabel = (parentUserLabel: string): string => {
    switch (parentUserLabel) {
      case 'TCM': return 'BAN Admin';
      case 'BAN Admin': return 'CRU';
      case 'CRU': return 'IRU';
      default: return '';
    }
  };

  const getIndexForRole = (role: string): number => {
    switch (role) {
      case 'TCM': return 0;
      case 'BAN Admin': return 1;
      case 'CRU': return 2;
      case 'IRU': return 3;
      default: return 3;
    }
  };

  return (
    <div className="organization-chart-node">
      <div className="node-wrapper">
        <div 
          className={`node-card ${isOver ? 'drag-over' : ''}`}
          onClick={() => onClickNode(node)}
          draggable
          onDragStart={(e) => handleDragStart(e, node)}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node)}
        >
          {/* Header */}
          <div className={`px-4 py-2 flex justify-between items-center node-header-${node.data.status}`}>
            <RoleBadge role={node.data.role || ''} />
            <div className="flex items-center space-x-1">
              {node.data.role !== 'IRU' && (
                <button
                  className="action-button action-button-primary"
                  onClick={(e) => handleAdd(e, node)}
                  title="Add user"
                >
                  <Plus size={14} className="text-white" />
                </button>
              )}
              <button className="action-button action-button-primary">
                <MoreVertical size={14} className="text-white" />
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img 
                  src={node.data.avatar} 
                  alt={node.data.name}
                  className={`w-20 h-20 rounded-full object-cover border-2 shadow-lg status-${node.data.status}`}
                />
                <div 
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-sm bg-${node.data.status}`}
                />
              </div>
            </div>
            
            <div className="text-center mb-4">
              <div 
                className="font-medium text-gray-900 truncate-text" 
                title={node.data.name}
              >
                {node.data.name}
              </div>
            </div>

            <div className="flex justify-center space-x-3">
              <button 
                className="action-button action-button-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEditNode) {
                    onEditNode({
                      node: node,
                      destination: node
                    });
                  }
                }}
                title="Edit user"
              >
                <Edit size={14} />
              </button>
              
              <button
                className="action-button action-button-danger"
                onClick={(e) => handleDelete(e, node.id)}
                title="Delete user"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {node.children && node.children.length > 0 && (
        <div className="children-container">
          <div className="line-container">
            <div className="vertical-line"></div>
            {node.children.length > 1 && <div className="horizontal-line"></div>}
          </div>
          <div className="children-wrapper">
            {node.children.map((child, index) => (
              <div key={child.id} className="child-node">
                <div className="child-line"></div>
                <OrganizationChartNode
                  node={child}
                  onClickNode={onClickNode}
                  onDragNode={onDragNode}
                  onAddNode={onAddNode}
                  onEditNode={onEditNode}
                  onDeleteNode={onDeleteNode}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const OrganizationChart: React.FC<OrganizationChartProps> = ({
  data,
  onClickNode,
  onDragNode,
  onAddNode,
  onEditNode,
  onDeleteNode
}) => {
  return (
    <div className="organization-chart">
      <div className="chart-container">
        {data.map((node) => (
          <div key={node.id} className="root-node">
            <OrganizationChartNode
              node={node}
              onClickNode={onClickNode}
              onDragNode={onDragNode}
              onAddNode={onAddNode}
              onEditNode={onEditNode}
              onDeleteNode={onDeleteNode}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizationChart;