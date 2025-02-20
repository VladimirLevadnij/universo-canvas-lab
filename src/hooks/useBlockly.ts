
import { useCallback, useEffect } from 'react';
import * as Blockly from 'blockly/core';

interface UseBlocklyProps {
  translations: {
    arComponents: {
      run: string;
      model: string;
      modelTypes: {
        cube: string;
        sphere: string;
        cylinder: string;
      };
    };
  };
}

export const useBlockly = ({ translations }: UseBlocklyProps) => {
  useEffect(() => {
    Blockly.Blocks['ar_run'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(translations.arComponents.run);
        this.appendStatementInput("BLOCKS")
            .setCheck(null);
        this.setColour(230);
        this.setTooltip(translations.arComponents.run);
        this.setHelpUrl("");
      }
    };

    Blockly.Blocks['ar_3d_model'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(translations.arComponents.model)
            .appendField(new Blockly.FieldDropdown([
              [translations.arComponents.modelTypes.cube, "CUBE"],
              [translations.arComponents.modelTypes.sphere, "SPHERE"],
              [translations.arComponents.modelTypes.cylinder, "CYLINDER"]
            ]), "MODEL");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip(translations.arComponents.model);
        this.setHelpUrl("");
      }
    };
  }, [translations]);
};
