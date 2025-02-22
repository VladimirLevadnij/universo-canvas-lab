
import React, { useRef, useEffect } from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import * as En from 'blockly/msg/en';
import * as Ru from 'blockly/msg/ru';

interface BlocklyComponentProps {
  initialXml?: string;
  onWorkspaceChange?: (workspace: Blockly.WorkspaceSvg) => void;
  language?: 'en' | 'ru';
}

const BlocklyComponent: React.FC<BlocklyComponentProps> = ({ 
  initialXml, 
  onWorkspaceChange,
  language = 'en'
}) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    if (!blocklyDiv.current) return;

    console.log('Initializing Blockly workspace...');

    // Set locale based on current language
    const messages = language === 'en' ? En : Ru;
    Blockly.setLocale(messages);

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
          {
            kind: 'category',
            name: 'Logic',
            colour: '210',
            contents: [
              {
                kind: 'block',
                type: 'controls_if'
              },
              {
                kind: 'block',
                type: 'logic_compare'
              },
              {
                kind: 'block',
                type: 'logic_operation'
              },
              {
                kind: 'block',
                type: 'logic_boolean'
              },
              {
                kind: 'block',
                type: 'logic_null'
              },
            ]
          },
          {
            kind: 'category',
            name: 'Loops',
            colour: '120',
            contents: [
              {
                kind: 'block',
                type: 'controls_repeat_ext'
              },
              {
                kind: 'block',
                type: 'controls_whileUntil'
              },
              {
                kind: 'block',
                type: 'controls_for'
              },
              {
                kind: 'block',
                type: 'controls_forEach'
              },
            ]
          },
          {
            kind: 'category',
            name: 'Math',
            colour: '230',
            contents: [
              {
                kind: 'block',
                type: 'math_number'
              },
              {
                kind: 'block',
                type: 'math_arithmetic'
              },
              {
                kind: 'block',
                type: 'math_single'
              },
              {
                kind: 'block',
                type: 'math_round'
              },
            ]
          },
          {
            kind: 'category',
            name: 'Text',
            colour: '160',
            contents: [
              {
                kind: 'block',
                type: 'text'
              },
              {
                kind: 'block',
                type: 'text_join'
              },
              {
                kind: 'block',
                type: 'text_append'
              },
              {
                kind: 'block',
                type: 'text_length'
              },
            ]
          },
          {
            kind: 'category',
            name: 'Variables',
            custom: 'VARIABLE',
            colour: '330',
          },
          {
            kind: 'category',
            name: 'Functions',
            custom: 'PROCEDURE',
            colour: '290',
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
        console.log('Loading initial XML:', initialXml);
        const xml = Blockly.utils.xml.textToDom(initialXml);
        Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
        console.log('Initial XML loaded successfully');
      } catch (e) {
        console.error('Error loading initial XML:', e);
      }
    }

    // Set up workspace change listener with debounce
    if (onWorkspaceChange && workspaceRef.current) {
      let timeoutId: NodeJS.Timeout;
      
      const changeListener = () => {
        if (workspaceRef.current) {
          // Clear previous timeout
          clearTimeout(timeoutId);
          
          // Set new timeout
          timeoutId = setTimeout(() => {
            onWorkspaceChange(workspaceRef.current!);
          }, 500); // Debounce for 500ms
        }
      };
      
      workspaceRef.current.addChangeListener(changeListener);
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
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
      }
    };
  }, [initialXml, onWorkspaceChange, language]);

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
