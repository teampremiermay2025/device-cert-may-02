import { TreeNode } from './index';

export class OrganizationChartHelper {
  private data: TreeNode[];

  constructor(data: TreeNode[]) {
    this.data = JSON.parse(JSON.stringify(data));
  }

  getData(): TreeNode[] {
    return this.data;
  }

  findNodeById(id: string, nodes = this.data): TreeNode | null {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }
      if (node.children && node.children.length > 0) {
        const found = this.findNodeById(id, node.children);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  findParentNode(id: string, nodes = this.data, parent: TreeNode | null = null): TreeNode | null {
    for (const node of nodes) {
      if (node.id === id) {
        return parent;
      }
      if (node.children && node.children.length > 0) {
        const found = this.findParentNode(id, node.children, node);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  removeNodeById(id: string, nodes = this.data): boolean {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id) {
        nodes.splice(i, 1);
        return true;
      }
      if (nodes[i].children && nodes[i].children.length > 0) {
        const removed = this.removeNodeById(id, nodes[i].children);
        if (removed) {
          return true;
        }
      }
    }
    return false;
  }

  moveNode(nodeId: string, destinationId: string): boolean {
    const node = this.findNodeById(nodeId);
    if (!node) return false;

    const destination = this.findNodeById(destinationId);
    if (!destination) return false;

    // Remove node from its current position
    const parent = this.findParentNode(nodeId);
    if (parent) {
      parent.children = parent.children.filter(child => child.id !== nodeId);
    } else {
      this.data = this.data.filter(item => item.id !== nodeId);
    }

    // Update node's parent reference
    node.data.parent = destinationId;
    
    // Add node to its new destination
    destination.children.push(node);
    
    return true;
  }

  addNode(nodeId: string, parentId: string, nodeData: TreeNode): boolean {
    const parent = this.findNodeById(parentId);
    if (!parent) return false;

    const newNode = JSON.parse(JSON.stringify(nodeData));
    newNode.data.parent = parentId;
    
    parent.children.push(newNode);
    return true;
  }

  editNode(nodeId: string, updatedNode: TreeNode): boolean {
    const node = this.findNodeById(nodeId);
    if (!node) return false;

    node.data = { ...node.data, ...updatedNode.data };
    return true;
  }

  deleteNode(nodeId: string): boolean {
    return this.removeNodeById(nodeId);
  }
}