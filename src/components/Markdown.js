import React from 'react';
import ReactMarkdown from 'react-markdown';
import ItemLink from '../containers/ItemLink';

const Markdown = ({ ...props }) => {
  const outProps = {
    renderers: {
      link: ItemLink,
    },
    ...props,
  };
  return <ReactMarkdown {...outProps}/>;
}

export default Markdown;
