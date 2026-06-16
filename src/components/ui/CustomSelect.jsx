import React from 'react';
import Select from 'react-select';

const CustomSelect = ({ options, value, onChange, placeholder, isDisabled, className = '' }) => {
  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isDisabled={isDisabled}
      unstyled={true}
      menuPortalTarget={document.body}
      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
      className={className}
      classNames={{
        control: ({ isFocused }) => 
          `flex w-full items-center justify-between rounded-none border border-gray-300 bg-white min-h-[38px] cursor-pointer text-sm ${
            isFocused ? 'border-[#003588] ring-1 ring-[#003588] outline-none' : 'hover:border-gray-400'
          }`,
        menu: () => 'rounded-none shadow-lg border border-gray-200 mt-1 bg-white z-[100] absolute w-full',
        option: ({ isFocused, isSelected }) => 
          `cursor-pointer px-3 py-2 text-sm ${
            isSelected 
              ? 'bg-[#003588] text-white' 
              : isFocused 
                ? 'bg-blue-50 text-gray-900' 
                : 'text-gray-700'
          }`,
        valueContainer: () => 'px-3 py-1 flex flex-wrap flex-1 items-center overflow-hidden',
        placeholder: () => 'text-gray-500 truncate',
        singleValue: () => 'text-gray-900 truncate',
        input: () => 'text-gray-900 m-0 p-0',
        menuList: () => 'py-1 max-h-60 overflow-y-auto',
        dropdownIndicator: () => 'text-gray-400 p-2 hover:text-gray-600',
        indicatorSeparator: () => 'bg-gray-200 my-2 mx-1 w-px',
        clearIndicator: () => 'text-gray-400 p-2 hover:text-gray-600'
      }}
    />
  );
};

export default CustomSelect;
