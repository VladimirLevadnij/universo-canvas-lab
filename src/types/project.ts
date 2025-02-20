
export interface Project {
  id: string;
  title: string;
  description: string | null;
}

export interface FlowContent {
  blocklyXml?: string;
}

export const isFlowContent = (content: unknown): content is FlowContent => {
  const c = content as any;
  return c !== null && typeof c === 'object';
};
