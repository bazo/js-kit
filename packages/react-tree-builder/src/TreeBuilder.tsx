/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DragEvent, useMemo, useRef, useState, VFC } from "react";

import { NodeData, Tree, TreeArray, TreeNode } from "./Tree";

export type NodeLabelRenderer<T extends NodeData> = (node: TreeNode<T>) => ReturnType<VFC>;
export type InternalEditorCallback<T extends NodeData> = (parent: TreeNode<T>, data: T) => void;
export type EditorCallback<T extends NodeData> = (data: T) => void;
export type EditorFactory<T extends NodeData> = ({
	dataCallback,
	cancelCallback,
}: {
	dataCallback: EditorCallback<T>;
	cancelCallback: () => void;
}) => ReturnType<VFC>;

interface LeafProps<T extends NodeData> {
	editorFactory: EditorFactory<T>;
	node: TreeNode<T>;
	editorCallback: InternalEditorCallback<T>;
	labelRenderer: NodeLabelRenderer<T>;
	isDragOver: boolean;
}

function Leaf<T extends NodeData = NodeData>({
	node,
	editorCallback,
	editorFactory: EditorFactory,
	labelRenderer,
	isDragOver,
}: LeafProps<T>): ReturnType<VFC> {
	const [isEditing, setEditing] = useState(false);

	const enableEdit = (): void => {
		setEditing(true);
	};

	const cancelEdit = (): void => {
		setEditing(false);
	};

	const dataCallback: EditorCallback<T> = (data) => {
		editorCallback(node, data);
		cancelEdit();
	};

	const onDragEnter = (e: DragEvent<HTMLDivElement>): void => {
		e.preventDefault();
	};

	const onDragOver = (e: DragEvent<HTMLDivElement>): void => {
		e.preventDefault();
	};

	const onDrop = (e: DragEvent<HTMLDivElement>): void => {
		e.preventDefault();
		//@ts-ignore
		const data = JSON.parse(e.dataTransfer.getData("text/plain")) as T;
		editorCallback(node, data);
	};

	return (
		<li>
			{labelRenderer(node)}
			<span onClick={enableEdit}>+</span>
			{(node.hasChildren() || isDragOver) && (
				<ul>
					{node.children.map((node) => {
						return (
							<Leaf<T>
								node={node}
								key={node.id}
								editorCallback={editorCallback}
								editorFactory={EditorFactory}
								labelRenderer={labelRenderer}
								isDragOver={isDragOver}
							/>
						);
					})}
					{isDragOver && (
						<li onDragEnter={onDragEnter} onDragOver={onDragOver} onDrop={onDrop}>
							DROP HERE
						</li>
					)}
				</ul>
			)}
			{isEditing && <EditorFactory dataCallback={dataCallback} cancelCallback={cancelEdit} />}
		</li>
	);
}

function defaultNodeRenderer<T extends NodeData>(node: TreeNode<T>): ReturnType<VFC> {
	return <>{node.id}</>;
}

function defaultDataCallback<T extends NodeData>(parent: TreeNode<T>, data: T): void {
	const node = new TreeNode<T>(data.id, data);
	parent.addChild(node);
}

type DataCallback<T extends NodeData> = (parent: TreeNode<T>, data: T) => void;

export interface TreeBuilderProps<T extends NodeData> {
	data?: TreeArray<T>;
	editorFactory: EditorFactory<T>;
	nodeLabelRenderer?: NodeLabelRenderer<T>;
	dataCallback?: DataCallback<T>;
	onSave: (data: TreeArray) => void;
	onError?: (error: Error) => void;
}

export function TreeBuilder<T extends NodeData = NodeData>({
	data,
	editorFactory,
	nodeLabelRenderer = defaultNodeRenderer,
	dataCallback = defaultDataCallback,
	onSave,
	onError,
}: TreeBuilderProps<T>): ReturnType<VFC> {
	const tree = useRef(new Tree<T>(data));

	const dragLevel = useRef(0);
	const [isDragOver, setDragOver] = useState(false);

	const onDragEnter = (e: DragEvent<HTMLDivElement>): void => {
		e.preventDefault();

		dragLevel.current += 1;
		if (dragLevel.current === 1) {
			setDragOver(true);
		}
	};

	const onDragLeave = (e: DragEvent<HTMLDivElement>): void => {
		e.preventDefault();

		dragLevel.current -= 1;
		if (dragLevel.current === 0) {
			setDragOver(false);
		}
	};

	const onDragOver = (e: DragEvent<HTMLDivElement>): void => {
		e.preventDefault();
	};

	const onDrop = (e: DragEvent<HTMLDivElement>): void => {
		e.preventDefault();
		dragLevel.current = 0;
		setDragOver(false);
	};

	const handleSave = (): void => {
		onSave(tree.current.toArray());
	};

	const handleDataCallback: DataCallback<T> = (parent, data) => {
		try {
			dataCallback(parent, data);
		} catch (error) {
			if (onError) {
				onError(error);
			} else {
				throw error;
			}
		}
	};

	return useMemo(
		() => (
			<div onDragEnter={onDragEnter} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
				<ul className={"tree"}>
					<Leaf<T>
						node={tree.current.root}
						editorCallback={handleDataCallback}
						editorFactory={editorFactory}
						labelRenderer={nodeLabelRenderer}
						isDragOver={isDragOver}
					/>
				</ul>
				<button onClick={handleSave}>Save</button>
			</div>
		),
		[isDragOver]
	);
}
