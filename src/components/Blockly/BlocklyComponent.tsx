
import React, { useRef, useEffect } from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import * as En from 'blockly/msg/en';

interface BlocklyComponentProps {
  initialXml?: string;
  onWorkspaceChange?: (workspace: Blockly.WorkspaceSvg) => void;
}

const BlocklyComponent: React.FC<BlocklyComponentProps> = ({ initialXml, onWorkspaceChange }) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    if (!blocklyDiv.current) return;

    console.info('Initializing Blockly workspace...');

    // Set locale
    Blockly.setLocale(En);

    // Configure the workspace
    const options: Blockly.BlocklyOptions = {
      toolbox: {
        kind: 'categoryToolbox',
        contents: [
          {
            kind: 'category',
            name: 'AR Components',
            colour: '230',
            contents: [
              {
                kind: 'block',
                type: 'ar_run',
              },
              {
                kind: 'block',
                type: 'ar_3d_model',
              },
            ],
          },
        ],
      },
      trashcan: true,
      move: {
        scrollbars: true,
        drag: true,
        wheel: true,
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
      grid: {
        spacing: 20,
        length: 3,
        colour: '#ccc',
        snap: true,
      },
      theme: {
        name: 'custom',
        base: 'classic',
        componentStyles: {
          workspaceBackgroundColour: '#ffffff',
          toolboxBackgroundColour: '#f8f9fa',
          toolboxForegroundColour: '#495057',
          flyoutBackgroundColour: '#ffffff',
          scrollbarColour: '#dee2e6',
        },
      },
    };

    // Initialize the workspace
    workspaceRef.current = Blockly.inject(blocklyDiv.current, options);

    // Load initial XML if provided
    if (initialXml) {
      try {
        const xml = Blockly.utils.xml.textToDom(initialXml);
        Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
      } catch (e) {
        console.error('Error loading initial XML:', e);
      }
    }

    // Set up workspace change listener
    if (onWorkspaceChange && workspaceRef.current) {
      workspaceRef.current.addChangeListener(() => {
        onWorkspaceChange(workspaceRef.current!);
      });
    }

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      if (workspaceRef.current) {
        Blockly.svgResize(workspaceRef.current);
      }
    });

    if (blocklyDiv.current) {
      resizeObserver.observe(blocklyDiv.current);
    }

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      workspaceRef.current?.dispose();
    };
  }, [initialXml, onWorkspaceChange]);

  return (
    <div 
      className="blockly-workspace-container" 
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#ffffff',
      }}
    >
      <div
        ref={blocklyDiv}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    </div>
  );
};

export default BlocklyComponent;
