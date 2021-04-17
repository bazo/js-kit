import "./treeBuilderStory.css";

import { EditorFactory, TreeArray, TreeBuilder, TreeBuilderProps, TreeNode } from "@bazo/react-tree-builder";
import { Meta, Story } from "@storybook/react";
import React, { ReactNode } from "react";
import { Field, Form } from "react-final-form";

const meta: Meta = {
	title: "Bazo JS Kit/React/Tree Builder",
	component: TreeBuilder,
	argTypes: {
		onSave: {
			action: "onSave",
		},
	},
};
export default meta;

interface Data {
	id: number | string;
	name: string;
}

const data: Data[] = [
	{
		id: 1,
		name: "beds",
	},
	{
		id: 2,
		name: "bowls",
	},
	{
		id: 3,
		name: "toys",
	},
	{
		id: 4,
		name: "pelechy",
	},
	{
		id: 5,
		name: "kukane",
	},
	{
		id: 6,
		name: "automatic",
	},
	{
		id: 7,
		name: "wooden",
	},
];

const treeData: TreeArray<Data> = [
	{
		id: 1,
		name: "beds",
		children: [
			{
				id: 4,
				name: "pelechy",
				children: [],
			},
			{
				id: 5,
				name: "kukane",
				children: [],
			},
		],
	},
	{ id: 2, name: "bowls", children: [{ id: 3, name: "toys", children: [] }] },
];

const Template: Story<TreeBuilderProps<Data>> = (args) => (
	<div style={{ display: "flex" }}>
		<div style={{ flexBasis: "50%" }}>
			<TreeBuilder {...args} onSave={args.onSave} />
		</div>
		<div style={{ flexBasis: "50%" }}>
			{data.map(({ id, name }) => {
				return (
					<div
						id={id.toString()}
						key={id.toString()}
						className="draggable-item"
						draggable
						onDragStart={(e) => {
							e.dataTransfer.setData("text/plain", JSON.stringify({ id, name }));
							e.dataTransfer.dropEffect = "copy";
						}}
					>
						{name} ({id})
					</div>
				);
			})}
		</div>
	</div>
);

const NodeEditor: EditorFactory<Data> = ({ dataCallback, cancelCallback }) => {
	return (
		<Form<Data>
			onSubmit={dataCallback}
			render={({ handleSubmit }) => (
				<form onSubmit={handleSubmit}>
					<Field
						name="id"
						render={({ input, meta }) => (
							<div>
								<label>ID</label>
								<input type="text" {...input} placeholder="ID" />
								{meta.touched && meta.error && <span>{meta.error}</span>}
							</div>
						)}
					/>

					<Field name="name">
						{({ input, meta }) => (
							<div>
								<label>name</label>
								<input type="text" {...input} placeholder="Name" />
								{meta.touched && meta.error && <span>{meta.error}</span>}
							</div>
						)}
					</Field>

					<button type="submit">Submit</button>
					<button type="button" onClick={cancelCallback}>
						Cancel
					</button>
				</form>
			)}
		/>
	);
};

const labelRenderer = (node: TreeNode<Data>): ReactNode => {
	return (
		<>
			{node.data?.name || "root"} {node.id && `(${node.id})`}
		</>
	);
};

const onError = (error) => {
	console.log({ error });
};

export const Empty = Template.bind({});
Empty.args = {
	nodeLabelRenderer: labelRenderer,
	editorFactory: NodeEditor,
	onSave: (data) => {
		console.log(JSON.stringify(data));
	},
	onError,
} as TreeBuilderProps<Data>;

export const Prefilled = Template.bind({});
Prefilled.args = {
	data: treeData,
	nodeLabelRenderer: labelRenderer,
	editorFactory: NodeEditor,
	onSave: (data) => {
		console.log(JSON.stringify(data));
	},
	onError,
} as TreeBuilderProps<Data>;
