import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Outline from 'components/Outline';
import Icon from 'components/Icon';

import core from 'core';
import selectors from 'selectors';

import './SettingsPanel.scss';

// import { RadioGroup, ReversedRadioButton } from 'react-radio-buttons';
import { RadioGroup, Radio } from 'react-radio-group';

function SettingsPanel() {
  const outlines = useSelector(state => selectors.getOutlines(state));
  // const [mul, setMul] = React.useState(1);

  const onChange = value => {
    core.setDisplayMode(value);
  };

  const initialLayout = window.top.persitedLayout;
  const [layoutMode, setLayoutMode] = React.useState(initialLayout);
  const handleChange = value => {
    setLayoutMode(value);
    core.setDisplayMode(value);
  };

  return (
    <div className="Panel SettingsPanel" data-element="settingsPanel">
      <p> Settings </p>

      {/* <button
        onClick={() => {
          window.utils.setCanvasMultiplier(mul);
          setMul(mul + 1);
          alert(`test  ${mul}`);
        }}
      >
        <p>Test</p>
      </button> */}

      <RadioGroup name="fruit" selectedValue={layoutMode} onChange={handleChange}>
        <label className="container">
          <Radio value="Single" /> Single
          <span class="checkmark"></span>
        </label>
        <label className="container">
          <Radio value="Continuous" /> Continuous
          <span class="checkmark"></span>
        </label>
        <label className="container">
          <Radio value="Facing" /> Facing
          <span class="checkmark"></span>
        </label>
        <label className="container">
          <Radio value="FacingContinuous" /> FacingContinuous
          <span class="checkmark"></span>
        </label>
        <label className="container">
          <Radio value="CoverFacing" /> CoverFacing
          <span class="checkmark"></span>
        </label>
        <label className="container">
          <Radio value="Cover" /> Cover
          <span class="checkmark"></span>
        </label>
      </RadioGroup>
    </div>
  );
}

export default SettingsPanel;
