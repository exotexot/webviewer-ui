import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import actions from 'actions';

import core from 'core';
import selectors from 'selectors';

import './SettingsPanel.scss';

import { RadioGroup, Radio } from 'react-radio-group';
import Switch from 'react-switch';
import { useStore } from 'react-redux';

function SettingsPanel() {
  // const outlines = useSelector(state => selectors.getOutlines(state));

  const persistedLayout = window.top.persitedLayout;

  const initialLayout = () => {
    let l = persistedLayout;

    if (l === 'Single' || l === 'Continuous') {
      l = 'Single';
    } else if (l === 'Facing' || l === 'FacingContinuous') {
      l = 'Facing';
    } else if (l === 'CoverFacing' || l === 'Cover') {
      l = 'CoverFacing';
    }

    return l;
  };

  // Continuous
  const initialContinuous = () => {
    let l;

    switch (persistedLayout) {
      case 'Single':
        l = false;
        break;

      case 'Facing':
        l = false;
        break;

      case 'FacingContinuous':
        l = true;
        break;

      case 'CoverFacing':
        l = false;
        break;

      case 'Cover':
        l = true;
        break;

      default:
        l = true;
        break;
    }

    return l;
  };

  const [continuous, setContinuous] = React.useState(initialContinuous);
  const handleSwitchChange = value => {
    let l = core.getDisplayMode();
    // alert(l);

    if (l === 'Single' || l === 'Continuous') {
      l = value ? 'Continuous' : 'Single';
    } else if (l === 'Facing' || l === 'FacingContinuous') {
      l = value ? 'FacingContinuous' : 'Facing';
    } else if (l === 'CoverFacing' || l === 'Cover') {
      l = value ? 'Cover' : 'CoverFacing';
    }

    setContinuous(previousState => !previousState);
    core.setDisplayMode(l);
  };

  // Layout Modes
  const [layoutMode, setLayoutMode] = React.useState(initialLayout);
  const handleChange = value => {
    setLayoutMode(value);

    let l;

    if (value === 'Single') {
      l = continuous ? 'Continuous' : 'Single';
    } else if (value === 'Facing') {
      l = continuous ? 'FacingContinuous' : 'Facing';
    } else if (value === 'CoverFacing') {
      l = continuous ? 'Cover' : 'CoverFacing';
    }

    core.setDisplayMode(l);
  };

  // const [colorMode, setColorMode] = React.useState('light');

  // const handleColorChange = value => {
  //   setColorMode(value);
  //   // actions.setActiveTheme(value);

  //   window.top.instance.setColor

  //   alert(value);
  // };

  return (
    <div className="Panel SettingsPanel" data-element="settingsPanel">
      <p> Page Layout </p>
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
          <Radio value="Single" /> Single Page
          <span className="checkmark"></span>
        </label>
        <label className="container">
          <Radio value="Facing" /> Facing Pages
          <span className="checkmark"></span>
        </label>
        <label className="container">
          <Radio value="CoverFacing" /> Cover Facing
          <span className="checkmark"></span>
        </label>
      </RadioGroup>

      <label className="container switch">
        Continuous Scrolling
        <Switch
          checked={continuous}
          onChange={handleSwitchChange}
          onColor="#FA7614"
          onHandleColor="#FFFFFF"
          handleDiameter={18}
          uncheckedIcon={false}
          checkedIcon={false}
          boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
          activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
          height={8}
          width={30}
        />
      </label>

      <br />
      <br />

      {/* <p> Color Mode </p>
      <RadioGroup name="fruit" selectedValue={colorMode} onChange={handleColorChange}>
        <label className="container">
          <Radio value="light" /> Light Mode
          <span className="checkmark"></span>
        </label>
        <label className="container">
          <Radio value="dark" /> Dark Mode
          <span className="checkmark"></span>
        </label>
      </RadioGroup> */}
    </div>
  );
}

export default SettingsPanel;
