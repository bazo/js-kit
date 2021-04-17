type NodeID = string | number | null;

export interface NodeData {
	id: NodeID;
}

type _TreeData<T extends NodeData = NodeData> = {
	[K in keyof T]: T[K];
};

type TreeData<T extends NodeData = NodeData> = _TreeData<T> & {
	children: TreeData<T>[];
};

export type TreeArray<T extends NodeData = NodeData> = TreeData<T>[];

export class TreeNode<T extends NodeData = NodeData> {
	private _id: NodeID;
	private _parent: TreeNode<T> | null = null;
	private _data?: T | undefined;
	private _children: TreeNode<T>[];
	private _tree: Tree<T> = (null as unknown) as Tree<T>;

	constructor(id: TreeNode<T>["_id"], data?: TreeNode<T>["_data"]) {
		this._id = id;
		this._data = data;
		this._children = [];
	}

	public get id(): TreeNode<T>["_id"] {
		return this._id;
	}

	public get children(): TreeNode<T>[] {
		return this._children;
	}

	public get data(): TreeNode<T>["_data"] {
		return this._data;
	}

	public get parent(): TreeNode<T>["_parent"] {
		return this._parent;
	}

	public addChild(node: TreeNode<T>): TreeNode<T> {
		const canAdd = this._tree.addNodeId(node.id);
		if (!canAdd) {
			throw new Error(`Cannot add node with id ${node.id}`);
		}

		node._parent = this;
		this._children.push(node);
		node.tree = this._tree;

		return node;
	}

	public hasChildren(): boolean {
		return this._children.length > 0;
	}

	public isRoot(): boolean {
		return this._parent === null;
	}

	/** @internal */
	public set tree(tree: Tree<T>) {
		this._tree = tree;
	}
}

export function treeArrayToTreeNode<T extends NodeData = NodeData>(data?: TreeArray<T>): TreeNode<T> {
	const root = new TreeNode<T>(null);

	return root;
}

export class Tree<T extends NodeData = NodeData> {
	private _root: TreeNode<T>;

	private nodeIds: NodeID[] = [null];

	constructor(data?: TreeArray<T>) {
		this._root = new TreeNode<T>(null);
		this._root.tree = this;
	}

	public get root(): TreeNode<T> {
		return this._root;
	}

	private _extractData(node: TreeNode<T>): TreeData<T> {
		const parent = ({
			...node.data,
			id: node.id,
			children: [],
		} as unknown) as TreeData<T>;

		for (const child of node.children) {
			parent.children.push(this._extractData(child));
		}

		return parent;
	}

	public toArray(): TreeArray<T> {
		const root = this._extractData(this._root);
		return root.children;
	}

	public addNodeId(id: NodeID): boolean {
		if (this.nodeIds.includes(id) || !id) {
			return false;
		}
		this.nodeIds.push(id);
		return true;
	}
}
