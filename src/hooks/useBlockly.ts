
import { useCallback, useEffect } from 'react';
import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import * as Ru from 'blockly/msg/ru';

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
  language: 'en' | 'ru';
}

export const useBlockly = ({ translations, language }: UseBlocklyProps) => {
  const setBlocklyLocale = useCallback((lang: 'en' | 'ru') => {
    const messages = lang === 'en' ? En : Ru;
    Blockly.setLocale(messages);
  }, []);

  useEffect(() => {
    // Установить локаль при изменении языка
    setBlocklyLocale(language);

    // Определить кастомные блоки с учетом текущего языка
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
  }, [translations, language, setBlocklyLocale]);
};
