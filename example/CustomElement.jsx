import React from "react"
import PropTypes from "prop-types"

function buttonClicked() {
  alert('I\'m a custom button inside a custom element that was clicked');
}

export default function CustomElement(props) {
  return (
    <div>
      <div>I&apos;m a custom react element with prop: {props.name}</div>
      <button onClick={ buttonClicked }>I&apos;m a custom button</button>
    </div>
  );
}

CustomElement.propTypes = {
  name: PropTypes.string
};
