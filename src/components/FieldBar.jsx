import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { AppstoreOutlined, MailOutlined, SettingOutlined, DashboardOutlined, ClockCircleOutlined, ReadOutlined } from '@ant-design/icons';
import { Menu } from 'antd';

const items = [
    {
        label: `Language of Test`,
        key: 'SubMenu1',
        icon: <ReadOutlined />,
        children: [
          {
            type: 'group',
            label: 'Language',
            children: [
              { label: 'English', key: 'en' },
              { label: 'Spanish', key: 'sp' },
              { label: 'French', key: 'fr'}
            ],
          },
        ],
      },
    {
    label: 'Difficulty of Test',
    key: 'SubMenu2',
    icon: <DashboardOutlined />,
    children: [
      {
        type: 'group',
        label: 'Words',
        children: [
          { label: 'Top 100', key: '100' },
          { label: 'Top 500', key: '500' },
          { label: 'Top 1000', key: '1000'}
        ],
      },
    ],
  },
  {
    label: 'Time of Test',
    key: 'SubMenu3',
    icon: <ClockCircleOutlined />,
    children: [
    {
        type: 'group',
        label: 'Length',
        children: [
        { label: '15s', key: '15' },
        { label: '30s', key: '30' },
        { label: '60s', key: '60'},
        ],
      },
    ],
    }];

const FieldBar = ({ onValuesChange }) => {
  const [values, setValues] = useState({
    language: 'en',
    difficulty: '100',
    time: '15',
  });

  const onClick = useCallback((e) => {
    const [value, category] = e.keyPath;
    let newValues = { ...values };
    switch (category) {
      case 'SubMenu1':
        newValues.language = value;
        break;
      case 'SubMenu2':
        newValues.difficulty = value;
        break;
      case 'SubMenu3':
        newValues.time = value;
        break;
    }
    setValues(newValues);
    if (typeof onValuesChange === 'function') {
      onValuesChange(newValues);
    }
  }, [values, onValuesChange]);


  return  (
    <div style={{paddingTop: '20px', paddingBottom: '20px'}}>
      <center>
        <Menu onClick={onClick} selectedKeys={[ values.language, values.difficulty, values.time]} mode="horizontal" items={items} style={{textAlign:'center', maxHeight: '100px', justifyContent:'center', width: '500px', backgroundColor:'#e6e6e6', borderRadius: '10px'}}/>
      </center>
    </div>
  );
};

FieldBar.propTypes = {
  onValuesChange: PropTypes.func.isRequired,
};

export default FieldBar;